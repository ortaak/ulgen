'use client';

import { useState, useRef } from 'react';
import { Trash2 } from 'lucide-react';

export interface ChecklistItemData {
  id: string;
  name: string;
  checked: boolean;
  position: number;
}

interface ChecklistItemProps {
  item: ChecklistItemData;
  onToggle: (itemId: string, checked: boolean) => Promise<void>;
  onDelete: (itemId: string) => Promise<void>;
  onRename: (itemId: string, name: string) => Promise<void>;
}

export function ChecklistItem({ item, onToggle, onDelete, onRename }: ChecklistItemProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(item.name);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleToggle = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await onToggle(item.id, !item.checked);
    } finally {
      setLoading(false);
    }
  };

  const handleRenameCommit = async () => {
    const trimmed = editValue.trim();
    if (!trimmed || trimmed === item.name) {
      setEditValue(item.name);
      setEditing(false);
      return;
    }
    setLoading(true);
    try {
      await onRename(item.id, trimmed);
    } finally {
      setLoading(false);
      setEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleRenameCommit();
    if (e.key === 'Escape') {
      setEditValue(item.name);
      setEditing(false);
    }
  };

  const handleDelete = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await onDelete(item.id);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2 group py-1">
      <input
        type="checkbox"
        checked={item.checked}
        onChange={handleToggle}
        disabled={loading}
        className="h-4 w-4 rounded border-gray-300 text-blue-600 cursor-pointer flex-shrink-0"
      />

      {editing ? (
        <input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleRenameCommit}
          onKeyDown={handleKeyDown}
          autoFocus
          className="flex-1 text-sm border border-blue-400 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      ) : (
        <span
          onClick={() => { setEditing(true); setEditValue(item.name); }}
          className={`flex-1 text-sm cursor-pointer hover:underline decoration-dotted ${
            item.checked ? 'line-through text-gray-400' : 'text-gray-800'
          }`}
        >
          {item.name}
        </span>
      )}

      <button
        onClick={handleDelete}
        disabled={loading}
        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity flex-shrink-0"
        title="Öğeyi sil"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
