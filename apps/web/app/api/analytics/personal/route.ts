/**
 * Personal Analytics API
 *
 * GET /api/analytics/personal?range=week|month|3month|all
 *
 * TimelineTask verisinden türetilen kişisel verimlilik analitiği:
 * - Haftalık/aylık özet (tamamlanan, atlanan, planlanan sayıları)
 * - Board bazlı zaman dağılımı (pasta grafik verisi)
 * - Saatlik verimlilik haritası (en üretken saatler)
 * - Tahmin doğruluğu trendi (estimatedMinutes vs actualMinutes)
 * - Özet istatistikler (streak, toplam süre, vb.)
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from 'database';
import { startOfDay, subDays, subMonths, format } from 'date-fns';

type RangeParam = 'week' | 'month' | '3month' | 'all';

function getStartDate(range: RangeParam): Date | null {
  const now = new Date();
  switch (range) {
    case 'week':
      return subDays(startOfDay(now), 7);
    case 'month':
      return subMonths(startOfDay(now), 1);
    case '3month':
      return subMonths(startOfDay(now), 3);
    case 'all':
      return null;
    default:
      return subDays(startOfDay(now), 7);
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const rangeParam = (searchParams.get('range') ?? 'week') as RangeParam;
    const validRanges: RangeParam[] = ['week', 'month', '3month', 'all'];
    const range = validRanges.includes(rangeParam) ? rangeParam : 'week';

    const startDate = getStartDate(range);
    const userId = session.user.id;

    const dateFilter = startDate ? { scheduledDate: { gte: startDate } } : {};

    // Tüm görevleri tek sorguda çek (aggregation için yeterli veri)
    const tasks = await prisma.timelineTask.findMany({
      where: { userId, ...dateFilter },
      include: {
        board: { select: { id: true, title: true } },
      },
      orderBy: { scheduledDate: 'asc' },
    });

    // ── 1. Özet istatistikler ────────────────────────────────────────────────
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').length;
    const skippedTasks = tasks.filter((t) => t.status === 'SKIPPED').length;
    const plannedTasks = tasks.filter(
      (t) => t.status === 'PLANNED' || t.status === 'IN_PROGRESS' || t.status === 'PAUSED'
    ).length;

    // Toplam harcanan dakika (tamamlanan görevler)
    const totalActualMinutes = tasks
      .filter((t) => t.status === 'COMPLETED' && t.actualMinutes)
      .reduce((sum, t) => sum + (t.actualMinutes ?? 0), 0);

    // Ortalama tahmin doğruluğu: (1 - |actual-estimated|/estimated) * 100
    const tasksWithBothTimes = tasks.filter(
      (t) => t.status === 'COMPLETED' && t.actualMinutes && t.estimatedMinutes > 0
    );
    const avgAccuracy =
      tasksWithBothTimes.length > 0
        ? Math.round(
            (tasksWithBothTimes.reduce((sum, t) => {
              const ratio = Math.abs((t.actualMinutes! - t.estimatedMinutes) / t.estimatedMinutes);
              return sum + Math.max(0, (1 - ratio) * 100);
            }, 0) /
              tasksWithBothTimes.length) *
              10
          ) / 10
        : null;

    // En uzun kesintisiz çalışma streaki (tamamlanan görevi olan günler)
    const completedDaySet = new Set(
      tasks
        .filter((t) => t.status === 'COMPLETED')
        .map((t) => format(t.scheduledDate, 'yyyy-MM-dd'))
    );
    const streak = calcStreak(completedDaySet);

    // ── 2. Günlük özet (bar chart) ───────────────────────────────────────────
    // range'e göre kaç gün geriye gideceğimizi belirle
    const daysBack = range === 'week' ? 7 : range === 'month' ? 30 : range === '3month' ? 90 : 90;
    const dailySummary = buildDailySummary(tasks, Math.min(daysBack, 90));

    // ── 3. Board dağılımı (pie chart) ────────────────────────────────────────
    const boardMap = new Map<string, { boardId: string; boardTitle: string; minutes: number; taskCount: number }>();
    for (const task of tasks) {
      if (task.status !== 'COMPLETED') continue;
      const key = task.boardId;
      const existing = boardMap.get(key) ?? {
        boardId: task.boardId,
        boardTitle: task.board.title,
        minutes: 0,
        taskCount: 0,
      };
      existing.minutes += task.actualMinutes ?? task.estimatedMinutes;
      existing.taskCount += 1;
      boardMap.set(key, existing);
    }
    const boardDistribution = Array.from(boardMap.values()).sort((a, b) => b.minutes - a.minutes);

    // ── 4. Saatlik verimlilik haritası ──────────────────────────────────────
    // Hangi saatlerde daha çok görev tamamlandı (0-23)
    const hourlyMap = new Array(24).fill(0).map((_, hour) => ({ hour, taskCount: 0, totalMinutes: 0 }));
    for (const task of tasks) {
      if (task.status !== 'COMPLETED') continue;
      const hour = task.startTime.getHours();
      hourlyMap[hour].taskCount += 1;
      hourlyMap[hour].totalMinutes += task.actualMinutes ?? task.estimatedMinutes;
    }

    // ── 5. Tahmin doğruluğu trendi (son 10 tamamlanan görev) ─────────────────
    const recentCompleted = tasks
      .filter((t) => t.status === 'COMPLETED' && t.actualMinutes)
      .slice(-20); // Son 20 tamamlanan görev

    const estimationTrend = recentCompleted.map((t) => ({
      date: format(t.scheduledDate, 'MM/dd'),
      estimated: t.estimatedMinutes,
      actual: t.actualMinutes!,
      accuracy: Math.round(
        Math.max(0, (1 - Math.abs((t.actualMinutes! - t.estimatedMinutes) / t.estimatedMinutes)) * 100)
      ),
    }));

    return NextResponse.json({
      summary: {
        totalTasks,
        completedTasks,
        skippedTasks,
        plannedTasks,
        totalActualMinutes,
        avgAccuracy,
        streak,
      },
      dailySummary,
      boardDistribution,
      hourlyHeatmap: hourlyMap,
      estimationTrend,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Sunucu hatası';
    console.error('Analytics getirme hatası:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ── Yardımcı fonksiyonlar ────────────────────────────────────────────────────

function calcStreak(completedDays: Set<string>): number {
  if (completedDays.size === 0) return 0;
  const today = format(new Date(), 'yyyy-MM-dd');
  let streak = 0;
  let checkDate = new Date();

  // Bugünden geriye doğru giderek kesintisiz günleri say
  // Bugün tamamlanan görev yoksa dünden başla
  if (!completedDays.has(today)) {
    checkDate = subDays(checkDate, 1);
  }

  while (true) {
    const dateStr = format(checkDate, 'yyyy-MM-dd');
    if (!completedDays.has(dateStr)) break;
    streak++;
    checkDate = subDays(checkDate, 1);
  }

  return streak;
}

function buildDailySummary(
  tasks: Array<{ scheduledDate: Date; status: string }>,
  daysBack: number
) {
  const result: Array<{ date: string; completed: number; skipped: number; planned: number }> = [];
  const today = startOfDay(new Date());

  for (let i = daysBack - 1; i >= 0; i--) {
    const day = subDays(today, i);
    const dateStr = format(day, 'yyyy-MM-dd');
    const dayTasks = tasks.filter(
      (t) => format(startOfDay(t.scheduledDate), 'yyyy-MM-dd') === dateStr
    );

    result.push({
      date: dateStr,
      completed: dayTasks.filter((t) => t.status === 'COMPLETED').length,
      skipped: dayTasks.filter((t) => t.status === 'SKIPPED').length,
      planned: dayTasks.filter(
        (t) => t.status === 'PLANNED' || t.status === 'IN_PROGRESS' || t.status === 'PAUSED'
      ).length,
    });
  }

  return result;
}
