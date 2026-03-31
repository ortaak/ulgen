/**
 * Single Board API
 * 
 * GET /api/boards/[id] - Board detaylarını getirir
 * PATCH /api/boards/[id] - Board'u günceller
 * DELETE /api/boards/[id] - Board'u siler
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { BoardService } from '@/services/board.service';
import { updateBoardSchema } from '@/lib/validations';

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

    const board = await BoardService.getBoardById(
      params.id,
      session.user.id
    );

    return NextResponse.json(board);
  } catch (error: any) {
    console.error('Board getirme hatası:', error);
    
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
    const validatedData = updateBoardSchema.parse(body);

    const board = await BoardService.updateBoard(
      params.id,
      validatedData,
      session.user.id
    );

    return NextResponse.json(board);
  } catch (error: any) {
    console.error('Board güncelleme hatası:', error);
    
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

    await BoardService.deleteBoard(params.id, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Board silme hatası:', error);
    return NextResponse.json(
      { error: error.message || 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
