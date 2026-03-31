/**
 * Timeline Zustand Store
 *
 * Günlük görev zaman çizelgesi için global state yönetimi.
 * Optimistic updates: Store'u hemen güncelle, API başarısızsa revert et.
 */

import { create } from 'zustand';
import { TimelineTask, TimelineStats, UnscheduledCard } from '@/types';
import { CreateTimelineTaskInput } from '@/lib/validations';

interface TimelineStore {
  // State
  currentDate: Date;
  tasks: TimelineTask[];
  unscheduledCards: UnscheduledCard[];
  isLoading: boolean;
  isUnscheduledLoading: boolean;
  stats: TimelineStats;
  error: string | null;

  // Date actions
  setDate: (date: Date) => void;

  // Data fetching
  fetchTasks: (date: Date) => Promise<void>;
  fetchUnscheduledCards: (date?: Date) => Promise<void>;

  // Task mutations
  addTask: (data: CreateTimelineTaskInput) => Promise<void>;
  updateStatus: (id: string, action: 'start' | 'pause' | 'complete' | 'skip') => Promise<void>;
  rescheduleTask: (id: string, startTime: string, endTime: string, estimatedMinutes?: number) => Promise<void>;
  moveTaskToDate: (id: string, targetDate: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;

  // Utility
  reset: () => void;
}

// Yerel saat bazlı formatlama — toISOString() UTC verir, timezone farklılığında gün kayar
function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const defaultStats: TimelineStats = {
  totalPlanned: 0,
  completed: 0,
  inProgress: 0,
  remaining: 0,
  totalMinutesPlanned: 0,
};

function computeStats(tasks: TimelineTask[]): TimelineStats {
  return {
    totalPlanned: tasks.length,
    completed: tasks.filter((t) => t.status === 'COMPLETED').length,
    inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
    remaining: tasks.filter((t) => t.status === 'PLANNED' || t.status === 'PAUSED').length,
    totalMinutesPlanned: tasks.reduce((sum, t) => sum + t.estimatedMinutes, 0),
  };
}

export const useTimelineStore = create<TimelineStore>((set, get) => ({
  currentDate: new Date(),
  tasks: [],
  unscheduledCards: [],
  isLoading: false,
  isUnscheduledLoading: false,
  stats: defaultStats,
  error: null,

  setDate: (date) => {
    set({ currentDate: date });
    get().fetchTasks(date);
    get().fetchUnscheduledCards(date);
  },

  fetchTasks: async (date) => {
    set({ isLoading: true, error: null });
    try {
      const dateStr = formatDate(date);
      const res = await fetch(`/api/timeline?date=${dateStr}`);
      if (!res.ok) throw new Error('Görevler yüklenemedi');
      const data = await res.json();
      const tasks = data.tasks as TimelineTask[];
      set({ tasks, stats: computeStats(tasks), isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchUnscheduledCards: async (date) => {
    const targetDate = date ?? get().currentDate;
    set({ isUnscheduledLoading: true });
    try {
      const dateStr = formatDate(targetDate);
      const res = await fetch(`/api/timeline/unscheduled?date=${dateStr}`);
      if (!res.ok) throw new Error('Planlanmamış kartlar yüklenemedi');
      const data = await res.json();
      set({ unscheduledCards: data.cards as UnscheduledCard[], isUnscheduledLoading: false });
    } catch {
      set({ isUnscheduledLoading: false });
    }
  },

  addTask: async (data) => {
    try {
      const res = await fetch('/api/timeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Görev eklenemedi');
      }

      const newTask = (await res.json()) as TimelineTask;

      set((state) => {
        const tasks = [...state.tasks, newTask].sort(
          (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        );
        return {
          tasks,
          stats: computeStats(tasks),
          // Eklenen kart artık unscheduled pool'dan çıkar
          unscheduledCards: state.unscheduledCards.filter((c) => c.id !== newTask.cardId),
        };
      });
    } catch (error: any) {
      throw error;
    }
  },

  updateStatus: async (id, action) => {
    const previousTasks = get().tasks;

    // Optimistic update
    const statusMap: Record<string, TimelineTask['status']> = {
      start: 'IN_PROGRESS',
      pause: 'PAUSED',
      complete: 'COMPLETED',
      skip: 'SKIPPED',
    };

    set((state) => {
      const tasks = state.tasks.map((t) =>
        t.id === id ? { ...t, status: statusMap[action] } : t
      );
      return { tasks, stats: computeStats(tasks) };
    });

    try {
      const res = await fetch(`/api/timeline/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) {
        // Revert
        set({ tasks: previousTasks, stats: computeStats(previousTasks) });
        const err = await res.json();
        throw new Error(err.error || 'Güncelleme başarısız');
      }

      // Sunucudan gelen gerçek veriyle güncelle (actualStartTime vb. için)
      const updatedTask = (await res.json()) as TimelineTask;
      set((state) => {
        const tasks = state.tasks.map((t) => (t.id === id ? updatedTask : t));
        return { tasks, stats: computeStats(tasks) };
      });
    } catch (error: any) {
      throw error;
    }
  },

  rescheduleTask: async (id, startTime, endTime, estimatedMinutes) => {
    const previousTasks = get().tasks;

    // Optimistic update
    set((state) => {
      const tasks = state.tasks
        .map((t) =>
          t.id === id
            ? { ...t, startTime, endTime, estimatedMinutes: estimatedMinutes ?? t.estimatedMinutes }
            : t
        )
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
      return { tasks, stats: computeStats(tasks) };
    });

    const res = await fetch(`/api/timeline/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startTime, endTime, estimatedMinutes }),
    });

    if (res.status === 409) {
      set({ tasks: previousTasks, stats: computeStats(previousTasks) });
      const data = await res.json();
      const err = new Error('CONFLICT') as any;
      err.conflictingTask = data.conflictingTask as TimelineTask;
      throw err;
    }

    if (!res.ok) {
      set({ tasks: previousTasks, stats: computeStats(previousTasks) });
      const data = await res.json();
      throw new Error(data.error || 'Yeniden planlama başarısız');
    }

    const updatedTask = (await res.json()) as TimelineTask;
    set((state) => {
      const tasks = state.tasks
        .map((t) => (t.id === id ? updatedTask : t))
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
      return { tasks, stats: computeStats(tasks) };
    });
  },

  moveTaskToDate: async (id, targetDate) => {
    const previousTasks = get().tasks;

    // Optimistic: görevi listeden kaldır (hedef günde yeniden yükleme yapılacak)
    set((state) => {
      const tasks = state.tasks.filter((t) => t.id !== id);
      return { tasks, stats: computeStats(tasks) };
    });

    try {
      const res = await fetch(`/api/timeline/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduledDate: targetDate }),
      });

      if (res.status === 409) {
        set({ tasks: previousTasks, stats: computeStats(previousTasks) });
        const data = await res.json();
        const err = new Error('CONFLICT') as any;
        err.conflictingTask = data.conflictingTask;
        throw err;
      }

      if (!res.ok) {
        set({ tasks: previousTasks, stats: computeStats(previousTasks) });
        const data = await res.json();
        throw new Error(data.error || 'Taşıma başarısız');
      }
    } catch (error: any) {
      throw error;
    }
  },

  deleteTask: async (id) => {
    const previousTasks = get().tasks;
    const deletedTask = previousTasks.find((t) => t.id === id);

    // Optimistic delete
    set((state) => {
      const tasks = state.tasks.filter((t) => t.id !== id);
      return { tasks, stats: computeStats(tasks) };
    });

    try {
      const res = await fetch(`/api/timeline/tasks/${id}`, { method: 'DELETE' });

      if (!res.ok) {
        // Revert
        set({ tasks: previousTasks, stats: computeStats(previousTasks) });
        const err = await res.json();
        throw new Error(err.error || 'Silme başarısız');
      }

      // Silinen kartı tekrar unscheduled pool'a ekle
      if (deletedTask) {
        get().fetchUnscheduledCards();
      }
    } catch (error: any) {
      throw error;
    }
  },

  reset: () => {
    set({
      tasks: [],
      unscheduledCards: [],
      isLoading: false,
      isUnscheduledLoading: false,
      stats: defaultStats,
      error: null,
    });
  },
}));
