/**
 * Board Bazlı Renk Kodlaması
 *
 * Her board'a deterministik bir renk atar.
 * boardId hash → 10 renk paletinden biri.
 */

export interface BoardColor {
  borderClass: string;   // border-l-* için
  dotClass: string;      // renkli nokta için
  textClass: string;     // metin için
}

export const BOARD_COLOR_PALETTE: BoardColor[] = [
  { borderClass: 'border-l-blue-500',   dotClass: 'bg-blue-500',   textClass: 'text-blue-600' },
  { borderClass: 'border-l-purple-500', dotClass: 'bg-purple-500', textClass: 'text-purple-600' },
  { borderClass: 'border-l-green-500',  dotClass: 'bg-green-500',  textClass: 'text-green-600' },
  { borderClass: 'border-l-orange-500', dotClass: 'bg-orange-500', textClass: 'text-orange-600' },
  { borderClass: 'border-l-pink-500',   dotClass: 'bg-pink-500',   textClass: 'text-pink-600' },
  { borderClass: 'border-l-teal-500',   dotClass: 'bg-teal-500',   textClass: 'text-teal-600' },
  { borderClass: 'border-l-red-500',    dotClass: 'bg-red-500',    textClass: 'text-red-600' },
  { borderClass: 'border-l-yellow-500', dotClass: 'bg-yellow-500', textClass: 'text-yellow-600' },
  { borderClass: 'border-l-indigo-500', dotClass: 'bg-indigo-500', textClass: 'text-indigo-600' },
  { borderClass: 'border-l-cyan-500',   dotClass: 'bg-cyan-500',   textClass: 'text-cyan-600' },
];

/**
 * boardId'den deterministik renk indeksi hesaplar.
 * Aynı boardId her zaman aynı rengi üretir.
 */
export function getBoardColorIndex(boardId: string): number {
  let hash = 0;
  for (let i = 0; i < boardId.length; i++) {
    hash = (hash * 31 + boardId.charCodeAt(i)) % BOARD_COLOR_PALETTE.length;
  }
  return Math.abs(hash);
}

export function getBoardColor(boardId: string): BoardColor {
  return BOARD_COLOR_PALETTE[getBoardColorIndex(boardId)];
}

/**
 * Tüm görevlerdeki boardId'lerden bir renk haritası oluşturur.
 * boardId → renk indeksi
 */
export function buildBoardColorMap(boardIds: string[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const id of boardIds) {
    if (!(id in map)) {
      map[id] = getBoardColorIndex(id);
    }
  }
  return map;
}
