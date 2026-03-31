/**
 * Zod Validation Schemas
 * 
 * API endpoint'leri için input validation schemas.
 * Tüm kullanıcı girdilerini doğrular ve tip güvenliği sağlar.
 */

import { z } from 'zod';

// ============================================================================
// AUTH SCHEMAS
// ============================================================================

export const registerSchema = z.object({
  email: z.string().email('Geçerli bir email adresi giriniz'),
  name: z.string().min(2, 'İsim en az 2 karakter olmalıdır'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
});

export const loginSchema = z.object({
  email: z.string().email('Geçerli bir email adresi giriniz'),
  password: z.string().min(1, 'Şifre gereklidir'),
});

// ============================================================================
// BOARD SCHEMAS
// ============================================================================

export const createBoardSchema = z.object({
  title: z.string().min(1, 'Başlık gereklidir').max(100, 'Başlık en fazla 100 karakter olabilir'),
  description: z.string().max(500, 'Açıklama en fazla 500 karakter olabilir').optional(),
  background: z.string().optional(),
});

export const updateBoardSchema = createBoardSchema.partial();

export const addBoardMemberSchema = z.object({
  email: z.string().email('Geçerli bir email adresi giriniz'),
  role: z.enum(['member', 'admin']).default('member'),
});

// ============================================================================
// LIST SCHEMAS
// ============================================================================

export const createListSchema = z.object({
  title: z.string().min(1, 'Başlık gereklidir').max(100, 'Başlık en fazla 100 karakter olabilir'),
  boardId: z.string().cuid('Geçersiz board ID'),
  position: z.number().int().min(0),
});

export const updateListSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  position: z.number().int().min(0).optional(),
});

// ============================================================================
// CARD SCHEMAS
// ============================================================================

export const createCardSchema = z.object({
  title: z.string().min(1, 'Başlık gereklidir').max(200, 'Başlık en fazla 200 karakter olabilir'),
  description: z.string().max(2000, 'Açıklama en fazla 2000 karakter olabilir').optional(),
  listId: z.string().cuid('Geçersiz list ID'),
  position: z.number().int().min(0),
  dueDate: z.string().datetime().nullable().optional(),
});

export const updateCardSchema = createCardSchema
  .partial()
  .omit({ listId: true })
  .extend({
    // dueComplete createCardSchema'da yok, sadece update'te geçerli
    dueComplete: z.boolean().optional(),
    // dueDate null göndererek temizleme desteği
    dueDate: z.string().datetime().nullable().optional(),
    // Eisenhower matrisi kadranlari — null ile temizlenebilir
    eisenhowerQuadrant: z.enum(['DO', 'PLAN', 'DELEGATE', 'DELETE']).nullable().optional(),
    // Board-level tamamlanma (Timeline'dan dışlamak için)
    isCompleted: z.boolean().optional(),
  });

export const moveCardSchema = z.object({
  listId: z.string().cuid('Geçersiz list ID'),
  position: z.number().int().min(0),
});

// ============================================================================
// TIMELINE SCHEMAS
// ============================================================================

export const createTimelineTaskSchema = z.object({
  cardId: z.string().cuid('Geçersiz kart ID'),
  boardId: z.string().cuid('Geçersiz board ID'),
  scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Tarih YYYY-MM-DD formatında olmalıdır'),
  startTime: z.string().datetime('Geçersiz başlangıç saati'),
  endTime: z.string().datetime('Geçersiz bitiş saati'),
  estimatedMinutes: z.number().int().min(15, 'En az 15 dakika').max(480, 'En fazla 8 saat').default(60),
});

export const updateTimelineTaskStatusSchema = z.object({
  action: z.enum(['start', 'pause', 'complete', 'skip'], {
    errorMap: () => ({ message: 'Geçersiz aksiyon. start, pause, complete veya skip olmalıdır' }),
  }),
});

export const rescheduleTimelineTaskSchema = z.object({
  startTime: z.string().datetime('Geçersiz başlangıç saati'),
  endTime: z.string().datetime('Geçersiz bitiş saati'),
  estimatedMinutes: z.number().int().min(15).max(480).optional(),
});

// Görevi başka bir güne taşıma (haftalık görünüm D&D)
export const moveTaskToDateSchema = z.object({
  scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD formatında olmalıdır'),
});

// ============================================================================
// LABEL SCHEMAS
// ============================================================================

const VALID_LABEL_COLORS = ['green', 'yellow', 'orange', 'red', 'purple', 'blue', 'pink', 'teal', 'gray', 'black'] as const;

export const createLabelSchema = z.object({
  name: z.string().min(1, 'Etiket adı gereklidir').max(50, 'Etiket adı en fazla 50 karakter olabilir'),
  color: z.enum(VALID_LABEL_COLORS, { errorMap: () => ({ message: 'Geçersiz renk' }) }),
});

export const updateLabelSchema = createLabelSchema.partial();

// ============================================================================
// ATTACHMENT CONSTANTS
// ============================================================================

/** Maksimum dosya boyutu: 8MB (byte cinsinden) */
export const MAX_ATTACHMENT_SIZE = 8 * 1024 * 1024;

/** İzin verilen MIME tipleri */
export const ALLOWED_ATTACHMENT_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
] as const;

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateBoardInput = z.infer<typeof createBoardSchema>;
export type UpdateBoardInput = z.infer<typeof updateBoardSchema>;
export type AddBoardMemberInput = z.infer<typeof addBoardMemberSchema>;
export type CreateListInput = z.infer<typeof createListSchema>;
export type UpdateListInput = z.infer<typeof updateListSchema>;
export type CreateCardInput = z.infer<typeof createCardSchema>;
export type UpdateCardInput = z.infer<typeof updateCardSchema>;
export type MoveCardInput = z.infer<typeof moveCardSchema>;
export type CreateTimelineTaskInput = z.infer<typeof createTimelineTaskSchema>;
export type UpdateTimelineTaskStatusInput = z.infer<typeof updateTimelineTaskStatusSchema>;
export type RescheduleTimelineTaskInput = z.infer<typeof rescheduleTimelineTaskSchema>;
export type CreateLabelInput = z.infer<typeof createLabelSchema>;
export type UpdateLabelInput = z.infer<typeof updateLabelSchema>;
