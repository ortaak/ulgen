/**
 * Board Members API
 * 
 * POST /api/boards/[id]/members - Board'a üye ekler
 * DELETE /api/boards/[id]/members - Board'dan üye çıkarır
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { BoardService } from '@/services/board.service';
import { addBoardMemberSchema } from '@/lib/validations';

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
    const validatedData = addBoardMemberSchema.parse(body);

    const member = await BoardService.addMember(
      params.id,
      validatedData,
      session.user.id
    );

    return NextResponse.json(member, { status: 201 });
  } catch (error: any) {
    console.error('Üye ekleme hatası:', error);
    
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

    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get('userId');

    if (!memberId) {
      return NextResponse.json(
        { error: 'Kullanıcı ID gerekli' },
        { status: 400 }
      );
    }

    await BoardService.removeMember(
      params.id,
      memberId,
      session.user.id
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Üye çıkarma hatası:', error);
    return NextResponse.json(
      { error: error.message || 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
