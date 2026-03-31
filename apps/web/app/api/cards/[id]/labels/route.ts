import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "database";
import { z } from "zod";

const addLabelSchema = z.object({
  labelId: z.string().cuid("Geçersiz etiket ID"),
});

/**
 * POST /api/cards/[id]/labels
 * Karta label ekler
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: cardId } = params;
    const body = await req.json();

    const { labelId } = addLabelSchema.parse(body);

    // Kart var mı ve erişim yetkisi var mı kontrol et
    const card = await prisma.card.findUnique({
      where: { id: cardId },
      include: {
        list: {
          include: {
            board: {
              include: {
                members: {
                  where: { userId: session.user.id },
                },
              },
            },
          },
        },
      },
    });

    if (!card) {
      return NextResponse.json({ error: "Kart bulunamadı" }, { status: 404 });
    }

    if (card.list.board.members.length === 0) {
      return NextResponse.json(
        { error: "Bu karta erişim yetkiniz yok" },
        { status: 403 }
      );
    }

    // Label board'a ait mi kontrol et
    const label = await prisma.label.findFirst({
      where: { id: labelId, boardId: card.list.board.id },
    });

    if (!label) {
      return NextResponse.json(
        { error: "Etiket bu board'a ait değil" },
        { status: 400 }
      );
    }

    // Zaten eklenmiş mi kontrol et (upsert ile güvenli)
    await prisma.cardLabel.upsert({
      where: { cardId_labelId: { cardId, labelId } },
      create: { cardId, labelId },
      update: {},
    });

    return NextResponse.json(label, { status: 201 });
  } catch (error) {
    console.error("Karta label ekleme hatası:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Etiket karta eklenemedi" },
      { status: 500 }
    );
  }
}
