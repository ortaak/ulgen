/**
 * HourlyHeatmap — Saatlik verimlilik ısı haritası
 *
 * 24 saatlik grid. Her hücrenin renk yoğunluğu o saatte tamamlanan
 * görev sayısıyla orantılıdır. Hover'da detay tooltip gösterilir.
 */

'use client';

import { useState } from 'react';

interface HourlyData {
  hour: number;
  taskCount: number;
  totalMinutes: number;
}

interface HourlyHeatmapProps {
  data: HourlyData[];
}

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} dk`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h} sa ${m} dk` : `${h} sa`;
}

function formatHour(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00`;
}

// Görev sayısına göre arka plan rengi hesaplar (0 → beyaz, max → koyu yeşil)
function getCellStyle(taskCount: number, maxCount: number): string {
  if (taskCount === 0) return 'bg-gray-100 text-gray-300';
  const ratio = taskCount / maxCount;
  if (ratio <= 0.25) return 'bg-green-100 text-green-700';
  if (ratio <= 0.5) return 'bg-green-300 text-green-800';
  if (ratio <= 0.75) return 'bg-green-500 text-white';
  return 'bg-green-700 text-white';
}

export function HourlyHeatmap({ data }: HourlyHeatmapProps) {
  const [tooltip, setTooltip] = useState<{ hour: number; x: number; y: number } | null>(null);

  const maxCount = Math.max(...data.map((d) => d.taskCount), 1);
  const hasData = data.some((d) => d.taskCount > 0);

  const activeHour = tooltip ? data[tooltip.hour] : null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-1">Saatlik Verimlilik Haritası</h3>
      <p className="text-xs text-gray-400 mb-4">Hangi saatlerde daha çok görev tamamlıyorsun?</p>

      {!hasData ? (
        <div className="flex items-center justify-center h-24 text-sm text-gray-400">
          Henüz tamamlanan görev yok.
        </div>
      ) : (
        <div className="relative">
          {/* Sabah / Öğle / Akşam / Gece etiketleri */}
          <div className="flex justify-between text-xs text-gray-400 mb-1 px-0.5">
            <span>Gece yarısı</span>
            <span>Sabah</span>
            <span>Öğle</span>
            <span>Akşam</span>
            <span>Gece</span>
          </div>

          {/* 24 saat grid — 8 sütun × 3 satır */}
          <div className="grid grid-cols-8 gap-1">
            {data.map((d) => (
              <div
                key={d.hour}
                className={`relative h-10 rounded flex flex-col items-center justify-center cursor-default transition-all ${getCellStyle(d.taskCount, maxCount)}`}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setTooltip({ hour: d.hour, x: rect.left, y: rect.top });
                }}
                onMouseLeave={() => setTooltip(null)}
              >
                <span className="text-[10px] font-medium leading-none">{formatHour(d.hour)}</span>
                {d.taskCount > 0 && (
                  <span className="text-[9px] leading-none opacity-80">{d.taskCount}</span>
                )}
              </div>
            ))}
          </div>

          {/* Tooltip */}
          {tooltip && activeHour && (
            <div className="mt-3 p-3 bg-gray-800 text-white rounded-lg text-xs flex gap-4">
              <span className="font-semibold">{formatHour(activeHour.hour)}</span>
              <span>{activeHour.taskCount} görev tamamlandı</span>
              {activeHour.totalMinutes > 0 && (
                <span>{formatMinutes(activeHour.totalMinutes)} harcandı</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Lejant */}
      <div className="flex items-center gap-2 mt-4">
        <span className="text-xs text-gray-400">Az</span>
        {['bg-gray-100', 'bg-green-100', 'bg-green-300', 'bg-green-500', 'bg-green-700'].map(
          (cls, i) => (
            <div key={i} className={`w-5 h-5 rounded ${cls} border border-gray-200`} />
          )
        )}
        <span className="text-xs text-gray-400">Çok</span>
      </div>
    </div>
  );
}
