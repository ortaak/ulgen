/**
 * Cards API
 * 
 * POST /api/cards - Yeni kart oluşturur
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { CardService } from '@/services/card.service';
import { createCardSchema } from '@/lib/validations';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validatedData = createCardSchema.parse(body);

    const card = await CardService.createCard(
      validatedData,
      session.user.id
    );

    return NextResponse.json(card, { status: 201 });
  } catch (error: any) {
    console.error('Kart oluşturma hatası:', error);
    
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
