'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Plus, CalendarDays, Calendar, FileText } from 'lucide-react';
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { Button } from '@/components/ui/button';
import { useTimelineStore } from '@/store/timeline.store';
import { TimelineHeader } from './timeline-header';
import { TimelineSection } from './timeline-section';
import { TimelineStatsPanel } from './timeline-stats';
import { UnscheduledPool } from './unscheduled-pool';
import { AddTaskDialog } from './add-task-dialog';
import { RescheduleModal } from './reschedule-modal';
import { ConflictModal } from './conflict-modal';
import { PomodoroTimer } from './pomodoro-timer';
import { WeeklyView } from './weekly-view';
import { DailyReportModal } from './daily-report-modal';
import { buildBoardColorMap } from './board-colors';
import { TimelineTask, UnscheduledCard } from '@/types';

type SectionKey = 'morning' | 'afternoon' | 'evening';

function classifyTask(task: TimelineTask): SectionKey {
  const hour = new Date(task.startTime).getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}

interface RescheduleModalState {
  task: TimelineTask;
  targetSection: SectionKey;
}

interface ConflictModalState {
  task: TimelineTask;
  conflictingTask: TimelineTask;
  newStartTime: string;
  newEndTime: string;
}

export function TimelineView() {
  const {
    currentDate,
    tasks,
    unscheduledCards,
    isLoading,
    isUnscheduledLoading,
    stats,
    setDate,
    fetchTasks,
    fetchUnscheduledCards,
    addTask,
    updateStatus,
    deleteTask,
    rescheduleTask,
  } = useTimelineStore();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [preselectedCard, setPreselectedCard] = useState<UnscheduledCard | null>(null);
  const [rescheduleModal, setRescheduleModal] = useState<RescheduleModalState | null>(null);
  const [conflictModal, setConflictModal] = useState<ConflictModalState | null>(null);
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');
  const [reportOpen, setReportOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  useEffect(() => {
    fetchTasks(currentDate);
    fetchUnscheduledCards(currentDate);
  }, []);

  // Board renk haritası — boardId → palet indeksi
  const boardColorMap = useMemo(
    () => buildBoardColorMap(tasks.map((t) => t.boardId)),
    [tasks]
  );

  const morningTasks = tasks.filter((t) => classifyTask(t) === 'morning');
  const afternoonTasks = tasks.filter((t) => classifyTask(t) === 'afternoon');
  const eveningTasks = tasks.filter((t) => classifyTask(t) === 'evening');

  const handleDateChange = (date: Date) => {
    setDate(date);
  };

  const handleUpdateStatus = async (id: string, action: 'start' | 'pause' | 'complete' | 'skip') => {
    try {
      await updateStatus(id, action);
      const labels: Record<string, string> = {
        start: 'Görev başlatıldı',
        pause: 'Görev duraklatıldı',
        complete: 'Görev tamamlandı! 🎉',
        skip: 'Görev atlandı',
      };
      toast.success(labels[action]);
    } catch (err: any) {
      toast.error(err.message || 'Güncelleme başarısız');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTask(id);
      toast.success('Görev kaldırıldı');
    } catch (err: any) {
      toast.error(err.message || 'Silme başarısız');
    }
  };

  const handleAddTask = async (data: Parameters<typeof addTask>[0]) => {
    await addTask(data);
    toast.success("Görev timeline'a eklendi");
  };

  const handleOpenDialogForCard = (card: UnscheduledCard) => {
    setPreselectedCard(card);
    setDialogOpen(true);
  };

  const handleOpenDialog = () => {
    setPreselectedCard(null);
    setDialogOpen(true);
  };

  // Drag end: farklı bloğa bırakıldıysa RescheduleModal aç
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const targetSection = over.id as SectionKey;

    const draggedTask = tasks.find((t) => t.id === taskId);
    if (!draggedTask) return;

    const sourceSection = classifyTask(draggedTask);
    if (sourceSection === targetSection) return; // aynı blok — değişiklik yok

    setRescheduleModal({ task: draggedTask, targetSection });
  };

  // RescheduleModal'dan onay geldiğinde çağrılır
  const handleRescheduleConfirm = async (startTime: string, endTime: string) => {
    if (!rescheduleModal) return;

    const { task } = rescheduleModal;
    const estimatedMinutes = Math.round(
      (new Date(endTime).getTime() - new Date(startTime).getTime()) / 60000
    );

    try {
      await rescheduleTask(task.id, startTime, endTime, estimatedMinutes);
      setRescheduleModal(null);
      toast.success('Görev yeniden planlandı');
    } catch (err: any) {
      if (err.message === 'CONFLICT') {
        // Çakışma modali aç, reschedule modali kapat
        setRescheduleModal(null);
        setConflictModal({
          task,
          conflictingTask: err.conflictingTask as TimelineTask,
          newStartTime: startTime,
          newEndTime: endTime,
        });
        // ConflictModal'dan hata fırlatma — modal zaten açılıyor
        throw err;
      }
      throw err;
    }
  };

  // ConflictModal — Replace: çakışan görevi sil, bu görevi planla
  const handleConflictReplace = async () => {
    if (!conflictModal) return;
    const { task, conflictingTask, newStartTime, newEndTime } = conflictModal;

    await deleteTask(conflictingTask.id);
    const estimatedMinutes = Math.round(
      (new Date(newEndTime).getTime() - new Date(newStartTime).getTime()) / 60000
    );
    await rescheduleTask(task.id, newStartTime, newEndTime, estimatedMinutes);

    setConflictModal(null);
    toast.success('Görev değiştirildi ve yeniden planlandı');
  };

  // ConflictModal — Move: çakışan görevi kaydır, ardından bu görevi planla
  const handleConflictMove = async () => {
    if (!conflictModal) return;
    const { task, conflictingTask, newStartTime, newEndTime } = conflictModal;

    // Çakışan görevin süresi
    const conflictDuration =
      new Date(conflictingTask.endTime).getTime() -
      new Date(conflictingTask.startTime).getTime();

    // Çakışan görev: bu görevin bitiş saatinden başlar
    const conflictNewStart = newEndTime;
    const conflictNewEnd = new Date(
      new Date(newEndTime).getTime() + conflictDuration
    ).toISOString();

    await rescheduleTask(
      conflictingTask.id,
      conflictNewStart,
      conflictNewEnd,
      conflictingTask.estimatedMinutes
    );
    const estimatedMinutes = Math.round(
      (new Date(newEndTime).getTime() - new Date(newStartTime).getTime()) / 60000
    );
    await rescheduleTask(task.id, newStartTime, newEndTime, estimatedMinutes);

    setConflictModal(null);
    toast.success('Görevler yeniden düzenlendi');
  };

  const handleConflictCancel = () => {
    setConflictModal(null);
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <TimelineHeader currentDate={currentDate} onDateChange={handleDateChange} />

          {/* Ana layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sol: Timeline blokları */}
            <div className="lg:col-span-2 space-y-2">
              <div className="flex items-center justify-between mb-4">
                {/* Günlük / Haftalık toggle */}
                <div className="flex items-center border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('daily')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                      viewMode === 'daily'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    Günlük
                  </button>
                  <button
                    onClick={() => setViewMode('weekly')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors border-l ${
                      viewMode === 'weekly'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <CalendarDays className="h-3.5 w-3.5" />
                    Haftalık
                  </button>
                </div>

                {viewMode === 'daily' && (
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setReportOpen(true)}>
                      <FileText className="h-4 w-4 mr-1.5" />
                      Rapor
                    </Button>
                    <Button onClick={handleOpenDialog} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Görev Ekle
                    </Button>
                  </div>
                )}
              </div>

              {/* Haftalık görünüm */}
              {viewMode === 'weekly' && (
                <WeeklyView
                  currentDate={currentDate}
                  onDayClick={(date) => {
                    setViewMode('daily');
                    handleDateChange(date);
                  }}
                />
              )}

              {viewMode === 'daily' && (isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center text-gray-400">
                    <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-3" />
                    <p className="text-sm">Yükleniyor...</p>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl border p-4">
                  <TimelineSection
                    title="Sabah (06:00 – 12:00)"
                    icon="morning"
                    tasks={morningTasks}
                    boardColorMap={boardColorMap}
                    onUpdateStatus={handleUpdateStatus}
                    onDelete={handleDelete}
                  />
                  <TimelineSection
                    title="Öğle (12:00 – 18:00)"
                    icon="afternoon"
                    tasks={afternoonTasks}
                    boardColorMap={boardColorMap}
                    onUpdateStatus={handleUpdateStatus}
                    onDelete={handleDelete}
                  />
                  <TimelineSection
                    title="Akşam (18:00 – 00:00)"
                    icon="evening"
                    tasks={eveningTasks}
                    boardColorMap={boardColorMap}
                    onUpdateStatus={handleUpdateStatus}
                    onDelete={handleDelete}
                  />

                  {tasks.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                      <p className="text-base mb-2">Henüz görev eklenmedi</p>
                      <p className="text-sm">
                        Sağdaki listeden kart seçin veya &quot;Görev Ekle&quot; butonuna tıklayın
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Sağ: Stats, Pomodoro ve Unscheduled pool */}
            <div className="space-y-4">
              <TimelineStatsPanel stats={stats} />
              <PomodoroTimer activeTask={tasks.find((t) => t.status === 'IN_PROGRESS') ?? null} />
              <UnscheduledPool
                cards={unscheduledCards}
                isLoading={isUnscheduledLoading}
                onAddToTimeline={handleOpenDialogForCard}
              />
            </div>
          </div>
        </div>

        {/* Dialoglar */}
        <AddTaskDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          currentDate={currentDate}
          unscheduledCards={unscheduledCards}
          preselectedCard={preselectedCard}
          onAdd={handleAddTask}
        />

        {rescheduleModal && (
          <RescheduleModal
            open={!!rescheduleModal}
            onOpenChange={(v) => { if (!v) setRescheduleModal(null); }}
            task={rescheduleModal.task}
            targetSection={rescheduleModal.targetSection}
            currentDate={currentDate}
            allTasks={tasks}
            onConfirm={handleRescheduleConfirm}
          />
        )}

        {conflictModal && (
          <ConflictModal
            open={!!conflictModal}
            onOpenChange={(v) => { if (!v) setConflictModal(null); }}
            pendingTask={conflictModal.task}
            conflictingTask={conflictModal.conflictingTask}
            newStartTime={conflictModal.newStartTime}
            newEndTime={conflictModal.newEndTime}
            onReplace={handleConflictReplace}
            onMove={handleConflictMove}
            onCancel={handleConflictCancel}
          />
        )}

        <DailyReportModal
          open={reportOpen}
          onOpenChange={setReportOpen}
          date={currentDate}
          tasks={tasks}
          stats={stats}
        />
      </div>
    </DndContext>
  );
}
