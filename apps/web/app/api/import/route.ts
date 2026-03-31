/**
 * Import API Route
 * 
 * Trello ve diğer platformlardan veri aktarımı.
 * JSON formatında board verilerini import eder.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from 'database';

/**
 * Trello JSON Export Formatı
 */
interface TrelloExport {
  name: string;
  desc?: string;
  prefs?: {
    background?: string;
  };
  lists: TrelloList[];
  cards: TrelloCard[];
  members?: TrelloMember[];
  actions?: TrelloAction[];
}

interface TrelloList {
  id: string;
  name: string;
  pos: number;
  closed?: boolean;
}

interface TrelloCard {
  id: string;
  name: string;
  desc?: string;
  idList: string;
  pos: number;
  due?: string;
  labels?: Array<{ id?: string; color: string; name: string }>;
  idMembers?: string[];
  closed?: boolean;
}

interface TrelloMember {
  id: string;
  fullName: string;
  username: string;
}

interface TrelloAction {
  id: string;
  type: string;
  date: string;
  data: {
    text?: string;
    idCard?: string;
    card?: { id: string };
  };
  idMemberCreator?: string;
}

/**
 * POST /api/import
 * 
 * Trello JSON export dosyasını import eder.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Yetkilendirme gerekli' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { data, platform = 'trello' } = body;

    if (!data) {
      return NextResponse.json(
        { error: 'Import verisi gerekli' },
        { status: 400 }
      );
    }

    // Platform'a göre import işlemi
    let result;
    if (platform === 'trello') {
      result = await importFromTrello(data, user.id);
    } else {
      return NextResponse.json(
        { error: `Desteklenmeyen platform: ${platform}` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      board: result,
      message: 'Board başarıyla import edildi',
    });

  } catch (error) {
    console.error('[IMPORT_ERROR]', error);
    return NextResponse.json(
      { 
        error: 'Import işlemi başarısız',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}

/**
 * Trello'dan veri import et
 */
