import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "database";
import { z } from "zod";

// Validation schema
const commentSchema = z.object({
  content: z.string().min(1, "Yorum içeriği boş olamaz").max(5000, "Yorum çok uzun"),
});

/**
 * GET /api/cards/[id]/comments
 * Bir karta ait tüm yorumları getirir (yeni -> eski sıralama)
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: cardId } = params;

    // Kartın var olduğunu ve kullanıcının erişim yetkisini kontrol et
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

    // Yorumları getir (yeni -> eski)
    const comments = await prisma.comment.findMany({
      where: { cardId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(comments, { status: 200 });
  } catch (error) {
    console.error("Yorum getirme hatası:", error);
    return NextResponse.json(
      { error: "Yorumlar getirilemedi" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cards/[id]/comments
 * Bir karta yeni yorum ekler
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

    // Validation
    const validatedData = commentSchema.parse(body);

    // Kartın var olduğunu ve kullanıcının erişim yetkisini kontrol et
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
        { error: "Bu karta yorum ekleme yetkiniz yok" },
        { status: 403 }
      );
    }

    // Yorum oluştur
    const comment = await prisma.comment.create({
      data: {
        content: validatedData.content,
        cardId,
        authorId: session.user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Yorum ekleme hatası:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Yorum eklenemedi" },
      { status: 500 }
    );
  }
}
