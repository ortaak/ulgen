/**
 * PATCH  /api/checklist-items/[id] — Öğe adını veya checked durumunu günceller
 * DELETE /api/checklist-items/[id] — Öğeyi siler
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "database";
import { z } from "zod";

const updateItemSchema = z.object({
  name: z.string().min(1).max(512).optional(),
  checked: z.boolean().optional(),
}).refine((data) => data.name !== undefined || data.checked !== undefined, {
  message: "name veya checked alanlarından en az biri gerekli",
});

async function checkItemAccess(itemId: string, userId: string) {
  return prisma.checklistItem.findFirst({
    where: {
      id: itemId,
      checklist: {
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
    },
    select: { id: true },
  });
}

/**
 * PATCH /api/checklist-items/[id]
 * Öğenin adını veya tamamlanma durumunu günceller
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

    const { id: itemId } = params;

    const access = await checkItemAccess(itemId, session.user.id);
    if (!access) {
      return NextResponse.json(
        { error: "Öğe bulunamadı veya erişim yetkiniz yok" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const validatedData = updateItemSchema.parse(body);

    const item = await prisma.checklistItem.update({
      where: { id: itemId },
      data: {
        ...(validatedData.name !== undefined && { name: validatedData.name }),
        ...(validatedData.checked !== undefined && { checked: validatedData.checked }),
      },
    });

    return NextResponse.json(item, { status: 200 });
  } catch (error) {
    console.error("Kontrol listesi öğesi güncelleme hatası:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Öğe güncellenemedi" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/checklist-items/[id]
 * Kontrol listesi öğesini siler
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

    const { id: itemId } = params;

    const access = await checkItemAccess(itemId, session.user.id);
    if (!access) {
      return NextResponse.json(
        { error: "Öğe bulunamadı veya erişim yetkiniz yok" },
        { status: 404 }
      );
    }

    await prisma.checklistItem.delete({ where: { id: itemId } });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Kontrol listesi öğesi silme hatası:", error);
    return NextResponse.json(
      { error: "Öğe silinemedi" },
      { status: 500 }
    );
  }
}
