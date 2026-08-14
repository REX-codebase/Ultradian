import React, { useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  IconPlay,
  IconPause,
  IconReset,
  IconSkip,
  IconVolume,
  IconVolumeMute,
  IconZenPortal,
  IconSparkle,
} from './icons';
import {
  SessionRecord,
  CategoryTag,
  SessionType,
  UserSettings,
  UltradianPreset,
  AmbientSoundType,
} from '../types';
import { DEFAULT_PRESETS } from '../utils/storage';

interface HomeCommandCenterProps {
  currentTask: string;
  onTaskChange: (task: string) => void;
  category: CategoryTag;
  onCategoryChange: (cat: CategoryTag) => void;
  secondsLeft: number;
  totalSeconds: number;
  isRunning: boolean;
  sessionType: SessionType;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSkip: () => void;
  distractionsCount: number;
  onAddDistraction: () => void;
  completedCyclesToday: number;
  targetCycles: number;
  settings: UserSettings;
  onSelectPreset: (preset: UltradianPreset) => void;
  onApplyRecommendation: (workMins: number, breakMins: number, ambient?: AmbientSoundType) => void;
  sessionRecords: SessionRecord[];
  activeAmbient: AmbientSoundType;
  onToggleAmbient: () => void;
  onToggleZen: () => void;
  onOpenSettings: () => void;
  isAuthorizedForAi?: boolean;
  onOpenAuth?: () => void;
}

const CATEGORIES: CategoryTag[] = ['Coding', 'Writing', 'Design', 'Research', 'Strategy', 'Study', 'General'];

