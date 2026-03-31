/**
 * Create Board Dialog
 * 
 * Yeni board oluşturma formu.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { BOARD_BACKGROUNDS } from '@/types';
import { Plus } from 'lucide-react';

export function CreateBoardDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    background: BOARD_BACKGROUNDS[0].value as string,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Board oluşturulamadı');
      }

      const board = await response.json();
      setOpen(false);
      setFormData({ title: '', description: '', background: BOARD_BACKGROUNDS[0].value });
      router.push(`/boards/${board.id}`);
      router.refresh();
    } catch (error) {
      console.error('Board oluşturma hatası:', error);
      alert('Board oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Board
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Yeni Board Oluştur</DialogTitle>
            <DialogDescription>
              Yeni bir proje board&apos;ı oluşturun ve ekibinizle paylaşın.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Başlık</Label>
              <Input
                id="title"
                placeholder="Board başlığı..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Açıklama (Opsiyonel)</Label>
              <Input
                id="description"
                placeholder="Board açıklaması..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Arka Plan Rengi</Label>
              <div className="grid grid-cols-5 gap-2">
                {BOARD_BACKGROUNDS.map((bg) => (
                  <button
                    key={bg.value}
                    type="button"
                    className={`h-12 rounded-md transition-transform hover:scale-105 ${
                      formData.background === bg.value ? 'ring-2 ring-offset-2 ring-primary' : ''
                    }`}
                    style={{ backgroundColor: bg.value }}
                    onClick={() => setFormData({ ...formData, background: bg.value })}
                    title={bg.label}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              İptal
            </Button>
            <Button type="submit" disabled={loading || !formData.title}>
              {loading ? 'Oluşturuluyor...' : 'Oluştur'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
