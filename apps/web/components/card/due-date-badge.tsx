/**
 * DueDateBadge Component
 *
 * Kartın bitiş tarihini renkli rozet olarak gösterir.
 * Renk mantığı (Trello benzeri):
 *  - Tamamlandı        → yeşil
 *  - Geçmiş (gecikmiş) → kırmızı
 *  - Bugün veya 2 gün içinde → sarı (uyarı)
 *  - Daha uzak gelecek → gri (nötr)
 */

'use client';

import { useMemo } from 'react';
import { Calendar } from 'lucide-react';
import { differenceInCalendarDays, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

interface DueDateBadgeProps {
  dueDate: string;
  dueComplete: boolean;
  /** Kompakt mod: sadece kart listesinde ikon + tarih göster */
  compact?: boolean;
}

type DueDateStatus = 'completed' | 'overdue' | 'due-soon' | 'upcoming';

function getDueDateStatus(dueDate: string, dueComplete: boolean): DueDateStatus {
  if (dueComplete) return 'completed';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = parseISO(dueDate);
  const daysUntilDue = differenceInCalendarDays(due, today);

  if (daysUntilDue < 0) return 'overdue';
  if (daysUntilDue <= 2) return 'due-soon';
  return 'upcoming';
}

const STATUS_STYLES: Record<DueDateStatus, string> = {
  completed: 'bg-green-100 text-green-800 border-green-200',
  overdue:   'bg-red-100 text-red-800 border-red-200',
  'due-soon':'bg-yellow-100 text-yellow-800 border-yellow-200',
  upcoming:  'bg-gray-100 text-gray-700 border-gray-200',
};

const STATUS_LABELS: Record<DueDateStatus, string> = {
  completed: 'Tamamlandı',
  overdue:   'Gecikmiş',
  'due-soon':'Yaklaşıyor',
  upcoming:  '',
};

export function DueDateBadge({ dueDate, dueComplete, compact = false }: DueDateBadgeProps) {
  const status = useMemo(
    () => getDueDateStatus(dueDate, dueComplete),
    [dueDate, dueComplete]
  );

  const formattedDate = useMemo(() => {
    const due = parseISO(dueDate);
    return new Intl.DateTimeFormat('tr-TR', {
      day: 'numeric',
      month: 'short',
    }).format(due);
  }, [dueDate]);

  const statusLabel = STATUS_LABELS[status];

  if (compact) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium border',
          STATUS_STYLES[status]
        )}
        title={statusLabel || undefined}
      >
        <Calendar className="h-3 w-3" />
        {formattedDate}
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-medium border',
        STATUS_STYLES[status]
      )}
    >
      <Calendar className="h-4 w-4" />
      {formattedDate}
      {statusLabel && (
        <span className="font-semibold">— {statusLabel}</span>
      )}
    </span>
  );
}
