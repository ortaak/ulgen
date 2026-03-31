/**
 * Card Move API
 * 
 * POST /api/cards/[id]/move - Kartı başka bir listeye taşır
 * 
 * Not: Aşama 1'de drag&drop UI yok, ancak API hazır
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { CardService } from '@/services/card.service';
import { moveCardSchema } from '@/lib/validations';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validatedData = moveCardSchema.parse(body);

    const card = await CardService.moveCard(
      params.id,
      validatedData,
      session.user.id
    );

    return NextResponse.json(card);
  } catch (error: any) {
    console.error('Kart taşıma hatası:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Geçersiz giriş verisi', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
