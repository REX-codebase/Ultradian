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
            <motion.form
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="w-full"
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveTask();
              }}
            >
              <label htmlFor="focal-task" className="sr-only">
                What are you focusing on?
              </label>
              <div className="relative flex items-center justify-center rounded-2xl swift-glass-card px-4 py-3 border border-[color:var(--line)] shadow-md backdrop-blur-xl">
                <input
                  id="focal-task"
                  name="focalTask"
                  aria-label="What is your focal intention?"
                  type="text"
                  value={tempTask}
                  onChange={(e) => setTempTask(e.target.value)}
                  onBlur={handleSaveTask}
                  placeholder="What is your focal intention?"
                  className="w-full bg-transparent text-center font-serif text-[clamp(1.25rem,4.5vw,1.85rem)] leading-snug text-[color:var(--ink)] placeholder:text-[color:var(--ink-mute)] focus:outline-none"
                  autoFocus
                />
              </div>
            </motion.form>
          ) : (
            <motion.button
              type="button"
              whileHover={{ scale: 1.015, y: -1 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 450, damping: 25 }}
              onClick={() => {
                triggerHaptic();
                setTempTask(currentTask);
                setIsEditingTask(true);
              }}
              className="group relative flex min-h-12 w-full items-center justify-center rounded-2xl px-5 py-2.5 transition-all duration-200 hover:bg-[color:var(--line)]/30 border border-transparent hover:border-[color:var(--line)]/60 cursor-pointer"
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

        {/* SwiftUI Segmented Category Selector */}
        <div className="swift-segmented-track mt-4 max-w-full justify-start sm:justify-center overflow-x-auto scrollbar-none">
          {CATEGORIES.map((cat) => {
            const active = category === cat;
            return (
              <motion.button
                key={cat}
                type="button"
                whileTap={{ scale: 0.94 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                onClick={() => {
                  triggerHaptic();
                  onCategoryChange(cat);
                }}
                className={`relative z-10 min-h-8.5 rounded-full px-3.5 py-1 text-xs font-medium tracking-wide transition-colors duration-200 cursor-pointer select-none ${
                  active ? 'text-[color:var(--paper)] font-semibold' : 'text-[color:var(--ink-mute)] hover:text-[color:var(--ink)]'
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="activeCategoryPill"
                    className="absolute inset-0 z-[-1] rounded-full bg-[color:var(--ink)] shadow-xs"
                    transition={{ type: 'spring', stiffness: 480, damping: 32, mass: 0.6 }}
                  />
                )}
                <span>{cat}</span>
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
        <motion.div
          animate={isRunning ? { scale: [1, 1.02, 1] } : { scale: 1 }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          className="liquid-glass-badge z-10 flex items-center gap-1.5 rounded-full px-3.5 py-1 text-[11px] font-mono font-medium tracking-widest uppercase text-[color:var(--ink-soft)]"
        >
          <span className={`h-1.5 w-1.5 rounded-full ${isRunning ? 'bg-[color:var(--ink)] animate-ping' : 'bg-[color:var(--ink-mute)]'}`} />
          <span>{phaseLabel}</span>
          {isRunning && <span className="text-[color:var(--ink)] font-bold">· LIVE</span>}
        </motion.div>

        {/* Massive Serif Clock Display */}
        <motion.p
          className="clock-face z-10 mt-3 font-serif text-[clamp(4.8rem,24vw,8.2rem)] leading-none tracking-tight text-[color:var(--ink)] tabular-nums drop-shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:drop-shadow-[0_2px_16px_rgba(255,255,255,0.04)]"
          aria-live="polite"
          key={secondsLeft}
          initial={{ opacity: 0.92, scale: 0.995 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
        >
          {formatTime(secondsLeft)}
        </motion.p>

        {/* Precision Hairline Progress Sweep */}
        <div className="z-10 mt-5 w-48 sm:w-56">
          <div
            className="relative h-1 w-full overflow-hidden rounded-full bg-[color:var(--line)]/70 backdrop-blur-sm"
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <motion.div
              className="h-full rounded-full bg-[color:var(--ink)]"
              initial={false}
              animate={{ width: `${progressPercent}%` }}
              transition={{ type: 'spring', stiffness: 120, damping: 20 }}
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
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 450, damping: 24 }}
          onClick={() => {
            triggerHaptic();
            if (isRunning) onPause();
            else onStart();
          }}
          className="swift-pill-cta group relative flex min-h-14 w-full max-w-xs items-center justify-center gap-2.5 px-8 text-base font-medium tracking-wide cursor-pointer"
        >
          <div className="liquid-sheen opacity-40 group-hover:opacity-60 transition-opacity" />
          <AnimatePresence mode="wait" initial={false}>
            {isRunning ? (
              <motion.div
                key="pause"
                initial={{ rotate: -90, opacity: 0, scale: 0.8 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center gap-2"
              >
                <IconPause size={17} className="text-[color:var(--paper)] fill-current" />
                <span>Pause Wave</span>
              </motion.div>
            ) : (
              <motion.div
                key="play"
                initial={{ rotate: 90, opacity: 0, scale: 0.8 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: -90, opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center gap-2"
              >
                <IconPlay size={17} className="text-[color:var(--paper)] fill-current ml-0.5" />
                <span>{`Begin ${Math.round(totalSeconds / 60)}m Wave`}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Secondary Glass Dock Actions */}
        <div className="liquid-glass-dock flex items-center gap-1 p-1 shadow-sm">
          <motion.button
            type="button"
            whileHover={{ scale: 1.08, y: -1 }}
            whileTap={{ scale: 0.91 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            onClick={() => {
              triggerHaptic();
              onReset();
            }}
            className="inline-flex min-h-10 min-w-10 items-center justify-center gap-1.5 rounded-full px-3 text-xs font-medium text-[color:var(--ink-mute)] hover:text-[color:var(--ink)] hover:bg-[color:var(--line)]/50 transition-colors cursor-pointer"
            title="Reset timer"
          >
            <IconReset size={14} />
            <span>Reset</span>
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ scale: 1.08, y: -1 }}
            whileTap={{ scale: 0.91 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            onClick={() => {
              triggerHaptic();
              onSkip();
            }}
            className="inline-flex min-h-10 min-w-10 items-center justify-center gap-1.5 rounded-full px-3 text-xs font-medium text-[color:var(--ink-mute)] hover:text-[color:var(--ink)] hover:bg-[color:var(--line)]/50 transition-colors cursor-pointer"
            title="Skip to next phase"
          >
            <IconSkip size={14} />
            <span>Skip</span>
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ scale: 1.08, y: -1 }}
            whileTap={{ scale: 0.91 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            onClick={() => {
              triggerHaptic();
              onToggleAmbient();
            }}
            className={`inline-flex min-h-10 min-w-10 items-center justify-center gap-1.5 rounded-full px-3 text-xs font-medium transition-colors cursor-pointer ${
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
            whileHover={{ scale: 1.08, y: -1 }}
            whileTap={{ scale: 0.91 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            onClick={() => {
              triggerHaptic();
              onToggleZen();
            }}
            className="inline-flex min-h-10 min-w-10 items-center justify-center gap-1.5 rounded-full px-3 text-xs font-medium text-[color:var(--ink-mute)] hover:text-[color:var(--ink)] hover:bg-[color:var(--line)]/50 transition-colors cursor-pointer"
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
          <div className="liquid-glass-badge flex items-center gap-1.5 rounded-full px-3.5 py-1 text-[11px] shadow-xs">
            <span className="font-mono font-semibold text-[color:var(--ink)]">{completedCyclesToday}</span>
            <span>/ {targetCycles} waves</span>
          </div>

          <div className="liquid-glass-badge flex items-center gap-1.5 rounded-full px-3.5 py-1 text-[11px] shadow-xs">
            <span className="font-mono font-semibold text-[color:var(--ink)]">
              {Math.floor(todayMinutes / 60) > 0 ? `${Math.floor(todayMinutes / 60)}h ` : ''}
              {todayMinutes % 60}m
            </span>
            <span>focus today</span>
          </div>

          <motion.button
            type="button"
            whileHover={{ scale: 1.06, y: -1 }}
            whileTap={{ scale: 0.93 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            onClick={() => {
              triggerHaptic();
              onAddDistraction();
            }}
            className="liquid-glass-badge flex items-center gap-1.5 rounded-full px-3.5 py-1 text-[11px] hover:text-[color:var(--ink)] transition-colors cursor-pointer shadow-xs"
            title="Log a distraction slip"
          >
            <span className="font-mono font-semibold text-[color:var(--ink)]">{distractionsCount}</span>
            <span>slip{distractionsCount === 1 ? '' : 's'}</span>
          </motion.button>
        </div>

        {/* Preset Length Selector Accordion */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 450, damping: 25 }}
          onClick={() => {
            triggerHaptic();
            setShowPresets((open) => !open);
          }}
          className="pressable min-h-10 text-xs text-[color:var(--ink-mute)] underline-offset-4 hover:text-[color:var(--ink)] flex items-center gap-1.5 cursor-pointer"
        >
          <span>{settings.workMinutes}m focus / {settings.shortBreakMinutes}m rest</span>
          <span className="text-[10px] opacity-60">· {showPresets ? 'Hide presets' : 'Change preset'}</span>
        </motion.button>

        <AnimatePresence>
          {showPresets && (
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 380, damping: 26 }}
              className="grid w-full grid-cols-2 gap-2.5 sm:grid-cols-4 pt-1"
            >
              {DEFAULT_PRESETS.map((preset) => {
                const active = settings.activePresetId === preset.id;
                return (
                  <motion.button
                    key={preset.id}
                    type="button"
                    whileHover={{ scale: 1.04, y: -1 }}
                    whileTap={{ scale: 0.94 }}
                    transition={{ type: 'spring', stiffness: 480, damping: 25 }}
                    onClick={() => {
                      triggerHaptic();
                      onSelectPreset(preset);
                    }}
                    className={`swift-glass-card flex min-h-16 flex-col justify-center px-3.5 py-2.5 text-left transition-all cursor-pointer ${
                      active
                        ? 'border-[color:var(--ink)] bg-[color:var(--ink)] text-[color:var(--paper)] shadow-lg'
                        : 'text-[color:var(--ink-soft)] hover:border-[color:var(--ink-mute)]'
                    }`}
                  >
                    <span className="block font-serif text-base font-medium">
                      {preset.workMinutes}/{preset.shortBreakMinutes}m
                    </span>
                    <span className={`mt-0.5 block text-[11px] truncate ${active ? 'opacity-90 text-[color:var(--paper)] font-medium' : 'opacity-70 text-[color:var(--ink-mute)]'}`}>
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
