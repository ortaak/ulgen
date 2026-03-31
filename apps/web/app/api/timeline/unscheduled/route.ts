/**
 * Unscheduled Cards API
 *
 * GET /api/timeline/unscheduled?date=YYYY-MM-DD
 * — Belirtilen gün için henüz planlanmamış kartları getirir
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { TimelineService } from '@/services/timeline.service';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: 'Geçersiz tarih. YYYY-MM-DD formatında olmalıdır' },
        { status: 400 }
      );
    }

    const cards = await TimelineService.getUnscheduledCards(session.user.id, date);
    return NextResponse.json({ cards });
  } catch (error: any) {
    console.error('Planlanmamış kartlar getirme hatası:', error);
    return NextResponse.json({ error: error.message || 'Sunucu hatası' }, { status: 500 });
  }
}
