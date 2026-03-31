/**
 * User Registration API
 * 
 * Yeni kullanıcı kaydı için endpoint.
 * 
 * POST /api/auth/register
 * Body: { email, name, password }
 */

import { NextResponse } from 'next/server';
import { prisma } from 'database';
import * as bcrypt from 'bcryptjs';
import { registerSchema } from '@/lib/validations';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Input validation
    const validatedData = registerSchema.parse(body);

    // Kullanıcı zaten var mı?
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Bu email adresi zaten kullanılıyor' },
        { status: 400 }
      );
    }

    // Şifre hash'le
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Kullanıcı oluştur
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        name: validatedData.name,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error: any) {
    console.error('Kayıt hatası:', error);
    
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
