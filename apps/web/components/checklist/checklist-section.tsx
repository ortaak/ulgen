'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { ChecklistBlock, ChecklistData } from './checklist-block';

interface ChecklistSectionProps {
  cardId: string;
}

export function ChecklistSection({ cardId }: ChecklistSectionProps) {
  const [checklists, setChecklists] = useState<ChecklistData[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadChecklists();
  }, [cardId]);

  const loadChecklists = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/cards/${cardId}/checklists`);
      if (!res.ok) throw new Error('Kontrol listeleri yüklenemedi');
      const data: ChecklistData[] = await res.json();
      setChecklists(data);
    } catch (error) {
      console.error('Checklist yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    const trimmed = newName.trim();
    if (!trimmed) return;

    setCreating(true);
    try {
      const res = await fetch(`/api/cards/${cardId}/checklists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
      });
      if (!res.ok) throw new Error('Kontrol listesi oluşturulamadı');

      const created: ChecklistData = await res.json();
      setChecklists((prev) => [...prev, created]);
      setNewName('');
      setShowForm(false);
    } catch (error) {
      console.error('Checklist oluşturma hatası:', error);
      alert('Kontrol listesi oluşturulamadı');
    } finally {
      setCreating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleCreate();
    if (e.key === 'Escape') { setShowForm(false); setNewName(''); }
  };

  const handleChecklistChange = (updated: ChecklistData) => {
    setChecklists((prev) => prev.map((c) => c.id === updated.id ? updated : c));
  };

  const handleChecklistDelete = async (checklistId: string) => {
    const res = await fetch(`/api/checklists/${checklistId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Kontrol listesi silinemedi');
    setChecklists((prev) => prev.filter((c) => c.id !== checklistId));
  };

  if (loading) {
    return (
      <div className="text-sm text-gray-400 py-2">Kontrol listeleri yükleniyor...</div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Kontrol Listeleri</h3>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          <Plus className="h-3.5 w-3.5" />
          Checklist Ekle
        </button>
      </div>

      {/* Yeni checklist formu */}
      {showForm && (
        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Kontrol listesi adı..."
            autoFocus
            disabled={creating}
            className="flex-1 text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
          />
          <button
            onClick={handleCreate}
            disabled={creating || !newName.trim()}
            className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            Ekle
          </button>
          <button
            onClick={() => { setShowForm(false); setNewName(''); }}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            İptal
          </button>
        </div>
      )}

      {/* Checklist blokları */}
      {checklists.length === 0 && !showForm && (
        <p className="text-xs text-gray-400">Henüz kontrol listesi yok.</p>
      )}

      {checklists.map((cl) => (
        <div key={cl.id} className="border border-gray-100 rounded-lg p-3 bg-gray-50/50">
          <ChecklistBlock
            checklist={cl}
            onChange={handleChecklistChange}
            onDelete={handleChecklistDelete}
          />
        </div>
      ))}
    </div>
  );
}
