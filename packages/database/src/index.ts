/**
 * Database Package - Prisma Client Export
 * 
 * Bu modül, Prisma client'ı export eder ve
 * tüm veritabanı modellerini ve tiplerini sağlar.
 * 
 * Singleton pattern kullanarak development ortamında
 * hot-reload sırasında birden fazla Prisma instance
 * oluşmasını önler.
 */

import { PrismaClient } from '@prisma/client';

// Global tip tanımı - development'ta Prisma instance'ını saklamak için
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Prisma Client Instance
 * 
 * Production'da: Her zaman yeni instance
 * Development'ta: Global scope'ta saklanır (hot-reload optimizasyonu)
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
  });

// Development ortamında global instance'ı sakla
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Tüm Prisma tiplerini ve modellerini export et
export * from '@prisma/client';
