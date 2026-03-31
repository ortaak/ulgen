'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { UnscheduledCard } from '@/types';
import { CreateTimelineTaskInput } from '@/lib/validations';

interface AddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentDate: Date;
  unscheduledCards: UnscheduledCard[];
  preselectedCard?: UnscheduledCard | null;
  onAdd: (data: CreateTimelineTaskInput) => Promise<void>;
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function buildIso(date: Date, timeStr: string): string {
  // timeStr: "HH:MM"
  const [h, m] = timeStr.split(':').map(Number);
  const d = new Date(date);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

// Yakın gelecekteki saati bul (bir sonraki tam saat veya yarım saat)
function nextRoundTime(): string {
  const now = new Date();
  const minutes = now.getMinutes();
  let h = now.getHours();
  let m = 0;
  if (minutes < 30) {
    m = 30;
  } else {
    h = h + 1;
    m = 0;
  }
  if (h >= 24) h = 23;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120, 180];

export function AddTaskDialog({
  open,
  onOpenChange,
  currentDate,
  unscheduledCards,
  preselectedCard,
  onAdd,
}: AddTaskDialogProps) {
  const [selectedCardId, setSelectedCardId] = useState('');
  const [startTime, setStartTime] = useState(nextRoundTime());
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Grup kartları board'a göre
  const groupedCards = unscheduledCards.reduce<Record<string, UnscheduledCard[]>>((acc, card) => {
    const key = card.boardTitle;
    if (!acc[key]) acc[key] = [];
    acc[key].push(card);
    return acc;
  }, {});

  useEffect(() => {
    if (open) {
      setError('');
      if (preselectedCard) {
        setSelectedCardId(preselectedCard.id);
      } else {
        setSelectedCardId('');
      }
      setStartTime(nextRoundTime());
      setDurationMinutes(60);
    }
  }, [open, preselectedCard]);

  const computeEndTime = (): string => {
    const [h, m] = startTime.split(':').map(Number);
    const totalMin = h * 60 + m + durationMinutes;
    const endH = Math.floor(totalMin / 60) % 24;
    const endM = totalMin % 60;
    return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
  };

  const handleSubmit = async () => {
    setError('');

    if (!selectedCardId) {
      setError('Lütfen bir kart seçin');
      return;
    }

    const selectedCard = unscheduledCards.find((c) => c.id === selectedCardId);
    if (!selectedCard) {
      setError('Seçilen kart bulunamadı');
      return;
    }

    const startIso = buildIso(currentDate, startTime);
    const endIso = buildIso(currentDate, computeEndTime());

    setIsSubmitting(true);
    try {
      await onAdd({
        cardId: selectedCard.id,
        boardId: selectedCard.boardId,
        scheduledDate: formatDate(currentDate),
        startTime: startIso,
        endTime: endIso,
        estimatedMinutes: durationMinutes,
      });
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || 'Görev eklenemedi');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Timeline&apos;a Görev Ekle
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Kart seçimi */}
          <div className="space-y-1.5">
            <Label htmlFor="card-select">Kart</Label>
            {unscheduledCards.length === 0 ? (
              <p className="text-sm text-gray-500 italic py-2">
                Tüm kartlar zaten bugün planlandı 🎉
              </p>
            ) : (
              <select
                id="card-select"
                value={selectedCardId}
                onChange={(e) => setSelectedCardId(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">-- Kart Seçin --</option>
                {Object.entries(groupedCards).map(([boardTitle, cards]) => (
                  <optgroup key={boardTitle} label={boardTitle}>
                    {cards.map((card) => (
                      <option key={card.id} value={card.id}>
                        {card.title} ({card.listTitle})
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            )}
          </div>

          {/* Başlangıç saati */}
          <div className="space-y-1.5">
            <Label htmlFor="start-time">Başlangıç Saati</Label>
            <input
              id="start-time"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Süre */}
          <div className="space-y-1.5">
            <Label>Tahmini Süre</Label>
            <div className="flex flex-wrap gap-2">
              {DURATION_OPTIONS.map((min) => (
                <button
                  key={min}
                  onClick={() => setDurationMinutes(min)}
                  className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                    durationMinutes === min
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-primary'
                  }`}
                >
                  {min < 60 ? `${min}dk` : `${min / 60}s`}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              Bitiş: {computeEndTime()}
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            İptal
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || unscheduledCards.length === 0}>
            {isSubmitting ? 'Ekleniyor...' : 'Ekle'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
