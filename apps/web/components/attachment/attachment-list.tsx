'use client';

/**
 * AttachmentList — Karta Ait Dosya Eklerini Listeler
 *
 * API'dan ekleri çeker, listeleme ve silme işlemlerini yönetir.
 * Yeni ek yüklemek için AttachmentUpload bileşenini içerir.
 */

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Attachment } from '@/types';
import { AttachmentItem } from './attachment-item';
import { AttachmentUpload } from './attachment-upload';
import { Paperclip, Loader2 } from 'lucide-react';
import { useBoardStore } from '@/store/board.store';

interface AttachmentListProps {
  cardId: string;
  boardOwnerId: string;
}

export function AttachmentList({ cardId, boardOwnerId }: AttachmentListProps) {
  const { data: session } = useSession();
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const addAttachment = useBoardStore((state) => state.addAttachment);
  const removeAttachment = useBoardStore((state) => state.removeAttachment);

  // Ekleri API'dan yükle
  useEffect(() => {
    const fetchAttachments = async () => {
      try {
        const response = await fetch(`/api/cards/${cardId}/attachments`);
        if (!response.ok) throw new Error('Ekler getirilemedi');

        const data: Attachment[] = await response.json();
        setAttachments(data);
      } catch (error) {
        console.error('Ek getirme hatası:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttachments();
  }, [cardId]);

  // Yeni ek yüklendiğinde listeye ve store'a ekle
  const handleUploadComplete = (attachment: Attachment) => {
    setAttachments((prev) => [attachment, ...prev]);
    addAttachment(cardId, attachment);
  };

  // Eki sil
  const handleDelete = async (attachmentId: string) => {
    const response = await fetch(`/api/attachments/${attachmentId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Dosya silinemedi');
    }

    setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
    removeAttachment(cardId, attachmentId);
  };

  if (!session?.user?.id) return null;

  return (
    <div className="space-y-3">
      {/* Bölüm Başlığı */}
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-medium text-sm text-gray-700">
          <Paperclip className="h-4 w-4" />
          Ekler
          {attachments.length > 0 && (
            <span className="text-xs text-gray-500">({attachments.length})</span>
          )}
        </h3>
      </div>

      {/* Yükleme Bileşeni */}
      <AttachmentUpload
        cardId={cardId}
        onUploadComplete={handleUploadComplete}
      />

      {/* Ek Listesi */}
      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Yükleniyor...
        </div>
      ) : attachments.length === 0 ? (
        <p className="text-sm text-gray-400 py-2">
          Henüz dosya eki yok
        </p>
      ) : (
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <AttachmentItem
              key={attachment.id}
              attachment={attachment}
              currentUserId={session.user.id}
              boardOwnerId={boardOwnerId}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
