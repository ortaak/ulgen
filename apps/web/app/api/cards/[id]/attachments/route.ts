/**
 * GET  /api/cards/[id]/attachments — Karta ait dosya eklerini listeler
 * POST /api/cards/[id]/attachments — Yüklenen dosyanın metadata'sını kaydeder
 *
 * NOT: Dosya yükleme işlemi UploadThing tarafından /api/uploadthing üzerinden yapılır.
 * Bu endpoint yalnızca yükleme sonrası Prisma'ya kayıt için kullanılır.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "database";
import { z } from "zod";

// Yükleme sonrası metadata kayıt şeması
const saveAttachmentSchema = z.object({
  name: z.string().min(1, "Dosya adı boş olamaz").max(255),
  url: z.string().url("Geçersiz URL"),
  key: z.string().min(1, "UploadThing key boş olamaz"),
  mimeType: z.string().min(1, "MIME tipi boş olamaz"),
  size: z.number().int().positive("Dosya boyutu pozitif olmalıdır"),
});

/**
 * Kullanıcının karta erişim yetkisi var mı kontrol eder
 */
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
 * GET /api/cards/[id]/attachments
 * Karta ait tüm dosya eklerini getirir (yeni → eski sıralama)
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

    // Erişim kontrolü
    const card = await checkCardAccess(cardId, session.user.id);
    if (!card) {
      return NextResponse.json(
        { error: "Kart bulunamadı veya erişim yetkiniz yok" },
        { status: 404 }
      );
    }

    const attachments = await prisma.attachment.findMany({
      where: { cardId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(attachments, { status: 200 });
  } catch (error) {
    console.error("Dosya ekleri getirme hatası:", error);
    return NextResponse.json(
      { error: "Dosya ekleri getirilemedi" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cards/[id]/attachments
 * UploadThing'e yüklenen dosyanın metadata'sını Prisma'ya kaydeder.
 * Frontend, dosyayı UploadThing'e yükledikten sonra bu endpoint'i çağırır.
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

    // Erişim kontrolü
    const card = await checkCardAccess(cardId, session.user.id);
    if (!card) {
      return NextResponse.json(
        { error: "Kart bulunamadı veya erişim yetkiniz yok" },
        { status: 404 }
      );
    }

    const body = await req.json();

    // Validation
    const validatedData = saveAttachmentSchema.parse(body);

    // Prisma'ya kaydet
    const attachment = await prisma.attachment.create({
      data: {
        name: validatedData.name,
        url: validatedData.url,
        key: validatedData.key,
        mimeType: validatedData.mimeType,
        size: validatedData.size,
        cardId,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(attachment, { status: 201 });
  } catch (error) {
    console.error("Dosya eki kaydetme hatası:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Dosya eki kaydedilemedi" },
      { status: 500 }
    );
  }
}
