'use client';

/**
 * AttachmentUpload — Dosya Yükleme Bileşeni
 *
 * Drag & drop veya tıklayarak dosya seçimi sağlar.
 * UploadThing ile dosyayı CDN'e yükler, ardından
 * /api/cards/[cardId]/attachments endpoint'ine metadata kaydeder.
 *
 * Desteklenen dosya türleri: Resimler, PDF, Word, Excel (maks. 8MB)
 */

import { useCallback, useState } from 'react';
import { useUploadThing } from '@/lib/uploadthing';
import { Attachment } from '@/types';
import { Paperclip, Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AttachmentUploadProps {
  cardId: string;
  onUploadComplete: (attachment: Attachment) => void;
}

export function AttachmentUpload({ cardId, onUploadComplete }: AttachmentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const { startUpload, isUploading } = useUploadThing('cardAttachment', {
    onClientUploadComplete: async (results) => {
      // UploadThing yüklemeyi tamamladı — Prisma'ya metadata kaydet
      for (const result of results) {
        try {
          const response = await fetch(`/api/cards/${cardId}/attachments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: result.name,
              url: result.url,
              key: result.key,
              mimeType: result.type || 'application/octet-stream',
              size: result.size,
            }),
          });

          if (!response.ok) {
            throw new Error('Dosya metadata kaydedilemedi');
          }

          const attachment: Attachment = await response.json();
          onUploadComplete(attachment);
        } catch (err) {
          console.error('Metadata kaydetme hatası:', err);
          setError('Dosya yüklendi ancak kaydedilemedi. Lütfen sayfayı yenileyin.');
        }
      }
      setIsOpen(false);
    },
    onUploadError: (err) => {
      setError(err.message || 'Dosya yüklenirken bir hata oluştu');
    },
  });

  const handleFileChange = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;

      setError(null);
      const fileArray = Array.from(files);
      startUpload(fileArray);
    },
    [startUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      handleFileChange(e.dataTransfer.files);
    },
    [handleFileChange]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2"
      >
        <Paperclip className="h-4 w-4" />
        Dosya Ekle
      </Button>
    );
  }

  return (
    <div className="space-y-2">
      {/* Drag & Drop Alanı */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50'}
          ${isUploading ? 'opacity-50 pointer-events-none' : 'hover:border-gray-400 hover:bg-gray-100 cursor-pointer'}
        `}
        onClick={() => {
          if (!isUploading) {
            document.getElementById(`file-input-${cardId}`)?.click();
          }
        }}
      >
        <input
          id={`file-input-${cardId}`}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
          className="hidden"
          onChange={(e) => handleFileChange(e.target.files)}
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-sm text-gray-600">Yükleniyor...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-gray-400" />
            <p className="text-sm font-medium text-gray-700">
              Dosyaları buraya sürükleyin veya tıklayın
            </p>
            <p className="text-xs text-gray-500">
              Resim, PDF, Word, Excel · Maks. 8MB
            </p>
          </div>
        )}
      </div>

      {/* Hata Mesajı */}
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <X className="h-3 w-3" />
          {error}
        </p>
      )}

      {/* İptal Butonu */}
      {!isUploading && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setIsOpen(false);
            setError(null);
          }}
        >
          İptal
        </Button>
      )}
    </div>
  );
}
