'use client';

import { ChevronDown, ChevronRight, ListTodo, Plus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UnscheduledCard } from '@/types';
import { LabelBadge } from '@/components/label/label-badge';

interface UnscheduledPoolProps {
  cards: UnscheduledCard[];
  isLoading: boolean;
  onAddToTimeline: (card: UnscheduledCard) => void;
}

export function UnscheduledPool({ cards, isLoading, onAddToTimeline }: UnscheduledPoolProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="bg-white rounded-xl border p-4">
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="w-full flex items-center gap-2 mb-3 text-left"
      >
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronRight className="h-4 w-4 text-gray-400" />
        )}
        <ListTodo className="h-4 w-4 text-purple-500" />
        <span className="font-semibold text-gray-800 text-sm">Planlanmadı</span>
        <span className="ml-auto text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
          {cards.length}
        </span>
      </button>

      {isOpen && (
        <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
          {isLoading ? (
            <p className="text-sm text-gray-400 text-center py-4">Yükleniyor...</p>
          ) : cards.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4 italic">
              Tüm kartlar planlandı 🎉
            </p>
          ) : (
            cards.map((card) => (
              <div
                key={card.id}
                className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{card.title}</p>
                  <p className="text-xs text-gray-400 truncate">
                    {card.boardTitle} · {card.listTitle}
                  </p>
                  {card.labels.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {card.labels.map((label) => (
                        <LabelBadge key={label.id} label={label} />
                      ))}
                    </div>
                  )}
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                  onClick={() => onAddToTimeline(card)}
                  title="Timeline'a ekle"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
