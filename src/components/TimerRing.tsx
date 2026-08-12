import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  AlertTriangle,
  Brain,
  Coffee,
  Sparkles,
  Flame,
  Minimize2,
  Volume2,
  VolumeX,
} from 'lucide-react';
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
          badgeBg: 'bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 border-transparent',
          strokeColor: 'stroke-stone-900 dark:stroke-stone-100',
          glowBg: 'bg-amber-500/10 dark:bg-amber-400/10',
          icon: <Brain className="w-3.5 h-3.5 mr-1.5" />,
        };
      case 'shortBreak':
        return {
          title: 'Light Recovery Wave',
          subtitle: 'Synapse Renewal & Muscle De-tension',
          badgeBg: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border-amber-300 dark:border-amber-800',
          strokeColor: 'stroke-amber-600 dark:stroke-amber-400',
          glowBg: 'bg-amber-500/15',
          icon: <Coffee className="w-3.5 h-3.5 mr-1.5" />,
        };
      case 'longBreak':
        return {
          title: 'Deep Biological Restoration',
          subtitle: 'Full Metabolic & Neural Refresh',
          badgeBg: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800',
          strokeColor: 'stroke-emerald-600 dark:stroke-emerald-400',
          glowBg: 'bg-emerald-500/15',
          icon: <Sparkles className="w-3.5 h-3.5 mr-1.5" />,
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
    <div className="relative flex flex-col items-center w-full max-w-xl mx-auto p-6 sm:p-10 rounded-3xl bg-white/90 dark:bg-stone-900/90 border border-stone-200/90 dark:border-stone-800/90 shadow-2xl backdrop-blur-xl transition-all duration-500 select-none overflow-hidden group">
      {/* Living Pulsing Ambient Glow Aura */}
      {isRunning && (
        <div
          className={`absolute -inset-10 rounded-[40px] ${phaseTheme.glowBg} blur-3xl transition-opacity duration-1000 animate-pulse pointer-events-none opacity-80`}
        />
      )}

      {/* Top Instrument Header */}
      <div className="w-full flex items-center justify-between mb-6 z-10">
        <div className="flex items-center space-x-2">
          <div className={`flex items-center px-3.5 py-1.5 rounded-full border text-[11px] font-mono font-bold tracking-widest uppercase shadow-xs transition-transform duration-300 hover:scale-105 ${phaseTheme.badgeBg}`}>
            {phaseTheme.icon}
            <span>{phaseTheme.title}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onToggleAmbient}
            className={`p-2.5 rounded-xl border text-xs transition-all duration-300 active:scale-95 ${
              activeAmbient !== 'none'
                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/40 shadow-xs glow-amber'
                : 'bg-stone-100 dark:bg-stone-800/80 text-stone-500 dark:text-stone-400 border-stone-200/80 dark:border-stone-700/80 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
            title="Toggle Soundscape"
          >
            {activeAmbient !== 'none' ? <Volume2 className="w-4 h-4 text-amber-500 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={onToggleCompact}
            className="p-2.5 rounded-xl bg-stone-100 dark:bg-stone-800/80 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 border border-stone-200/80 dark:border-stone-700/80 text-xs transition-all duration-300 active:scale-95"
            title="Switch to Compact Timer Mode"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Living Instrument Watchmaker Chronometer Dial */}
      <div className="relative flex items-center justify-center my-3 z-10">
        <svg className="w-72 h-72 sm:w-84 sm:h-84 transform -rotate-90 filter drop-shadow-md" viewBox="0 0 340 340">
          <defs>
            <linearGradient id="workGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="50%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>
            <linearGradient id="shortBreakGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
            <linearGradient id="longBreakGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
            <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Subtle Outer Boundary Dotted ring */}
          <circle
            cx="170"
            cy="170"
            r={radius + 12}
            className="stroke-stone-300/60 dark:stroke-stone-700/50"
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
                  ? 'stroke-stone-400 dark:stroke-stone-400'
                  : 'stroke-stone-200 dark:stroke-stone-800'
              }
              strokeWidth={tick.isMajor ? 1.8 : 0.9}
            />
          ))}

          {/* Base Track */}
          <circle
            cx="170"
            cy="170"
            r={radius}
            className="stroke-stone-100 dark:stroke-stone-800/80"
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
            filter="url(#glowFilter)"
            stroke={
              sessionType === 'work'
                ? 'url(#workGradient)'
                : sessionType === 'shortBreak'
                ? 'url(#shortBreakGradient)'
                : 'url(#longBreakGradient)'
            }
            className="transition-all duration-500 ease-out"
          />
        </svg>

        {/* Chronometer Typography overlay */}
        <div className="absolute flex flex-col items-center justify-center text-center inset-0 pointer-events-none">
          <motion.span
            key={secondsLeft}
            initial={{ opacity: 0.9, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-6xl sm:text-7xl font-serif tracking-tight text-stone-900 dark:text-stone-100 font-normal drop-shadow-xs"
          >
            {formatTime(secondsLeft)}
          </motion.span>

          {/* Rhythm Status Pills */}
          <div className="flex items-center space-x-2 mt-4 px-3.5 py-1.5 rounded-full bg-stone-100/90 dark:bg-stone-800/90 text-stone-700 dark:text-stone-300 text-[10px] font-mono font-bold tracking-widest uppercase border border-stone-200 dark:border-stone-700 shadow-xs backdrop-blur-sm">
            <Flame className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            <span>CYCLE {completedCyclesCount + 1} / {targetCycles}</span>
          </div>
        </div>
      </div>

      {/* Tactile Control Deck */}
      <div className="flex items-center space-x-5 mt-6 z-10">
        <button
          onClick={onReset}
          className="p-3.5 rounded-2xl bg-stone-100 dark:bg-stone-800/80 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200 dark:hover:bg-stone-700 border border-stone-200/80 dark:border-stone-700/80 transition-all duration-200 active:scale-95 hover:shadow-md"
          title="Reset sequence"
        >
          <RotateCcw className="w-4.5 h-4.5" />
        </button>

        {isRunning ? (
          <button
            onClick={onPause}
            className="flex items-center justify-center px-10 py-4 rounded-2xl bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-stone-200 text-stone-100 dark:text-stone-900 font-bold text-xs tracking-wider uppercase shadow-xl hover:shadow-2xl transition-all duration-200 active:scale-95 space-x-2.5 group/btn"
          >
            <Pause className="w-4 h-4 fill-current transition-transform group-hover/btn:scale-110" />
            <span>Pause Focus</span>
          </button>
        ) : (
          <button
            onClick={onStart}
            className="flex items-center justify-center px-10 py-4 rounded-2xl bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-stone-200 text-stone-100 dark:text-stone-900 font-bold text-xs tracking-wider uppercase shadow-xl hover:shadow-2xl transition-all duration-200 active:scale-95 space-x-2.5 group/btn glow-amber"
          >
            <Play className="w-4 h-4 fill-current ml-0.5 transition-transform group-hover/btn:scale-110" />
            <span>Start Focus</span>
          </button>
        )}

        <button
          onClick={onSkip}
          className="p-3.5 rounded-2xl bg-stone-100 dark:bg-stone-800/80 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200 dark:hover:bg-stone-700 border border-stone-200/80 dark:border-stone-700/80 transition-all duration-200 active:scale-95 hover:shadow-md"
          title="Skip phase"
        >
          <SkipForward className="w-4.5 h-4.5" />
        </button>
      </div>
    </div>
  );
};

