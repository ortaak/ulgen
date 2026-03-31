/**
 * Create List Form
 * 
 * Yeni liste oluşturma formu.
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import { useBoardStore } from '@/store/board.store';

interface CreateListFormProps {
  boardId: string;
  position: number;
  onClose: () => void;
  onCreated?: () => void;
}

export function CreateListForm({ boardId, position, onClose, onCreated }: CreateListFormProps) {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const addList = useBoardStore((state) => state.addList);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);

    try {
      const response = await fetch('/api/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          boardId,
          position,
        }),
      });

      if (!response.ok) {
        throw new Error('Liste oluşturulamadı');
      }

      const newList = await response.json();
      
      // Store'u güncelle (optimistic update)
      addList({ ...newList, cards: [] });

      setTitle('');
      if (onCreated) {
        onCreated();
      }
      onClose();
    } catch (error) {
      console.error('Liste oluşturma hatası:', error);
      alert('Liste oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 rounded-lg p-3 w-80 flex-shrink-0">
      <form onSubmit={handleSubmit}>
        <Input
          placeholder="Liste başlığı..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
          disabled={loading}
          className="mb-2"
        />
        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={loading || !title.trim()}>
            {loading ? 'Ekleniyor...' : 'Liste Ekle'}
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
