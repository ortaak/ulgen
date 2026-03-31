/**
 * Single Card API
 * 
 * GET /api/cards/[id] - Kart detaylarını getirir
 * PATCH /api/cards/[id] - Kart günceller
 * DELETE /api/cards/[id] - Kart siler
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { CardService } from '@/services/card.service';
import { updateCardSchema } from '@/lib/validations';

export async function GET(
  _req: Request,
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

    const card = await CardService.getCardById(
      params.id,
      session.user.id
    );

    return NextResponse.json(card);
  } catch (error: any) {
    console.error('Kart getirme hatası:', error);
    
    const status = error.message.includes('bulunamadı') ? 404 : 500;
    return NextResponse.json(
      { error: error.message || 'Sunucu hatası' },
      { status }
    );
  }
}

export async function PATCH(
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
    const validatedData = updateCardSchema.parse(body);

    const card = await CardService.updateCard(
      params.id,
      validatedData,
      session.user.id
    );

    return NextResponse.json(card);
  } catch (error: any) {
    console.error('Kart güncelleme hatası:', error);
    
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

export async function DELETE(
  _req: Request,
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

    await CardService.deleteCard(params.id, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Kart silme hatası:', error);
    return NextResponse.json(
      { error: error.message || 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
