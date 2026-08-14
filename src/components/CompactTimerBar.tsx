import React from 'react';
import { motion } from 'motion/react';
import {
  IconPlay,
  IconPause,
  IconReset,
  IconSkip,
  IconZenPortal,
  IconVolume,
  IconVolumeMute,
  IconFlame,
  IconNeuralFlow,
  IconRestVessel,
  IconSparkle,
} from './icons';
import { SessionType, AmbientSoundType, CategoryTag } from '../types';

interface CompactTimerBarProps {
  secondsLeft: number;
  totalSeconds: number;
  isRunning: boolean;
  sessionType: SessionType;
  currentTask: string;
  category: CategoryTag;
  completedCyclesCount: number;
  targetCycles: number;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSkip: () => void;
  onExpand: () => void;
  activeAmbient: AmbientSoundType;
  onToggleAmbient: () => void;
}

export const CompactTimerBar: React.FC<CompactTimerBarProps> = ({
  secondsLeft,
  totalSeconds,
  isRunning,
  sessionType,
  currentTask,
  category,
  completedCyclesCount,
  targetCycles,
  onStart,
  onPause,
  onReset,
  onSkip,
  onExpand,
  activeAmbient,
  onToggleAmbient,
}) => {
  const progress = Math.max(0, Math.min(100, ((totalSeconds - secondsLeft) / totalSeconds) * 100));

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="liquid-glass-card w-full max-w-2xl mx-auto p-3.5 sm:p-4 shadow-xl flex items-center justify-between gap-3 select-none text-[color:var(--ink)]"
    >
      {/* Left: Mini Ring + Timer Readout */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="relative w-11 h-11 flex items-center justify-center shrink-0">
          <svg className="w-11 h-11 transform -rotate-90" viewBox="0 0 44 44">
            <circle
              cx="22"
              cy="22"
              r={radius}
              className="stroke-[color:var(--line)]"
              strokeWidth="3"
              fill="transparent"
            />
            <circle
              cx="22"
              cy="22"
              r={radius}
              className="stroke-[color:var(--ink)]"
              strokeWidth="3"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-[10px]">
            {sessionType === 'work' ? (
              <IconNeuralFlow size={14} className="text-[color:var(--ink)]" />
            ) : sessionType === 'shortBreak' ? (
              <IconRestVessel size={14} className="text-[color:var(--ink)]" />
            ) : (
              <IconSparkle size={14} className="text-[color:var(--ink)]" />
            )}
          </div>
        </div>

        <div>
          <span className="clock-face font-serif text-2xl sm:text-3xl font-medium tracking-tight text-[color:var(--ink)] block leading-none">
            {formatTime(secondsLeft)}
          </span>
          <span className="text-[9px] font-mono font-bold tracking-wider uppercase text-[color:var(--ink-mute)] flex items-center gap-1 mt-1">
            <IconFlame size={11} className="text-[color:var(--ink)]" />
            <span>CYCLE {completedCyclesCount + 1}/{targetCycles}</span>
          </span>
        </div>
      </div>

      {/* Center: Active Task Banner */}
      <div className="hidden sm:block flex-1 min-w-0 px-2">
        <div className="flex items-center gap-2">
          <span className="liquid-glass-badge px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider text-[color:var(--ink-soft)]">
            {category}
          </span>
          <p className="text-xs font-serif italic text-[color:var(--ink-soft)] truncate">
            {currentTask || 'Focus session objective'}
          </p>
        </div>
      </div>

      {/* Right: Quick Controls */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={onToggleAmbient}
          className={`p-2 rounded-full border text-xs transition-colors ${
            activeAmbient !== 'none'
              ? 'bg-[color:var(--ink)] text-[color:var(--paper)] border-[color:var(--ink)]'
              : 'liquid-glass-badge text-[color:var(--ink-mute)] hover:text-[color:var(--ink)]'
          }`}
          title="Toggle Soundscape"
        >
          {activeAmbient !== 'none' ? <IconVolume size={14} /> : <IconVolumeMute size={14} />}
        </button>

        {isRunning ? (
          <button
            type="button"
            onClick={onPause}
            className="px-3.5 py-1.5 rounded-full bg-[color:var(--ink)] text-[color:var(--paper)] font-medium text-xs flex items-center gap-1 hover:opacity-90 shadow-xs"
          >
            <IconPause size={13} />
            <span className="hidden xs:inline">Pause</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onStart}
            className="px-3.5 py-1.5 rounded-full bg-[color:var(--ink)] text-[color:var(--paper)] font-medium text-xs flex items-center gap-1 hover:opacity-90 shadow-xs"
          >
            <IconPlay size={13} />
            <span className="hidden xs:inline">Start</span>
          </button>
        )}

        <button
          type="button"
          onClick={onReset}
          className="p-2 rounded-full liquid-glass-badge text-[color:var(--ink-mute)] hover:text-[color:var(--ink)]"
          title="Reset"
        >
          <IconReset size={14} />
        </button>

        <button
          type="button"
          onClick={onSkip}
          className="p-2 rounded-full liquid-glass-badge text-[color:var(--ink-mute)] hover:text-[color:var(--ink)]"
          title="Skip"
        >
          <IconSkip size={14} />
        </button>

        <button
          type="button"
          onClick={onExpand}
          className="p-2 rounded-full liquid-glass-badge text-[color:var(--ink)] hover:text-[color:var(--ink)] ml-0.5"
          title="Expand View"
        >
          <IconZenPortal size={14} />
        </button>
      </div>
    </motion.div>
  );
};
