/**
 * PATCH  /api/checklists/[id] — Kontrol listesi adını günceller
 * DELETE /api/checklists/[id] — Kontrol listesini siler
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "database";
import { z } from "zod";

const updateChecklistSchema = z.object({
  name: z.string().min(1, "Kontrol listesi adı boş olamaz").max(255),
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
 * PATCH /api/checklists/[id]
 * Kontrol listesi adını günceller
 */
export async function PATCH(
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
    const validatedData = updateChecklistSchema.parse(body);

    const checklist = await prisma.checklist.update({
      where: { id: checklistId },
      data: { name: validatedData.name },
      include: { items: { orderBy: { position: "asc" } } },
    });

    return NextResponse.json(checklist, { status: 200 });
  } catch (error) {
    console.error("Kontrol listesi güncelleme hatası:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Kontrol listesi güncellenemedi" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/checklists/[id]
 * Kontrol listesini ve tüm öğelerini siler (Cascade)
 */
export async function DELETE(
  _req: NextRequest,
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

    await prisma.checklist.delete({ where: { id: checklistId } });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Kontrol listesi silme hatası:", error);
    return NextResponse.json(
      { error: "Kontrol listesi silinemedi" },
      { status: 500 }
    );
  }
}
