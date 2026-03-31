/**
 * Single List API
 * 
 * PATCH /api/lists/[id] - Liste günceller
 * DELETE /api/lists/[id] - Liste siler
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ListService } from '@/services/list.service';
import { updateListSchema } from '@/lib/validations';

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
    const validatedData = updateListSchema.parse(body);

    const list = await ListService.updateList(
      params.id,
      validatedData,
      session.user.id
    );

    return NextResponse.json(list);
  } catch (error: any) {
    console.error('Liste güncelleme hatası:', error);
    
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

    await ListService.deleteList(params.id, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Liste silme hatası:', error);
    return NextResponse.json(
      { error: error.message || 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
