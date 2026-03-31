/**
 * EstimationAccuracyChart — Tahmin doğruluğu trend çizgi grafiği
 *
 * Son tamamlanan görevlerde tahmini vs gerçek süreyi karşılaştırır.
 * "Tahminci olarak gelişiyor musun?" sorusunu görselleştirir.
 */

'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface EstimationTrendItem {
  date: string;
  estimated: number;
  actual: number;
  accuracy: number;
}

interface EstimationAccuracyChartProps {
  data: EstimationTrendItem[];
  avgAccuracy: number | null;
}

export function EstimationAccuracyChart({ data, avgAccuracy }: EstimationAccuracyChartProps) {
  if (data.length < 2) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700">Tahmin Doğruluğu Trendi</h3>
          {avgAccuracy !== null && <AccuracyBadge accuracy={avgAccuracy} />}
        </div>
        <div className="flex items-center justify-center h-[180px] text-sm text-gray-400">
          En az 2 tamamlanan görev gerekli.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-700">Tahmin Doğruluğu Trendi</h3>
          <p className="text-xs text-gray-400">
            Tahmini süre (mavi) ile gerçek süre (turuncu) karşılaştırması
          </p>
        </div>
        {avgAccuracy !== null && <AccuracyBadge accuracy={avgAccuracy} />}
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6b7280' }} />
          <YAxis
            tick={{ fontSize: 11, fill: '#6b7280' }}
            tickFormatter={(v) => `${v}dk`}
          />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
            formatter={(value, name) => [`${value} dk`, name]}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line
            type="monotone"
            dataKey="estimated"
            name="Tahmini"
            stroke="#60a5fa"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="actual"
            name="Gerçek"
            stroke="#f97316"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function AccuracyBadge({ accuracy }: { accuracy: number }) {
  const color =
    accuracy >= 80 ? 'bg-green-100 text-green-700' :
    accuracy >= 60 ? 'bg-yellow-100 text-yellow-700' :
    'bg-red-100 text-red-700';

  return (
    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${color}`}>
      %{accuracy} doğru
    </div>
  );
}
