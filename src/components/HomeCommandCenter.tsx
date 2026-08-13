import React, { useMemo, useState } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Volume2, VolumeX, Maximize2 } from 'lucide-react';
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

  const phaseLabel = sessionType === 'work' ? 'Focus' : sessionType === 'longBreak' ? 'Long rest' : 'Rest';

  const handleSaveTask = () => {
    onTaskChange(tempTask.trim());
    setIsEditingTask(false);
  };

  return (
    <section className="home-stage mx-auto w-full max-w-xl px-1">
      <div className="flex flex-col items-center text-center">
        {isEditingTask ? (
          <form
            className="w-full"
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveTask();
            }}
          >
            <label htmlFor="focal-task" className="sr-only">
              What are you working on
            </label>
            <input
              id="focal-task"
              type="text"
              value={tempTask}
              onChange={(e) => setTempTask(e.target.value)}
              onBlur={handleSaveTask}
              placeholder="What are you working on?"
              className="w-full bg-transparent text-center font-serif text-[clamp(1.35rem,5vw,2rem)] leading-snug text-[color:var(--ink)] placeholder:text-[color:var(--ink-mute)] focus:outline-none"
              autoFocus
            />
          </form>
        ) : (
          <button
            type="button"
            onClick={() => {
              setTempTask(currentTask);
              setIsEditingTask(true);
            }}
            className="pressable min-h-11 w-full px-2 font-serif text-[clamp(1.35rem,5vw,2rem)] leading-snug text-[color:var(--ink)]"
          >
            {currentTask || 'What are you working on?'}
          </button>
        )}

        <div className="chip-rail mt-3 max-w-full justify-start sm:justify-center px-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => onCategoryChange(cat)}
              className={`pressable min-h-9 rounded-full px-3 text-sm ${
                category === cat
                  ? 'bg-[color:var(--ink)] text-[color:var(--paper)]'
                  : 'text-[color:var(--ink-mute)] hover:text-[color:var(--ink)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-10 flex flex-col items-center sm:mt-14">
        <p className="text-sm tracking-[0.18em] text-[color:var(--ink-mute)] uppercase">
          {phaseLabel}
          {isRunning ? ' · live' : ''}
        </p>
        <p
          className="clock-face mt-3 font-serif text-[clamp(4.4rem,22vw,7.5rem)] leading-none tracking-tight text-[color:var(--ink)] tabular-nums"
          aria-live="polite"
        >
          {formatTime(secondsLeft)}
        </p>
        <div
          className="mt-6 h-px w-40 overflow-hidden bg-[color:var(--line)]"
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full bg-[color:var(--ink)] transition-[width] duration-500"
            style={{ width: `${progressPercent}%`, transitionTimingFunction: 'var(--ease-whisper)' }}
          />
        </div>
      </div>

      <div className="mt-10 flex flex-col items-center gap-4 sm:mt-12">
        <button
          type="button"
          onClick={isRunning ? onPause : onStart}
          className="pressable flex min-h-14 w-full max-w-xs items-center justify-center rounded-full bg-[color:var(--ink)] px-8 text-base font-medium text-[color:var(--paper)]"
        >
          {isRunning ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4 fill-current" />}
          {isRunning ? 'Pause' : `Begin ${Math.round(totalSeconds / 60)}m`}
        </button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onReset}
            className="pressable inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-full px-3 text-sm text-[color:var(--ink-mute)] hover:text-[color:var(--ink)]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
          <button
            type="button"
            onClick={onSkip}
            className="pressable inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-full px-3 text-sm text-[color:var(--ink-mute)] hover:text-[color:var(--ink)]"
          >
            <SkipForward className="h-3.5 w-3.5" />
            Skip
          </button>
          <button
            type="button"
            onClick={onToggleAmbient}
            className="pressable inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-full px-3 text-sm text-[color:var(--ink-mute)] hover:text-[color:var(--ink)]"
            aria-pressed={activeAmbient !== 'none'}
          >
            {activeAmbient !== 'none' ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
            Sound
          </button>
          <button
            type="button"
            onClick={onToggleZen}
            className="pressable inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-full px-3 text-sm text-[color:var(--ink-mute)] hover:text-[color:var(--ink)]"
          >
            <Maximize2 className="h-3.5 w-3.5" />
            Zen
          </button>
        </div>
      </div>

      <footer className="mt-12 flex flex-col items-center gap-4 text-sm text-[color:var(--ink-mute)] sm:mt-16">
        <p>
          <span className="text-[color:var(--ink)]">{completedCyclesToday}</span>
          <span> / {targetCycles} waves</span>
          <span className="mx-2 text-[color:var(--line)]">·</span>
          <span className="text-[color:var(--ink)]">
            {Math.floor(todayMinutes / 60) > 0 ? `${Math.floor(todayMinutes / 60)}h ` : ''}
            {todayMinutes % 60}m
          </span>
          <span> today</span>
          <span className="mx-2 text-[color:var(--line)]">·</span>
          <button
            type="button"
            onClick={onAddDistraction}
            className="pressable min-h-11 text-[color:var(--ink-mute)] hover:text-[color:var(--ink)]"
          >
            {distractionsCount} slip{distractionsCount === 1 ? '' : 's'}
          </button>
        </p>

        <button
          type="button"
          onClick={() => setShowPresets((open) => !open)}
          className="pressable min-h-11 text-sm text-[color:var(--ink-mute)] underline-offset-4 hover:text-[color:var(--ink)] hover:underline"
        >
          {showPresets ? 'Hide lengths' : `${settings.workMinutes} / ${settings.shortBreakMinutes} min`}
        </button>

        {showPresets && (
          <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4">
            {DEFAULT_PRESETS.map((preset) => {
              const active = settings.activePresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onSelectPreset(preset)}
                  className={`pressable min-h-14 rounded-2xl border px-3 py-2 text-left ${
                    active
                      ? 'border-[color:var(--ink)] bg-[color:var(--ink)] text-[color:var(--paper)]'
                      : 'border-[color:var(--line)] text-[color:var(--ink-soft)] hover:border-[color:var(--ink-mute)]'
                  }`}
                >
                  <span className="block font-serif text-base">
                    {preset.workMinutes}/{preset.shortBreakMinutes}
                  </span>
                  <span className="mt-0.5 block text-xs opacity-70">
                    {preset.name.replace(/^Level \d+:\s*/, '').split(' (')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </footer>
    </section>
  );
};
