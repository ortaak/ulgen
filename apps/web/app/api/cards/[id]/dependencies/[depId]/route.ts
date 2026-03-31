/**
 * DELETE /api/cards/[id]/dependencies/[depId]
 * Belirtilen bağımlılık kaydını siler.
 * [id]: kartın ID'si (erişim kontrolü için)
 * [depId]: CardDependency kaydının ID'si
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "database";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string; depId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    // Bağımlılık kaydını bul
    const dependency = await prisma.cardDependency.findUnique({
      where: { id: params.depId },
      include: {
        blockingCard: {
          include: {
            list: {
              include: {
                board: {
                  include: {
                    members: { where: { userId: session.user.id } },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!dependency) {
      return NextResponse.json(
        { error: "Bağımlılık bulunamadı" },
        { status: 404 }
      );
    }

    // Bu bağımlılık doğru karta ait mi?
    if (
      dependency.blockedCardId !== params.id &&
      dependency.blockingCardId !== params.id
    ) {
      return NextResponse.json(
        { error: "Bu bağımlılık bu karta ait değil" },
        { status: 403 }
      );
    }

    // Erişim kontrolü: board üyesi veya sahibi
    const board = dependency.blockingCard.list.board;
    if (board.ownerId !== session.user.id && board.members.length === 0) {
      return NextResponse.json(
        { error: "Bu bağımlılığı silme yetkiniz yok" },
        { status: 403 }
      );
    }

    await prisma.cardDependency.delete({ where: { id: params.depId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Bağımlılık silme hatası:", error);
    return NextResponse.json(
      { error: "Bağımlılık silinemedi" },
      { status: 500 }
    );
  }
}
