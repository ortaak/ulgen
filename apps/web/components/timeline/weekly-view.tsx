'use client';

import { useEffect, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TimelineTask } from '@/types';

interface DaySummary {
  date: Date;
  dateStr: string;
  tasks: TimelineTask[];
  completed: number;
  total: number;
  totalMinutes: number;
}

interface WeeklyViewProps {
  onDayClick: (date: Date) => void;
  currentDate: Date;
}

const DAYS_TR = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
const MONTHS_TR = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];

// Yerel saat bazlı formatlama — toISOString() UTC verir, timezone farklılığında gün kayar
function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Pazar
  // Pazartesi'den başlayan hafta: Pazar = 6. gün
  const diff = (day + 6) % 7;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatDuration(minutes: number): string {
  if (minutes === 0) return '';
  if (minutes < 60) return `${minutes}dk`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}s ${m}dk` : `${h}s`;
}

export function WeeklyView({ onDayClick, currentDate }: WeeklyViewProps) {
  const [weekStart, setWeekStart] = useState<Date>(() => getWeekStart(currentDate));
  const [summaries, setSummaries] = useState<DaySummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // currentDate dışarıdan değiştiğinde (tarih navigasyonu), haftayı güncelle
  useEffect(() => {
    setWeekStart(getWeekStart(currentDate));
  }, [currentDate]);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const startDateStr = formatDate(weekStart);
  const endDateStr = formatDate(addDays(weekStart, 6));

  const fetchWeekData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/timeline?startDate=${startDateStr}&endDate=${endDateStr}`);
      if (!res.ok) throw new Error('Haftalık veri yüklenemedi');
      const data = await res.json();
      const tasks = (data.tasks ?? []) as TimelineTask[];

      const built: DaySummary[] = weekDays.map((date) => {
        const ds = formatDate(date);
        const dayTasks = tasks.filter(
          (t) => formatDate(new Date(t.scheduledDate)) === ds
        );
        return {
          date,
          dateStr: ds,
          tasks: dayTasks,
          completed: dayTasks.filter((t) => t.status === 'COMPLETED').length,
          total: dayTasks.length,
          totalMinutes: dayTasks.reduce((s, t) => s + t.estimatedMinutes, 0),
        };
      });

      setSummaries(built);
    } catch {
      setSummaries(weekDays.map((date) => ({
        date,
        dateStr: formatDate(date),
        tasks: [],
        completed: 0,
        total: 0,
        totalMinutes: 0,
      })));
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDateStr, endDateStr]);

  useEffect(() => {
    fetchWeekData();
  }, [fetchWeekData]);

  const prevWeek = () => setWeekStart((d) => addDays(d, -7));
  const nextWeek = () => setWeekStart((d) => addDays(d, 7));
  const goToCurrentWeek = () => setWeekStart(getWeekStart(new Date()));

  const todayStr = formatDate(new Date());
  const currentDateStr = formatDate(currentDate);

  // Haftanın ay/yıl etiketi
  const weekLabel = (() => {
    const s = weekStart;
    const e = addDays(weekStart, 6);
    if (s.getMonth() === e.getMonth()) {
      return `${MONTHS_TR[s.getMonth()]} ${s.getFullYear()}`;
    }
    return `${MONTHS_TR[s.getMonth()]} – ${MONTHS_TR[e.getMonth()]} ${e.getFullYear()}`;
  })();

  return (
    <div className="bg-white rounded-xl border p-4">
      {/* Hafta navigasyonu */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-gray-500" />
          <span className="font-semibold text-gray-800 text-sm">{weekLabel}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={prevWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs px-2" onClick={goToCurrentWeek}>
            Bu Hafta
          </Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={nextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 7 gün grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-2">
          {summaries.map((day) => {
            const isToday = day.dateStr === todayStr;
            const isSelected = day.dateStr === currentDateStr;
            const completionRate = day.total > 0 ? (day.completed / day.total) * 100 : 0;
            const dayOfWeek = day.date.getDay();
            const dayLabel = DAYS_TR[dayOfWeek];
            const dayNum = day.date.getDate();

            return (
              <button
                key={day.dateStr}
                onClick={() => onDayClick(day.date)}
                className={`
                  flex flex-col items-center rounded-lg p-2 border transition-all text-left
                  hover:border-primary/40 hover:bg-gray-50 cursor-pointer
                  ${isSelected ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-gray-200'}
                  ${isToday && !isSelected ? 'border-blue-300 bg-blue-50/50' : ''}
                `}
              >
                {/* Gün adı */}
                <span className={`text-xs font-medium ${isToday ? 'text-blue-600' : 'text-gray-500'}`}>
                  {dayLabel}
                </span>
                {/* Gün numarası */}
                <span
                  className={`text-sm font-bold mt-0.5 w-7 h-7 flex items-center justify-center rounded-full ${
                    isToday ? 'bg-blue-600 text-white' : isSelected ? 'bg-primary text-primary-foreground' : 'text-gray-800'
                  }`}
                >
                  {dayNum}
                </span>

                {/* İlerleme çubuğu */}
                <div className="w-full h-1 rounded-full bg-gray-100 mt-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      completionRate === 100
                        ? 'bg-green-500'
                        : completionRate > 0
                        ? 'bg-yellow-400'
                        : 'bg-transparent'
                    }`}
                    style={{ width: `${completionRate}%` }}
                  />
                </div>

                {/* Görev özeti */}
                {day.total > 0 ? (
                  <div className="mt-1.5 w-full space-y-0.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">{day.total} görev</span>
                      {day.completed > 0 && (
                        <span className="text-green-600 flex items-center gap-0.5">
                          <CheckCircle2 className="h-2.5 w-2.5" />
                          {day.completed}
                        </span>
                      )}
                    </div>
                    {day.totalMinutes > 0 && (
                      <div className="flex items-center gap-0.5 text-xs text-gray-400">
                        <Clock className="h-2.5 w-2.5" />
                        <span>{formatDuration(day.totalMinutes)}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-gray-300 mt-1.5">Boş</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Haftalık özet */}
      {summaries.length > 0 && (
        <div className="mt-4 pt-3 border-t flex items-center justify-around text-xs text-gray-500">
          <div className="text-center">
            <p className="font-semibold text-gray-800">
              {summaries.reduce((s, d) => s + d.total, 0)}
            </p>
            <p>Toplam</p>
          </div>
          <div className="text-center">
            <p className="font-semibold text-green-600">
              {summaries.reduce((s, d) => s + d.completed, 0)}
            </p>
            <p>Tamamlandı</p>
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-800">
              {formatDuration(summaries.reduce((s, d) => s + d.totalMinutes, 0))}
            </p>
            <p>Planlanan</p>
          </div>
        </div>
      )}
    </div>
  );
}
