/**
 * Timeline Service
 *
 * Günlük görev zaman çizelgesi için CRUD işlemleri ve yetkilendirme.
 *
 * Yetkiler:
 * - Görev oluşturma: Kullanıcı ilgili board'a erişebilmeli
 * - Görev güncelleme/silme: Sadece görevin sahibi
 */

import { prisma } from 'database';
import { CreateTimelineTaskInput } from '@/lib/validations';
import { TimelineStats } from '@/types';

// Card scalar alanlarını seçer; labels ayrıca enrichTasksWithLabels ile eklenir
const TASK_INCLUDE = {
  card: {
    select: {
      id: true,
      title: true,
      description: true,
      // Bağımlılık sayıları — timeline'da bloke uyarısı için
      _count: {
        select: {
          blockedBy: true,
          blockingFor: true,
        },
      },
    },
  },
  board: {
    select: { id: true, title: true },
  },
};

type RawTask = {
  cardId: string;
  card: {
    id: string;
    title: string;
    description: string | null;
    _count: { blockedBy: number; blockingFor: number };
  };
};

type LabelShape = { id: string; name: string; color: string; boardId: string };

// CardLabel tablosundan kartlara ait etiketleri çekip göreve ekler
async function enrichTasksWithLabels<T extends RawTask>(tasks: T[]) {
  if (tasks.length === 0) return tasks.map((t) => ({ ...t, card: { ...t.card, labels: [] as LabelShape[] } }));

  const cardIds = tasks.map((t) => t.cardId);
  const cardLabels = await prisma.cardLabel.findMany({
    where: { cardId: { in: cardIds } },
    include: { label: true },
  });

  const labelsByCardId = new Map<string, LabelShape[]>();
  for (const cl of cardLabels) {
    const existing = labelsByCardId.get(cl.cardId) ?? [];
    labelsByCardId.set(cl.cardId, [...existing, cl.label]);
  }

  return tasks.map((t) => ({
    ...t,
    card: {
      ...t.card,
      labels: labelsByCardId.get(t.cardId) ?? ([] as LabelShape[]),
    },
  }));
}

export class TimelineService {
  /**
   * Belirli bir gün için kullanıcının timeline görevlerini getirir.
   * Başlangıç saatine göre sıralı.
   */
  static async getTasksForDate(userId: string, date: string) {
    // date: 'YYYY-MM-DD' formatında — o günün 00:00 - 23:59 UTC aralığı
    const start = new Date(`${date}T00:00:00.000Z`);
    const end = new Date(`${date}T23:59:59.999Z`);

    const tasks = await prisma.timelineTask.findMany({
      where: {
        userId,
        scheduledDate: { gte: start, lte: end },
      },
      include: TASK_INCLUDE,
      orderBy: { startTime: 'asc' },
    });

    const stats: TimelineStats = {
      totalPlanned: tasks.length,
      completed: tasks.filter((t) => t.status === 'COMPLETED').length,
      inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
      remaining: tasks.filter((t) => t.status === 'PLANNED' || t.status === 'PAUSED').length,
      totalMinutesPlanned: tasks.reduce((sum, t) => sum + t.estimatedMinutes, 0),
    };

    const enrichedTasks = await enrichTasksWithLabels(tasks);
    return { tasks: enrichedTasks, stats };
  }

  /**
   * Tarih aralığı için kullanıcının timeline görevlerini getirir.
   * Haftalık görünüm için kullanılır.
   */
  static async getTasksForDateRange(userId: string, startDate: string, endDate: string) {
    const start = new Date(`${startDate}T00:00:00.000Z`);
    const end = new Date(`${endDate}T23:59:59.999Z`);

    const tasks = await prisma.timelineTask.findMany({
      where: {
        userId,
        scheduledDate: { gte: start, lte: end },
      },
      include: TASK_INCLUDE,
      orderBy: { startTime: 'asc' },
    });

    const enrichedTasks = await enrichTasksWithLabels(tasks);
    return { tasks: enrichedTasks };
  }

