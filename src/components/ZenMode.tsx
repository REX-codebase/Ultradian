import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  IconMinimize,
  IconPlay,
  IconPause,
  IconReset,
  IconSkip,
  IconNeuralFlow,
  IconVolume,
  IconVolumeMute,
  IconWind,
  IconSparkle,
  IconFocusTarget,
} from './icons';
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
  { label: 'Inhale deeply...', duration: 4 },
  { label: 'Hold flow state...', duration: 4 },
  { label: 'Exhale slowly...', duration: 4 },
  { label: 'Rest & Focus...', duration: 2 },
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

  const radius = 145;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Generate 60 watchmaker ticks for Living Instrument in Zen Mode
  const tickMarks = Array.from({ length: 60 }).map((_, i) => {
    const angle = (i * 6 * Math.PI) / 180;
    const isMajor = i % 5 === 0;
    const innerR = isMajor ? radius - 14 : radius - 8;
    const outerR = radius - 2;

    const x1 = 180 + innerR * Math.cos(angle);
    const y1 = 180 + innerR * Math.sin(angle);
    const x2 = 180 + outerR * Math.cos(angle);
    const y2 = 180 + outerR * Math.sin(angle);

    return { id: i, x1, y1, x2, y2, isMajor };
  });

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between p-6 sm:p-10 bg-stone-950 text-stone-100 select-none overflow-hidden backdrop-blur-2xl">
      {/* Background Living Ambient Halo */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-stone-900/60 via-stone-950 to-stone-950 pointer-events-none" />
      {isRunning && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] rounded-full bg-amber-500/10 blur-3xl animate-pulse pointer-events-none" />
      )}

      {/* Top Header Bar */}
      <div className="relative z-10 w-full max-w-5xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-stone-900 to-stone-800 text-amber-400 flex items-center justify-center border border-stone-800 shadow-md">
            <IconNeuralFlow size={20} />
          </div>
          <div>
            <h2 className="font-serif italic text-base text-stone-200">
              Zen Shield Mode
            </h2>
            <p className="text-[10px] font-mono font-bold tracking-wider uppercase text-stone-500">
              {sessionType === 'work' ? 'Active Focus Wave' : 'Recovery Active'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            onClick={() => setShowBreathing(!showBreathing)}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-full border text-xs font-medium transition-all duration-200 cursor-pointer shadow-xs ${
              showBreathing
                ? 'bg-stone-100 text-stone-900 border-transparent shadow-md'
                : 'bg-stone-900/80 text-stone-400 border-stone-800 hover:text-stone-100 hover:bg-stone-800'
            }`}
          >
            <IconWind size={14} />
            <span className="hidden sm:inline">Breathing Guide</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            onClick={() => onSelectAmbient(activeAmbient === 'alpha_binaural' ? 'none' : 'alpha_binaural')}
            className={`p-2.5 rounded-full border transition-all duration-200 cursor-pointer shadow-xs ${
              activeAmbient !== 'none'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-xs glow-amber'
                : 'bg-stone-900/80 text-stone-400 border-stone-800 hover:text-stone-100 hover:bg-stone-800'
            }`}
            title="Toggle Soundscape"
          >
            {activeAmbient !== 'none' ? <IconVolume size={16} className="text-amber-400 animate-pulse" /> : <IconVolumeMute size={16} />}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            onClick={onExit}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-full bg-stone-900/90 hover:bg-stone-800 text-stone-200 border border-stone-800 text-xs font-medium transition-all duration-200 cursor-pointer shadow-xs"
          >
            <IconMinimize size={14} />
            <span className="hidden sm:inline">Exit Zen</span>
          </motion.button>
        </div>
      </div>

      {/* Persistent Task Display Anchored at Top Center */}
      <div className="relative z-10 my-4 w-full max-w-xl">
        <div className="px-5 py-3 rounded-2xl bg-stone-900/90 border border-stone-800/90 text-center flex items-center justify-between gap-3 shadow-xl backdrop-blur-xl">
          <div className="flex items-center space-x-2.5 min-w-0">
            <IconFocusTarget size={16} className="text-amber-400 shrink-0" />
            <span className="text-xs text-stone-400 font-mono font-bold uppercase shrink-0">FOCUS GOAL:</span>
            <span className="font-serif italic text-sm text-stone-100 truncate">
              {currentTask || 'Singular focal objective'}
            </span>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            onClick={onAddDistraction}
            className="px-3 py-1 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 text-[10px] font-mono font-bold uppercase shrink-0 transition-all cursor-pointer shadow-xs"
          >
            + Distraction ({distractionsCount})
          </motion.button>
        </div>
      </div>

      {/* Center Piece Living Instrument Chrono Dial */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto text-center max-w-2xl w-full">
        {/* Breathing Guide Overlay */}
        <AnimatePresence mode="wait">
          {showBreathing && (
            <motion.div
              key={breathIdx}
              initial={{ opacity: 0, y: 10, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.94 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="absolute -top-28 flex flex-col items-center"
            >
              <div className="w-12 h-12 rounded-full border border-amber-500/40 flex items-center justify-center bg-stone-900/90 mb-2 animate-pulse glow-amber">
                <IconSparkle size={20} className="text-amber-400" />
              </div>
              <p className="font-serif italic text-base text-stone-200">
                {BREATHING_PHASES[breathIdx].label}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Watchmaker Dial */}
        <div className="relative flex items-center justify-center">
          <svg className="w-72 h-72 sm:w-88 sm:h-88 transform -rotate-90 filter drop-shadow-lg" viewBox="0 0 360 360">
            <circle
              cx="180"
              cy="180"
              r={radius + 12}
              className="stroke-stone-900/80"
              strokeWidth="1"
              strokeDasharray="2 6"
              fill="transparent"
            />

            {/* Tick Marks */}
            {tickMarks.map((tick) => (
              <line
                key={tick.id}
                x1={tick.x1}
                y1={tick.y1}
                x2={tick.x2}
                y2={tick.y2}
                className={tick.isMajor ? 'stroke-stone-600' : 'stroke-stone-900'}
                strokeWidth={tick.isMajor ? 1.5 : 0.8}
              />
            ))}

            <circle
              cx="180"
              cy="180"
              r={radius}
              className="stroke-stone-900/90"
              strokeWidth="4"
              fill="transparent"
            />

            <circle
              cx="180"
              cy="180"
              r={radius}
              stroke={sessionType === 'work' ? '#f59e0b' : '#10b981'}
              strokeWidth="5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-500 ease-out filter drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]"
            />
          </svg>

          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-6xl sm:text-7xl font-serif text-white font-light tracking-tight drop-shadow-md">
              {formatTime(secondsLeft)}
            </span>
            <span className="text-[9px] font-mono uppercase tracking-widest text-amber-500/90 font-bold mt-3 px-3.5 py-1 rounded-full bg-stone-900/90 border border-stone-800 shadow-xs">
              {sessionType === 'work' ? 'ULTRADIAN FOCUS WAVE' : 'RECOVERY BREAK'}
            </span>
          </div>
        </div>
      </div>

      {/* Tactile Bottom Action Bar */}
      <div className="relative z-10 w-full max-w-xs flex items-center justify-between">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          onClick={onReset}
          className="p-3.5 rounded-full bg-stone-900 border border-stone-800 text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-all duration-200 cursor-pointer shadow-xs"
        >
          <IconReset size={16} />
        </motion.button>

        {isRunning ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 450, damping: 25 }}
            onClick={onPause}
            className="flex items-center space-x-2 px-8 py-3.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-900 font-bold text-xs tracking-wider uppercase shadow-xl transition-all duration-200 cursor-pointer"
          >
            <IconPause size={16} />
            <span>Pause</span>
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 450, damping: 25 }}
            onClick={onStart}
            className="flex items-center space-x-2 px-8 py-3.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-900 font-bold text-xs tracking-wider uppercase shadow-xl transition-all duration-200 cursor-pointer glow-amber"
          >
            <IconPlay size={16} />
            <span>Resume</span>
          </motion.button>
        )}

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          onClick={onSkip}
          className="p-3.5 rounded-full bg-stone-900 border border-stone-800 text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-all duration-200 cursor-pointer shadow-xs"
        >
          <IconSkip size={16} />
        </motion.button>
      </div>
    </div>
  );
};

