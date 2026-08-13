import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Minimize2, Play, Pause, RotateCcw, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { SessionType, AmbientSoundType } from '../types';

interface ZenModeProps {
  secondsLeft: number;
  totalSeconds: number;
  isRunning: boolean;
  sessionType: SessionType;
  currentTask: string;
  distractionsCount: number;
  onAddDistraction: () => void;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSkip: () => void;
  onExit: () => void;
  activeAmbient: AmbientSoundType;
  onSelectAmbient: (type: AmbientSoundType) => void;
}

const BREATHING_PHASES = [
  { label: 'Inhale', duration: 4 },
  { label: 'Hold', duration: 4 },
  { label: 'Exhale', duration: 4 },
  { label: 'Rest', duration: 2 },
];

export const ZenMode: React.FC<ZenModeProps> = ({
  secondsLeft,
  totalSeconds,
  isRunning,
  sessionType,
  currentTask,
  distractionsCount,
  onAddDistraction,
  onStart,
  onPause,
  onReset,
  onSkip,
  onExit,
  activeAmbient,
  onSelectAmbient,
}) => {
  const [showBreathing, setShowBreathing] = useState(false);
  const [breathIdx, setBreathIdx] = useState(0);

  useEffect(() => {
    if (!showBreathing) return;
    const interval = setInterval(() => {
      setBreathIdx((prev) => (prev + 1) % BREATHING_PHASES.length);
    }, BREATHING_PHASES[breathIdx].duration * 1000);
    return () => clearInterval(interval);
  }, [showBreathing, breathIdx]);

  const progress = Math.max(0, Math.min(100, ((totalSeconds - secondsLeft) / totalSeconds) * 100));

  const formatTime = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    if (hrs > 0) {
      return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const phaseLabel = sessionType === 'work' ? 'Focus' : 'Rest';

  const layer = (
    <div className="zen-layer px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))]">
      <div className="relative z-10 flex w-full max-w-xl items-center justify-between">
        <div>
          <p className="text-xs tracking-[0.18em] uppercase text-[color:var(--ink-mute)]">{phaseLabel}</p>
          <p className="mt-1 max-w-[14rem] truncate font-serif text-lg text-[color:var(--ink)]">
            {currentTask || 'This wave'}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowBreathing((open) => !open)}
            className={`pressable min-h-11 rounded-full px-3 text-sm ${
              showBreathing ? 'text-[color:var(--ink)]' : 'text-[color:var(--ink-mute)]'
            }`}
            aria-pressed={showBreathing}
          >
            Breathe
          </button>
          <button
            type="button"
            onClick={() => onSelectAmbient(activeAmbient === 'none' ? 'alpha_binaural' : 'none')}
            className="pressable inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-[color:var(--ink-mute)]"
            aria-pressed={activeAmbient !== 'none'}
          >
            {activeAmbient !== 'none' ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={onExit}
            className="pressable inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm text-[color:var(--ink-mute)]"
          >
            <Minimize2 className="h-4 w-4" />
            Exit
          </button>
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center text-center">
        <AnimatePresence mode="wait">
          {showBreathing && (
            <motion.p
              key={breathIdx}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              className="mb-6 text-sm tracking-[0.16em] uppercase text-[color:var(--ink-mute)]"
            >
              {BREATHING_PHASES[breathIdx].label}
            </motion.p>
          )}
        </AnimatePresence>

        <p className="clock-face font-serif text-[clamp(4.6rem,20vw,7.5rem)] leading-none tracking-tight">
          {formatTime(secondsLeft)}
        </p>
        <div
          className="mt-8 h-px w-40 overflow-hidden bg-[color:var(--line)]"
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full bg-[color:var(--ink)]"
            style={{
              width: `${progress}%`,
              transition: 'width 500ms var(--ease-whisper)',
            }}
          />
        </div>
      </div>

      <div className="relative z-10 flex w-full max-w-xs items-center justify-between pb-2">
        <button type="button" onClick={onReset} className="pressable inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-[color:var(--ink-mute)]">
          <RotateCcw className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={isRunning ? onPause : onStart}
          className="pressable flex min-h-12 min-w-32 items-center justify-center rounded-full bg-[color:var(--ink)] px-8 text-[color:var(--paper)]"
        >
          {isRunning ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4 fill-current" />}
          {isRunning ? 'Pause' : 'Resume'}
        </button>
        <button type="button" onClick={onSkip} className="pressable inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-[color:var(--ink-mute)]">
          <SkipForward className="h-4 w-4" />
        </button>
      </div>

      <button
        type="button"
        onClick={onAddDistraction}
        className="pressable absolute bottom-[max(6.5rem,calc(env(safe-area-inset-bottom)+5.5rem))] text-sm text-[color:var(--ink-mute)]"
      >
        {distractionsCount} slip{distractionsCount === 1 ? '' : 's'}
      </button>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(layer, document.body);
};
