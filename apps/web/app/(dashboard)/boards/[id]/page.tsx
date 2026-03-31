/**
 * Board Detail Page
 *
 * Board detay sayfası — Kanban ve Eisenhower Matris görünümleri.
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useBoardStore } from '@/store/board.store';
import { List } from '@/components/list/list';
import { CreateListForm } from '@/components/list/create-list-form';
import { CardDetailModal } from '@/components/card/card-detail-modal';
import { EisenhowerMatrix } from '@/components/matrix/eisenhower-matrix';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeft, LayoutGrid, Table2, Tag, X, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { EisenhowerQuadrant, LABEL_COLORS } from '@/types';

type ViewMode = 'kanban' | 'matrix';

export default function BoardPage() {
  const params = useParams();
  const router = useRouter();
  const boardId = params.id as string;

  const { board, setBoard, setLoading, deleteList, moveCard, updateCard, reset, activeLabelFilter, setLabelFilter } = useBoardStore();
  const [showAddList, setShowAddList] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [hideCompleted, setHideCompleted] = useState(false);

  // DnD sensors - mouse movement için
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px hareket etmeden drag başlamaz
      },
    })
  );

  useEffect(() => {
    loadBoard();

    return () => {
      reset();
    };
  }, [boardId]);

  const loadBoard = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/boards/${boardId}`);

      if (!response.ok) {
        if (response.status === 404) {
          alert('Board bulunamadı');
          router.push('/boards');
          return;
        }
        throw new Error('Board yüklenemedi');
      }

      const data = await response.json();
      setBoard(data);
    } catch (error) {
      console.error('Board yükleme hatası:', error);
      alert('Board yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  // Drag start
  const handleDragStart = (_event: DragStartEvent) => {
    // DragOverlay eklendiğinde burası kullanılacak
  };

  // Drag end - kartı yeni pozisyonuna taşı (Kanban)
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeCard = board?.lists
      ?.flatMap((list) => list.cards)
      .find((card) => card.id === activeId);

    if (!activeCard) return;

    const overCard = board?.lists
      ?.flatMap((list) => list.cards)
      .find((card) => card.id === overId);

    const overList = board?.lists?.find((list) => list.id === overId);

    let newListId: string;
    let newPosition: number;

    if (overCard) {
      const targetList = board?.lists?.find((list) =>
        list.cards.some((c) => c.id === overId)
      );
      if (!targetList) return;

      newListId = targetList.id;
      newPosition = overCard.position;
    } else if (overList) {
      newListId = overList.id;
      newPosition = overList.cards.length;
    } else {
      return;
    }

    // Optimistic update
    moveCard(activeId, newListId, newPosition);

    try {
      const response = await fetch(`/api/cards/${activeId}/move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listId: newListId,
          position: newPosition,
        }),
      });

      if (!response.ok) {
        throw new Error('Kart taşınamadı');
      }

      await loadBoard();
    } catch (error) {
      console.error('Kart taşıma hatası:', error);
      await loadBoard();
    }
  };

  // Matris: kadran değiştirme
  const handleQuadrantChange = async (
    cardId: string,
    quadrant: EisenhowerQuadrant | null
  ) => {
    // Optimistic update
    updateCard(cardId, { eisenhowerQuadrant: quadrant });

    try {
      const response = await fetch(`/api/cards/${cardId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eisenhowerQuadrant: quadrant }),
      });

      if (!response.ok) {
        throw new Error('Kadran güncellenemedi');
      }
    } catch (error) {
      console.error('Kadran güncelleme hatası:', error);
      // Hata durumunda board'u yeniden yükle
      await loadBoard();
    }
  };

  // Tüm board kartlarını düzleştir (matris için)
  const allCards = board?.lists?.flatMap((list) => list.cards) ?? [];

  // Label filtresi + tamamlananları gizle
  const filteredLists = board?.lists?.map((list) => ({
    ...list,
    cards: list.cards.filter((card) => {
      if (hideCompleted && card.isCompleted) return false;
      if (activeLabelFilter && !card.labels.some((l) => l.id === activeLabelFilter)) return false;
      return true;
    }),
  })) ?? [];

  const filteredCards = allCards.filter((card) => {
    if (hideCompleted && card.isCompleted) return false;
    if (activeLabelFilter && !card.labels.some((l) => l.id === activeLabelFilter)) return false;
    return true;
  });

  if (!board) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: board.background || '#0079bf' }}
    >
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/boards">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-white">{board.title}</h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-white/80 text-sm">
              {board.members?.length || 0} üye
            </span>

            {/* Tamamlananları gizle toggle */}
            <button
              onClick={() => setHideCompleted((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors border ${
                hideCompleted
                  ? 'bg-green-500 text-white border-green-400'
                  : 'bg-white/20 text-white border-white/30 hover:bg-white/30'
              }`}
              title={hideCompleted ? 'Tamamlananları göster' : 'Tamamlananları gizle'}
            >
              <CheckCircle2 className="h-4 w-4" />
              {hideCompleted ? 'Tamamlananlar gizli' : 'Tamamlananlar'}
            </button>

            {/* Görünüm seçici */}
            <div className="flex items-center gap-1 bg-white/20 rounded-lg p-1">
              <button
                onClick={() => setViewMode('kanban')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'kanban'
                    ? 'bg-white text-gray-800'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
                Kanban
              </button>
              <button
                onClick={() => setViewMode('matrix')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'matrix'
                    ? 'bg-white text-gray-800'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                <Table2 className="h-4 w-4" />
                Matris
              </button>
            </div>
          </div>
        </div>
        {board.description && (
          <p className="text-white/80 mt-2 ml-14">{board.description}</p>
        )}

        {/* Label filtre bar — board'da etiket varsa göster */}
        {(board.labels?.length ?? 0) > 0 && (
          <div className="flex items-center gap-2 mt-3 ml-14 flex-wrap">
            <Tag className="h-3.5 w-3.5 text-white/60" />
            {board.labels!.map((label) => {
              const colorDef = LABEL_COLORS.find((c) => c.value === label.color);
              const isActive = activeLabelFilter === label.id;
              return (
                <button
                  key={label.id}
                  onClick={() => setLabelFilter(isActive ? null : label.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${
                    isActive
                      ? 'bg-white text-gray-800 border-white shadow-sm'
                      : 'bg-white/20 text-white border-white/30 hover:bg-white/30'
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${colorDef?.class ?? 'bg-gray-400'}`} />
                  {label.name}
                  {isActive && <X className="h-3 w-3" />}
                </button>
              );
            })}
            {activeLabelFilter && (
              <button
                onClick={() => setLabelFilter(null)}
                className="text-xs text-white/60 hover:text-white underline"
              >
                Filtreyi Temizle
              </button>
            )}
          </div>
        )}
      </div>

      {/* ================================================================
          KANBAN GÖRÜNÜMİ
      ================================================================ */}
      {viewMode === 'kanban' && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="p-4 overflow-x-auto">
            <div className="flex gap-4 pb-4">
              {filteredLists.map((list) => (
                <List
                  key={list.id}
                  list={list}
                  onDelete={(listId) => {
                    deleteList(listId);
                  }}
                />
              ))}

              {/* Add List */}
              {showAddList ? (
                <CreateListForm
                  boardId={boardId}
                  position={board.lists?.length || 0}
                  onClose={() => setShowAddList(false)}
                  onCreated={loadBoard}
                />
              ) : (
                <Button
                  variant="ghost"
                  className="w-80 flex-shrink-0 bg-white/20 hover:bg-white/30 text-white"
                  onClick={() => setShowAddList(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Liste Ekle
                </Button>
              )}
            </div>
          </div>
        </DndContext>
      )}

      {/* ================================================================
          EISENHOWER MATRİS GÖRÜNÜMİ
      ================================================================ */}
      {viewMode === 'matrix' && (
        <div className="p-6">
          <div className="max-w-5xl mx-auto">
            {/* Matris başlık açıklaması */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-5 text-white">
              <h2 className="font-semibold text-lg mb-1">Eisenhower Matrisi</h2>
              <p className="text-sm text-white/80">
                Kartları önem ve aciliyet durumuna göre 4 kadrana sürükleyin.
                Kartları tıklayarak detaylarına ulaşabilirsiniz.
              </p>
            </div>

            <EisenhowerMatrix
              cards={filteredCards}
              onQuadrantChange={handleQuadrantChange}
            />
          </div>
        </div>
      )}

      {/* Card Detail Modal — her iki görünümde de çalışır */}
      <CardDetailModal boardId={boardId} onUpdate={loadBoard} />
    </div>
  );
}
