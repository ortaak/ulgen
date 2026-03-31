/**
 * Attachment Service
 *
 * Dosya eki CRUD işlemlerini yönetir.
 * API route'larından ayrılmış iş mantığı (business logic) katmanı.
 *
 * Yetkiler:
 * - Ekleri görüntüleme: Board üyesi olmalı
 * - Ek silme: Dosyayı yükleyen kullanıcı veya board sahibi olmalı
 */

import { prisma } from "database";

export class AttachmentService {
  /**
   * Karta ait tüm dosya eklerini getirir
   * Yeni → eski sıralama ile
   */
  static async getCardAttachments(cardId: string, userId: string) {
    // Önce erişim yetkisi kontrol et
    const card = await prisma.card.findFirst({
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

    if (!card) {
      throw new Error("Kart bulunamadı veya erişim yetkiniz yok");
    }

    return prisma.attachment.findMany({
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
  }

  /**
   * Dosya ekini siler
   * Yalnızca dosyayı yükleyen kullanıcı veya board sahibi silebilir
   */
  static async canDeleteAttachment(
    attachmentId: string,
    userId: string
  ): Promise<{ canDelete: boolean; key: string | null }> {
    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId },
      include: {
        card: {
          include: {
            list: {
              include: {
                board: {
                  select: { ownerId: true },
                },
              },
            },
          },
        },
      },
    });

    if (!attachment) {
      return { canDelete: false, key: null };
    }

    const isUploader = attachment.userId === userId;
    const isBoardOwner = attachment.card.list.board.ownerId === userId;

    return {
      canDelete: isUploader || isBoardOwner,
      key: attachment.key,
    };
  }
}
