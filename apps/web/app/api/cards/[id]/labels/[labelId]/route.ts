import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "database";

/**
 * DELETE /api/cards/[id]/labels/[labelId]
 * Karttan label çıkarır
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string; labelId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: cardId, labelId } = params;

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

    // CardLabel kaydını sil (yoksa hata vermez)
    await prisma.cardLabel.deleteMany({
      where: { cardId, labelId },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Karttan label çıkarma hatası:", error);
    return NextResponse.json(
      { error: "Etiket karttan çıkarılamadı" },
      { status: 500 }
    );
  }
}
