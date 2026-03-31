/**
 * DueDatePicker Component
 *
 * Bitiş tarihi seçici + tamamlandı toggle.
 * Harici kütüphane gerektirmez; styled native <input type="date"> kullanır.
 * date-fns ile ISO dönüşümleri yapılır.
 */

'use client';

import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Calendar, X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DueDateBadge } from './due-date-badge';

interface DueDatePickerProps {
  /** Mevcut bitiş tarihi (ISO string veya null) */
  dueDate: string | null;
  /** Tamamlandı durumu */
  dueComplete: boolean;
  /** Kaydet callback'i — null göndererek tarihi temizler */
  onSave: (dueDate: string | null, dueComplete: boolean) => Promise<void>;
  /** Kaydedilirken loading göstergesi için */
  disabled?: boolean;
}

export function DueDatePicker({
  dueDate,
  dueComplete,
  onSave,
  disabled = false,
}: DueDatePickerProps) {
  // HTML date input için YYYY-MM-DD formatında tut
  const [dateValue, setDateValue] = useState<string>(
    dueDate ? format(parseISO(dueDate), 'yyyy-MM-dd') : ''
  );
  const [isComplete, setIsComplete] = useState(dueComplete);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // YYYY-MM-DD → ISO 8601 (gece yarısı UTC) dönüşümü
      const isoDate = dateValue ? new Date(dateValue + 'T00:00:00').toISOString() : null;
      await onSave(isoDate, isComplete);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = async () => {
    setDateValue('');
    setIsComplete(false);
    setIsSaving(true);
    try {
      await onSave(null, false);
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges =
    dateValue !== (dueDate ? format(parseISO(dueDate), 'yyyy-MM-dd') : '') ||
    isComplete !== dueComplete;

  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-2 text-sm font-medium">
        <Calendar className="h-4 w-4" />
        Bitiş Tarihi
      </Label>

      {/* Mevcut tarih varsa badge göster */}
      {dueDate && (
        <div className="flex items-center gap-2">
          <DueDateBadge dueDate={dueDate} dueComplete={dueComplete} />
        </div>
      )}

      {/* Tarih seçici input */}
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={dateValue}
          onChange={(e) => setDateValue(e.target.value)}
          disabled={disabled || isSaving}
          className={cn(
            'flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm',
            'shadow-sm transition-colors',
            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
            'disabled:cursor-not-allowed disabled:opacity-50'
          )}
        />
        {/* Tarihi temizle butonu */}
        {dueDate && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            disabled={disabled || isSaving}
            className="h-9 px-2 text-gray-500 hover:text-red-600"
            title="Tarihi kaldır"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Tamamlandı checkbox — sadece tarih seçilmişse göster */}
      {(dateValue || dueDate) && (
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isComplete}
            onChange={(e) => setIsComplete(e.target.checked)}
            disabled={disabled || isSaving}
            className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
          />
          <span className="text-sm text-gray-700">Tamamlandı olarak işaretle</span>
        </label>
      )}

      {/* Kaydet butonu — değişiklik varsa göster */}
      {hasChanges && dateValue && (
        <Button
          type="button"
          size="sm"
          onClick={handleSave}
          disabled={disabled || isSaving}
          className="mt-1"
        >
          {isSaving ? 'Kaydediliyor...' : 'Tarihi Kaydet'}
        </Button>
      )}

    </div>
  );
}
