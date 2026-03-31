/**
 * Timeline API
 *
 * GET  /api/timeline?date=YYYY-MM-DD  — Belirtilen gün için görevleri getirir
 * POST /api/timeline                  — Yeni timeline görevi oluşturur
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { TimelineService } from '@/services/timeline.service';
import { createTimelineTaskSchema } from '@/lib/validations';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;

    // Haftalık görünüm: startDate + endDate
    if (startDate || endDate) {
      if (!startDate || !endDate || !datePattern.test(startDate) || !datePattern.test(endDate)) {
        return NextResponse.json(
          { error: 'Geçersiz tarih aralığı. startDate ve endDate YYYY-MM-DD formatında olmalıdır' },
          { status: 400 }
        );
      }
      const result = await TimelineService.getTasksForDateRange(session.user.id, startDate, endDate);
      return NextResponse.json(result);
    }

    // Günlük görünüm: date
    if (!date || !datePattern.test(date)) {
      return NextResponse.json(
        { error: 'Geçersiz tarih. YYYY-MM-DD formatında olmalıdır' },
        { status: 400 }
      );
    }

    const result = await TimelineService.getTasksForDate(session.user.id, date);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Timeline getirme hatası:', error);
    return NextResponse.json({ error: error.message || 'Sunucu hatası' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = createTimelineTaskSchema.parse(body);

    const task = await TimelineService.createTask(validatedData, session.user.id);
    return NextResponse.json(task, { status: 201 });
  } catch (error: any) {
    console.error('Timeline görev oluşturma hatası:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Geçersiz giriş verisi', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: error.message || 'Sunucu hatası' }, { status: 500 });
  }
}
