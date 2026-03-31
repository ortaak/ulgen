import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "database";
import { z } from "zod";

// Validation schema
const commentUpdateSchema = z.object({
  content: z.string().min(1, "Yorum içeriği boş olamaz").max(5000, "Yorum çok uzun"),
});

/**
 * PUT /api/comments/[id]
 * Bir yorumu günceller (sadece yorum sahibi)
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: commentId } = params;
    const body = await req.json();

    // Validation
    const validatedData = commentUpdateSchema.parse(body);

    // Yorumun var olduğunu kontrol et
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        author: true,
        card: {
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
        },
      },
    });

    if (!comment) {
      return NextResponse.json({ error: "Yorum bulunamadı" }, { status: 404 });
    }

    // Yetki kontrolü: Sadece yorum sahibi düzenleyebilir
    if (comment.authorId !== session.user.id) {
      return NextResponse.json(
        { error: "Bu yorumu düzenleme yetkiniz yok" },
        { status: 403 }
      );
    }

    // Board erişim kontrolü
    if (comment.card.list.board.members.length === 0) {
      return NextResponse.json(
        { error: "Bu kartın board'una erişim yetkiniz yok" },
        { status: 403 }
      );
    }

    // Yorumu güncelle
    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: {
        content: validatedData.content,
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

    return NextResponse.json(updatedComment, { status: 200 });
  } catch (error) {
    console.error("Yorum güncelleme hatası:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Yorum güncellenemedi" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/comments/[id]
 * Bir yorumu siler (sadece yorum sahibi veya board owner)
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: commentId } = params;

    // Yorumun var olduğunu kontrol et
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        author: true,
        card: {
          include: {
            list: {
              include: {
                board: {
                  include: {
                    members: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!comment) {
      return NextResponse.json({ error: "Yorum bulunamadı" }, { status: 404 });
    }

    // Yetki kontrolü: Yorum sahibi veya board owner silebilir
    const isAuthor = comment.authorId === session.user.id;
    const isOwner = comment.card.list.board.ownerId === session.user.id;
    const isMember = comment.card.list.board.members.some(
      (m: { userId: string }) => m.userId === session.user.id
    );

    if (!isMember) {
      return NextResponse.json(
        { error: "Bu kartın board'una erişim yetkiniz yok" },
        { status: 403 }
      );
    }

    if (!isAuthor && !isOwner) {
      return NextResponse.json(
        { error: "Bu yorumu silme yetkiniz yok" },
        { status: 403 }
      );
    }

    // Yorumu sil
    await prisma.comment.delete({
      where: { id: commentId },
    });

    return NextResponse.json(
      { message: "Yorum başarıyla silindi" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Yorum silme hatası:", error);
    return NextResponse.json(
      { error: "Yorum silinemedi" },
      { status: 500 }
    );
  }
}
