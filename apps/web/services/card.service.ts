/**
 * Card Service
 * 
 * Kart CRUD işlemlerini yönetir.
 * 
 * Yetkiler:
 * - Kart oluşturma/düzenleme/silme: Board üyesi olmalı
 * - Kart taşıma: Board üyesi olmalı
 */

import { prisma } from 'database';
import { CreateCardInput, UpdateCardInput, MoveCardInput } from '@/lib/validations';

export class CardService {
  /**
   * Yeni kart oluşturur
   */
  static async createCard(data: CreateCardInput, userId: string) {
    // Liste erişim kontrolü
    const list = await prisma.list.findFirst({
      where: {
        id: data.listId,
        board: {
          OR: [
            { ownerId: userId },
            { members: { some: { userId } } },
          ],
        },
      },
    });

    if (!list) {
      throw new Error('Liste bulunamadı veya erişim izniniz yok');
    }

    const created = await prisma.card.create({
      data: {
        ...data,
        creatorId: userId,
      },
      include: {
        creator: {
          select: { id: true, name: true, image: true }
        },
        assignees: {
          select: { id: true, name: true, image: true }
        },
        labels: { include: { label: true } },
      },
    });
    return { ...created, labels: created.labels.map((cl) => cl.label) };
  }

  /**
   * Kart günceller
   */
  static async updateCard(
    cardId: string,
    data: UpdateCardInput,
    userId: string
  ) {
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
    });

    if (!card) {
      throw new Error('Kart bulunamadı veya erişim izniniz yok');
    }

    const updated = await prisma.card.update({
      where: { id: cardId },
      data,
      include: {
        creator: {
          select: { id: true, name: true, image: true }
        },
        assignees: {
          select: { id: true, name: true, image: true }
        },
        labels: { include: { label: true } },
      },
    });
    return { ...updated, labels: updated.labels.map((cl) => cl.label) };
  }

  /**
   * Kartı başka bir listeye taşır veya aynı listede pozisyonunu değiştirir
   * 
   * NOT: Bu aşamada drag&drop UI yok, ama API hazır
   */
  static async moveCard(
    cardId: string,
    data: MoveCardInput,
    userId: string
  ) {
    // Kart erişim kontrolü
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
    });

    if (!card) {
      throw new Error('Kart bulunamadı veya erişim izniniz yok');
    }

    // Hedef liste erişim kontrolü
    const targetList = await prisma.list.findFirst({
      where: {
        id: data.listId,
        board: {
          OR: [
            { ownerId: userId },
            { members: { some: { userId } } },
          ],
        },
      },
    });

    if (!targetList) {
      throw new Error('Hedef liste bulunamadı veya erişim izniniz yok');
    }

    const moved = await prisma.card.update({
      where: { id: cardId },
      data: {
        listId: data.listId,
        position: data.position,
      },
      include: {
        creator: {
          select: { id: true, name: true, image: true }
        },
        assignees: {
          select: { id: true, name: true, image: true }
        },
        labels: { include: { label: true } },
      },
    });
    return { ...moved, labels: moved.labels.map((cl) => cl.label) };
  }

  /**
   * Kart siler
   */
  static async deleteCard(cardId: string, userId: string) {
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
    });

    if (!card) {
      throw new Error('Kart bulunamadı veya erişim izniniz yok');
    }

    return prisma.card.delete({
      where: { id: cardId },
    });
  }

  /**
   * Kart detaylarını getirir
   */
  static async getCardById(cardId: string, userId: string) {
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
      include: {
        creator: {
          select: { id: true, name: true, email: true, image: true }
        },
        assignees: {
          select: { id: true, name: true, email: true, image: true }
        },
        list: {
          select: { id: true, title: true, boardId: true },
        },
        labels: { include: { label: true } },
      },
    });

    if (!card) {
      throw new Error('Kart bulunamadı veya erişim izniniz yok');
    }

    return { ...card, labels: card.labels.map((cl) => cl.label) };
  }
}
