/**
 * Card Detail Modal
 * 
 * Kart detaylarını gösteren modal.
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card as CardType } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, CheckCircle2, Circle } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useBoardStore } from '@/store/board.store';
import { CommentList } from '@/components/comment/comment-list';
import { AttachmentList } from '@/components/attachment/attachment-list';
import { DueDatePicker } from './due-date-picker';
import { ChecklistSection } from '@/components/checklist/checklist-section';
import { LabelPicker } from '@/components/label/label-picker';
import { DependencyPicker } from './dependency-picker';

interface CardDetailModalProps {
  boardId: string;
  onUpdate?: () => void;
}

export function CardDetailModal({ boardId, onUpdate }: CardDetailModalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cardId = searchParams.get('card');
  
  const [card, setCard] = useState<CardType | null>(null);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  const updateCard = useBoardStore((state) => state.updateCard);
  const deleteCard = useBoardStore((state) => state.deleteCard);
  const board = useBoardStore((state) => state.board);

  useEffect(() => {
    if (cardId) {
      loadCard();
    }
  }, [cardId]);

  const loadCard = async () => {
    if (!cardId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/cards/${cardId}`);
      if (!response.ok) throw new Error('Kart yüklenemedi');
      
      const data = await response.json();
      setCard(data);
      setTitle(data.title);
      setDescription(data.description || '');
    } catch (error) {
      console.error('Kart yükleme hatası:', error);
      handleClose();
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    router.push(`/boards/${boardId}`);
  };

  const handleUpdate = async () => {
    if (!card) return;

    try {
      const response = await fetch(`/api/cards/${card.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
        }),
      });

      if (!response.ok) throw new Error('Kart güncellenemedi');

      const updatedCard = await response.json();
      
      // Store'u güncelle
      updateCard(card.id, { title, description });
      setCard(updatedCard);
      
      onUpdate?.();
    } catch (error) {
      console.error('Güncelleme hatası:', error);
      alert('Kart güncellenemedi');
    }
  };

  const handleToggleCompleted = async () => {
    if (!card) return;
    const newValue = !card.isCompleted;

    // Optimistic update
    setCard((prev) => prev ? { ...prev, isCompleted: newValue } : prev);
    updateCard(card.id, { isCompleted: newValue });

    try {
      const response = await fetch(`/api/cards/${card.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted: newValue }),
      });

      if (!response.ok) {
        // Revert
        setCard((prev) => prev ? { ...prev, isCompleted: card.isCompleted } : prev);
        updateCard(card.id, { isCompleted: card.isCompleted });
        alert('Kart durumu güncellenemedi');
      }
    } catch {
      setCard((prev) => prev ? { ...prev, isCompleted: card.isCompleted } : prev);
      updateCard(card.id, { isCompleted: card.isCompleted });
      alert('Kart durumu güncellenemedi');
    }
  };

  const handleDueDateSave = async (dueDate: string | null, dueComplete: boolean) => {
    if (!card) return;

    try {
      const response = await fetch(`/api/cards/${card.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dueDate, dueComplete }),
      });

      if (!response.ok) throw new Error('Tarih güncellenemedi');

      const updatedCard = await response.json();
      // Hem local state hem de store güncelleniyor
      setCard(updatedCard);
      updateCard(card.id, { dueDate, dueComplete });
    } catch (error) {
      console.error('Tarih güncelleme hatası:', error);
      alert('Bitiş tarihi güncellenemedi');
    }
  };

  const handleDelete = async () => {
    if (!card || !confirm('Bu kartı silmek istediğinizden emin misiniz?')) return;

    try {
      const response = await fetch(`/api/cards/${card.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Kart silinemedi');

      // Store'u güncelle
      deleteCard(card.id);
      
      onUpdate?.();
      handleClose();
    } catch (error) {
      console.error('Silme hatası:', error);
      alert('Kart silinemedi');
    }
  };

  if (!cardId) return null;

  return (
    <Dialog open={!!cardId} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-lg">Yükleniyor...</div>
          </div>
        ) : card ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">{card.title}</DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Etiketler */}
              <div>
                <LabelPicker
                  cardId={card.id}
                  boardId={boardId}
                  cardLabels={card.labels ?? []}
                  onLabelsChange={(labels) => {
                    setCard((prev) => prev ? { ...prev, labels } : prev);
                    updateCard(card.id, { labels });
                  }}
                />
              </div>

              {/* Başlık */}
              <div>
                <Label htmlFor="title">Başlık</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={handleUpdate}
                />
              </div>

              {/* Açıklama */}
              <div>
                <Label htmlFor="description">Açıklama</Label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={handleUpdate}
                  className="w-full min-h-[120px] p-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Açıklama ekleyin..."
                />
              </div>

              {/* Kart Tamamlandı */}
              <div>
                <button
                  onClick={handleToggleCompleted}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all w-full ${
                    card.isCompleted
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-green-400 hover:bg-green-50 text-gray-600'
                  }`}
                >
                  {card.isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <Circle className="h-5 w-5 flex-shrink-0" />
                  )}
                  <span className="text-sm font-medium">
                    {card.isCompleted ? 'Kart Tamamlandı — Geri Al' : 'Kartı Tamamlandı Olarak İşaretle'}
                  </span>
                </button>
                {card.isCompleted && (
                  <p className="text-xs text-gray-500 mt-1 ml-1">
                    Bu kart Timeline planlamasından dışlanır.
                  </p>
                )}
              </div>

              {/* Bitiş Tarihi */}
              <div>
                <DueDatePicker
                  dueDate={card.dueDate}
                  dueComplete={card.dueComplete}
                  onSave={handleDueDateSave}
                />
              </div>

              {/* Atananlar */}
              {card.assignees && card.assignees.length > 0 && (
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4" />
                    Atananlar
                  </Label>
                  <div className="flex gap-2 flex-wrap">
                    {card.assignees.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded"
                      >
                        {user.image && (
                          <img
                            src={user.image}
                            alt={user.name || ''}
                            className="w-6 h-6 rounded-full"
                          />
                        )}
                        <span className="text-sm">{user.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tarihler */}
              <div className="text-xs text-gray-500 space-y-1">
                <p>Oluşturulma: {formatDate(card.createdAt)}</p>
                {card.updatedAt && card.updatedAt !== card.createdAt && (
                  <p>Son güncelleme: {formatDate(card.updatedAt)}</p>
                )}
              </div>

              {/* Bağımlılıklar Bölümü */}
              <div className="pt-4 border-t">
                <DependencyPicker cardId={card.id} />
              </div>

              {/* Kontrol Listeleri Bölümü */}
              <div className="pt-4 border-t">
                <ChecklistSection cardId={card.id} />
              </div>

              {/* Dosya Ekleri Bölümü */}
              <div className="pt-4 border-t">
                <AttachmentList
                  cardId={card.id}
                  boardOwnerId={board?.owner?.id || ''}
                />
              </div>

              {/* Yorumlar Bölümü */}
              <div className="pt-4 border-t">
                <CommentList cardId={card.id} />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                >
                  Kartı Sil
                </Button>
                <Button variant="outline" onClick={handleClose}>
                  Kapat
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center p-8">
            Kart bulunamadı
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
