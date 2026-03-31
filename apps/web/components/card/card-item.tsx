/**
 * Card Item Component
 *
 * Liste içinde görünen kart önizlemesi. Drag & Drop desteği ile.
 */

'use client';

import { Card as CardType } from '@/types';
import { Card } from '@/components/ui/card';
import { User, CheckCircle2, Circle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { DueDateBadge } from './due-date-badge';
import { LabelBadge } from '@/components/label/label-badge';
import { DependencyBadge } from './dependency-badge';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useBoardStore } from '@/store/board.store';

interface CardItemProps {
  card: CardType;
}

export function CardItem({ card }: CardItemProps) {
  const router = useRouter();
  const updateCard = useBoardStore((state) => state.updateCard);

  // Sortable - kart draggable
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleToggleCompleted = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const newValue = !card.isCompleted;

    // Optimistic update
    updateCard(card.id, { isCompleted: newValue });

    try {
      const response = await fetch(`/api/cards/${card.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted: newValue }),
      });

      if (!response.ok) {
        // Revert on failure
        updateCard(card.id, { isCompleted: card.isCompleted });
      }
    } catch {
      updateCard(card.id, { isCompleted: card.isCompleted });
    }
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card
        className={`p-3 cursor-grab active:cursor-grabbing hover:bg-gray-50 transition-colors relative ${
          card.isCompleted ? 'opacity-60' : ''
        }`}
        onClick={(_e) => {
          // Drag sırasında modal açılmasın
          if (!isDragging) {
            router.push(`?card=${card.id}`);
          }
        }}
      >
        {/* Tamamlandı toggle butonu */}
        <button
          onClick={handleToggleCompleted}
          className="absolute top-2 right-2 text-gray-400 hover:text-green-500 transition-colors z-10"
          title={card.isCompleted ? 'Tamamlanmadı olarak işaretle' : 'Tamamlandı olarak işaretle'}
        >
          {card.isCompleted ? (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          ) : (
            <Circle className="h-4 w-4" />
          )}
        </button>

        {/* Etiketler */}
        {card.labels.length > 0 && (
          <div className="flex gap-1 mb-2 flex-wrap pr-6">
            {card.labels.map((label) => (
              <LabelBadge key={label.id} label={label} />
            ))}
          </div>
        )}

        {/* Başlık */}
        <p className={`text-sm font-medium mb-2 pr-6 ${card.isCompleted ? 'line-through text-gray-500' : ''}`}>
          {card.title}
        </p>

        {/* Meta bilgiler */}
        <div className="flex items-center gap-2 flex-wrap">
          {card.dueDate && (
            <DueDateBadge
              dueDate={card.dueDate}
              dueComplete={card.dueComplete}
              compact
            />
          )}
          {card.assignees.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <User className="h-3 w-3" />
              <span>{card.assignees.length}</span>
            </div>
          )}
          {/* Bağımlılık rozetleri */}
          {(card._count?.blockedBy ?? 0) + (card._count?.blockingFor ?? 0) > 0 && (
            <DependencyBadge
              blockedByCount={card._count?.blockedBy ?? 0}
              blockingForCount={card._count?.blockingFor ?? 0}
            />
          )}
          {card.isCompleted && (
            <span className="text-xs text-green-600 font-medium bg-green-50 px-1.5 py-0.5 rounded">
              Tamamlandı
            </span>
          )}
        </div>
      </Card>
    </div>
  );
}
