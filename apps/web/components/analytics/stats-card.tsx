/**
 * StatsCard — Tek bir özet metrik için kart bileşeni
 */

interface StatsCardProps {
  label: string;
  value: string | number;
  sub?: string;
  color?: 'green' | 'blue' | 'orange' | 'purple' | 'gray';
}

const colorMap = {
  green: 'text-green-600 bg-green-50',
  blue: 'text-blue-600 bg-blue-50',
  orange: 'text-orange-600 bg-orange-50',
  purple: 'text-purple-600 bg-purple-50',
  gray: 'text-gray-600 bg-gray-50',
};

export function StatsCard({ label, value, sub, color = 'blue' }: StatsCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-1">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className={`text-3xl font-bold ${colorMap[color].split(' ')[0]}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  );
}
