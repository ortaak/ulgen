'use client';

import { useState, useEffect, useRef } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Play, Pause, CheckCircle, SkipForward, Trash2, Clock, GripVertical, Timer, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TimelineTask } from '@/types';
import { BOARD_COLOR_PALETTE } from './board-colors';
import { LabelBadge } from '@/components/label/label-badge';

interface TimelineTaskCardProps {
  task: TimelineTask;
  boardColorIndex: number;
  onUpdateStatus: (id: string, action: 'start' | 'pause' | 'complete' | 'skip') => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} dk`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}s ${m}dk` : `${h} saat`;
}

const STATUS_CONFIG = {
  PLANNED: {
    bg: 'bg-white',
    badge: 'bg-gray-100 text-gray-600',
    label: 'Planlandı',
  },
  IN_PROGRESS: {
    bg: 'bg-yellow-50',
    badge: 'bg-yellow-100 text-yellow-700',
    label: 'Devam Ediyor',
  },
  PAUSED: {
    bg: 'bg-orange-50',
    badge: 'bg-orange-100 text-orange-700',
    label: 'Duraklatıldı',
  },
  COMPLETED: {
    bg: 'bg-green-50 opacity-75',
    badge: 'bg-green-100 text-green-700',
    label: 'Tamamlandı',
  },
  SKIPPED: {
    bg: 'bg-gray-50 opacity-50',
    badge: 'bg-gray-100 text-gray-500',
    label: 'Atlandı',
  },
};

// Sadece bu durumlar drag&drop ile yeniden planlanabilir
const DRAGGABLE_STATUSES: TimelineTask['status'][] = ['PLANNED', 'PAUSED'];

function useElapsedSeconds(task: TimelineTask): number | null {
  const [elapsed, setElapsed] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (task.status !== 'IN_PROGRESS' || !task.actualStartTime) {
      setElapsed(null);
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    const compute = () => {
      const diff = Math.floor((Date.now() - new Date(task.actualStartTime!).getTime()) / 1000);
      setElapsed(diff);
    };

    compute();
    intervalRef.current = setInterval(compute, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [task.status, task.actualStartTime]);

  return elapsed;
}

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}s ${m.toString().padStart(2, '0')}dk`;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function TimelineTaskCard({
  task,
  boardColorIndex,
  onUpdateStatus,
  onDelete,
}: TimelineTaskCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const elapsedSeconds = useElapsedSeconds(task);

  const isDraggable = DRAGGABLE_STATUSES.includes(task.status);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    disabled: !isDraggable,
    data: { task },
  });

  const dragStyle = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  const config = STATUS_CONFIG[task.status];
  const boardColor = BOARD_COLOR_PALETTE[boardColorIndex];

  const handleAction = async (action: 'start' | 'pause' | 'complete' | 'skip') => {
    setIsUpdating(true);
    try {
      await onUpdateStatus(task.id, action);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(task.id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={dragStyle}
      className={`rounded-lg border shadow-sm p-3 transition-all border-l-4 ${boardColor.borderClass} ${config.bg} ${
        task.status === 'SKIPPED' ? 'line-through' : ''
      } ${isDragging ? 'opacity-40 shadow-lg ring-2 ring-primary/30 z-50' : ''}`}
    >
      {/* Başlık ve board bilgisi */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-start gap-1.5 flex-1 min-w-0">
          {/* Drag handle — sadece draggable görevlerde gösterilir */}
          {isDraggable && (
            <button
              {...listeners}
              {...attributes}
              className="mt-0.5 flex-shrink-0 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 transition-colors"
              title="Saati değiştirmek için sürükle"
            >
              <GripVertical className="h-4 w-4" />
            </button>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">{task.card.title}</p>
            <div className="flex items-center gap-1">
              <span className={`inline-block h-2 w-2 rounded-full flex-shrink-0 ${boardColor.dotClass}`} />
              <p className={`text-xs truncate ${boardColor.textClass}`}>{task.board.title}</p>
            </div>
          </div>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${config.badge}`}>
          {config.label}
        </span>
      </div>

      {/* Saat ve süre */}
      <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
        <Clock className="h-3 w-3 flex-shrink-0" />
        <span>
          {formatTime(task.startTime)} – {formatTime(task.endTime)}
        </span>
        <span className="text-gray-400">·</span>
        <span>{formatDuration(task.estimatedMinutes)}</span>
        {task.actualMinutes && (
          <>
            <span className="text-gray-400">·</span>
            <span className="text-green-600">Gerçek: {formatDuration(task.actualMinutes)}</span>
          </>
        )}
      </div>

      {/* Canlı geçen süre sayacı — yalnızca IN_PROGRESS */}
      {task.status === 'IN_PROGRESS' && elapsedSeconds !== null && (
        <div className="flex items-center gap-1.5 text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-md px-2 py-1 mb-2 font-mono">
          <Timer className="h-3 w-3 animate-pulse" />
          <span className="font-semibold">{formatElapsed(elapsedSeconds)}</span>
          <span className="text-yellow-500 font-sans">geçti</span>
        </div>
      )}

      {/* Bağımlılık bloke uyarısı — tamamlanmamış bekleyen kartlar varsa */}
      {(task.card._count?.blockedBy ?? 0) > 0 && task.status !== 'COMPLETED' && task.status !== 'SKIPPED' && (
        <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-2 py-1 mb-2">
          <Lock className="h-3 w-3 flex-shrink-0" />
          <span>
            {task.card._count!.blockedBy} kart tamamlanmadan bu görev başlayamaz
          </span>
        </div>
      )}

      {/* Etiketler */}
      {task.card.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.card.labels.map((label) => (
            <LabelBadge key={label.id} label={label} />
          ))}
        </div>
      )}

      {/* Aksiyonlar */}
      {task.status !== 'COMPLETED' && task.status !== 'SKIPPED' && (
        <div className="flex items-center gap-1 flex-wrap">
          {(task.status === 'PLANNED' || task.status === 'PAUSED') && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              disabled={isUpdating}
              onClick={() => handleAction('start')}
            >
              <Play className="h-3 w-3 mr-1" />
              Başlat
            </Button>
          )}

          {task.status === 'IN_PROGRESS' && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              disabled={isUpdating}
              onClick={() => handleAction('pause')}
            >
              <Pause className="h-3 w-3 mr-1" />
              Duraklat
            </Button>
          )}

          {(task.status === 'IN_PROGRESS' || task.status === 'PAUSED') && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs text-green-600 border-green-300 hover:bg-green-50"
              disabled={isUpdating}
              onClick={() => handleAction('complete')}
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Tamamla
            </Button>
          )}

          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs text-gray-500"
            disabled={isUpdating}
            onClick={() => handleAction('skip')}
          >
            <SkipForward className="h-3 w-3 mr-1" />
            Atla
          </Button>

          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs text-red-500 hover:text-red-600 ml-auto"
            disabled={isDeleting}
            onClick={handleDelete}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Tamamlandı durumu */}
      {task.status === 'COMPLETED' && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-green-600 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Tamamlandı
            {task.actualEndTime && ` · ${formatTime(task.actualEndTime)}`}
          </span>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs text-red-400"
            disabled={isDeleting}
            onClick={handleDelete}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Atlandı durumu */}
      {task.status === 'SKIPPED' && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Atlandı</span>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs text-red-400"
            disabled={isDeleting}
            onClick={handleDelete}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}
