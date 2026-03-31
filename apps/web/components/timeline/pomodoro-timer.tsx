'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TimelineTask } from '@/types';

// Pomodoro sabitleri (saniye cinsinden)
const FOCUS_DURATION = 25 * 60;
const SHORT_BREAK = 5 * 60;
const LONG_BREAK = 15 * 60;
const ROUNDS_BEFORE_LONG = 4;

type Phase = 'focus' | 'short_break' | 'long_break';

const PHASE_CONFIG: Record<Phase, { label: string; color: string; bg: string; duration: number }> = {
  focus: {
    label: 'Odak',
    color: 'text-red-600',
    bg: 'bg-red-50 border-red-200',
    duration: FOCUS_DURATION,
  },
  short_break: {
    label: 'Kısa Mola',
    color: 'text-green-600',
    bg: 'bg-green-50 border-green-200',
    duration: SHORT_BREAK,
  },
  long_break: {
    label: 'Uzun Mola',
    color: 'text-blue-600',
    bg: 'bg-blue-50 border-blue-200',
    duration: LONG_BREAK,
  },
};

function formatSeconds(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

interface PomodoroTimerProps {
  activeTask?: TimelineTask | null;
}

export function PomodoroTimer({ activeTask }: PomodoroTimerProps) {
  const [phase, setPhase] = useState<Phase>('focus');
  const [secondsLeft, setSecondsLeft] = useState(FOCUS_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [completedRounds, setCompletedRounds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const config = PHASE_CONFIG[phase];
  const totalDuration = config.duration;
  const progress = ((totalDuration - secondsLeft) / totalDuration) * 100;

  const goToNextPhase = useCallback((rounds: number) => {
    const newRounds = rounds + (phase === 'focus' ? 1 : 0);
    setCompletedRounds(newRounds);

    if (phase === 'focus') {
      if (newRounds % ROUNDS_BEFORE_LONG === 0) {
        setPhase('long_break');
        setSecondsLeft(LONG_BREAK);
      } else {
        setPhase('short_break');
        setSecondsLeft(SHORT_BREAK);
      }
    } else {
      setPhase('focus');
      setSecondsLeft(FOCUS_DURATION);
    }
    setIsRunning(false);
  }, [phase]);

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          goToNextPhase(completedRounds);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, goToNextPhase, completedRounds]);

  const handleToggle = () => setIsRunning((r) => !r);

  const handleReset = () => {
    setIsRunning(false);
    setSecondsLeft(config.duration);
  };

  const handlePhaseSelect = (p: Phase) => {
    setIsRunning(false);
    setPhase(p);
    setSecondsLeft(PHASE_CONFIG[p].duration);
  };

  // SVG çember progress
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={`rounded-xl border p-4 transition-colors ${config.bg}`}>
      {/* Başlık */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <Timer className={`h-4 w-4 ${config.color}`} />
          <span className={`text-sm font-semibold ${config.color}`}>Pomodoro</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          {Array.from({ length: ROUNDS_BEFORE_LONG }).map((_, i) => (
            <span
              key={i}
              className={`h-2 w-2 rounded-full ${
                i < completedRounds % ROUNDS_BEFORE_LONG
                  ? 'bg-red-400'
                  : 'bg-gray-200'
              }`}
            />
          ))}
          <span className="ml-1 text-gray-400">
            {Math.floor(completedRounds / ROUNDS_BEFORE_LONG) > 0
              ? `×${Math.floor(completedRounds / ROUNDS_BEFORE_LONG) + 1}`
              : ''}
          </span>
        </div>
      </div>

      {/* Faz seçici */}
      <div className="flex gap-1 mb-4">
        {(Object.keys(PHASE_CONFIG) as Phase[]).map((p) => (
          <button
            key={p}
            onClick={() => handlePhaseSelect(p)}
            className={`flex-1 text-xs py-1 rounded-md font-medium transition-colors ${
              phase === p
                ? `${PHASE_CONFIG[p].color} bg-white shadow-sm border`
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {PHASE_CONFIG[p].label}
          </button>
        ))}
      </div>

      {/* Sayaç — SVG çember */}
      <div className="flex flex-col items-center mb-4">
        <div className="relative w-24 h-24">
          <svg className="w-24 h-24 -rotate-90" viewBox="0 0 88 88">
            {/* Arka plan çemberi */}
            <circle
              cx="44"
              cy="44"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              className="text-gray-200"
            />
            {/* İlerleme çemberi */}
            <circle
              cx="44"
              cy="44"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className={config.color}
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-xl font-mono font-bold ${config.color}`}>
              {formatSeconds(secondsLeft)}
            </span>
            <span className="text-xs text-gray-400 mt-0.5">
              {phase === 'focus' ? <Brain className="h-3 w-3 inline" /> : <Coffee className="h-3 w-3 inline" />}
            </span>
          </div>
        </div>

        <p className={`text-xs font-medium mt-2 ${config.color}`}>{config.label}</p>
      </div>

      {/* Kontroller */}
      <div className="flex items-center gap-2">
        <Button
          className="flex-1 h-8 text-xs"
          variant={isRunning ? 'outline' : 'default'}
          onClick={handleToggle}
        >
          {isRunning ? (
            <>
              <Pause className="h-3 w-3 mr-1" /> Duraklat
            </>
          ) : (
            <>
              <Play className="h-3 w-3 mr-1" /> {secondsLeft === config.duration ? 'Başlat' : 'Devam Et'}
            </>
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
          onClick={handleReset}
          title="Sıfırla"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Aktif görev bağlantısı */}
      {activeTask && (
        <div className="mt-3 pt-3 border-t border-current/10">
          <p className="text-xs text-gray-500 mb-0.5">Çalışılan görev:</p>
          <p className="text-xs font-medium text-gray-700 truncate">{activeTask.card.title}</p>
          <p className="text-xs text-gray-400 truncate">{activeTask.board.title}</p>
        </div>
      )}

      {/* Tamamlanan tur sayısı */}
      {completedRounds > 0 && (
        <p className="text-xs text-gray-400 text-center mt-2">
          {completedRounds} odak turu tamamlandı
        </p>
      )}
    </div>
  );
}
