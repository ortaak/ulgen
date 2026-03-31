/**
 * DependencyBadge
 *
 * Kart önizlemesi üzerinde bağımlılık göstergesi.
 * - Kırmızı kilit: Bu kart bloke edilmiş (beklemekte olduğu tamamlanmamış kartlar var)
 * - Sarı kilit: Bu kart başkalarını blokluyor
 */

'use client';

import { Lock, LockOpen } from 'lucide-react';

interface DependencyBadgeProps {
  /** Bu kartın beklediği, henüz tamamlanmamış kart sayısı */
  blockedByCount: number;
  /** Bu kartın bloke ettiği kart sayısı */
  blockingForCount: number;
}

export function DependencyBadge({ blockedByCount, blockingForCount }: DependencyBadgeProps) {
  if (blockedByCount === 0 && blockingForCount === 0) return null;

  return (
    <div className="flex items-center gap-1">
      {/* Bloke edilmiş: bu kart beklemede */}
      {blockedByCount > 0 && (
        <span
          className="flex items-center gap-0.5 text-xs text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded"
          title={`${blockedByCount} kart tamamlanmadan bu kart başlayamaz`}
        >
          <Lock className="h-3 w-3" />
          {blockedByCount}
        </span>
      )}

      {/* Bloklayan: bu kart başkalarını bekletiyor */}
      {blockingForCount > 0 && (
        <span
          className="flex items-center gap-0.5 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded"
          title={`Bu kart ${blockingForCount} kartı bekletiyor`}
        >
          <LockOpen className="h-3 w-3" />
          {blockingForCount}
        </span>
      )}
    </div>
  );
}
