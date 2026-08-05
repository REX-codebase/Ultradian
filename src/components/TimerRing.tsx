import React from 'react';
import { motion } from 'motion/react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  AlertTriangle,
  Brain,
  Coffee,
  Sparkles,
  Tag,
  Flame,
} from 'lucide-react';
import { SessionType, CategoryTag } from '../types';

interface TimerRingProps {
  secondsLeft: number;
  totalSeconds: number;
  isRunning: boolean;
  sessionType: SessionType;
  currentTask: string;
  onTaskChange: (task: string) => void;
  category: CategoryTag;
  onCategoryChange: (cat: CategoryTag) => void;
  distractionsCount: number;
  onAddDistraction: () => void;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSkip: () => void;
  completedCyclesCount: number;
  targetCycles: number;
}

const CATEGORIES: CategoryTag[] = ['Coding', 'Writing', 'Design', 'Research', 'Strategy', 'Study', 'General'];

export const TimerRing: React.FC<TimerRingProps> = ({
  secondsLeft,
  totalSeconds,
  isRunning,
  sessionType,
  currentTask,
  onTaskChange,
  category,
  onCategoryChange,
  distractionsCount,
  onAddDistraction,
  onStart,
  onPause,
  onReset,
  onSkip,
  completedCyclesCount,
  targetCycles,
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
          title: 'Ultradian Focus',
          subtitle: 'BRAC peak cognitive window',
          strokeColor: 'currentColor',
          badgeBg: 'bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-950 border-transparent',
          icon: <Brain className="w-3.5 h-3.5 mr-1.5" />,
        };
      case 'shortBreak':
        return {
          title: 'Light Recovery',
          subtitle: 'Active synapse renewal interval',
          strokeColor: '#78716c', // stone-500
          badgeBg: 'bg-stone-200 text-stone-800 dark:bg-stone-800 dark:text-stone-200 border-stone-300 dark:border-stone-700',
          icon: <Coffee className="w-3.5 h-3.5 mr-1.5" />,
        };
      case 'longBreak':
        return {
          title: 'Deep Restoration',
          subtitle: 'Full biological rhythm refresh',
          strokeColor: '#a8a29e', // stone-400
          badgeBg: 'bg-stone-100 text-stone-700 dark:bg-stone-900 dark:text-stone-300 border-stone-200 dark:border-stone-800',
          icon: <Sparkles className="w-3.5 h-3.5 mr-1.5" />,
        };
    }
  };

  const phaseTheme = getPhaseTheme();
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center w-full max-w-lg mx-auto p-4 sm:p-8 rounded-xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800/80 shadow-xs transition-all duration-300">
      {/* Top Phase Indicator */}
      <div className="flex flex-col items-center mb-6 sm:mb-8 text-center">
        <div className={`flex items-center px-3.5 py-1 rounded-full border text-[10px] font-mono font-bold tracking-widest uppercase mb-2 ${phaseTheme.badgeBg}`}>
          {phaseTheme.icon}
          <span>{phaseTheme.title}</span>
        </div>
        <p className="font-serif italic text-sm text-stone-500 dark:text-stone-400 mt-0.5">
          {phaseTheme.subtitle}
        </p>
      </div>

      {/* Elegant Watchmaker Chrono Ring */}
      <div className="relative flex items-center justify-center my-4">
        <svg className="w-64 h-64 sm:w-72 sm:h-72 transform -rotate-90" viewBox="0 0 300 300">
          {/* Subtle Outer Boundary Dotted ring */}
          <circle
            cx="150"
            cy="150"
            r={radius + 8}
            className="stroke-stone-100 dark:stroke-stone-800/50"
            strokeWidth="1"
            strokeDasharray="2 4"
            fill="transparent"
          />

          {/* Thin Chrono Track */}
          <circle
            cx="150"
            cy="150"
            r={radius}
            className="stroke-stone-200 dark:stroke-stone-800"
            strokeWidth="1.5"
            fill="transparent"
          />

          {/* Precision Flow Progress Segment */}
          <circle
            cx="150"
            cy="150"
            r={radius}
            strokeWidth="3.5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className={`transition-all duration-500 ease-out ${
              sessionType === 'work'
                ? 'stroke-stone-900 dark:stroke-stone-100'
                : sessionType === 'shortBreak'
                ? 'stroke-stone-500 dark:stroke-stone-400'
                : 'stroke-stone-400 dark:stroke-stone-300'
            }`}
          />
        </svg>

        {/* Chronometer Typography overlay */}
        <div className="absolute flex flex-col items-center justify-center text-center inset-0 pointer-events-none">
          {/* Main Serif Timer */}
          <motion.span
            key={secondsLeft}
            initial={{ opacity: 0.85, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-5xl sm:text-6xl font-serif tracking-normal text-stone-900 dark:text-stone-100 font-light"
          >
            {formatTime(secondsLeft)}
          </motion.span>

          {/* Minimalist rhythm wave tags */}
          <div className="flex items-center space-x-1.5 mt-4 px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-[10px] font-mono font-bold tracking-widest uppercase border border-stone-200/60 dark:border-stone-700/60">
            <Flame className="w-3 h-3 text-stone-500" />
            <span>
              CYCLE {completedCyclesCount + 1} / {targetCycles}
            </span>
          </div>

          {/* Mindful Distraction Tracker */}
          {sessionType === 'work' && isRunning && (
            <button
              onClick={onAddDistraction}
              className="mt-4 pointer-events-auto flex items-center space-x-1 px-2.5 py-1 rounded-sm bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-500 dark:text-stone-400 border border-stone-200 dark:border-stone-750 text-[10px] font-medium transition-colors"
              title="Acknowledge & register distraction"
            >
              <AlertTriangle className="w-3 h-3" />
              <span>Register Distraction ({distractionsCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Input Label & Field */}
      <div className="w-full mt-8 space-y-4">
        {sessionType === 'work' ? (
          <div>
            <span className="block text-[10px] font-mono font-bold tracking-widest uppercase text-stone-400 dark:text-stone-500 mb-1.5">
              CURRENT FOCUS DOMAIN
            </span>
            <input
              type="text"
              value={currentTask}
              onChange={(e) => onTaskChange(e.target.value)}
              placeholder="Specify the singular focal objective..."
              className="w-full px-4 py-3 rounded-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-850 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:border-stone-500 dark:focus:border-stone-400 focus:bg-stone-50/50 transition-all"
            />
          </div>
        ) : (
          <div className="p-4 rounded-sm bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-800 text-center">
            <p className="text-xs font-serif italic text-stone-600 dark:text-stone-300 leading-relaxed">
              🌿 Relieve cognitive load. Focus on breath, hydration, or muscular relaxation.
            </p>
          </div>
        )}

        {/* Compact Domain Taxonomy */}
        {sessionType === 'work' && (
          <div className="flex items-center space-x-2 overflow-x-auto py-1 scrollbar-none">
            <Tag className="w-3 h-3 text-stone-400 shrink-0" />
            <div className="flex space-x-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => onCategoryChange(cat)}
                  className={`px-3 py-1 rounded-full text-[10px] font-semibold tracking-wide transition-all duration-150 ${
                    category === cat
                      ? 'bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 font-bold'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 hover:bg-stone-200/60 dark:hover:bg-stone-700/60'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Tactical Action Deck */}
      <div className="flex items-center space-x-4 mt-8 w-full justify-center">
        {/* Reset */}
        <button
          onClick={onReset}
          className="p-3.5 rounded-full border border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-850 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
          title="Reset sequence"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Enter/Pause Wave */}
        {isRunning ? (
          <button
            onClick={onPause}
            className="flex items-center justify-center px-10 py-3.5 rounded-full bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-stone-200 text-stone-100 dark:text-stone-900 font-semibold text-xs tracking-wider uppercase shadow-xs transition-all duration-200 space-x-2"
          >
            <Pause className="w-3.5 h-3.5 fill-current" />
            <span>Pause Focus</span>
          </button>
        ) : (
          <button
            onClick={onStart}
            className="flex items-center justify-center px-10 py-3.5 rounded-full bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-stone-200 text-stone-100 dark:text-stone-900 font-semibold text-xs tracking-wider uppercase shadow-xs transition-all duration-200 space-x-2"
          >
            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
            <span>Start Focus</span>
          </button>
        )}

        {/* Skip */}
        <button
          onClick={onSkip}
          className="p-3.5 rounded-full border border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-850 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
          title="Skip phase"
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
