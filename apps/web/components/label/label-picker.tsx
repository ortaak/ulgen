"use client";

import { useState, useRef, useEffect } from "react";
import { Tag, Plus, Check, Pencil, Trash2, Loader2 } from "lucide-react";
import { Label as LabelType, LABEL_COLORS } from "@/types";
import { useBoardStore } from "@/store/board.store";
import { Button } from "@/components/ui/button";

interface LabelPickerProps {
  cardId: string;
  boardId: string;
  cardLabels: LabelType[];
  onLabelsChange: (labels: LabelType[]) => void;
}

export function LabelPicker({ cardId, boardId, cardLabels, onLabelsChange }: LabelPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState<string>(LABEL_COLORS[0].value);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const board = useBoardStore((state) => state.board);
  const addBoardLabel = useBoardStore((state) => state.addBoardLabel);
  const updateBoardLabel = useBoardStore((state) => state.updateBoardLabel);
  const deleteBoardLabel = useBoardStore((state) => state.deleteBoardLabel);

  const boardLabels = board?.labels ?? [];

  // Dropdown dışına tıklanınca kapat
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setIsCreating(false);
        setEditingLabelId(null);
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const isSelected = (labelId: string) => cardLabels.some((l) => l.id === labelId);

  const handleToggle = async (label: LabelType) => {
    if (isSelected(label.id)) {
      try {
        const res = await fetch(`/api/cards/${cardId}/labels/${label.id}`, { method: "DELETE" });
        if (!res.ok) throw new Error();
        onLabelsChange(cardLabels.filter((l) => l.id !== label.id));
      } catch {
        alert("Etiket karttan çıkarılamadı");
      }
    } else {
      try {
        const res = await fetch(`/api/cards/${cardId}/labels`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ labelId: label.id }),
        });
        if (!res.ok) throw new Error();
        onLabelsChange([...cardLabels, label]);
      } catch {
        alert("Etiket karta eklenemedi");
      }
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/boards/${boardId}/labels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), color: newColor }),
      });
      if (!res.ok) throw new Error();
      const label: LabelType = await res.json();
      addBoardLabel(label);
      setNewName("");
      setNewColor(LABEL_COLORS[0].value);
      setIsCreating(false);
    } catch {
      alert("Etiket oluşturulamadı");
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartEdit = (label: LabelType) => {
    setEditingLabelId(label.id);
    setEditName(label.name);
    setEditColor(label.color);
    setIsCreating(false);
  };

  const handleSaveEdit = async (labelId: string) => {
    if (!editName.trim()) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/labels/${labelId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim(), color: editColor }),
      });
      if (!res.ok) throw new Error();
      const updated: LabelType = await res.json();
      updateBoardLabel(labelId, updated);
      if (isSelected(labelId)) {
        onLabelsChange(cardLabels.map((l) => (l.id === labelId ? updated : l)));
      }
      setEditingLabelId(null);
    } catch {
      alert("Etiket güncellenemedi");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (labelId: string) => {
    if (!confirm("Bu etiketi silmek istediğinizden emin misiniz?")) return;
    try {
      const res = await fetch(`/api/labels/${labelId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      deleteBoardLabel(labelId);
      onLabelsChange(cardLabels.filter((l) => l.id !== labelId));
      if (editingLabelId === labelId) setEditingLabelId(null);
    } catch {
      alert("Etiket silinemedi");
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
        onClick={() => setIsOpen((v) => !v)}
      >
        <Tag className="h-4 w-4" />
        Etiketler
        {cardLabels.length > 0 && (
          <span className="bg-primary text-primary-foreground text-xs rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center leading-none">
            {cardLabels.length}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white border rounded-lg shadow-lg z-50 p-2">
          <p className="text-xs font-semibold text-gray-500 uppercase px-2 mb-2">Etiketler</p>

          {boardLabels.length === 0 && !isCreating && (
            <p className="text-xs text-gray-400 text-center py-2">Henüz etiket yok</p>
          )}

          {boardLabels.map((label) => {
            const colorDef = LABEL_COLORS.find((c) => c.value === label.color);
            const isEditing = editingLabelId === label.id;

            if (isEditing) {
              return (
                <div key={label.id} className="p-2 rounded-md bg-gray-50 mb-1">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full text-sm border rounded px-2 py-1 mb-2 focus:outline-none focus:ring-1 focus:ring-blue-400"
                    placeholder="Etiket adı"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveEdit(label.id);
                      if (e.key === "Escape") setEditingLabelId(null);
                    }}
                  />
                  <div className="flex flex-wrap gap-1 mb-2">
                    {LABEL_COLORS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        className={`h-5 w-5 rounded-full ${c.class} ring-offset-1 transition-all ${
                          editColor === c.value ? "ring-2 ring-gray-800 scale-110" : ""
                        }`}
                        onClick={() => setEditColor(c.value)}
                        title={c.label}
                      />
                    ))}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      className="h-7 text-xs flex-1"
                      onClick={() => handleSaveEdit(label.id)}
                      disabled={isSaving || !editName.trim()}
                    >
                      {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : "Kaydet"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs"
                      onClick={() => setEditingLabelId(null)}
                    >
                      İptal
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 text-red-500 hover:bg-red-50"
                      onClick={() => handleDelete(label.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={label.id}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-50 cursor-pointer group"
                onClick={() => handleToggle(label)}
              >
                <div
                  className={`h-5 w-5 rounded flex items-center justify-center flex-shrink-0 ${colorDef?.class ?? "bg-gray-400"}`}
                >
                  {isSelected(label.id) && <Check className="h-3 w-3 text-white" />}
                </div>
                <span className="flex-1 text-sm truncate">{label.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartEdit(label);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-gray-200 transition-opacity"
                >
                  <Pencil className="h-3 w-3 text-gray-500" />
                </button>
              </div>
            );
          })}

          {/* Yeni etiket oluştur formu */}
          {isCreating ? (
            <div className="mt-2 p-2 rounded-md bg-gray-50">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full text-sm border rounded px-2 py-1 mb-2 focus:outline-none focus:ring-1 focus:ring-blue-400"
                placeholder="Etiket adı"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreate();
                  if (e.key === "Escape") setIsCreating(false);
                }}
              />
              <div className="flex flex-wrap gap-1 mb-2">
                {LABEL_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    className={`h-5 w-5 rounded-full ${c.class} ring-offset-1 transition-all ${
                      newColor === c.value ? "ring-2 ring-gray-800 scale-110" : ""
                    }`}
                    onClick={() => setNewColor(c.value)}
                    title={c.label}
                  />
                ))}
              </div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  className="h-7 text-xs flex-1"
                  onClick={handleCreate}
                  disabled={isSaving || !newName.trim()}
                >
                  {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : "Oluştur"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs"
                  onClick={() => setIsCreating(false)}
                >
                  İptal
                </Button>
              </div>
            </div>
          ) : (
            <button
              className="mt-1 w-full flex items-center gap-2 px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-50 rounded-md"
              onClick={() => {
                setIsCreating(true);
                setEditingLabelId(null);
              }}
            >
              <Plus className="h-4 w-4" />
              Yeni Etiket Oluştur
            </button>
          )}
        </div>
      )}
    </div>
  );
}
