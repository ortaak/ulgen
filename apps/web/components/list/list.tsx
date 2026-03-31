/**
 * List Component
 * 
 * Bir liste ve içindeki kartları gösterir. Drag & Drop desteği ile.
 */

'use client';

import { useState } from 'react';
import { List as ListType } from '@/types';
import { CardItem } from '@/components/card/card-item';
import { CreateCardForm } from '@/components/card/create-card-form';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { useBoardStore } from '@/store/board.store';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

interface ListProps {
  list: ListType;
  onDelete?: (listId: string) => void;
}

export function List({ list, onDelete }: ListProps) {
  const [showAddCard, setShowAddCard] = useState(false);
  const deleteList = useBoardStore((state) => state.deleteList);

  // Droppable - liste bir drop zone
  const { setNodeRef } = useDroppable({
    id: list.id,
  });

  const handleDelete = async () => {
    if (!confirm(`"${list.title}" listesini silmek istediğinize emin misiniz?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/lists/${list.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Liste silinemedi');
      }

      // Store'u güncelle
      deleteList(list.id);

      if (onDelete) {
        onDelete(list.id);
      }
    } catch (error) {
      console.error('Liste silme hatası:', error);
      alert('Liste silinemedi');
    }
  };

  return (
    <div 
      ref={setNodeRef}
      className="bg-gray-100 rounded-lg p-3 w-80 flex-shrink-0"
    >
      {/* Liste başlığı */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">{list.title}</h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Kartlar - Sortable Context */}
      <SortableContext
        items={list.cards.map((c) => c.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2 mb-2">
          {list.cards.map((card) => (
            <CardItem key={card.id} card={card} />
          ))}
        </div>
      </SortableContext>

      {/* Kart ekleme formu */}
      {showAddCard ? (
        <CreateCardForm
          listId={list.id}
          position={list.cards.length}
          onClose={() => setShowAddCard(false)}
        />
      ) : (
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => setShowAddCard(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Kart Ekle
        </Button>
      )}
    </div>
  );
}
