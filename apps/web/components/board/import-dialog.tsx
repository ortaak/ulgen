/**
 * Import Data Dialog
 * 
 * Trello ve diğer platformlardan veri aktarma arayüzü.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, FileJson, AlertCircle, CheckCircle } from 'lucide-react';

interface ImportDialogProps {
  onImportComplete?: (boardId: string) => void;
}

export function ImportDialog({ onImportComplete }: ImportDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [platform, setPlatform] = useState<'trello'>('trello');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.json')) {
      setError('Sadece JSON dosyaları destekleniyor');
      return;
    }

    setFile(selectedFile);
    setError(null);

    // Dosyayı oku ve preview oluştur
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        setPreview({
          boardName: data.name || 'Bilinmeyen',
          listsCount: data.lists?.length || 0,
          cardsCount: data.cards?.length || 0,
        });
      } catch (err) {
        setError('JSON dosyası okunamadı. Geçersiz format.');
        setFile(null);
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleImport = async () => {
    if (!file) {
      setError('Lütfen bir dosya seçin');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Dosyayı oku
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);

          // API'ye gönder
          const response = await fetch('/api/import', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              data,
              platform,
            }),
          });

          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.error || 'Import başarısız');
          }

          setSuccess(true);
          
          // 2 saniye sonra board sayfasına yönlendir
          setTimeout(() => {
            setOpen(false);
            if (result.board?.id) {
              if (onImportComplete) {
                onImportComplete(result.board.id);
              } else {
                router.push(`/boards/${result.board.id}`);
              }
            } else {
              router.push('/boards');
            }
          }, 2000);

        } catch (err) {
          setError(err instanceof Error ? err.message : 'Import başarısız');
        } finally {
          setLoading(false);
        }
      };

      reader.onerror = () => {
        setError('Dosya okunamadı');
        setLoading(false);
      };

      reader.readAsText(file);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Beklenmeyen bir hata oluştu');
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setOpen(false);
      setFile(null);
      setPreview(null);
      setError(null);
      setSuccess(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline"
          type="button"
        >
          <Upload className="h-4 w-4 mr-2" />
          Veri Aktar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Veri Aktarma</DialogTitle>
          <DialogDescription>
            Trello veya diğer platformlardan board verilerinizi aktarın.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          // Başarı mesajı
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
            <div className="text-center">
              <p className="text-lg font-semibold">Import Başarılı!</p>
              <p className="text-sm text-gray-500 mt-1">
                Board sayfasına yönlendiriliyorsunuz...
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Platform Seçimi */}
            <div>
              <Label htmlFor="platform">Platform</Label>
              <select
                id="platform"
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={platform}
                onChange={(e) => setPlatform(e.target.value as 'trello')}
                disabled={loading}
              >
                <option value="trello">Trello</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Şu anda sadece Trello JSON export formatı desteklenmektedir.
              </p>
            </div>

            {/* Dosya Seçimi */}
            <div>
              <Label htmlFor="file">JSON Dosyası</Label>
              <div className="mt-1">
                <label
                  htmlFor="file-upload"
                  className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <FileJson className="h-10 w-10 text-gray-400" />
                    <div className="text-center">
                      {file ? (
                        <>
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024).toFixed(2)} KB
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-medium">
                            Dosya seçmek için tıklayın
                          </p>
                          <p className="text-xs text-gray-500">veya sürükleyip bırakın</p>
                        </>
                      )}
                    </div>
                  </div>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleFileSelect}
                    disabled={loading}
                  />
                </label>
              </div>
            </div>

            {/* Preview */}
            {preview && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 mb-2">
                  Önizleme
                </p>
                <div className="space-y-1 text-sm text-blue-800">
                  <p>📋 Board: {preview.boardName}</p>
                  <p>📝 Liste Sayısı: {preview.listsCount}</p>
                  <p>🎯 Kart Sayısı: {preview.cardsCount}</p>
                </div>
              </div>
            )}

            {/* Hata mesajı */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900">Hata</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Nasıl Kullanılır */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm font-medium mb-2">📖 Nasıl Kullanılır?</p>
              <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
                <li>Trello&apos;da board&apos;unuzu açın</li>
                <li>Menü → Export → Export as JSON</li>
                <li>İndirilen JSON dosyasını buraya yükleyin</li>
                <li>&quot;Import Et&quot; butonuna tıklayın</li>
              </ol>
            </div>

            {/* Butonlar */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={loading}
              >
                İptal
              </Button>
              <Button
                onClick={handleImport}
                disabled={!file || loading}
              >
                {loading ? 'İçe Aktarılıyor...' : 'Import Et'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
