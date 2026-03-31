/**
 * Create Card Form
 * 
 * Yeni kart oluşturma formu.
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import { useBoardStore } from '@/store/board.store';

interface CreateCardFormProps {
  listId: string;
  position: number;
  onClose: () => void;
  onCreated?: () => void;
}

export function CreateCardForm({ listId, position, onClose, onCreated }: CreateCardFormProps) {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const addCard = useBoardStore((state) => state.addCard);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);

    try {
      const response = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          listId,
          position,
          labels: [],
        }),
      });

      if (!response.ok) {
        throw new Error('Kart oluşturulamadı');
      }

      const newCard = await response.json();
      
      // Store'u güncelle (optimistic update)
      addCard(newCard);

      setTitle('');
      if (onCreated) {
        onCreated();
      }
      onClose();
    } catch (error) {
      console.error('Kart oluşturma hatası:', error);
      alert('Kart oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-2 shadow-sm">
      <form onSubmit={handleSubmit}>
        <Input
          placeholder="Kart başlığı..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
          disabled={loading}
          className="mb-2"
        />
        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={loading || !title.trim()}>
            {loading ? 'Ekleniyor...' : 'Kart Ekle'}
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