function formatTime(totalSecs: number) {
  const mins = Math.floor(Math.max(0, totalSecs) / 60);
  const secs = Math.max(0, totalSecs) % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export const HomeCommandCenter: React.FC<HomeCommandCenterProps> = ({
  currentTask,
  onTaskChange,
  category,
  onCategoryChange,
  secondsLeft,
  totalSeconds,
  isRunning,
  sessionType,
  onStart,
  onPause,
  onReset,
  onSkip,
  distractionsCount,
  onAddDistraction,
  completedCyclesToday,
  targetCycles,
  settings,
  onSelectPreset,
  sessionRecords,
  activeAmbient,
  onToggleAmbient,
  onToggleZen,
}) => {
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [tempTask, setTempTask] = useState(currentTask);
  const [showPresets, setShowPresets] = useState(false);

  const triggerHaptic = useCallback(() => {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(8);
      }
    } catch {}
  }, []);

  const todayDateStr = new Date().toISOString().split('T')[0];
  const todayMinutes = useMemo(() => {
    const logged = sessionRecords
      .filter((r) => r.dateString === todayDateStr && r.type === 'work')
      .reduce((acc, r) => acc + Math.round((r.actualSecondsCompleted || 0) / 60), 0);
    if (isRunning && sessionType === 'work') {
      return logged + Math.floor((totalSeconds - secondsLeft) / 60);
    }
    return logged;
  }, [sessionRecords, todayDateStr, isRunning, sessionType, totalSeconds, secondsLeft]);

  const progressPercent = totalSeconds > 0
    ? Math.min(100, Math.round(((totalSeconds - secondsLeft) / totalSeconds) * 100))
    : 0;

  const phaseLabel = sessionType === 'work' ? 'Focus Wave' : sessionType === 'longBreak' ? 'Deep Restoration' : 'Light Recovery';

  const handleSaveTask = () => {
    onTaskChange(tempTask.trim());
    setIsEditingTask(false);
  };

  return (
    <section className="home-stage mx-auto w-full max-w-xl px-1">
      {/* 1. Focal Intention Capsule */}
      <div className="flex flex-col items-center text-center">
        <div className="relative w-full max-w-lg">
          {isEditingTask ? (
            <form
              className="w-full"
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveTask();
              }}
            >
              <label htmlFor="focal-task" className="sr-only">
                What are you focusing on?
              </label>
              <div className="relative flex items-center justify-center rounded-2xl bg-[color:var(--paper-raised)]/90 px-4 py-3 border border-[color:var(--line)] shadow-sm backdrop-blur-md">
                <input
                  id="focal-task"
                  type="text"
                  value={tempTask}
                  onChange={(e) => setTempTask(e.target.value)}
                  onBlur={handleSaveTask}
                  placeholder="What is your focal intention?"
                  className="w-full bg-transparent text-center font-serif text-[clamp(1.25rem,4.5vw,1.85rem)] leading-snug text-[color:var(--ink)] placeholder:text-[color:var(--ink-mute)] focus:outline-none"
                  autoFocus
                />
              </div>
            </form>
          ) : (
            <motion.button
              type="button"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                triggerHaptic();
                setTempTask(currentTask);
                setIsEditingTask(true);
              }}
              className="group relative flex min-h-12 w-full items-center justify-center rounded-2xl px-5 py-2.5 transition-all duration-200 hover:bg-[color:var(--line)]/30 border border-transparent hover:border-[color:var(--line)]/60"
            >
              <span className="font-serif text-[clamp(1.3rem,4.8vw,1.9rem)] leading-snug text-[color:var(--ink)] tracking-tight">
                {currentTask || (
                  <span className="text-[color:var(--ink-mute)] group-hover:text-[color:var(--ink-soft)] transition-colors">
                    What are you focusing on?
                  </span>
                )}
              </span>
            </motion.button>
          )}
        </div>

        {/* Category Selector Chips */}
        <div className="chip-rail mt-3.5 max-w-full justify-start sm:justify-center px-1 py-1">
          {CATEGORIES.map((cat) => {
            const active = category === cat;
            return (
              <motion.button
                key={cat}
                type="button"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => {
                  triggerHaptic();
                  onCategoryChange(cat);
                }}
                className={`relative min-h-8.5 rounded-full px-3.5 text-xs font-medium tracking-wide transition-all duration-200 ${
                  active
                    ? 'bg-[color:var(--ink)] text-[color:var(--paper)] shadow-xs'
                    : 'text-[color:var(--ink-mute)] hover:text-[color:var(--ink)] hover:bg-[color:var(--line)]/40'
                }`}
              >
                {cat}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* 2. Precision Chronometer Stage */}
      <div className="relative mt-9 flex flex-col items-center sm:mt-12">
        {/* Subtle living breathing aura when live */}
        {isRunning && <div className="chronometer-aura" />}

        {/* Phase Pill Badge */}
        <div className="liquid-glass-badge z-10 flex items-center gap-1.5 rounded-full px-3.5 py-1 text-[11px] font-mono font-medium tracking-widest uppercase text-[color:var(--ink-soft)]">
          <span className={`h-1.5 w-1.5 rounded-full ${isRunning ? 'bg-[color:var(--ink)] animate-ping' : 'bg-[color:var(--ink-mute)]'}`} />
          <span>{phaseLabel}</span>
          {isRunning && <span className="text-[color:var(--ink)] font-bold">· LIVE</span>}
        </div>

        {/* Massive Serif Clock Display */}
        <p
          className="clock-face z-10 mt-3 font-serif text-[clamp(4.8rem,24vw,8.2rem)] leading-none tracking-tight text-[color:var(--ink)] tabular-nums drop-shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:drop-shadow-[0_2px_16px_rgba(255,255,255,0.04)]"
          aria-live="polite"
        >
          {formatTime(secondsLeft)}
        </p>

        {/* Precision Hairline Progress Sweep */}
        <div className="z-10 mt-5 w-48 sm:w-56">
          <div
            className="relative h-1 w-full overflow-hidden rounded-full bg-[color:var(--line)]/70 backdrop-blur-sm"
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-[color:var(--ink)] transition-all duration-500"
              style={{ width: `${progressPercent}%`, transitionTimingFunction: 'var(--ease-whisper)' }}
            />
          </div>
          <div className="mt-1.5 flex justify-between text-[10px] font-mono text-[color:var(--ink-mute)]">
            <span>0m</span>
            <span>{progressPercent}%</span>
            <span>{Math.round(totalSeconds / 60)}m</span>
          </div>
        </div>
      </div>

      {/* 3. Tactile Command Deck */}
      <div className="mt-9 flex flex-col items-center gap-4 sm:mt-11">
        {/* Primary Master CTA */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.025 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => {
            triggerHaptic();
            if (isRunning) onPause();
            else onStart();
          }}
          className="group relative flex min-h-14 w-full max-w-xs items-center justify-center gap-2.5 overflow-hidden rounded-full bg-[color:var(--ink)] px-8 text-base font-medium tracking-wide text-[color:var(--paper)] shadow-[0_10px_28px_-8px_color-mix(in_oklab,var(--ink)_35%,transparent)] transition-all duration-200 hover:shadow-[0_14px_34px_-6px_color-mix(in_oklab,var(--ink)_45%,transparent)]"
        >
          <div className="liquid-sheen opacity-40 group-hover:opacity-60 transition-opacity" />
          {isRunning ? (
            <IconPause size={17} className="text-[color:var(--paper)] fill-current" />
          ) : (
            <IconPlay size={17} className="text-[color:var(--paper)] fill-current ml-0.5" />
          )}
          <span>{isRunning ? 'Pause Wave' : `Begin ${Math.round(totalSeconds / 60)}m Wave`}</span>
        </motion.button>

        {/* Secondary Glass Dock Actions */}
        <div className="liquid-glass-dock flex items-center gap-1 p-1">
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.93 }}
            onClick={() => {
              triggerHaptic();
              onReset();
            }}
            className="inline-flex min-h-10 min-w-10 items-center justify-center gap-1.5 rounded-full px-3 text-xs font-medium text-[color:var(--ink-mute)] hover:text-[color:var(--ink)] hover:bg-[color:var(--line)]/50 transition-colors"
            title="Reset timer"
          >
            <IconReset size={14} />
            <span>Reset</span>
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.93 }}
            onClick={() => {
              triggerHaptic();
              onSkip();
            }}
            className="inline-flex min-h-10 min-w-10 items-center justify-center gap-1.5 rounded-full px-3 text-xs font-medium text-[color:var(--ink-mute)] hover:text-[color:var(--ink)] hover:bg-[color:var(--line)]/50 transition-colors"
            title="Skip to next phase"
          >
            <IconSkip size={14} />
            <span>Skip</span>
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.93 }}
            onClick={() => {
              triggerHaptic();
              onToggleAmbient();
            }}
            className={`inline-flex min-h-10 min-w-10 items-center justify-center gap-1.5 rounded-full px-3 text-xs font-medium transition-colors ${
              activeAmbient !== 'none'
                ? 'text-[color:var(--ink)] bg-[color:var(--line)]/70 font-semibold'
                : 'text-[color:var(--ink-mute)] hover:text-[color:var(--ink)] hover:bg-[color:var(--line)]/50'
            }`}
            aria-pressed={activeAmbient !== 'none'}
            title="Toggle background soundscape"
          >
            {activeAmbient !== 'none' ? <IconVolume size={14} /> : <IconVolumeMute size={14} />}
            <span>Sound</span>
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.93 }}
            onClick={() => {
              triggerHaptic();
              onToggleZen();
            }}
            className="inline-flex min-h-10 min-w-10 items-center justify-center gap-1.5 rounded-full px-3 text-xs font-medium text-[color:var(--ink-mute)] hover:text-[color:var(--ink)] hover:bg-[color:var(--line)]/50 transition-colors"
            title="Enter fullscreen distraction-free Zen mode"
          >
            <IconZenPortal size={14} />
            <span>Zen</span>
          </motion.button>
        </div>
      </div>

      {/* 4. Sculpted Daily Wave Ledger & Presets */}
      <footer className="mt-11 flex flex-col items-center gap-4 text-xs text-[color:var(--ink-mute)] sm:mt-14">
        {/* Metric Pill Rail */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          <div className="liquid-glass-badge flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px]">
            <span className="font-mono font-semibold text-[color:var(--ink)]">{completedCyclesToday}</span>
            <span>/ {targetCycles} waves</span>
          </div>

          <div className="liquid-glass-badge flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px]">
            <span className="font-mono font-semibold text-[color:var(--ink)]">
              {Math.floor(todayMinutes / 60) > 0 ? `${Math.floor(todayMinutes / 60)}h ` : ''}
              {todayMinutes % 60}m
            </span>
            <span>focus today</span>
          </div>

          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.93 }}
            onClick={() => {
              triggerHaptic();
              onAddDistraction();
            }}
            className="liquid-glass-badge flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] hover:text-[color:var(--ink)] transition-colors cursor-pointer"
            title="Log a distraction slip"
          >
            <span className="font-mono font-semibold text-[color:var(--ink)]">{distractionsCount}</span>
            <span>slip{distractionsCount === 1 ? '' : 's'}</span>
          </motion.button>
        </div>

        {/* Preset Length Selector Accordion */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic();
            setShowPresets((open) => !open)}
          }
          className="pressable min-h-10 text-xs text-[color:var(--ink-mute)] underline-offset-4 hover:text-[color:var(--ink)] hover:underline flex items-center gap-1.5"
        >
          <span>{settings.workMinutes}m focus / {settings.shortBreakMinutes}m rest</span>
          <span className="text-[10px] opacity-60">· {showPresets ? 'Hide presets' : 'Change preset'}</span>
        </button>

        <AnimatePresence>
          {showPresets && (
            <motion.div
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4 pt-1"
            >
              {DEFAULT_PRESETS.map((preset) => {
                const active = settings.activePresetId === preset.id;
                return (
                  <motion.button
                    key={preset.id}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      triggerHaptic();
                      onSelectPreset(preset);
                    }}
                    className={`pressable liquid-glass-card flex min-h-16 flex-col justify-center px-3.5 py-2.5 text-left transition-all ${
                      active
                        ? 'border-[color:var(--ink)] bg-[color:var(--ink)] text-[color:var(--paper)] shadow-md'
                        : 'text-[color:var(--ink-soft)] hover:border-[color:var(--ink-mute)]'
                    }`}
                  >
                    <span className="block font-serif text-base font-medium">
                      {preset.workMinutes}/{preset.shortBreakMinutes}m
                    </span>
                    <span className={`mt-0.5 block text-[11px] truncate ${active ? 'opacity-85 text-[color:var(--paper)]' : 'opacity-70 text-[color:var(--ink-mute)]'}`}>
                      {preset.name.replace(/^Level \d+:\s*/, '').split(' (')[0]}
                    </span>
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </footer>
    </section>
  );
};
