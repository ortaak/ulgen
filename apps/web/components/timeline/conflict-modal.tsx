'use client';

import { useState } from 'react';
import { AlertTriangle, Trash2, ArrowRight, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TimelineTask } from '@/types';

interface ConflictModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Yeniden planlamaya çalıştığımız görev */
  pendingTask: TimelineTask;
  /** Çakışan mevcut görev */
  conflictingTask: TimelineTask;
  /** Bekleyen görev için önerilen yeni başlangıç saati (ISO) */
  newStartTime: string;
  /** Bekleyen görev için önerilen yeni bitiş saati (ISO) */
  newEndTime: string;
  /** Çakışan görevi sil, bu görevi planla */
  onReplace: () => Promise<void>;
  /** Çakışan görevi kaydır, her ikisini de planla */
  onMove: () => Promise<void>;
  /** Hiçbir şey yapma */
  onCancel: () => void;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function ConflictModal({
  open,
  onOpenChange,
  pendingTask,
  conflictingTask,
  newStartTime,
  newEndTime,
  onReplace,
  onMove,
  onCancel,
}: ConflictModalProps) {
  const [loading, setLoading] = useState<'replace' | 'move' | null>(null);

  const handleReplace = async () => {
    setLoading('replace');
    try {
      await onReplace();
      onOpenChange(false);
    } finally {
      setLoading(null);
    }
  };

  const handleMove = async () => {
    setLoading('move');
    try {
      await onMove();
      onOpenChange(false);
    } finally {
      setLoading(null);
    }
  };

  const handleCancel = () => {
    onCancel();
    onOpenChange(false);
  };

  const conflictStart = formatTime(conflictingTask.startTime);
  const conflictEnd = formatTime(conflictingTask.endTime);
  const pendingStart = formatTime(newStartTime);
  const pendingEnd = formatTime(newEndTime);

  // "Move" sonrası çakışan görevin yeni saati
  const conflictDuration =
    new Date(conflictingTask.endTime).getTime() - new Date(conflictingTask.startTime).getTime();
  const movedStart = formatTime(newEndTime);
  const movedEnd = formatTime(new Date(new Date(newEndTime).getTime() + conflictDuration).toISOString());

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleCancel(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
            Zaman Çakışması
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Çakışma bilgisi */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-2">
            <p className="text-sm text-amber-800 font-medium">
              Şu görevle çakışıyor:
            </p>
            <div className="text-sm text-amber-700">
              <p className="font-semibold">{conflictingTask.card.title}</p>
              <p className="text-xs">{conflictingTask.board.title} · {conflictStart} – {conflictEnd}</p>
            </div>
            <div className="border-t border-amber-200 pt-2 text-xs text-amber-600">
              Planlamak istediğiniz:{' '}
              <span className="font-medium">{pendingTask.card.title}</span>{' '}
              ({pendingStart} – {pendingEnd})
            </div>
          </div>

          {/* Seçenekler */}
          <div className="space-y-2">
            {/* Replace */}
            <button
              onClick={handleReplace}
              disabled={loading !== null}
              className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              <div className="flex items-center gap-2">
                <Trash2 className="h-4 w-4 text-red-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-800">Değiştir</p>
                  <p className="text-xs text-gray-500">
                    &quot;{conflictingTask.card.title}&quot; silinir, &quot;{pendingTask.card.title}&quot; planlanır
                  </p>
                </div>
              </div>
            </button>

            {/* Move */}
            <button
              onClick={handleMove}
              disabled={loading !== null}
              className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors disabled:opacity-50"
            >
              <div className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-blue-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-800">Kaydır</p>
                  <p className="text-xs text-gray-500">
                    &quot;{conflictingTask.card.title}&quot; → {movedStart}–{movedEnd} saatine taşınır
                  </p>
                </div>
              </div>
            </button>

            {/* Cancel */}
            <button
              onClick={handleCancel}
              disabled={loading !== null}
              className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <div className="flex items-center gap-2">
                <X className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-800">İptal</p>
                  <p className="text-xs text-gray-500">Hiçbir değişiklik yapma</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-2">
            <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
