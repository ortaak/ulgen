/**
 * Matrix Card Component
 *
 * Eisenhower matrisindeki her kadranda görünen kart kartı.
 * @dnd-kit useDraggable ile sürüklenebilir.
 */

'use client';

import { Card as CardType } from '@/types';
import { LabelBadge } from '@/components/label/label-badge';
import { Card } from '@/components/ui/card';
import { User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDraggable } from '@dnd-kit/core';
import { DueDateBadge } from '@/components/card/due-date-badge';

interface MatrixCardProps {
  card: CardType;
  /** Sürükleme sırasında renk tonu için kadran rengi */
  accentColor: string;
}

export function MatrixCard({ card, accentColor }: MatrixCardProps) {
  const router = useRouter();

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: card.id,
    data: { card },
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{ opacity: isDragging ? 0.4 : 1 }}
      className="touch-none"
    >
      <Card
        className="p-2.5 cursor-grab active:cursor-grabbing hover:shadow-md transition-all border-l-4"
        style={{ borderLeftColor: accentColor }}
        onClick={() => {
          if (!isDragging) {
            router.push(`?card=${card.id}`);
          }
        }}
      >
        {/* Etiketler */}
        {card.labels.length > 0 && (
          <div className="flex gap-1 mb-1.5 flex-wrap">
            {card.labels.map((label) => (
              <LabelBadge key={label.id} label={label} />
            ))}
          </div>
        )}

        {/* Başlık */}
        <p className="text-xs font-medium leading-snug mb-1.5">{card.title}</p>

        {/* Meta */}
        <div className="flex items-center gap-2 flex-wrap">
          {card.dueDate && (
            <DueDateBadge
              dueDate={card.dueDate}
              dueComplete={card.dueComplete}
              compact
            />
          )}
          {card.assignees.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <User className="h-3 w-3" />
              <span>{card.assignees.length}</span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
