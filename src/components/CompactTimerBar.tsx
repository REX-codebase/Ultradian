import React from 'react';
import { motion } from 'motion/react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Maximize2,
  Volume2,
  VolumeX,
  Flame,
  Brain,
  Coffee,
  Sparkles,
} from 'lucide-react';
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
      className="w-full max-w-2xl mx-auto p-3.5 sm:p-4 rounded-2xl bg-stone-900 text-stone-100 border border-stone-800 shadow-xl flex items-center justify-between gap-3 select-none"
    >
      {/* Left: Mini Ring + Timer Readout */}
      <div className="flex items-center space-x-3 shrink-0">
        <div className="relative w-11 h-11 flex items-center justify-center shrink-0">
          <svg className="w-11 h-11 transform -rotate-90" viewBox="0 0 44 44">
            <circle
              cx="22"
              cy="22"
              r={radius}
              className="stroke-stone-800"
              strokeWidth="3"
              fill="transparent"
            />
            <circle
              cx="22"
              cy="22"
              r={radius}
              className={
                sessionType === 'work'
                  ? 'stroke-stone-100'
                  : sessionType === 'shortBreak'
                  ? 'stroke-amber-400'
                  : 'stroke-emerald-400'
              }
              strokeWidth="3"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-[10px]">
            {sessionType === 'work' ? (
              <Brain className="w-3.5 h-3.5 text-stone-300" />
            ) : sessionType === 'shortBreak' ? (
              <Coffee className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            )}
          </div>
        </div>

        <div>
          <span className="font-serif text-2xl sm:text-3xl font-light tracking-tight text-white block leading-none">
            {formatTime(secondsLeft)}
          </span>
          <span className="text-[9px] font-mono font-bold tracking-wider uppercase text-stone-400 flex items-center space-x-1 mt-1">
            <Flame className="w-2.5 h-2.5 text-amber-500" />
            <span>CYCLE {completedCyclesCount + 1}/{targetCycles}</span>
          </span>
        </div>
      </div>

      {/* Center: Active Task Banner */}
      <div className="hidden sm:block flex-1 min-w-0 px-2">
        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 rounded bg-stone-800 text-[9px] font-bold uppercase tracking-wider text-stone-300">
            {category}
          </span>
          <p className="text-xs font-serif italic text-stone-200 truncate">
            {currentTask || 'Focus session objective'}
          </p>
        </div>
      </div>

      {/* Right: Quick Controls */}
      <div className="flex items-center space-x-1.5 shrink-0">
        <button
          onClick={onToggleAmbient}
          className={`p-2 rounded-lg border text-xs transition-colors ${
            activeAmbient !== 'none'
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-stone-800 text-stone-400 border-stone-700 hover:text-stone-200'
          }`}
          title="Toggle Soundscape"
        >
          {activeAmbient !== 'none' ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>

        {isRunning ? (
          <button
            onClick={onPause}
            className="px-3.5 py-2 rounded-xl bg-stone-100 text-stone-900 font-bold text-xs flex items-center space-x-1 hover:bg-stone-200"
          >
            <Pause className="w-3.5 h-3.5 fill-current" />
            <span className="hidden xs:inline">PAUSE</span>
          </button>
        ) : (
          <button
            onClick={onStart}
            className="px-3.5 py-2 rounded-xl bg-stone-100 text-stone-900 font-bold text-xs flex items-center space-x-1 hover:bg-stone-200"
          >
            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
            <span className="hidden xs:inline">START</span>
          </button>
        )}

        <button
          onClick={onReset}
          className="p-2 rounded-lg bg-stone-800 text-stone-400 hover:text-stone-200 border border-stone-700"
          title="Reset"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onSkip}
          className="p-2 rounded-lg bg-stone-800 text-stone-400 hover:text-stone-200 border border-stone-700"
          title="Skip"
        >
          <SkipForward className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onExpand}
          className="p-2 rounded-lg bg-stone-800 text-stone-200 hover:bg-stone-700 border border-stone-700 ml-1"
          title="Expand Living Instrument"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
};
