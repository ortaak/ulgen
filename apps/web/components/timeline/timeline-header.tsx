'use client';

import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TimelineHeaderProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

function formatDateLabel(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (isSameDay(date, today)) return 'Bugün';
  if (isSameDay(date, yesterday)) return 'Dün';
  if (isSameDay(date, tomorrow)) return 'Yarın';

  return date.toLocaleDateString('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

export function TimelineHeader({ currentDate, onDateChange }: TimelineHeaderProps) {
  const goToPrev = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 1);
    onDateChange(d);
  };

  const goToNext = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 1);
    onDateChange(d);
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <CalendarDays className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-gray-900">Günlük Plan</h1>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={goToPrev} title="Önceki gün">
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="min-w-[180px] text-center">
          <span className="font-semibold text-gray-800">{formatDateLabel(currentDate)}</span>
        </div>

        <Button variant="outline" size="icon" onClick={goToNext} title="Sonraki gün">
          <ChevronRight className="h-4 w-4" />
        </Button>

        {!isToday(currentDate) && (
          <Button variant="secondary" size="sm" onClick={goToToday} className="ml-2">
            Bugüne Dön
          </Button>
        )}
      </div>
    </div>
  );
}
