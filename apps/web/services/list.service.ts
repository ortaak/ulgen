/**
 * List Service
 * 
 * Liste CRUD işlemlerini yönetir.
 * 
 * Yetkiler:
 * - Liste oluşturma/düzenleme/silme: Board üyesi olmalı
 */

import { prisma } from 'database';
import { CreateListInput, UpdateListInput } from '@/lib/validations';

export class ListService {
  /**
   * Yeni liste oluşturur
   */
  static async createList(data: CreateListInput, userId: string) {
    // Board erişim kontrolü
    const board = await prisma.board.findFirst({
      where: {
        id: data.boardId,
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } },
        ],
      },
    });

    if (!board) {
      throw new Error('Board bulunamadı veya erişim izniniz yok');
    }

    return prisma.list.create({
      data,
      include: {
        cards: {
          include: {
            creator: { 
              select: { id: true, name: true, image: true } 
            },
            assignees: { 
              select: { id: true, name: true, image: true } 
            },
          },
          orderBy: { position: 'asc' },
        },
      },
    });
  }

  /**
   * Liste günceller
   */
  static async updateList(
    listId: string,
    data: UpdateListInput,
    userId: string
  ) {
    const list = await prisma.list.findFirst({
      where: {
        id: listId,
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

    return prisma.list.update({
      where: { id: listId },
      data,
    });
  }

  /**
   * Liste siler
   */
  static async deleteList(listId: string, userId: string) {
    const list = await prisma.list.findFirst({
      where: {
        id: listId,
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

    return prisma.list.delete({
      where: { id: listId },
    });
  }
}
