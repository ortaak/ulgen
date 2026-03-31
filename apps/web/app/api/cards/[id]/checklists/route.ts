/**
 * GET  /api/cards/[id]/checklists — Karta ait kontrol listelerini getirir
 * POST /api/cards/[id]/checklists — Yeni kontrol listesi oluşturur
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "database";
import { z } from "zod";

const createChecklistSchema = z.object({
  name: z.string().min(1, "Kontrol listesi adı boş olamaz").max(255),
});

async function checkCardAccess(cardId: string, userId: string) {
  return prisma.card.findFirst({
    where: {
      id: cardId,
      list: {
        board: {
          OR: [
            { ownerId: userId },
            { members: { some: { userId } } },
          ],
        },
      },
    },
    select: { id: true },
  });
}

/**
 * GET /api/cards/[id]/checklists
 * Karta ait tüm kontrol listelerini öğeleriyle birlikte getirir
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const { id: cardId } = params;

    const card = await checkCardAccess(cardId, session.user.id);
    if (!card) {
      return NextResponse.json(
        { error: "Kart bulunamadı veya erişim yetkiniz yok" },
        { status: 404 }
      );
    }

    const checklists = await prisma.checklist.findMany({
      where: { cardId },
      include: {
        items: {
          orderBy: { position: "asc" },
        },
      },
      orderBy: { position: "asc" },
    });

    return NextResponse.json(checklists, { status: 200 });
  } catch (error) {
    console.error("Kontrol listeleri getirme hatası:", error);
    return NextResponse.json(
      { error: "Kontrol listeleri getirilemedi" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cards/[id]/checklists
 * Yeni bir kontrol listesi oluşturur
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

    const { id: cardId } = params;

    const card = await checkCardAccess(cardId, session.user.id);
    if (!card) {
      return NextResponse.json(
        { error: "Kart bulunamadı veya erişim yetkiniz yok" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const validatedData = createChecklistSchema.parse(body);

    // Yeni kontrol listesinin pozisyonunu belirle (en sona ekle)
    const lastChecklist = await prisma.checklist.findFirst({
      where: { cardId },
      orderBy: { position: "desc" },
      select: { position: true },
    });
    const position = (lastChecklist?.position ?? -1) + 1;

    const checklist = await prisma.checklist.create({
      data: {
        name: validatedData.name,
        position,
        cardId,
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json(checklist, { status: 201 });
  } catch (error) {
    console.error("Kontrol listesi oluşturma hatası:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Kontrol listesi oluşturulamadı" },
      { status: 500 }
    );
  }
}
