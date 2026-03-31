/**
 * Card Dependencies API
 *
 * GET  /api/cards/[id]/dependencies  — Kartın tüm bağımlılıklarını getirir
 * POST /api/cards/[id]/dependencies  — Yeni bağımlılık ekler { blockingCardId }
 *
 * Terminoloji:
 *   blockingCard = önce bitmesi gereken kart
 *   blockedCard  = bekleyen (bağımlı) kart  ← bu endpoint'teki [id]
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "database";
import { z } from "zod";

const addDependencySchema = z.object({
  blockingCardId: z.string().cuid("Geçersiz kart ID"),
});

// Erişim yetkisi + kartı getiren yardımcı
async function getCardWithAccess(cardId: string, userId: string) {
  const card = await prisma.card.findUnique({
    where: { id: cardId },
    include: {
      list: {
        include: {
          board: {
            include: {
              members: { where: { userId } },
            },
          },
        },
      },
    },
  });

  if (!card) return null;
  if (card.list.board.ownerId !== userId && card.list.board.members.length === 0) {
    return null; // erişim yok
  }
  return card;
}

/**
 * BFS ile dairesel bağımlılık kontrolü.
 * "blockingCardId → blockedCardId → ..." zincirinde hedefCardId var mı?
 * Varsa döngü oluşur → reddedilmeli.
 */
async function wouldCreateCycle(
  newBlockingCardId: string,
  newBlockedCardId: string
): Promise<boolean> {
  // newBlockedCardId'nin "blockingFor" zincirinde newBlockingCardId ulaşabilir mi?
  // Yani newBlockedCardId dolaylı olarak newBlockingCardId'yi bloklayabilir mi?
  const visited = new Set<string>();
  const queue: string[] = [newBlockedCardId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current === newBlockingCardId) return true; // döngü bulundu
    if (visited.has(current)) continue;
    visited.add(current);

    // current kartın "blockingFor" (current başkalarını blokluyor) bağımlılıklarını bul
    const deps = await prisma.cardDependency.findMany({
      where: { blockingCardId: current },
      select: { blockedCardId: true },
    });
    for (const dep of deps) {
      queue.push(dep.blockedCardId);
    }
  }

  return false;
}

/**
 * GET /api/cards/[id]/dependencies
 * Kartın tüm bağımlılıklarını döner:
 *   - blockedBy: bu kartın beklediği kartlar (bu kart önce bunların bitmesini bekliyor)
 *   - blockingFor: bu kartın bloke ettiği kartlar (bunlar bu kartı bekliyor)
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

    const card = await getCardWithAccess(params.id, session.user.id);
    if (!card) {
      return NextResponse.json(
        { error: "Kart bulunamadı veya erişim yetkiniz yok" },
        { status: 404 }
      );
    }

    const [blockedBy, blockingFor] = await Promise.all([
      // Bu kart hangi kartları bekliyor? (bu kart = blockedCard)
      prisma.cardDependency.findMany({
        where: { blockedCardId: params.id },
        include: {
          blockingCard: {
            select: { id: true, title: true, isCompleted: true, listId: true },
          },
          blockedCard: {
            select: { id: true, title: true, isCompleted: true, listId: true },
          },
        },
        orderBy: { createdAt: "asc" },
      }),
      // Bu kart hangi kartları blokluyor? (bu kart = blockingCard)
      prisma.cardDependency.findMany({
        where: { blockingCardId: params.id },
        include: {
          blockingCard: {
            select: { id: true, title: true, isCompleted: true, listId: true },
          },
          blockedCard: {
            select: { id: true, title: true, isCompleted: true, listId: true },
          },
        },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    return NextResponse.json({ blockedBy, blockingFor });
  } catch (error) {
    console.error("Bağımlılık getirme hatası:", error);
    return NextResponse.json(
      { error: "Bağımlılıklar yüklenemedi" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cards/[id]/dependencies
 * Body: { blockingCardId }
 * [id] kartını blockingCard'a bağımlı kılar.
 * Yani: [id] kartı, blockingCard tamamlanmadan başlayamaz.
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

    const blockedCardId = params.id;
    const body = await req.json();
    const { blockingCardId } = addDependencySchema.parse(body);

    // Kendine bağımlılık yasak
    if (blockingCardId === blockedCardId) {
      return NextResponse.json(
        { error: "Kart kendine bağımlı olamaz" },
        { status: 400 }
      );
    }

    // Erişim kontrolü (her iki kart da erişilebilir olmalı)
    const [blockedCard, blockingCard] = await Promise.all([
      getCardWithAccess(blockedCardId, session.user.id),
      getCardWithAccess(blockingCardId, session.user.id),
    ]);

    if (!blockedCard) {
      return NextResponse.json(
        { error: "Hedef kart bulunamadı veya erişim yetkiniz yok" },
        { status: 404 }
      );
    }

    if (!blockingCard) {
      return NextResponse.json(
        { error: "Bloklayan kart bulunamadı veya erişim yetkiniz yok" },
        { status: 404 }
      );
    }

    // Dairesel bağımlılık kontrolü
    const hasCycle = await wouldCreateCycle(blockingCardId, blockedCardId);
    if (hasCycle) {
      return NextResponse.json(
        {
          error:
            "Dairesel bağımlılık: Bu bağımlılık döngüye yol açar. Eklenemez.",
        },
        { status: 400 }
      );
    }

    // Zaten var mı?
    const existing = await prisma.cardDependency.findUnique({
      where: {
        blockingCardId_blockedCardId: { blockingCardId, blockedCardId },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Bu bağımlılık zaten mevcut" },
        { status: 409 }
      );
    }

    const dependency = await prisma.cardDependency.create({
      data: { blockingCardId, blockedCardId },
      include: {
        blockingCard: {
          select: { id: true, title: true, isCompleted: true, listId: true },
        },
        blockedCard: {
          select: { id: true, title: true, isCompleted: true, listId: true },
        },
      },
    });

    return NextResponse.json(dependency, { status: 201 });
  } catch (error) {
    console.error("Bağımlılık ekleme hatası:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Bağımlılık eklenemedi" },
      { status: 500 }
    );
  }
}
