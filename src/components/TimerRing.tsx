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
    <div className="relative flex flex-col items-center w-full max-w-xl mx-auto p-6 sm:p-10 rounded-3xl bg-white/95 dark:bg-stone-900/95 border border-stone-200/90 dark:border-stone-800/90 shadow-xl transition-all duration-300 backdrop-blur-md select-none overflow-hidden">
      {/* Living Pulsing Ambient Glow Aura */}
      {isRunning && (
        <div
          className={`absolute inset-0 rounded-3xl ${phaseTheme.glowBg} blur-3xl transition-opacity duration-1000 animate-pulse pointer-events-none`}
        />
      )}

      {/* Top Instrument Header */}
      <div className="w-full flex items-center justify-between mb-6 z-10">
        <div className="flex items-center space-x-2">
          <div className={`flex items-center px-3 py-1 rounded-full border text-[10px] font-mono font-bold tracking-widest uppercase shadow-xs ${phaseTheme.badgeBg}`}>
            {phaseTheme.icon}
            <span>{phaseTheme.title}</span>
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={onToggleAmbient}
            className={`p-2 rounded-xl border text-xs transition-colors ${
              activeAmbient !== 'none'
                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/40'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 border-stone-200 dark:border-stone-700 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
            title="Toggle Soundscape"
          >
            {activeAmbient !== 'none' ? <Volume2 className="w-4 h-4 text-amber-500" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={onToggleCompact}
            className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 text-xs transition-colors"
            title="Switch to Compact Timer Mode"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Living Instrument Watchmaker Chronometer Dial */}
      <div className="relative flex items-center justify-center my-2 z-10">
        <svg className="w-72 h-72 sm:w-80 sm:h-80 transform -rotate-90" viewBox="0 0 340 340">
          {/* Subtle Outer Boundary Dotted ring */}
          <circle
            cx="170"
            cy="170"
            r={radius + 12}
            className="stroke-stone-200 dark:stroke-stone-800"
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
                  ? 'stroke-stone-400 dark:stroke-stone-500'
                  : 'stroke-stone-200 dark:stroke-stone-800'
              }
              strokeWidth={tick.isMajor ? 1.5 : 0.8}
            />
          ))}

          {/* Base Track */}
          <circle
            cx="170"
            cy="170"
            r={radius}
            className="stroke-stone-100 dark:stroke-stone-800/80"
            strokeWidth="4"
            fill="transparent"
          />

          {/* Precision Arc Progress Sweep */}
          <circle
            cx="170"
            cy="170"
            r={radius}
            strokeWidth="5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className={`transition-all duration-500 ease-out ${phaseTheme.strokeColor}`}
          />
        </svg>

        {/* Chronometer Typography overlay */}
        <div className="absolute flex flex-col items-center justify-center text-center inset-0 pointer-events-none">
          <motion.span
            key={secondsLeft}
            initial={{ opacity: 0.85, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-6xl sm:text-7xl font-serif tracking-tight text-stone-900 dark:text-stone-100 font-light"
          >
            {formatTime(secondsLeft)}
          </motion.span>

          {/* Rhythm Status Pills */}
          <div className="flex items-center space-x-2 mt-4 px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800/90 text-stone-700 dark:text-stone-300 text-[10px] font-mono font-bold tracking-widest uppercase border border-stone-200/80 dark:border-stone-700/80 shadow-xs">
            <Flame className="w-3 h-3 text-amber-500" />
            <span>CYCLE {completedCyclesCount + 1} / {targetCycles}</span>
          </div>
        </div>
      </div>

      {/* Tactile Control Deck */}
      <div className="flex items-center space-x-5 mt-6 z-10">
        <button
          onClick={onReset}
          className="p-3.5 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 transition-all active:scale-95"
          title="Reset sequence"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {isRunning ? (
          <button
            onClick={onPause}
            className="flex items-center justify-center px-10 py-4 rounded-2xl bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-stone-200 text-stone-100 dark:text-stone-900 font-bold text-xs tracking-wider uppercase shadow-lg transition-all active:scale-95 space-x-2"
          >
            <Pause className="w-4 h-4 fill-current" />
            <span>Pause Focus</span>
          </button>
        ) : (
          <button
            onClick={onStart}
            className="flex items-center justify-center px-10 py-4 rounded-2xl bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-stone-200 text-stone-100 dark:text-stone-900 font-bold text-xs tracking-wider uppercase shadow-lg transition-all active:scale-95 space-x-2"
          >
            <Play className="w-4 h-4 fill-current ml-0.5" />
            <span>Start Focus</span>
          </button>
        )}

        <button
          onClick={onSkip}
          className="p-3.5 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 transition-all active:scale-95"
          title="Skip phase"
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
