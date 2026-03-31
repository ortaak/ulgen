/**
 * POST /api/checklists/[id]/items — Kontrol listesine yeni öğe ekler
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "database";
import { z } from "zod";

const createItemSchema = z.object({
  name: z.string().min(1, "Öğe adı boş olamaz").max(512),
});

async function checkChecklistAccess(checklistId: string, userId: string) {
  return prisma.checklist.findFirst({
    where: {
      id: checklistId,
      card: {
        list: {
          board: {
            OR: [
              { ownerId: userId },
              { members: { some: { userId } } },
            ],
          },
        },
      },
    },
    select: { id: true },
  });
}

/**
 * POST /api/checklists/[id]/items
 * Kontrol listesine yeni bir öğe ekler
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const { id: checklistId } = params;

    const access = await checkChecklistAccess(checklistId, session.user.id);
    if (!access) {
      return NextResponse.json(
        { error: "Kontrol listesi bulunamadı veya erişim yetkiniz yok" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const validatedData = createItemSchema.parse(body);

    // En sona eklemek için mevcut maksimum pozisyonu bul
    const lastItem = await prisma.checklistItem.findFirst({
      where: { checklistId },
      orderBy: { position: "desc" },
      select: { position: true },
    });
    const position = (lastItem?.position ?? -1) + 1;

    const item = await prisma.checklistItem.create({
      data: {
        name: validatedData.name,
        checked: false,
        position,
        checklistId,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Kontrol listesi öğesi ekleme hatası:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Öğe eklenemedi" },
      { status: 500 }
    );
  }
}
