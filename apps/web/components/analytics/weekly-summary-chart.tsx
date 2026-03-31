/**
 * WeeklySummaryChart — Günlük tamamlanan/atlanan/planlanan görev bar chart
 *
 * recharts BarChart kullanır. Tarih bazlı gruplama API tarafından yapılır.
 */

'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';

interface DailySummaryItem {
  date: string;
  completed: number;
  skipped: number;
  planned: number;
}

interface WeeklySummaryChartProps {
  data: DailySummaryItem[];
}

export function WeeklySummaryChart({ data }: WeeklySummaryChartProps) {
  if (data.length === 0) {
    return <EmptyState message="Henüz veri yok. Günlük Plan'dan görev tamamlayarak başlayın." />;
  }

  // Sadece aktivite olan günleri göster, yoksa son 14 günü
  const displayData = data.slice(-30).map((d) => ({
    ...d,
    label: format(parseISO(d.date), 'dd MMM', { locale: tr }),
  }));

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Günlük Görev Özeti</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={displayData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: '#6b7280' }}
            interval="preserveStartEnd"
          />
          <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} allowDecimals={false} />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
            labelStyle={{ fontWeight: 600 }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="completed" name="Tamamlandı" fill="#22c55e" radius={[3, 3, 0, 0]} />
          <Bar dataKey="planned" name="Planlandı" fill="#60a5fa" radius={[3, 3, 0, 0]} />
          <Bar dataKey="skipped" name="Atlandı" fill="#f87171" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-center h-[280px]">
      <p className="text-sm text-gray-400">{message}</p>
    </div>
  );
}
