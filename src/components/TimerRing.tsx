import React from 'react';
import { motion } from 'motion/react';
import {
  IconPlay,
  IconPause,
  IconReset,
  IconSkip,
  IconNeuralFlow,
  IconRestVessel,
  IconSparkle,
  IconFlame,
  IconVolume,
  IconVolumeMute,
  IconZenPortal,
} from './icons';
import { SessionType, AmbientSoundType } from '../types';

interface TimerRingProps {
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
  completedCyclesCount: number;
  targetCycles: number;
  onToggleCompact: () => void;
  activeAmbient: AmbientSoundType;
  onToggleAmbient: () => void;
}

export const TimerRing: React.FC<TimerRingProps> = ({
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
  completedCyclesCount,
  targetCycles,
  onToggleCompact,
  activeAmbient,
  onToggleAmbient,
}) => {
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

  const getPhaseTheme = () => {
    switch (sessionType) {
      case 'work':
        return {
          title: 'Ultradian Wave Focus',
          subtitle: 'BRAC 90M Peak Cognitive Window',
          icon: <IconNeuralFlow size={14} className="mr-1.5" />,
        };
      case 'shortBreak':
        return {
          title: 'Light Recovery Wave',
          subtitle: 'Synapse Renewal & Muscle De-tension',
          icon: <IconRestVessel size={14} className="mr-1.5" />,
        };
      case 'longBreak':
        return {
          title: 'Deep Biological Restoration',
          subtitle: 'Full Metabolic & Neural Refresh',
          icon: <IconSparkle size={14} className="mr-1.5" />,
        };
    }
  };

  const phaseTheme = getPhaseTheme();
  const radius = 135;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Generate 60 precision tick marks for watchmaker chronometer aesthetic
  const tickMarks = Array.from({ length: 60 }).map((_, i) => {
    const angle = (i * 6 * Math.PI) / 180;
    const isMajor = i % 5 === 0;
    const innerR = isMajor ? radius - 14 : radius - 8;
    const outerR = radius - 2;

    const x1 = 170 + innerR * Math.cos(angle);
    const y1 = 170 + innerR * Math.sin(angle);
    const x2 = 170 + outerR * Math.cos(angle);
    const y2 = 170 + outerR * Math.sin(angle);

    return { id: i, x1, y1, x2, y2, isMajor };
  });

  return (
    <div className="liquid-glass-card relative flex flex-col items-center w-full max-w-xl mx-auto p-6 sm:p-10 shadow-2xl transition-all duration-500 select-none overflow-hidden group text-[color:var(--ink)]">
      {/* Living Pulsing Ambient Glow Aura */}
      {isRunning && (
        <div className="chronometer-aura" />
      )}

      {/* Top Instrument Header */}
      <div className="w-full flex items-center justify-between mb-6 z-10">
        <div className="flex items-center gap-2">
          <div className="liquid-glass-badge flex items-center px-3.5 py-1.5 rounded-full text-[11px] font-mono font-bold tracking-widest uppercase">
            {phaseTheme.icon}
            <span>{phaseTheme.title}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleAmbient}
            className={`p-2.5 rounded-2xl border text-xs transition-all duration-200 ${
              activeAmbient !== 'none'
                ? 'bg-[color:var(--ink)] text-[color:var(--paper)] border-[color:var(--ink)]'
                : 'liquid-glass-badge text-[color:var(--ink-mute)] hover:text-[color:var(--ink)]'
            }`}
            title="Toggle Soundscape"
          >
            {activeAmbient !== 'none' ? <IconVolume size={15} /> : <IconVolumeMute size={15} />}
          </button>

          <button
            type="button"
            onClick={onToggleCompact}
            className="liquid-glass-badge p-2.5 rounded-2xl text-[color:var(--ink-mute)] hover:text-[color:var(--ink)] transition-colors"
            title="Switch to Compact Timer Mode"
          >
            <IconZenPortal size={15} />
          </button>
        </div>
      </div>

      {/* Living Instrument Watchmaker Chronometer Dial */}
      <div className="relative flex items-center justify-center my-3 z-10">
        <svg className="w-72 h-72 sm:w-84 sm:h-84 transform -rotate-90 filter drop-shadow-md" viewBox="0 0 340 340">
          {/* Subtle Outer Boundary Dotted ring */}
          <circle
            cx="170"
            cy="170"
            r={radius + 12}
            className="stroke-[color:var(--line)]"
            strokeWidth="1"
            strokeDasharray="2 6"
            fill="transparent"
          />

          {/* 60 Precision Watchmaker Ticks */}
          {tickMarks.map((tick) => (
            <line
              key={tick.id}
              x1={tick.x1}
              y1={tick.y1}
              x2={tick.x2}
              y2={tick.y2}
              className={
                tick.isMajor
                  ? 'stroke-[color:var(--ink-mute)]'
                  : 'stroke-[color:var(--line)]'
              }
              strokeWidth={tick.isMajor ? 1.8 : 0.9}
            />
          ))}

          {/* Base Track */}
          <circle
            cx="170"
            cy="170"
            r={radius}
            className="stroke-[color:var(--line)]/50"
            strokeWidth="6"
            fill="transparent"
          />

          {/* Precision Arc Progress Sweep */}
          <circle
            cx="170"
            cy="170"
            r={radius}
            strokeWidth="7"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            stroke="var(--ink)"
            className="transition-all duration-500 ease-out"
          />
        </svg>

        {/* Chronometer Typography overlay */}
        <div className="absolute flex flex-col items-center justify-center text-center inset-0 pointer-events-none">
          <motion.span
            key={secondsLeft}
            initial={{ opacity: 0.9, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="clock-face text-6xl sm:text-7xl font-serif tracking-tight text-[color:var(--ink)] font-normal"
          >
            {formatTime(secondsLeft)}
          </motion.span>

          {/* Rhythm Status Pills */}
          <div className="liquid-glass-badge flex items-center gap-1.5 mt-4 px-3.5 py-1.5 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase text-[color:var(--ink-soft)]">
            <IconFlame size={12} className="text-[color:var(--ink)]" />
            <span>CYCLE {completedCyclesCount + 1} / {targetCycles}</span>
          </div>
        </div>
      </div>

      {/* Tactile Control Deck */}
      <div className="flex items-center gap-4 mt-6 z-10">
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.93 }}
          onClick={onReset}
          className="liquid-glass-badge p-3.5 rounded-2xl text-[color:var(--ink-mute)] hover:text-[color:var(--ink)] transition-colors"
          title="Reset sequence"
        >
          <IconReset size={16} />
        </motion.button>

        {isRunning ? (
          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={onPause}
            className="flex items-center justify-center px-9 py-3.5 rounded-full bg-[color:var(--ink)] text-[color:var(--paper)] font-medium text-xs tracking-wider uppercase shadow-md gap-2"
          >
            <IconPause size={15} />
            <span>Pause Wave</span>
          </motion.button>
        ) : (
          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={onStart}
            className="flex items-center justify-center px-9 py-3.5 rounded-full bg-[color:var(--ink)] text-[color:var(--paper)] font-medium text-xs tracking-wider uppercase shadow-md gap-2"
          >
            <IconPlay size={15} />
            <span>Start Wave</span>
          </motion.button>
        )}

        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.93 }}
          onClick={onSkip}
          className="liquid-glass-badge p-3.5 rounded-2xl text-[color:var(--ink-mute)] hover:text-[color:var(--ink)] transition-colors"
          title="Skip phase"
        >
          <IconSkip size={16} />
        </motion.button>
      </div>
    </div>
  );
};
