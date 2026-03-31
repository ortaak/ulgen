'use client';

import { CheckCircle, Clock, Loader2, AlertCircle } from 'lucide-react';
import { TimelineStats } from '@/types';

interface TimelineStatsProps {
  stats: TimelineStats;
}

function formatDuration(minutes: number): string {
  if (minutes === 0) return '—';
  if (minutes < 60) return `${minutes} dk`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}s ${m}dk` : `${h} saat`;
}

export function TimelineStatsPanel({ stats }: TimelineStatsProps) {
  const progressPercent =
    stats.totalPlanned > 0 ? Math.round((stats.completed / stats.totalPlanned) * 100) : 0;

  return (
    <div className="bg-white rounded-xl border p-4 space-y-4">
      <h2 className="font-semibold text-gray-800 text-sm">Günlük İlerleme</h2>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{stats.completed} / {stats.totalPlanned} tamamlandı</span>
          <span className="font-medium text-gray-700">{progressPercent}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatItem
          icon={<CheckCircle className="h-4 w-4 text-green-500" />}
          label="Tamamlandı"
          value={stats.completed}
        />
        <StatItem
          icon={<Loader2 className="h-4 w-4 text-yellow-500" />}
          label="Devam Eden"
          value={stats.inProgress}
        />
        <StatItem
          icon={<AlertCircle className="h-4 w-4 text-blue-500" />}
          label="Bekliyor"
          value={stats.remaining}
        />
        <StatItem
          icon={<Clock className="h-4 w-4 text-gray-400" />}
          label="Toplam Süre"
          value={formatDuration(stats.totalMinutesPlanned)}
          isText
        />
      </div>
    </div>
  );
}

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  isText?: boolean;
}

function StatItem({ icon, label, value, isText }: StatItemProps) {
  return (
    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
      {icon}
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className={`font-bold text-gray-800 ${isText ? 'text-xs' : 'text-base'}`}>{value}</p>
      </div>
    </div>
  );
}
