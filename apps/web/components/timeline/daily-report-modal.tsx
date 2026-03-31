'use client';

import { useCallback } from 'react';
import { FileText, Copy, Printer, CheckCircle2, SkipForward, Clock, TrendingUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TimelineTask, TimelineStats } from '@/types';
import { BOARD_COLOR_PALETTE, buildBoardColorMap } from './board-colors';
import { toast } from 'sonner';

interface DailyReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date;
  tasks: TimelineTask[];
  stats: TimelineStats;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('tr-TR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatDuration(minutes: number): string {
  if (minutes === 0) return '0 dk';
  if (minutes < 60) return `${minutes} dk`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h} saat ${m} dk` : `${h} saat`;
}

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

const STATUS_LABEL: Record<TimelineTask['status'], string> = {
  PLANNED: 'Planlandı',
  IN_PROGRESS: 'Devam Ediyor',
  PAUSED: 'Duraklatıldı',
  COMPLETED: 'Tamamlandı',
  SKIPPED: 'Atlandı',
};

export function DailyReportModal({ open, onOpenChange, date, tasks, stats }: DailyReportModalProps) {
  const boardColorMap = buildBoardColorMap(tasks.map((t) => t.boardId));

  // Board bazlı dağılım
  const boardBreakdown = tasks.reduce<Record<string, { title: string; count: number; minutes: number; colorIndex: number }>>((acc, task) => {
    if (!acc[task.boardId]) {
      acc[task.boardId] = {
        title: task.board.title,
        count: 0,
        minutes: 0,
        colorIndex: boardColorMap[task.boardId] ?? 0,
      };
    }
    acc[task.boardId].count++;
    acc[task.boardId].minutes += task.actualMinutes ?? task.estimatedMinutes;
    return acc;
  }, {});

  const actualTotal = tasks.reduce((s, t) => s + (t.actualMinutes ?? 0), 0);
  const estimatedTotal = stats.totalMinutesPlanned;
  const accuracy = estimatedTotal > 0 && actualTotal > 0
    ? Math.round((Math.min(actualTotal, estimatedTotal) / Math.max(actualTotal, estimatedTotal)) * 100)
    : null;

  // Metin raporu oluştur
  const buildTextReport = useCallback(() => {
    const lines: string[] = [
      `ULGEN — Günlük Rapor`,
      `Tarih: ${formatDate(date)}`,
      `${'─'.repeat(40)}`,
      ``,
      `ÖZET`,
      `  Toplam Görev   : ${stats.totalPlanned}`,
      `  Tamamlanan     : ${stats.completed}`,
      `  Atlanan        : ${tasks.filter(t => t.status === 'SKIPPED').length}`,
      `  Planlanan Süre : ${formatDuration(estimatedTotal)}`,
      actualTotal > 0 ? `  Gerçek Süre    : ${formatDuration(actualTotal)}` : '',
      accuracy !== null ? `  Tahmin Doğruluğu: %${accuracy}` : '',
      ``,
      `GÖREVLER`,
    ];

    tasks.forEach((task) => {
      lines.push(
        `  [${STATUS_LABEL[task.status]}] ${task.card.title}`,
        `    Board: ${task.board.title} | ${formatTime(task.startTime)}–${formatTime(task.endTime)}`,
        task.actualMinutes ? `    Gerçek süre: ${formatDuration(task.actualMinutes)}` : '',
      );
    });

    lines.push(``, `${'─'.repeat(40)}`, `ULGEN — ulgen.app`);
    return lines.filter((l) => l !== null && l !== undefined).join('\n');
  }, [date, tasks, stats, estimatedTotal, actualTotal, accuracy]);

  const handleCopy = () => {
    navigator.clipboard.writeText(buildTextReport()).then(() => {
      toast.success('Rapor panoya kopyalandı');
    });
  };

  const handlePrint = () => {
    const text = buildTextReport();
    const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>ULGEN — Günlük Rapor</title><style>body{font-family:monospace;font-size:13px;line-height:1.6;padding:32px;white-space:pre-wrap}</style></head><body>${escaped}</body></html>`;
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank', 'width=600,height=800');
    if (win) {
      win.addEventListener('load', () => { win.print(); URL.revokeObjectURL(url); });
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => onOpenChange(false)}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white rounded-t-xl">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-gray-600" />
            <div>
              <h2 className="font-semibold text-gray-900">Günlük Rapor</h2>
              <p className="text-xs text-gray-500">{formatDate(date)}</p>
            </div>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Özet kartları */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-gray-900">{stats.totalPlanned}</p>
              <p className="text-xs text-gray-500 mt-0.5">Toplam Görev</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              <p className="text-xs text-gray-500 mt-0.5">Tamamlanan</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-orange-600">
                {tasks.filter((t) => t.status === 'SKIPPED').length}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Atlanan</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-blue-600">{formatDuration(estimatedTotal)}</p>
              <p className="text-xs text-gray-500 mt-0.5">Planlanan Süre</p>
            </div>
          </div>

          {/* Tahmin doğruluğu */}
          {actualTotal > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                  <TrendingUp className="h-4 w-4" />
                  Süre Analizi
                </div>
                {accuracy !== null && (
                  <span className={`text-sm font-bold ${accuracy >= 80 ? 'text-green-600' : accuracy >= 60 ? 'text-yellow-600' : 'text-red-500'}`}>
                    %{accuracy} doğruluk
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Planlanan: {formatDuration(estimatedTotal)}
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  Gerçek: {formatDuration(actualTotal)}
                </span>
              </div>
            </div>
          )}

          {/* Board dağılımı */}
          {Object.keys(boardBreakdown).length > 1 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Board Dağılımı</h3>
              <div className="space-y-2">
                {Object.values(boardBreakdown).map((board) => {
                  const color = BOARD_COLOR_PALETTE[board.colorIndex];
                  const pct = estimatedTotal > 0 ? (board.minutes / estimatedTotal) * 100 : 0;
                  return (
                    <div key={board.title}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className={`flex items-center gap-1.5 font-medium ${color.textClass}`}>
                          <span className={`h-2 w-2 rounded-full ${color.dotClass}`} />
                          {board.title}
                        </span>
                        <span className="text-gray-500">{board.count} görev · {formatDuration(board.minutes)}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${color.dotClass.replace('bg-', 'bg-')}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Görev listesi */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Görevler</h3>
            <div className="space-y-2">
              {tasks.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">Bugün görev yok</p>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-start gap-2 p-2.5 rounded-lg border text-sm ${
                      task.status === 'COMPLETED' ? 'bg-green-50 border-green-100' :
                      task.status === 'SKIPPED' ? 'bg-gray-50 border-gray-100 opacity-60' :
                      'bg-white border-gray-100'
                    }`}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {task.status === 'COMPLETED' ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : task.status === 'SKIPPED' ? (
                        <SkipForward className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Clock className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate ${task.status === 'SKIPPED' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                        {task.card.title}
                      </p>
                      <p className="text-xs text-gray-400">
                        {task.board.title} · {formatTime(task.startTime)}–{formatTime(task.endTime)}
                        {task.actualMinutes ? ` · Gerçek: ${formatDuration(task.actualMinutes)}` : ''}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t bg-gray-50 rounded-b-xl sticky bottom-0">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            <Copy className="h-3.5 w-3.5 mr-1.5" />
            Panoya Kopyala
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-3.5 w-3.5 mr-1.5" />
            Yazdır
          </Button>
          <Button size="sm" onClick={() => onOpenChange(false)}>
            Kapat
          </Button>
        </div>
      </div>
    </div>
  );
}
