/**
 * BoardDistributionChart — Board bazlı harcanan dakika pasta grafiği
 *
 * recharts PieChart kullanır. Renk otomatik atanır (10 sabit renk paleti).
 */

'use client';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface BoardDistributionItem {
  boardId: string;
  boardTitle: string;
  minutes: number;
  taskCount: number;
}

interface BoardDistributionChartProps {
  data: BoardDistributionItem[];
}

// 10 renkten oluşan sabit palet — board sırası bu renklerle eşlenir
const COLORS = [
  '#6366f1', '#22c55e', '#f59e0b', '#ec4899', '#14b8a6',
  '#f97316', '#8b5cf6', '#06b6d4', '#ef4444', '#84cc16',
];

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} dk`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h} sa ${m} dk` : `${h} sa`;
}

export function BoardDistributionChart({ data }: BoardDistributionChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-center h-[280px]">
        <p className="text-sm text-gray-400">Henüz tamamlanan görev yok.</p>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    name: d.boardTitle,
    value: d.minutes,
    taskCount: d.taskCount,
  }));

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Board Bazlı Zaman Dağılımı</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [formatMinutes(Number(value ?? 0))]}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
          />
          <Legend
            wrapperStyle={{ fontSize: 12 }}
            formatter={(value, entry: any) =>
              `${value} (${formatMinutes(entry.payload.value)})`
            }
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
