/**
 * Board Zustand Store
 * 
 * Board, list ve card state management.
 * Client-side state optimistic updates için kullanılır.
 */

import { create } from 'zustand';
import { Board, List, Card, Attachment, Label } from '@/types';

interface BoardState {
  // State
  board: Board | null;
  isLoading: boolean;
  error: string | null;
  activeLabelFilter: string | null;

  // Board actions
  setBoard: (board: Board | null) => void;
  updateBoard: (updates: Partial<Board>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Label filter actions
  setLabelFilter: (labelId: string | null) => void;

  // Board-level label actions
  addBoardLabel: (label: Label) => void;
  updateBoardLabel: (labelId: string, updates: Partial<Label>) => void;
  deleteBoardLabel: (labelId: string) => void;

  // List actions
  addList: (list: List) => void;
  updateList: (listId: string, updates: Partial<List>) => void;
  deleteList: (listId: string) => void;

  // Card actions
  addCard: (card: Card) => void;
  updateCard: (cardId: string, updates: Partial<Card>) => void;
  deleteCard: (cardId: string) => void;
  moveCard: (cardId: string, targetListId: string, newPosition: number) => void;

  // Attachment actions
  addAttachment: (cardId: string, attachment: Attachment) => void;
  removeAttachment: (cardId: string, attachmentId: string) => void;

  // Reset
  reset: () => void;
}

const initialState = {
  board: null,
  isLoading: false,
  error: null,
  activeLabelFilter: null,
};

export const useBoardStore = create<BoardState>((set) => ({
  ...initialState,

  // Board actions
  setBoard: (board) => set({ board, error: null }),
  
  updateBoard: (updates) =>
    set((state) => ({
      board: state.board ? { ...state.board, ...updates } : null,
    })),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  // Label filter
  setLabelFilter: (labelId) => set({ activeLabelFilter: labelId }),

  // Board-level label yönetimi
  addBoardLabel: (label) =>
    set((state) => {
      if (!state.board) return state;
      return {
        board: {
          ...state.board,
          labels: [...(state.board.labels ?? []), label],
        },
      };
    }),

  updateBoardLabel: (labelId, updates) =>
    set((state) => {
      if (!state.board) return state;
      return {
        board: {
          ...state.board,
          labels: (state.board.labels ?? []).map((l) =>
            l.id === labelId ? { ...l, ...updates } : l
          ),
          // Kartlardaki etiketleri de güncelle
          lists: state.board.lists?.map((list) => ({
            ...list,
            cards: list.cards.map((card) => ({
              ...card,
              labels: card.labels.map((l) =>
                l.id === labelId ? { ...l, ...updates } : l
              ),
            })),
          })),
        },
      };
    }),

  deleteBoardLabel: (labelId) =>
    set((state) => {
      if (!state.board) return state;
      return {
        board: {
          ...state.board,
          labels: (state.board.labels ?? []).filter((l) => l.id !== labelId),
          // Kartlardaki etiket referanslarını da temizle
          lists: state.board.lists?.map((list) => ({
            ...list,
            cards: list.cards.map((card) => ({
              ...card,
              labels: card.labels.filter((l) => l.id !== labelId),
            })),
          })),
        },
        // Silinmiş etiket aktif filtreyse temizle
        activeLabelFilter:
          state.activeLabelFilter === labelId ? null : state.activeLabelFilter,
      };
    }),

  // List actions
  addList: (list) =>
    set((state) => {
      if (!state.board) return state;
      return {
        board: {
          ...state.board,
          lists: [...(state.board.lists || []), list],
        },
      };
    }),

  updateList: (listId, updates) =>
    set((state) => {
      if (!state.board?.lists) return state;
      return {
        board: {
          ...state.board,
          lists: state.board.lists.map((list) =>
            list.id === listId ? { ...list, ...updates } : list
          ),
        },
      };
    }),

  deleteList: (listId) =>
    set((state) => {
      if (!state.board?.lists) return state;
      return {
        board: {
          ...state.board,
          lists: state.board.lists.filter((list) => list.id !== listId),
        },
      };
    }),

  // Card actions
  addCard: (card) =>
    set((state) => {
      if (!state.board?.lists) return state;
      return {
        board: {
          ...state.board,
          lists: state.board.lists.map((list) =>
            list.id === card.listId
              ? { ...list, cards: [...list.cards, card] }
              : list
          ),
        },
      };
    }),

  updateCard: (cardId, updates) =>
    set((state) => {
      if (!state.board?.lists) return state;
      return {
        board: {
          ...state.board,
          lists: state.board.lists.map((list) => ({
            ...list,
            cards: list.cards.map((card) =>
              card.id === cardId ? { ...card, ...updates } : card
            ),
          })),
        },
      };
    }),

  deleteCard: (cardId) =>
    set((state) => {
      if (!state.board?.lists) return state;
      return {
        board: {
          ...state.board,
          lists: state.board.lists.map((list) => ({
            ...list,
            cards: list.cards.filter((card) => card.id !== cardId),
          })),
        },
      };
    }),

  moveCard: (cardId, targetListId, newPosition) =>
    set((state) => {
      if (!state.board?.lists) return state;

      // Kartı bul ve kaldır
      let movedCard: Card | null = null;
      const listsWithoutCard = state.board.lists.map((list) => {
        const card = list.cards.find((c) => c.id === cardId);
        if (card) {
          movedCard = { ...card, listId: targetListId, position: newPosition };
          return {
            ...list,
            cards: list.cards.filter((c) => c.id !== cardId),
          };
        }
        return list;
      });

      if (!movedCard) return state;

      // Kartı hedef listeye ekle
      const listsWithCard = listsWithoutCard.map((list) =>
        list.id === targetListId
          ? { ...list, cards: [...list.cards, movedCard!] }
          : list
      );

      return {
        board: {
          ...state.board,
          lists: listsWithCard,
        },
      };
    }),

  // Attachment actions
  addAttachment: (cardId, attachment) =>
    set((state) => {
      if (!state.board?.lists) return state;
      return {
        board: {
          ...state.board,
          lists: state.board.lists.map((list) => ({
            ...list,
            cards: list.cards.map((card) =>
              card.id === cardId
                ? {
                    ...card,
                    attachments: [attachment, ...(card.attachments || [])],
                  }
                : card
            ),
          })),
        },
      };
    }),

  removeAttachment: (cardId, attachmentId) =>
    set((state) => {
      if (!state.board?.lists) return state;
      return {
        board: {
          ...state.board,
          lists: state.board.lists.map((list) => ({
            ...list,
            cards: list.cards.map((card) =>
              card.id === cardId
                ? {
                    ...card,
                    attachments: (card.attachments || []).filter(
                      (a) => a.id !== attachmentId
                    ),
                  }
                : card
            ),
          })),
        },
      };
    }),

  // Reset
  reset: () => set(initialState),
}));
