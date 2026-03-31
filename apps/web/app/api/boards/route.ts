/**
 * Boards API
 * 
 * GET /api/boards - Kullanıcının tüm board'larını getirir
 * POST /api/boards - Yeni board oluşturur
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { BoardService } from '@/services/board.service';
import { createBoardSchema } from '@/lib/validations';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    const boards = await BoardService.getUserBoards(session.user.id);
    return NextResponse.json(boards);
  } catch (error: any) {
    console.error('Board listesi hatası:', error);
    return NextResponse.json(
      { error: error.message || 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

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
    const validatedData = createBoardSchema.parse(body);

    const board = await BoardService.createBoard(
      validatedData,
      session.user.id
    );

    return NextResponse.json(board, { status: 201 });
  } catch (error: any) {
    console.error('Board oluşturma hatası:', error);
    
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
