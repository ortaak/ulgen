'use client';

import { useState, useEffect } from 'react';
import { Clock, Move } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { TimelineTask } from '@/types';

type SectionKey = 'morning' | 'afternoon' | 'evening';

interface RescheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Yeniden planlanacak görev */
  task: TimelineTask;
  /** Sürüklenen hedef blok */
  targetSection: SectionKey;
  /** Mevcut tarih (ISO datetime hesabı için) */
  currentDate: Date;
  /** Çakışma tespiti için tüm görevler */
  allTasks: TimelineTask[];
  /** (startTimeISO, endTimeISO) ile onaylandığında çağrılır */
  onConfirm: (startTime: string, endTime: string) => Promise<void>;
}

const SECTION_LABELS: Record<SectionKey, string> = {
  morning: 'Sabah (06:00–12:00)',
  afternoon: 'Öğle (12:00–18:00)',
  evening: 'Akşam (18:00–00:00)',
};

const SECTION_DEFAULT_HOURS: Record<SectionKey, number> = {
  morning: 9,
  afternoon: 13,
  evening: 19,
};

function toHHMM(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function buildIso(baseDate: Date, timeStr: string): string {
  const [h, m] = timeStr.split(':').map(Number);
  const d = new Date(baseDate);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

function classifyHour(hour: number): SectionKey {
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}

/** Hedef bölümdeki son görevin bitiş saatini bulur ya da bölüm varsayılanına döner */
function suggestStartTime(
  targetSection: SectionKey,
  task: TimelineTask,
  allTasks: TimelineTask[]
): string {
  const sectionTasks = allTasks
    .filter(
      (t) =>
        t.id !== task.id &&
        t.status !== 'COMPLETED' &&
        t.status !== 'SKIPPED' &&
        classifyHour(new Date(t.startTime).getHours()) === targetSection
    )
    .sort((a, b) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime());

  if (sectionTasks.length > 0) {
    return toHHMM(new Date(sectionTasks[0].endTime));
  }

  const defaultHour = SECTION_DEFAULT_HOURS[targetSection];
  return `${String(defaultHour).padStart(2, '0')}:00`;
}

function addMinutesToHHMM(timeStr: string, minutes: number): string {
  const [h, m] = timeStr.split(':').map(Number);
  const total = h * 60 + m + minutes;
  const endH = Math.floor(total / 60) % 24;
  const endM = total % 60;
  return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
}

export function RescheduleModal({
  open,
  onOpenChange,
  task,
  targetSection,
  currentDate,
  allTasks,
  onConfirm,
}: RescheduleModalProps) {
  const [startTime, setStartTime] = useState('09:00');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setError('');
      const suggested = suggestStartTime(targetSection, task, allTasks);
      setStartTime(suggested);
      setDurationMinutes(task.estimatedMinutes);
    }
  }, [open, task, targetSection, allTasks]);

  const endTime = addMinutesToHHMM(startTime, durationMinutes);

  const handleConfirm = async () => {
    setError('');
    const startIso = buildIso(currentDate, startTime);
    const endIso = buildIso(currentDate, endTime);

    if (new Date(endIso) <= new Date(startIso)) {
      setError('Bitiş saati başlangıç saatinden sonra olmalıdır');
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(startIso, endIso);
      onOpenChange(false);
    } catch (err: any) {
      // Çakışma hatası timeline-view'da ele alınır, modal kapanmamalı
      if (err.message !== 'CONFLICT') {
        setError(err.message || 'Yeniden planlama başarısız');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120, 180];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Move className="h-5 w-5 text-primary" />
            Saati Değiştir
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Görev bilgisi */}
          <div className="bg-gray-50 rounded-lg px-3 py-2">
            <p className="text-sm font-medium text-gray-800 truncate">{task.card.title}</p>
            <p className="text-xs text-gray-500">
              {task.board.title} → <span className="font-medium">{SECTION_LABELS[targetSection]}</span>
            </p>
          </div>

          {/* Başlangıç saati */}
          <div className="space-y-1.5">
            <Label htmlFor="reschedule-start" className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              Başlangıç Saati
            </Label>
            <input
              id="reschedule-start"
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
            <p className="text-xs text-gray-500">Bitiş: {endTime}</p>
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
          <Button onClick={handleConfirm} disabled={isSubmitting}>
            {isSubmitting ? 'Planlanıyor...' : 'Yeniden Planla'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