async function importFromTrello(data: TrelloExport, userId: string) {
  // Validate data
  if (!data.name) {
    throw new Error('Board adı gerekli');
  }

  if (!data.lists || !Array.isArray(data.lists)) {
    throw new Error('Liste verisi gerekli');
  }

  // Board oluştur
  const board = await prisma.board.create({
    data: {
      title: data.name,
      description: data.desc || null,
      background: data.prefs?.background || null,
      ownerId: userId,
    },
  });

  // Listeleri import et (closed olanları hariç)
  const activeLists = data.lists.filter(list => !list.closed);
  const listMap = new Map<string, string>(); // Trello ID -> Yeni ID

  for (const trelloList of activeLists) {
    const list = await prisma.list.create({
      data: {
        title: trelloList.name,
        position: trelloList.pos,
        boardId: board.id,
      },
    });
    listMap.set(trelloList.id, list.id);
  }

  // Board-level label'ları topla ve oluştur (renk+isim kombinasyonuna göre tekilleştir)
  const labelKey = (color: string, name: string) => `${color}::${name}`;
  const labelDbMap = new Map<string, string>(); // "color::name" -> DB Label ID

  const VALID_COLORS = ['green', 'yellow', 'orange', 'red', 'purple', 'blue', 'pink', 'teal', 'gray', 'black'];

  if (data.cards && Array.isArray(data.cards)) {
    for (const trelloCard of data.cards) {
      if (!trelloCard.labels) continue;
      for (const tl of trelloCard.labels) {
        if (!tl.color) continue;
        // Trello rengi geçerli VALID_COLORS içinde değilse 'gray' kullan
        const normalizedColor = VALID_COLORS.includes(tl.color) ? tl.color : 'gray';
        const key = labelKey(normalizedColor, tl.name || tl.color);
        if (!labelDbMap.has(key)) {
          const label = await prisma.label.create({
            data: {
              name: tl.name || tl.color,
              color: normalizedColor,
              boardId: board.id,
            },
          });
          labelDbMap.set(key, label.id);
        }
      }
    }
  }

  // Kartları import et (closed olanları hariç, sadece aktif listelerdekiler)
  const cardMap = new Map<string, string>(); // Trello Card ID -> Yeni Card ID

  if (data.cards && Array.isArray(data.cards)) {
    const activeCards = data.cards.filter(
      card => !card.closed && listMap.has(card.idList)
    );

    for (const trelloCard of activeCards) {
      const newListId = listMap.get(trelloCard.idList);
      if (!newListId) continue;

      const card = await prisma.card.create({
        data: {
          title: trelloCard.name,
          description: trelloCard.desc || null,
          position: trelloCard.pos,
          dueDate: trelloCard.due ? new Date(trelloCard.due) : null,
          listId: newListId,
          creatorId: userId,
        },
      });

      cardMap.set(trelloCard.id, card.id);

      // CardLabel junction kayıtlarını oluştur
      if (trelloCard.labels && trelloCard.labels.length > 0) {
        for (const tl of trelloCard.labels) {
          if (!tl.color) continue;
          const normalizedColor = VALID_COLORS.includes(tl.color) ? tl.color : 'gray';
          const key = labelKey(normalizedColor, tl.name || tl.color);
          const labelId = labelDbMap.get(key);
          if (labelId) {
            await prisma.cardLabel.create({
              data: { cardId: card.id, labelId },
            });
          }
        }
      }
    }
  }

  // Yorumları import et (actions içindeki commentCard tipindekiler)
  if (data.actions && Array.isArray(data.actions)) {
    const commentActions = data.actions.filter(
      action => action.type === 'commentCard' && action.data?.text && action.data?.idCard
    );

    for (const action of commentActions) {
      const newCardId = cardMap.get(action.data.idCard || '');
      if (!newCardId || !action.data.text) continue;

      try {
        await prisma.comment.create({
          data: {
            content: action.data.text,
            cardId: newCardId,
            authorId: userId,
            createdAt: action.date ? new Date(action.date) : new Date(),
          },
        });
      } catch (error) {
        console.error('Yorum import hatası:', error);
        // Yorum import hatası tüm işlemi durdurmaz, devam et
      }
    }
  }

  // Board'u detaylarıyla döndür
  const result = await prisma.board.findUnique({
    where: { id: board.id },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      lists: {
        orderBy: { position: 'asc' },
        include: {
          cards: {
            orderBy: { position: 'asc' },
            include: {
              creator: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
              assignees: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
              comments: {
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
                  createdAt: 'desc',
                },
              },
            },
          },
        },
      },
      members: {
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
      },
      labels: true,
      _count: {
        select: {
          lists: true,
        },
      },
    },
  });

  return result;
}

/**
 * GET /api/import/preview
 * 
 * Import verilerini önizle (veritabanına kaydetmeden)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Yetkilendirme gerekli' },
        { status: 401 }
      );
    }

    // Query parametrelerinden örnek veri al
    const { searchParams } = new URL(request.url);
    const sampleData = searchParams.get('sample');

    if (sampleData === 'trello') {
      return NextResponse.json({
        example: {
          name: 'Örnek Proje Board',
          desc: 'Bu bir örnek board açıklamasıdır',
          lists: [
            { id: 'list1', name: 'Yapılacaklar', pos: 0 },
            { id: 'list2', name: 'Yapılıyor', pos: 1 },
            { id: 'list3', name: 'Tamamlandı', pos: 2 },
          ],
          cards: [
            {
              id: 'card1',
              name: 'Örnek Kart 1',
              desc: 'Kart açıklaması',
              idList: 'list1',
              pos: 0,
              labels: [{ color: 'green', name: 'Önemli' }],
            },
            {
              id: 'card2',
              name: 'Örnek Kart 2',
              idList: 'list2',
              pos: 0,
              due: new Date().toISOString(),
            },
          ],
        },
      });
    }

    return NextResponse.json({
      message: 'Import preview endpoint',
      supportedPlatforms: ['trello'],
      usage: 'POST /api/import with { data, platform }',
    });

  } catch (error) {
    console.error('[IMPORT_PREVIEW_ERROR]', error);
    return NextResponse.json(
      { error: 'Preview oluşturulamadı' },
      { status: 500 }
    );
  }
}
