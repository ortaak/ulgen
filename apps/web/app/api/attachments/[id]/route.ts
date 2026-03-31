/**
 * DELETE /api/attachments/[id] — Dosya ekini siler
 *
 * İki işlem yapar:
 * 1. UploadThing CDN'den dosyayı siler (UTApi kullanarak)
 * 2. Prisma veritabanından kaydı siler
 *
 * Yetki: Dosyayı yükleyen kullanıcı veya board sahibi silebilir.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "database";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

/**
 * DELETE /api/attachments/[id]
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

    const { id: attachmentId } = params;

    // Eki ve ilişkili board bilgilerini bul
    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId },
      include: {
        card: {
          include: {
            list: {
              include: {
                board: {
                  select: {
                    ownerId: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!attachment) {
      return NextResponse.json(
        { error: "Dosya eki bulunamadı" },
        { status: 404 }
      );
    }

    const boardOwnerId = attachment.card.list.board.ownerId;
    const isOwner = attachment.userId === session.user.id;
    const isBoardOwner = boardOwnerId === session.user.id;

    // Yalnızca dosyayı yükleyen veya board sahibi silebilir
    if (!isOwner && !isBoardOwner) {
      return NextResponse.json(
        { error: "Bu dosyayı silme yetkiniz yok" },
        { status: 403 }
      );
    }

    // 1. UploadThing CDN'den dosyayı sil
    await utapi.deleteFiles(attachment.key);

    // 2. Prisma'dan kaydı sil
    await prisma.attachment.delete({
      where: { id: attachmentId },
    });

    return NextResponse.json(
      { message: "Dosya eki başarıyla silindi" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Dosya eki silme hatası:", error);
    return NextResponse.json(
      { error: "Dosya eki silinemedi" },
      { status: 500 }
    );
  }
}
