/**
 * AnalyticsDashboard — Kişisel verimlilik analitiği ana bileşeni
 *
 * /analytics sayfasında kullanılır. Tüm chart ve stats bileşenlerini
 * bir araya getirir. Tarih aralığı filtresi (week/month/3month/all) içerir.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { StatsCard } from './stats-card';
import { WeeklySummaryChart } from './weekly-summary-chart';
import { BoardDistributionChart } from './board-distribution-chart';
import { HourlyHeatmap } from './hourly-heatmap';
import { EstimationAccuracyChart } from './estimation-accuracy-chart';

type Range = 'week' | 'month' | '3month' | 'all';

interface AnalyticsData {
  summary: {
    totalTasks: number;
    completedTasks: number;
    skippedTasks: number;
    plannedTasks: number;
    totalActualMinutes: number;
    avgAccuracy: number | null;
    streak: number;
  };
  dailySummary: Array<{ date: string; completed: number; skipped: number; planned: number }>;
  boardDistribution: Array<{ boardId: string; boardTitle: string; minutes: number; taskCount: number }>;
  hourlyHeatmap: Array<{ hour: number; taskCount: number; totalMinutes: number }>;
  estimationTrend: Array<{ date: string; estimated: number; actual: number; accuracy: number }>;
}

const RANGE_LABELS: Record<Range, string> = {
  week: 'Son 7 Gün',
  month: 'Son 1 Ay',
  '3month': 'Son 3 Ay',
  all: 'Tümü',
};

function formatMinutes(minutes: number): string {
  if (minutes === 0) return '0 dk';
  if (minutes < 60) return `${minutes} dk`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h} sa ${m} dk` : `${h} sa`;
}

export function AnalyticsDashboard() {
  const [range, setRange] = useState<Range>('week');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/analytics/personal?range=${range}`);
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? 'Veri yüklenemedi');
      }
      const json = await res.json();
      setData(json);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Başlık + Tarih aralığı seçici */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kişisel Analitik</h1>
          <p className="text-sm text-gray-500 mt-1">
            Görev geçmişin ve verimlilik trendlerin
          </p>
        </div>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {(Object.keys(RANGE_LABELS) as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                range === r
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {RANGE_LABELS[r]}
            </button>
          ))}
        </div>
      </div>

      {/* Hata */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Yükleniyor */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-xl h-24" />
          ))}
        </div>
      )}

      {/* İçerik */}
      {!loading && data && (
        <>
          {/* Özet istatistikler */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <StatsCard
              label="Tamamlanan Görev"
              value={data.summary.completedTasks}
              sub={`${data.summary.totalTasks} planlanan içinde`}
              color="green"
            />
            <StatsCard
              label="Harcanan Süre"
              value={formatMinutes(data.summary.totalActualMinutes)}
              sub="gerçek çalışma süresi"
              color="blue"
            />
            <StatsCard
              label="Tahmin Doğruluğu"
              value={data.summary.avgAccuracy !== null ? `%${data.summary.avgAccuracy}` : '—'}
              sub="estimated vs actual"
              color="purple"
            />
            <StatsCard
              label="Streak"
              value={`${data.summary.streak} gün`}
              sub="kesintisiz çalışma"
              color="orange"
            />
          </div>

          {/* Grafik grid — 2 sütun */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <WeeklySummaryChart data={data.dailySummary} />
            <BoardDistributionChart data={data.boardDistribution} />
          </div>

          {/* Tam genişlik bileşenler */}
          <div className="flex flex-col gap-6">
            <HourlyHeatmap data={data.hourlyHeatmap} />
            <EstimationAccuracyChart
              data={data.estimationTrend}
              avgAccuracy={data.summary.avgAccuracy}
            />
          </div>

          {/* Boş durum uyarısı */}
          {data.summary.totalTasks === 0 && (
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
              <p className="text-sm text-blue-700 font-medium mb-1">Henüz veri yok</p>
              <p className="text-xs text-blue-500">
                Günlük Plan sayfasından görev ekleyip tamamladıkça analitik veriler burada görünecek.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
