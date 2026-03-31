/**
 * Timeline Task API
 *
 * PATCH  /api/timeline/tasks/[id]  — Görev durumunu günceller (start/pause/complete/skip)
 *                                    veya saatini değiştirir (startTime/endTime)
 * DELETE /api/timeline/tasks/[id]  — Görevi siler
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { TimelineService } from '@/services/timeline.service';
import { updateTimelineTaskStatusSchema, rescheduleTimelineTaskSchema, moveTaskToDateSchema } from '@/lib/validations';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const body = await req.json();

    // scheduledDate → günler arası taşıma
    if ('scheduledDate' in body) {
      const { scheduledDate } = moveTaskToDateSchema.parse(body);
      const task = await TimelineService.moveTaskToDate(params.id, scheduledDate, session.user.id);
      return NextResponse.json(task);
    }

    // startTime/endTime → aynı gün saat değiştirme
    if ('startTime' in body || 'endTime' in body) {
      const { startTime, endTime, estimatedMinutes } = rescheduleTimelineTaskSchema.parse(body);
      const task = await TimelineService.rescheduleTask(
        params.id,
        startTime,
        endTime,
        session.user.id,
        estimatedMinutes
      );
      return NextResponse.json(task);
    }

    const { action } = updateTimelineTaskStatusSchema.parse(body);
    const task = await TimelineService.updateTaskStatus(params.id, action, session.user.id);
    return NextResponse.json(task);
  } catch (error: any) {
    console.error('Timeline görev güncelleme hatası:', error);

    if (error.code === 'TIMELINE_CONFLICT') {
      return NextResponse.json(
        { error: 'CONFLICT', conflictingTask: error.conflictingTask },
        { status: 409 }
      );
    }

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Geçersiz giriş verisi', details: error.errors },
        { status: 400 }
      );
    }

    if (error.message?.includes('bulunamadı')) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ error: error.message || 'Sunucu hatası' }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    await TimelineService.deleteTask(params.id, session.user.id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Timeline görev silme hatası:', error);

    if (error.message?.includes('bulunamadı')) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ error: error.message || 'Sunucu hatası' }, { status: 500 });
  }
}
