import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "database";
import { createLabelSchema } from "@/lib/validations";
import { z } from "zod";

/**
 * GET /api/boards/[id]/labels
 * Board'a ait tüm label'ları getirir
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

    const { id: boardId } = params;

    // Board'un var olduğunu ve kullanıcının erişim yetkisini kontrol et
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      include: {
        members: {
          where: { userId: session.user.id },
        },
      },
    });

    if (!board) {
      return NextResponse.json({ error: "Board bulunamadı" }, { status: 404 });
    }

    if (board.members.length === 0) {
      return NextResponse.json(
        { error: "Bu board'a erişim yetkiniz yok" },
        { status: 403 }
      );
    }

    const labels = await prisma.label.findMany({
      where: { boardId },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(labels, { status: 200 });
  } catch (error) {
    console.error("Label getirme hatası:", error);
    return NextResponse.json(
      { error: "Etiketler getirilemedi" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/boards/[id]/labels
 * Board'a yeni label oluşturur
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

    const { id: boardId } = params;
    const body = await req.json();

    const validatedData = createLabelSchema.parse(body);

    // Board erişim kontrolü
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      include: {
        members: {
          where: { userId: session.user.id },
        },
      },
    });

    if (!board) {
      return NextResponse.json({ error: "Board bulunamadı" }, { status: 404 });
    }

    if (board.members.length === 0) {
      return NextResponse.json(
        { error: "Bu board'a etiket ekleme yetkiniz yok" },
        { status: 403 }
      );
    }

    const label = await prisma.label.create({
      data: {
        name: validatedData.name,
        color: validatedData.color,
        boardId,
      },
    });

    return NextResponse.json(label, { status: 201 });
  } catch (error) {
    console.error("Label oluşturma hatası:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Etiket oluşturulamadı" },
      { status: 500 }
    );
  }
}
