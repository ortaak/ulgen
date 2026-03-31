'use client';

import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { ChevronDown, ChevronRight, Sun, Coffee, Moon } from 'lucide-react';
import { TimelineTask } from '@/types';
import { TimelineTaskCard } from './timeline-task-card';

interface TimelineSectionProps {
  title: string;
  icon: 'morning' | 'afternoon' | 'evening';
  tasks: TimelineTask[];
  boardColorMap: Record<string, number>;
  onUpdateStatus: (id: string, action: 'start' | 'pause' | 'complete' | 'skip') => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const ICON_MAP = {
  morning: { Icon: Sun, color: 'text-amber-500' },
  afternoon: { Icon: Coffee, color: 'text-blue-500' },
  evening: { Icon: Moon, color: 'text-indigo-500' },
};

export function TimelineSection({
  title,
  icon,
  tasks,
  boardColorMap,
  onUpdateStatus,
  onDelete,
}: TimelineSectionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const { Icon, color } = ICON_MAP[icon];

  const { setNodeRef, isOver } = useDroppable({ id: icon });

  const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;

  return (
    <div
      ref={setNodeRef}
      className={`mb-4 rounded-lg transition-colors ${
        isOver ? 'bg-primary/5 ring-2 ring-primary/20' : ''
      }`}
    >
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="w-full flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
      >
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
        )}
        <Icon className={`h-4 w-4 flex-shrink-0 ${color}`} />
        <span className="font-semibold text-gray-700 text-sm">{title}</span>
        {isOver && (
          <span className="ml-1 text-xs text-primary font-medium">Buraya bırak</span>
        )}
        <span className="ml-auto text-xs text-gray-400">
          {completedCount}/{tasks.length}
        </span>
      </button>

      {isOpen && (
        <div className="mt-1 space-y-2 pl-2">
          {tasks.length === 0 ? (
            <p
              className={`text-sm py-3 text-center italic transition-colors ${
                isOver ? 'text-primary' : 'text-gray-400'
              }`}
            >
              {isOver ? 'Görevi bu bloğa bırak' : 'Bu blokta henüz görev yok'}
            </p>
          ) : (
            tasks.map((task) => (
              <TimelineTaskCard
                key={task.id}
                task={task}
                boardColorIndex={boardColorMap[task.boardId] ?? 0}
                onUpdateStatus={onUpdateStatus}
                onDelete={onDelete}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
