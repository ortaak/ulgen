/**
 * DependencyPicker
 *
 * Kart detay modalında bağımlılık ekleme/silme arayüzü.
 *
 * Gösterir:
 *  - "Bu kartı bekletiyor" listesi (blockedBy) — bu kart başlamadan önce bunlar bitmeli
 *  - "Bu kartın beklediği" listesi (blockingFor) — bu kart başkaları tamamlanmadan başlayamaz
 *  - Arama ile kart ekleme
 */

'use client';

import { useState, useEffect } from 'react';
import { Link2, X, Lock, LockOpen, Plus, Search, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CardDependency } from '@/types';
import { useBoardStore } from '@/store/board.store';

interface DependencyPickerProps {
  cardId: string;
}

interface DepsState {
  blockedBy: CardDependency[];
  blockingFor: CardDependency[];
}

export function DependencyPicker({ cardId }: DependencyPickerProps) {
  const board = useBoardStore((state) => state.board);

  const [deps, setDeps] = useState<DepsState>({ blockedBy: [], blockingFor: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Board'daki tüm kartlar (kendi kartımız hariç)
  const allCards = board?.lists?.flatMap((list) =>
    list.cards.map((card) => ({ ...card, listTitle: list.title }))
  ) ?? [];

  const otherCards = allCards.filter((c) => c.id !== cardId);

  // Zaten eklenmiş kart ID'leri
  const existingDepIds = new Set([
    ...deps.blockedBy.map((d) => d.blockingCardId),
    ...deps.blockingFor.map((d) => d.blockedCardId),
  ]);

  const filteredCards = otherCards.filter(
    (c) =>
      !existingDepIds.has(c.id) &&
      c.title.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    fetchDeps();
  }, [cardId]);

  const fetchDeps = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/cards/${cardId}/dependencies`);
      if (!res.ok) throw new Error('Bağımlılıklar yüklenemedi');
      const data = await res.json();
      setDeps(data);
    } catch {
      setError('Bağımlılıklar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (blockingCardId: string) => {
    setAddingId(blockingCardId);
    setError(null);
    try {
      const res = await fetch(`/api/cards/${cardId}/dependencies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockingCardId }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Bağımlılık eklenemedi');
        return;
      }

      const dep: CardDependency = await res.json();
      setDeps((prev) => ({ ...prev, blockedBy: [...prev.blockedBy, dep] }));
      setSearch('');
      setIsAdding(false);
    } catch {
      setError('Bağımlılık eklenemedi');
    } finally {
      setAddingId(null);
    }
  };

  const handleRemove = async (depId: string) => {
    setRemovingId(depId);
    setError(null);
    try {
      const res = await fetch(`/api/cards/${cardId}/dependencies/${depId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        setError('Bağımlılık silinemedi');
        return;
      }

      setDeps((prev) => ({
        blockedBy: prev.blockedBy.filter((d) => d.id !== depId),
        blockingFor: prev.blockingFor.filter((d) => d.id !== depId),
      }));
    } catch {
      setError('Bağımlılık silinemedi');
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="text-sm text-gray-400 py-2">Bağımlılıklar yükleniyor...</div>
    );
  }

  const hasDeps = deps.blockedBy.length > 0 || deps.blockingFor.length > 0;

  return (
    <div className="space-y-3">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Link2 className="h-4 w-4" />
          Bağımlılıklar
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-blue-600 hover:text-blue-700"
          onClick={() => {
            setIsAdding((v) => !v);
            setSearch('');
            setError(null);
          }}
        >
          <Plus className="h-3 w-3 mr-1" />
          Ekle
        </Button>
      </div>

      {/* Hata mesajı */}
      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-2 py-1.5">
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Kart arama — "bunu ekle" paneli */}
      {isAdding && (
        <div className="border rounded-lg p-3 bg-gray-50 space-y-2">
          <p className="text-xs text-gray-500">
            Bu kartın başlamadan önce bitmesini beklediği kartı seçin:
          </p>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Kart ara..."
              className="pl-7 h-8 text-sm"
            />
          </div>
          <div className="max-h-40 overflow-y-auto space-y-1">
            {filteredCards.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-2">
                {search ? 'Kart bulunamadı' : 'Eklenecek uygun kart yok'}
              </p>
            ) : (
              filteredCards.map((card) => (
                <button
                  key={card.id}
                  onClick={() => handleAdd(card.id)}
                  disabled={addingId === card.id}
                  className="w-full text-left text-xs px-2 py-1.5 rounded hover:bg-white border border-transparent hover:border-gray-200 transition-colors flex items-center justify-between gap-2 disabled:opacity-50"
                >
                  <span className="flex-1 truncate">
                    <span className="text-gray-400 mr-1">{card.listTitle} /</span>
                    {card.title}
                  </span>
                  {card.isCompleted && (
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Mevcut bağımlılıklar */}
      {!hasDeps && !isAdding && (
        <p className="text-xs text-gray-400">Bağımlılık yok</p>
      )}

      {/* Bu kartın beklediği kartlar (blokedBy) */}
      {deps.blockedBy.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-red-600 flex items-center gap-1">
            <Lock className="h-3 w-3" />
            Bitmesini beklediği kartlar
          </p>
          {deps.blockedBy.map((dep) => (
            <div
              key={dep.id}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-md border text-xs ${
                dep.blockingCard.isCompleted
                  ? 'border-green-200 bg-green-50'
                  : 'border-red-200 bg-red-50'
              }`}
            >
              {dep.blockingCard.isCompleted ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
              ) : (
                <Lock className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
              )}
              <span
                className={`flex-1 truncate ${
                  dep.blockingCard.isCompleted ? 'line-through text-gray-400' : 'text-gray-700'
                }`}
              >
                {dep.blockingCard.title}
              </span>
              <button
                onClick={() => handleRemove(dep.id)}
                disabled={removingId === dep.id}
                className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 disabled:opacity-50"
                title="Bağımlılığı kaldır"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Bu kartın bloke ettiği kartlar (blockingFor) */}
      {deps.blockingFor.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-amber-600 flex items-center gap-1">
            <LockOpen className="h-3 w-3" />
            Bu kartı bekleyen kartlar
          </p>
          {deps.blockingFor.map((dep) => (
            <div
              key={dep.id}
              className="flex items-center gap-2 px-2 py-1.5 rounded-md border border-amber-200 bg-amber-50 text-xs"
            >
              <LockOpen className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
              <span className="flex-1 truncate text-gray-700">
                {dep.blockedCard.title}
              </span>
              <button
                onClick={() => handleRemove(dep.id)}
                disabled={removingId === dep.id}
                className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 disabled:opacity-50"
                title="Bağımlılığı kaldır"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
