/**
 * Eisenhower Matrix Component
 *
 * Board kartlarını 4 kadranda görselleştirir:
 *   YAP     (DO)       — Önemli + Acil     → kırmızı
 *   PLANLA  (PLAN)     — Önemli + Acil değil → sarı
 *   DEVRET  (DELEGATE) — Önemli değil + Acil → mavi
 *   SİL     (DELETE)   — Önemli değil + Acil değil → gri
 *
 * Sürükle-bırak ile kadran değiştirme desteklenir.
 * Sınıflandırılmamış kartlar alt havuzda görünür.
 */

'use client';

import { useState, useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core';
import { Card as CardType, EisenhowerQuadrant } from '@/types';
import { MatrixCard } from './matrix-card';

// ============================================================================
// KADRAN TANIMLARI
// ============================================================================

interface QuadrantConfig {
  id: EisenhowerQuadrant;
  label: string;
  subtitle: string;
  action: string;
  color: string;         // Tailwind bg sınıfı (header)
  borderColor: string;   // Tailwind border sınıfı
  accentHex: string;     // Sol kenar çizgisi rengi (MatrixCard)
  textColor: string;
}

const QUADRANTS: QuadrantConfig[] = [
  {
    id: 'DO',
    label: 'YAP',
    subtitle: 'Önemli + Acil',
    action: 'Hemen yap',
    color: 'bg-red-50',
    borderColor: 'border-red-300',
    accentHex: '#ef4444',
    textColor: 'text-red-700',
  },
  {
    id: 'PLAN',
    label: 'PLANLA',
    subtitle: 'Önemli + Acil Değil',
    action: 'Takvime al',
    color: 'bg-yellow-50',
    borderColor: 'border-yellow-300',
    accentHex: '#eab308',
    textColor: 'text-yellow-700',
  },
  {
    id: 'DELEGATE',
    label: 'DEVRET',
    subtitle: 'Acil + Önemli Değil',
    action: 'Başkasına ver',
    color: 'bg-blue-50',
    borderColor: 'border-blue-300',
    accentHex: '#3b82f6',
    textColor: 'text-blue-700',
  },
  {
    id: 'DELETE',
    label: 'SİL',
    subtitle: 'Önemli Değil + Acil Değil',
    action: 'Listeden çıkar',
    color: 'bg-gray-50',
    borderColor: 'border-gray-300',
    accentHex: '#9ca3af',
    textColor: 'text-gray-600',
  },
];

// ============================================================================
// DROPPABLE KADRAN
// ============================================================================

interface DroppableQuadrantProps {
  config: QuadrantConfig;
  cards: CardType[];
  isOver: boolean;
}

function DroppableQuadrant({ config, cards, isOver }: DroppableQuadrantProps) {
  const { setNodeRef } = useDroppable({ id: config.id });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-xl border-2 transition-colors flex flex-col min-h-[220px]
        ${config.borderColor}
        ${isOver ? 'ring-2 ring-offset-1 ring-current' : ''}
        ${config.color}
      `}
    >
      {/* Kadran başlığı */}
      <div className={`px-4 py-3 border-b ${config.borderColor}`}>
        <div className="flex items-center justify-between">
          <div>
            <span className={`text-sm font-bold ${config.textColor}`}>
              {config.label}
            </span>
            <span className="ml-2 text-xs text-gray-500">
              ({cards.length} kart)
            </span>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full border ${config.borderColor} ${config.textColor} bg-white/60`}>
            {config.action}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5">{config.subtitle}</p>
      </div>

      {/* Kartlar */}
      <div className="p-3 flex flex-col gap-2 flex-1">
        {cards.length === 0 && (
          <p className="text-xs text-gray-400 italic text-center mt-6">
            Kart sürükleyin
          </p>
        )}
        {cards.map((card) => (
          <MatrixCard key={card.id} card={card} accentColor={config.accentHex} />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// DROPPABLE SINIFLANDIRILMAMIŞ HAVUZ
// ============================================================================

function DroppableUnassigned({ cards, isOver }: { cards: CardType[]; isOver: boolean }) {
  const { setNodeRef } = useDroppable({ id: 'UNASSIGNED' });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-xl border-2 border-dashed border-gray-300 transition-colors
        ${isOver ? 'border-gray-500 bg-gray-50' : 'bg-white'}
      `}
    >
      <div className="px-4 py-3 border-b border-dashed border-gray-300">
        <span className="text-sm font-semibold text-gray-600">
          Sınıflandırılmamış
        </span>
        <span className="ml-2 text-xs text-gray-400">({cards.length} kart)</span>
        <p className="text-xs text-gray-400 mt-0.5">
          Kadrana yerleştirmek için yukarıya sürükleyin
        </p>
      </div>
      <div className="p-3 flex flex-wrap gap-2 min-h-[80px]">
        {cards.length === 0 && (
          <p className="text-xs text-gray-400 italic w-full text-center mt-4">
            Tüm kartlar sınıflandırıldı
          </p>
        )}
        {cards.map((card) => (
          <div key={card.id} className="w-48">
            <MatrixCard card={card} accentColor="#9ca3af" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// ANA BİLEŞEN
// ============================================================================

interface EisenhowerMatrixProps {
  /** Board'a ait tüm kartlar (tüm listelerden düzleştirilmiş) */
  cards: CardType[];
  /** Kadran değişikliğini üst bileşene bildir (API çağrısı için) */
  onQuadrantChange: (cardId: string, quadrant: EisenhowerQuadrant | null) => Promise<void>;
}

export function EisenhowerMatrix({ cards, onQuadrantChange }: EisenhowerMatrixProps) {
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  // Kadrana göre kartları grupla
  const getCardsForQuadrant = useCallback(
    (quadrantId: EisenhowerQuadrant) =>
      cards.filter((c) => c.eisenhowerQuadrant === quadrantId),
    [cards]
  );

  const unassignedCards = cards.filter((c) => !c.eisenhowerQuadrant);
  const activeCard = activeCardId ? cards.find((c) => c.id === activeCardId) : null;
  const activeCardQuadrant = activeCard
    ? (QUADRANTS.find((q) => q.id === activeCard.eisenhowerQuadrant) ?? null)
    : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveCardId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    setOverId(event.over ? (event.over.id as string) : null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveCardId(null);
    setOverId(null);

    const { active, over } = event;
    if (!over) return;

    const cardId = active.id as string;
    const targetId = over.id as string;

    const validQuadrants: Array<EisenhowerQuadrant | 'UNASSIGNED'> = [
      'DO', 'PLAN', 'DELEGATE', 'DELETE', 'UNASSIGNED',
    ];

    if (!validQuadrants.includes(targetId as EisenhowerQuadrant | 'UNASSIGNED')) return;

    const newQuadrant: EisenhowerQuadrant | null =
      targetId === 'UNASSIGNED' ? null : (targetId as EisenhowerQuadrant);

    // Aynı kadrana bırakıldıysa işlem yapma
    const card = cards.find((c) => c.id === cardId);
    if (card && card.eisenhowerQuadrant === newQuadrant) return;

    await onQuadrantChange(cardId, newQuadrant);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      {/* 2x2 Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {QUADRANTS.map((config) => (
          <DroppableQuadrant
            key={config.id}
            config={config}
            cards={getCardsForQuadrant(config.id)}
            isOver={overId === config.id}
          />
        ))}
      </div>

      {/* Sınıflandırılmamış havuz */}
      <DroppableUnassigned
        cards={unassignedCards}
        isOver={overId === 'UNASSIGNED'}
      />

      {/* Drag overlay - sürüklenen kartın gölgesi */}
      <DragOverlay>
        {activeCard && (
          <div className="rotate-2 opacity-90">
            <MatrixCard
              card={activeCard}
              accentColor={activeCardQuadrant?.accentHex ?? '#9ca3af'}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
