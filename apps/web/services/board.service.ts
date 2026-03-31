/**
 * Board Service
 * 
 * Board CRUD işlemlerini ve yetkilendirme kontrollerin işler.
 * 
 * Yetkiler:
 * - Board okuma: Sahip veya üye
 * - Board güncelleme: Sahip veya admin
 * - Board silme: Sadece sahip
 * - Üye ekleme/çıkarma: Sahip veya admin
 */

import { prisma } from 'database';
import { CreateBoardInput, UpdateBoardInput, AddBoardMemberInput } from '@/lib/validations';

export class BoardService {
  /**
   * Kullanıcının tüm board'larını getirir
   */
  static async getUserBoards(userId: string) {
    return prisma.board.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } },
        ],
      },
      include: {
        owner: { 
          select: { id: true, name: true, email: true, image: true } 
        },
        members: {
          include: {
            user: { 
              select: { id: true, name: true, email: true, image: true } 
            },
          },
        },
        _count: { 
          select: { lists: true } 
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  /**
   * Board detaylarını getirir (listeler ve kartlarla birlikte)
   */
  static async getBoardById(boardId: string, userId: string) {
    const board = await prisma.board.findFirst({
      where: {
        id: boardId,
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } },
        ],
      },
      include: {
        owner: { 
          select: { id: true, name: true, email: true, image: true } 
        },
        members: {
          include: {
            user: { 
              select: { id: true, name: true, email: true, image: true } 
            },
          },
        },
        labels: {
          orderBy: { id: 'asc' },
        },
        lists: {
          include: {
            cards: {
              include: {
                creator: {
                  select: { id: true, name: true, image: true }
                },
                assignees: {
                  select: { id: true, name: true, image: true }
                },
                labels: {
                  include: { label: true },
                },
                _count: {
                  select: {
                    blockedBy: true,   // Bu kartın beklediği kartlar sayısı
                    blockingFor: true, // Bu kartın bloke ettiği kartlar sayısı
                  },
                },
              },
              orderBy: { position: 'asc' },
            },
          },
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!board) {
      throw new Error('Board bulunamadı veya erişim izniniz yok');
    }

    // CardLabel junction'ını düzleştir: { cardId, labelId, label } → label doğrudan
    return {
      ...board,
      lists: board.lists.map((list) => ({
        ...list,
        cards: list.cards.map((card) => ({
          ...card,
          labels: card.labels.map((cl) => cl.label),
        })),
      })),
    };
  }

  /**
   * Yeni board oluşturur
   */
  static async createBoard(data: CreateBoardInput, userId: string) {
    return prisma.board.create({
      data: {
        ...data,
        ownerId: userId,
        members: {
          create: {
            userId,
            role: 'owner',
          },
        },
      },
      include: {
        owner: { 
          select: { id: true, name: true, email: true, image: true } 
        },
        members: {
          include: {
            user: { 
              select: { id: true, name: true, email: true, image: true } 
            },
          },
        },
      },
    });
  }

  /**
   * Board'u günceller (sadece sahip veya admin)
   */
  static async updateBoard(
    boardId: string,
    data: UpdateBoardInput,
    userId: string
  ) {
    // Yetki kontrolü
    const board = await prisma.board.findFirst({
      where: {
        id: boardId,
        OR: [
          { ownerId: userId },
          { members: { some: { userId, role: { in: ['owner', 'admin'] } } } },
        ],
      },
    });

    if (!board) {
      throw new Error('Board bulunamadı veya yetkiniz yok');
    }

    return prisma.board.update({
      where: { id: boardId },
      data,
    });
  }

  /**
   * Board'u siler (sadece sahip)
   */
  static async deleteBoard(boardId: string, userId: string) {
    const board = await prisma.board.findFirst({
      where: { id: boardId, ownerId: userId },
    });

    if (!board) {
      throw new Error('Board bulunamadı veya sadece sahip silebilir');
    }

    return prisma.board.delete({
      where: { id: boardId },
    });
  }

  /**
   * Board'a üye ekler (sadece sahip veya admin)
   */
  static async addMember(
    boardId: string,
    data: AddBoardMemberInput,
    userId: string
  ) {
    // Yetki kontrolü - requester sahip veya admin olmalı
    const board = await prisma.board.findFirst({
      where: {
        id: boardId,
        OR: [
          { ownerId: userId },
          { members: { some: { userId, role: { in: ['owner', 'admin'] } } } },
        ],
      },
    });

    if (!board) {
      throw new Error('Board bulunamadı veya yetkiniz yok');
    }

    // Eklenecek kullanıcıyı bul
    const newMember = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!newMember) {
      throw new Error('Kullanıcı bulunamadı');
    }

    // Zaten üye mi kontrol et
    const existingMember = await prisma.boardMember.findUnique({
      where: {
        boardId_userId: {
          boardId,
          userId: newMember.id,
        },
      },
    });

    if (existingMember) {
      throw new Error('Kullanıcı zaten üye');
    }

    return prisma.boardMember.create({
      data: {
        boardId,
        userId: newMember.id,
        role: data.role || 'member',
      },
      include: {
        user: { 
          select: { id: true, name: true, email: true, image: true } 
        },
      },
    });
  }

  /**
   * Board'dan üye çıkarır (sadece sahip veya admin)
   */
  static async removeMember(
    boardId: string,
    memberId: string,
    userId: string
  ) {
    // Yetki kontrolü
    const board = await prisma.board.findFirst({
      where: {
        id: boardId,
        OR: [
          { ownerId: userId },
          { members: { some: { userId, role: { in: ['owner', 'admin'] } } } },
        ],
      },
    });

    if (!board) {
      throw new Error('Board bulunamadı veya yetkiniz yok');
    }

    // Board sahibi çıkarılamaz
    if (board.ownerId === memberId) {
      throw new Error('Board sahibi çıkarılamaz');
    }

    return prisma.boardMember.delete({
      where: {
        boardId_userId: {
          boardId,
          userId: memberId,
        },
      },
    });
  }
}
