import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "database";
import { updateLabelSchema } from "@/lib/validations";
import { z } from "zod";

/**
 * PATCH /api/labels/[id]
 * Label'ı günceller (name ve/veya color)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: labelId } = params;
    const body = await req.json();

    const validatedData = updateLabelSchema.parse(body);

    // Label var mı ve kullanıcının board'a erişimi var mı kontrol et
    const label = await prisma.label.findUnique({
      where: { id: labelId },
      include: {
        board: {
          include: {
            members: {
              where: { userId: session.user.id },
            },
          },
        },
      },
    });

    if (!label) {
      return NextResponse.json({ error: "Etiket bulunamadı" }, { status: 404 });
    }

    if (label.board.members.length === 0) {
      return NextResponse.json(
        { error: "Bu etiketi düzenleme yetkiniz yok" },
        { status: 403 }
      );
    }

    const updatedLabel = await prisma.label.update({
      where: { id: labelId },
      data: validatedData,
    });

    return NextResponse.json(updatedLabel, { status: 200 });
  } catch (error) {
    console.error("Label güncelleme hatası:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Etiket güncellenemedi" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/labels/[id]
 * Label'ı siler (CardLabel kayıtları cascade ile silinir)
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

    const { id: labelId } = params;

    // Label var mı ve kullanıcının board'a erişimi var mı kontrol et
    const label = await prisma.label.findUnique({
      where: { id: labelId },
      include: {
        board: {
          include: {
            members: {
              where: { userId: session.user.id },
            },
          },
        },
      },
    });

    if (!label) {
      return NextResponse.json({ error: "Etiket bulunamadı" }, { status: 404 });
    }

    if (label.board.members.length === 0) {
      return NextResponse.json(
        { error: "Bu etiketi silme yetkiniz yok" },
        { status: 403 }
      );
    }

    await prisma.label.delete({ where: { id: labelId } });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Label silme hatası:", error);
    return NextResponse.json(
      { error: "Etiket silinemedi" },
      { status: 500 }
    );
  }
}