  /**
   * Yeni bir timeline görevi oluşturur.
   * Kullanıcının o board'a erişimi olmalı.
   * Zaman çakışması kontrol edilir.
   */
  static async createTask(data: CreateTimelineTaskInput, userId: string) {
    // Board erişim kontrolü
    const board = await prisma.board.findFirst({
      where: {
        id: data.boardId,
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } },
        ],
      },
    });

    if (!board) {
      throw new Error('Board bulunamadı veya bu board\'a erişim yetkiniz yok');
    }

    // Kartın bu board'a ait olduğunu doğrula
    const card = await prisma.card.findFirst({
      where: {
        id: data.cardId,
        list: { boardId: data.boardId },
      },
    });

    if (!card) {
      throw new Error('Kart bulunamadı veya bu board\'a ait değil');
    }

    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);

    if (endTime <= startTime) {
      throw new Error('Bitiş saati başlangıç saatinden sonra olmalıdır');
    }

    const scheduledDate = new Date(`${data.scheduledDate}T00:00:00.000Z`);

    // Zaman çakışması kontrolü
    const overlap = await prisma.timelineTask.findFirst({
      where: {
        userId,
        scheduledDate: {
          gte: new Date(`${data.scheduledDate}T00:00:00.000Z`),
          lte: new Date(`${data.scheduledDate}T23:59:59.999Z`),
        },
        status: { notIn: ['SKIPPED', 'COMPLETED'] },
        OR: [
          { startTime: { lt: endTime }, endTime: { gt: startTime } },
        ],
      },
    });

    if (overlap) {
      throw new Error('Bu zaman aralığında zaten bir görev var. Farklı bir saat seçin.');
    }

    const created = await prisma.timelineTask.create({
      data: {
        userId,
        cardId: data.cardId,
        boardId: data.boardId,
        scheduledDate,
        startTime,
        endTime,
        estimatedMinutes: data.estimatedMinutes ?? 60,
      },
      include: TASK_INCLUDE,
    });
    const [enriched] = await enrichTasksWithLabels([created]);
    return enriched;
  }

  /**
   * Görev durumunu günceller.
   * Sadece görevin sahibi güncelleyebilir.
   */
  static async updateTaskStatus(
    taskId: string,
    action: 'start' | 'pause' | 'complete' | 'skip',
    userId: string
  ) {
    const task = await prisma.timelineTask.findFirst({
      where: { id: taskId, userId },
    });

    if (!task) {
      throw new Error('Görev bulunamadı veya bu görevi değiştirme yetkiniz yok');
    }

    const now = new Date();

    let updateData: Record<string, unknown> = {};

    if (action === 'start') {
      updateData = {
        status: 'IN_PROGRESS',
        actualStartTime: task.actualStartTime ?? now,
      };
    } else if (action === 'pause') {
      updateData = { status: 'PAUSED' };
    } else if (action === 'complete') {
      const actualStart = task.actualStartTime ?? now;
      const actualMinutes = Math.round((now.getTime() - actualStart.getTime()) / 60000);
      updateData = {
        status: 'COMPLETED',
        actualEndTime: now,
        actualMinutes: actualMinutes > 0 ? actualMinutes : null,
      };
    } else if (action === 'skip') {
      updateData = { status: 'SKIPPED' };
    }

    const updated = await prisma.timelineTask.update({
      where: { id: taskId },
      data: updateData,
      include: TASK_INCLUDE,
    });
    const [enriched] = await enrichTasksWithLabels([updated]);
    return enriched;
  }

  /**
   * Timeline görevinin saatini değiştirir.
   * Sadece görevin sahibi değiştirebilir.
   * Zaman çakışması varsa TIMELINE_CONFLICT kodu ile hata fırlatır.
   */
  static async rescheduleTask(
    taskId: string,
    startTime: string,
    endTime: string,
    userId: string,
    estimatedMinutes?: number
  ) {
    const task = await prisma.timelineTask.findFirst({
      where: { id: taskId, userId },
    });

    if (!task) {
      throw new Error('Görev bulunamadı veya bu görevi değiştirme yetkiniz yok');
    }

    const newStart = new Date(startTime);
    const newEnd = new Date(endTime);

    if (newEnd <= newStart) {
      throw new Error('Bitiş saati başlangıç saatinden sonra olmalıdır');
    }

    // Çakışma kontrolü (mevcut görevi hariç tut)
    const overlapRaw = await prisma.timelineTask.findFirst({
      where: {
        userId,
        id: { not: taskId },
        scheduledDate: task.scheduledDate,
        status: { notIn: ['SKIPPED', 'COMPLETED'] },
        startTime: { lt: newEnd },
        endTime: { gt: newStart },
      },
      include: TASK_INCLUDE,
    });

    if (overlapRaw) {
      const [overlap] = await enrichTasksWithLabels([overlapRaw]);
      const conflictError = new Error('Zaman çakışması');
      (conflictError as any).code = 'TIMELINE_CONFLICT';
      (conflictError as any).conflictingTask = overlap;
      throw conflictError;
    }

    const estimated =
      estimatedMinutes ?? Math.round((newEnd.getTime() - newStart.getTime()) / 60000);

    const rescheduled = await prisma.timelineTask.update({
      where: { id: taskId },
      data: { startTime: newStart, endTime: newEnd, estimatedMinutes: estimated },
      include: TASK_INCLUDE,
    });
    const [enriched] = await enrichTasksWithLabels([rescheduled]);
    return enriched;
  }

  /**
   * Görevi başka bir güne taşır (saat korunur, sadece tarih değişir).
   * Haftalık görünüm sürükle-bırak için kullanılır.
   */
  static async moveTaskToDate(taskId: string, targetDate: string, userId: string) {
    const task = await prisma.timelineTask.findFirst({
      where: { id: taskId, userId },
    });

    if (!task) {
      throw new Error('Görev bulunamadı veya bu görevi değiştirme yetkiniz yok');
    }

    // Yeni scheduledDate base'i
    const [year, month, day] = targetDate.split('-').map(Number);

    const newStart = new Date(task.startTime);
    newStart.setUTCFullYear(year, month - 1, day);

    const newEnd = new Date(task.endTime);
    newEnd.setUTCFullYear(year, month - 1, day);

    // Bitiş gece yarısını geçiyorsa (örn. 23:00–01:00) ertesi güne sarkar
    if (newEnd <= newStart) {
      newEnd.setUTCDate(newEnd.getUTCDate() + 1);
    }

    const newScheduledDate = new Date(`${targetDate}T00:00:00.000Z`);

    // Yeni günde çakışma kontrolü (bu görev hariç)
    const overlap = await prisma.timelineTask.findFirst({
      where: {
        userId,
        id: { not: taskId },
        scheduledDate: { gte: newScheduledDate, lte: new Date(`${targetDate}T23:59:59.999Z`) },
        status: { notIn: ['SKIPPED', 'COMPLETED'] },
        startTime: { lt: newEnd },
        endTime: { gt: newStart },
      },
    });

    if (overlap) {
      const conflictError = new Error('Zaman çakışması');
      (conflictError as any).code = 'TIMELINE_CONFLICT';
      (conflictError as any).conflictingTask = overlap;
      throw conflictError;
    }

    const moved = await prisma.timelineTask.update({
      where: { id: taskId },
      data: { scheduledDate: newScheduledDate, startTime: newStart, endTime: newEnd },
      include: TASK_INCLUDE,
    });
    const [enriched] = await enrichTasksWithLabels([moved]);
    return enriched;
  }

  /**
   * Timeline görevini siler.
   * Sadece görevin sahibi silebilir.
   */
  static async deleteTask(taskId: string, userId: string) {
    const task = await prisma.timelineTask.findFirst({
      where: { id: taskId, userId },
    });

    if (!task) {
      throw new Error('Görev bulunamadı veya bu görevi silme yetkiniz yok');
    }

    await prisma.timelineTask.delete({ where: { id: taskId } });
  }

  /**
   * Kullanıcının erişebildiği tüm board'lardaki kartları getirir.
   * Belirli bir gün için zaten timeline'da olan kartlar hariç tutulur.
   */
  static async getUnscheduledCards(userId: string, date: string) {
    // O gün için zaten planlanmış card ID'lerini bul
    const scheduledCardIds = await prisma.timelineTask.findMany({
      where: {
        userId,
        scheduledDate: {
          gte: new Date(`${date}T00:00:00.000Z`),
          lte: new Date(`${date}T23:59:59.999Z`),
        },
        status: { notIn: ['SKIPPED'] },
      },
      select: { cardId: true },
    });

    const scheduledIds = scheduledCardIds.map((t) => t.cardId);

    // Kullanıcının erişebildiği tüm kartları getir (planlanmamışlar)
    const cards = await prisma.card.findMany({
      where: {
        id: { notIn: scheduledIds.length > 0 ? scheduledIds : undefined },
        isCompleted: false, // Board-level tamamlananları dışla
        list: {
          board: {
            OR: [
              { ownerId: userId },
              { members: { some: { userId } } },
            ],
          },
        },
      },
      include: {
        list: {
          select: {
            id: true,
            title: true,
            board: { select: { id: true, title: true } },
          },
        },
      },
      orderBy: [
        { list: { board: { updatedAt: 'desc' } } },
        { position: 'asc' },
      ],
      take: 100, // Performans için limit
    });

    // Etiketleri ayrıca çek (CardLabel join)
    const cardLabels = await enrichTasksWithLabels(
      cards.map((c) => ({ cardId: c.id, card: { id: c.id, title: c.title, description: c.description } }))
    );
    const labelsByCardId = new Map(cardLabels.map((c) => [c.cardId, c.card.labels]));

    return cards.map((card) => ({
      id: card.id,
      title: card.title,
      description: card.description,
      labels: labelsByCardId.get(card.id) ?? [],
      dueDate: card.dueDate?.toISOString() ?? null,
      listId: card.list.id,
      listTitle: card.list.title,
      boardId: card.list.board.id,
      boardTitle: card.list.board.title,
    }));
  }
}
