/**
 * Lists API
 * 
 * POST /api/lists - Yeni liste oluşturur
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ListService } from '@/services/list.service';
import { createListSchema } from '@/lib/validations';

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
    const validatedData = createListSchema.parse(body);

    const list = await ListService.createList(
      validatedData,
      session.user.id
    );

    return NextResponse.json(list, { status: 201 });
  } catch (error: any) {
    console.error('Liste oluşturma hatası:', error);
    
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
