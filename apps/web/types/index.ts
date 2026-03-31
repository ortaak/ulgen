/**
 * TypeScript Type Definitions
 * 
 * Frontend için tip tanımları.
 * Prisma modellerinden türetilmiş ve UI'ya uyarlanmış.
 */

// ============================================================================
// USER TYPES
// ============================================================================

export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
}

// ============================================================================
// BOARD TYPES
// ============================================================================

export interface Label {
  id: string;
  name: string;
  color: string;
  boardId: string;
}

export interface Board {
  id: string;
  title: string;
  description: string | null;
  background: string | null;
  createdAt: string;
  updatedAt: string;
  owner: User;
  members: BoardMember[];
  lists?: List[];
  labels?: Label[];
  _count?: {
    lists: number;
  };
}

export interface BoardMember {
  id: string;
  role: 'owner' | 'admin' | 'member';
  user: User;
}

// ============================================================================
// LIST TYPES
// ============================================================================

export interface List {
  id: string;
  title: string;
  position: number;
  boardId: string;
  cards: Card[];
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// ATTACHMENT TYPES
// ============================================================================

export interface Attachment {
  id: string;
  name: string;       // Orijinal dosya adı
  url: string;        // UploadThing CDN URL'i
  key: string;        // UploadThing file key (silme için)
  mimeType: string;   // image/jpeg, application/pdf, vb.
  size: number;       // Byte cinsinden boyut
  cardId: string;
  userId: string;
  user: Pick<User, 'id' | 'name' | 'email' | 'image'>;
  createdAt: string;
}

// ============================================================================
// CARD TYPES
// ============================================================================

export type EisenhowerQuadrant = 'DO' | 'PLAN' | 'DELEGATE' | 'DELETE';

// Bağımlılık ilişkisi — "blockingCard tamamlanmadan blockedCard başlayamaz"
export interface CardDependency {
  id: string;
  blockingCardId: string;
  blockedCardId: string;
  blockingCard: {
    id: string;
    title: string;
    isCompleted: boolean;
    listId: string;
  };
  blockedCard: {
    id: string;
    title: string;
    isCompleted: boolean;
    listId: string;
  };
  createdAt: string;
}

export interface Card {
  id: string;
  title: string;
  description: string | null;
  position: number;
  dueDate: string | null;
  dueComplete: boolean;
  isCompleted: boolean;
  labels: Label[];
  eisenhowerQuadrant: EisenhowerQuadrant | null;
  listId: string;
  creator: User;
  assignees: User[];
  attachments?: Attachment[];
  // Bağımlılıklar — modal açıldığında ayrı endpoint'ten yüklenir
  blockedBy?: CardDependency[];   // Bu kartı bekleyen bağımlılıklar (kart A tamamlanmalı)
  blockingFor?: CardDependency[]; // Bu kartın beklediği bağımlılıklar (bu kart A'yı bekliyor)
  // Board listesi için bağımlılık sayıları (board yüklenirken gelir)
  _count?: {
    blockedBy: number;
    blockingFor: number;
  };
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// LABEL COLORS
// ============================================================================

export const LABEL_COLORS = [
  { value: 'green', label: 'Yeşil', class: 'bg-green-500', textClass: 'text-green-700', lightClass: 'bg-green-100' },
  { value: 'yellow', label: 'Sarı', class: 'bg-yellow-400', textClass: 'text-yellow-700', lightClass: 'bg-yellow-100' },
  { value: 'orange', label: 'Turuncu', class: 'bg-orange-500', textClass: 'text-orange-700', lightClass: 'bg-orange-100' },
  { value: 'red', label: 'Kırmızı', class: 'bg-red-500', textClass: 'text-red-700', lightClass: 'bg-red-100' },
  { value: 'purple', label: 'Mor', class: 'bg-purple-500', textClass: 'text-purple-700', lightClass: 'bg-purple-100' },
  { value: 'blue', label: 'Mavi', class: 'bg-blue-500', textClass: 'text-blue-700', lightClass: 'bg-blue-100' },
  { value: 'pink', label: 'Pembe', class: 'bg-pink-500', textClass: 'text-pink-700', lightClass: 'bg-pink-100' },
  { value: 'teal', label: 'Teal', class: 'bg-teal-500', textClass: 'text-teal-700', lightClass: 'bg-teal-100' },
  { value: 'gray', label: 'Gri', class: 'bg-gray-500', textClass: 'text-gray-700', lightClass: 'bg-gray-100' },
  { value: 'black', label: 'Siyah', class: 'bg-gray-900', textClass: 'text-gray-900', lightClass: 'bg-gray-200' },
] as const;

// ============================================================================
// TIMELINE TYPES
// ============================================================================

export type TimelineTaskStatus = 'PLANNED' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED' | 'SKIPPED';

export interface TimelineTask {
  id: string;
  userId: string;
  cardId: string;
  boardId: string;
  scheduledDate: string;
  startTime: string;       // ISO datetime
  endTime: string;         // ISO datetime
  estimatedMinutes: number;
  status: TimelineTaskStatus;
  actualStartTime?: string | null;
  actualEndTime?: string | null;
  actualMinutes?: number | null;
  card: {
    id: string;
    title: string;
    description?: string | null;
    labels: Label[];
    _count?: {
      blockedBy: number;
      blockingFor: number;
    };
  };
  board: {
    id: string;
    title: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface TimelineStats {
  totalPlanned: number;
  completed: number;
  inProgress: number;
  remaining: number;
  totalMinutesPlanned: number;
}

// Board kartı (Unscheduled pool için — henüz timeline'a eklenmemiş)
export interface UnscheduledCard {
  id: string;
  title: string;
  description?: string | null;
  labels: Label[];
  dueDate?: string | null;
  listId: string;
  listTitle: string;
  boardId: string;
  boardTitle: string;
}

// ============================================================================
// BOARD BACKGROUNDS
// ============================================================================

export const BOARD_BACKGROUNDS = [
  { value: '#0079bf', label: 'Mavi' },
  { value: '#d29034', label: 'Turuncu' },
  { value: '#519839', label: 'Yeşil' },
  { value: '#b04632', label: 'Kırmızı' },
  { value: '#89609e', label: 'Mor' },
  { value: '#cd5a91', label: 'Pembe' },
  { value: '#4bbf6b', label: 'Açık Yeşil' },
  { value: '#00aecc', label: 'Turkuaz' },
  { value: '#838c91', label: 'Gri' },
] as const;
