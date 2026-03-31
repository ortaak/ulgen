'use client';

/**
 * AttachmentItem — Tek Bir Dosya Ekini Gösterir
 *
 * Resim dosyaları için thumbnail (küçük önizleme) gösterir.
 * Diğer dosya türleri için (PDF, Word, Excel) uygun bir ikon gösterir.
 *
 * Silme işlemi: Yalnızca dosyayı yükleyen kullanıcı veya board sahibi görebilir.
 */

import { useState } from 'react';
import { Attachment } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  FileText,
  FileSpreadsheet,
  File,
  Trash2,
  Download,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AttachmentItemProps {
  attachment: Attachment;
  currentUserId: string;
  boardOwnerId: string;
  onDelete: (attachmentId: string) => Promise<void>;
}

/**
 * Dosya boyutunu okunabilir formata çevirir
 * Örnek: 1048576 → "1.0 MB"
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * MIME tipine göre uygun ikonu döndürür
 */
function FileIcon({ mimeType }: { mimeType: string }) {
  if (mimeType.startsWith('image/')) return null; // Resimler için thumbnail kullanılır
  if (mimeType === 'application/pdf') {
    return <FileText className="h-8 w-8 text-red-500" />;
  }
  if (
    mimeType === 'application/msword' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return <FileText className="h-8 w-8 text-blue-500" />;
  }
  if (
    mimeType === 'application/vnd.ms-excel' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ) {
    return <FileSpreadsheet className="h-8 w-8 text-green-500" />;
  }
  return <File className="h-8 w-8 text-gray-500" />;
}

export function AttachmentItem({
  attachment,
  currentUserId,
  boardOwnerId,
  onDelete,
}: AttachmentItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const isImage = attachment.mimeType.startsWith('image/');
  const canDelete =
    attachment.userId === currentUserId || boardOwnerId === currentUserId;

  const timeAgo = formatDistanceToNow(new Date(attachment.createdAt), {
    addSuffix: true,
    locale: tr,
  });

  const handleDelete = async () => {
    if (!confirm(`"${attachment.name}" dosyasını silmek istediğinizden emin misiniz?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await onDelete(attachment.id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex gap-3 p-3 rounded-lg border bg-gray-50 hover:bg-gray-100 transition-colors group">
      {/* Önizleme: Resim veya Dosya İkonu */}
      <div className="flex-shrink-0 w-16 h-16 rounded overflow-hidden bg-white border flex items-center justify-center">
        {isImage ? (
          <img
            src={attachment.url}
            alt={attachment.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <FileIcon mimeType={attachment.mimeType} />
        )}
      </div>

      {/* Dosya Bilgileri */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate" title={attachment.name}>
          {attachment.name}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
          {formatFileSize(attachment.size)} · {timeAgo}
        </p>
        <p className="text-xs text-gray-400">
          {attachment.user.name || attachment.user.email}
        </p>

        {/* Aksiyonlar */}
        <div className="flex gap-2 mt-2">
          <a
            href={attachment.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
          >
            <ExternalLink className="h-3 w-3" />
            Aç
          </a>
          <a
            href={attachment.url}
            download={attachment.name}
            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
          >
            <Download className="h-3 w-3" />
            İndir
          </a>
        </div>
      </div>

      {/* Sil Butonu — sadece yetkili kullanıcılara gösterilir */}
      {canDelete && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50"
          title="Dosyayı sil"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
