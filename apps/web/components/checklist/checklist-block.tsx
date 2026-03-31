'use client';

import { useState } from 'react';
import { CheckSquare, Trash2, Plus } from 'lucide-react';
import { ChecklistItem, ChecklistItemData } from './checklist-item';

export interface ChecklistData {
  id: string;
  name: string;
  position: number;
  items: ChecklistItemData[];
}

interface ChecklistBlockProps {
  checklist: ChecklistData;
  onChange: (updated: ChecklistData) => void;
  onDelete: (checklistId: string) => Promise<void>;
}

export function ChecklistBlock({ checklist, onChange, onDelete }: ChecklistBlockProps) {
  const [newItemName, setNewItemName] = useState('');
  const [addingItem, setAddingItem] = useState(false);
  const [deletingChecklist, setDeletingChecklist] = useState(false);

  const checkedCount = checklist.items.filter((i) => i.checked).length;
  const totalCount = checklist.items.length;
  const progress = totalCount === 0 ? 0 : Math.round((checkedCount / totalCount) * 100);

  const handleToggleItem = async (itemId: string, checked: boolean) => {
    const response = await fetch(`/api/checklist-items/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checked }),
    });
    if (!response.ok) throw new Error('Öğe güncellenemedi');

    onChange({
      ...checklist,
      items: checklist.items.map((i) => i.id === itemId ? { ...i, checked } : i),
    });
  };

  const handleDeleteItem = async (itemId: string) => {
    const response = await fetch(`/api/checklist-items/${itemId}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Öğe silinemedi');

    onChange({
      ...checklist,
      items: checklist.items.filter((i) => i.id !== itemId),
    });
  };

  const handleRenameItem = async (itemId: string, name: string) => {
    const response = await fetch(`/api/checklist-items/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!response.ok) throw new Error('Öğe güncellenemedi');

    onChange({
      ...checklist,
      items: checklist.items.map((i) => i.id === itemId ? { ...i, name } : i),
    });
  };

  const handleAddItem = async () => {
    const trimmed = newItemName.trim();
    if (!trimmed) return;

    setAddingItem(true);
    try {
      const response = await fetch(`/api/checklists/${checklist.id}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
      });
      if (!response.ok) throw new Error('Öğe eklenemedi');

      const newItem: ChecklistItemData = await response.json();
      onChange({ ...checklist, items: [...checklist.items, newItem] });
      setNewItemName('');
    } finally {
      setAddingItem(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAddItem();
    if (e.key === 'Escape') setNewItemName('');
  };

  const handleDeleteChecklist = async () => {
    if (!confirm(`"${checklist.name}" kontrol listesini silmek istediğinizden emin misiniz?`)) return;
    setDeletingChecklist(true);
    try {
      await onDelete(checklist.id);
    } finally {
      setDeletingChecklist(false);
    }
  };

  return (
    <div className="space-y-2">
      {/* Başlık + Sil butonu */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckSquare className="h-4 w-4 text-gray-600 flex-shrink-0" />
          <span className="font-medium text-sm text-gray-800">{checklist.name}</span>
        </div>
        <button
          onClick={handleDeleteChecklist}
          disabled={deletingChecklist}
          className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Sil
        </button>
      </div>

      {/* İlerleme çubuğu */}
      {totalCount > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 w-8 text-right">{progress}%</span>
          <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                progress === 100 ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-gray-500">
            {checkedCount}/{totalCount}
          </span>
        </div>
      )}

      {/* Öğeler */}
      <div className="space-y-0.5 ml-1">
        {checklist.items.map((item) => (
          <ChecklistItem
            key={item.id}
            item={item}
            onToggle={handleToggleItem}
            onDelete={handleDeleteItem}
            onRename={handleRenameItem}
          />
        ))}
      </div>

      {/* Yeni öğe ekleme */}
      <div className="flex items-center gap-2 ml-6">
        <input
          type="text"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Öğe ekle..."
          disabled={addingItem}
          className="flex-1 text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-gray-400"
        />
        <button
          onClick={handleAddItem}
          disabled={addingItem || !newItemName.trim()}
          className="text-gray-500 hover:text-blue-600 disabled:opacity-40 transition-colors"
          title="Öğe ekle"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
