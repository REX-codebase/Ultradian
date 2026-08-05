import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Minimize2,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  AlertTriangle,
  Brain,
  Volume2,
  VolumeX,
  Wind,
  Sparkles,
} from 'lucide-react';
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
  { label: 'Inhale deeply', duration: 4 },
  { label: 'Hold flow', duration: 4 },
  { label: 'Exhale slowly', duration: 4 },
  { label: 'Rest & Focus', duration: 2 },
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

  const radius = 140;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between p-8 sm:p-12 bg-stone-950 text-stone-100 select-none overflow-hidden">
      {/* Top Navigation Bar */}
      <div className="relative z-10 w-full max-w-5xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-sm bg-stone-900 text-stone-300 flex items-center justify-center border border-stone-800">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-serif italic text-sm text-stone-300">
              Zen Shield
            </h2>
            <p className="text-[10px] font-bold tracking-wider uppercase text-stone-500">
              {sessionType === 'work' ? 'Active wave focus' : 'Recovery active'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2.5">
          {/* Breathing Guide Toggle */}
          <button
            onClick={() => setShowBreathing(!showBreathing)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-sm border text-xs font-semibold transition-all duration-200 ${
              showBreathing
                ? 'bg-stone-100 text-stone-900 border-transparent'
                : 'bg-stone-900 text-stone-400 border-stone-800 hover:text-stone-100'
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Breathing Guide</span>
            <span className="sm:hidden">Breath</span>
          </button>

          {/* Quick Audio Toggle */}
          <button
            onClick={() => onSelectAmbient(activeAmbient === 'alpha_binaural' ? 'none' : 'alpha_binaural')}
            className={`p-2 sm:p-2.5 rounded-sm border transition-all duration-200 ${
              activeAmbient !== 'none'
                ? 'bg-stone-100 text-stone-900 border-transparent'
                : 'bg-stone-900 text-stone-400 border-stone-800 hover:text-stone-100'
            }`}
            title="Toggle Alpha Binaural Soundscape"
          >
            {activeAmbient !== 'none' ? <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>

          {/* Close / Exit Button */}
          <button
            onClick={onExit}
            className="flex items-center space-x-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-sm bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-800 text-xs font-semibold transition-all duration-200"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exit Zen</span>
            <span className="sm:hidden">Exit</span>
          </button>
        </div>
      </div>

      {/* Primary Immersive Centerpiece */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto text-center max-w-2xl w-full">
        {/* Breathing Rhythm Overlay */}
        <AnimatePresence mode="wait">
          {showBreathing && (
            <motion.div
              key={breathIdx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute -top-36 flex flex-col items-center"
            >
              <div className="w-16 h-16 rounded-full border border-stone-800 flex items-center justify-center bg-stone-900/50 mb-3 animate-pulse">
                <Sparkles className="w-4 h-4 text-stone-400" />
              </div>
              <p className="font-serif italic text-base text-stone-300">
                {BREATHING_PHASES[breathIdx].label}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Task Focus Banner */}
        {currentTask && (
          <div className="mb-8 px-6 py-2.5 rounded-sm bg-stone-900 border border-stone-800 text-stone-300 text-xs font-medium tracking-wide max-w-md">
            Focus Wave Goal: <span className="text-white italic font-serif ml-1">{currentTask}</span>
          </div>
        )}

        {/* Minimal Watchmaker Dial */}
        <div className="relative flex items-center justify-center">
          <svg className="w-72 h-72 sm:w-80 sm:h-80 transform -rotate-90" viewBox="0 0 360 360">
            {/* Outer dotted dial limit */}
            <circle
              cx="180"
              cy="180"
              r={radius + 8}
              className="stroke-stone-900"
              strokeWidth="1"
              strokeDasharray="2 6"
              fill="transparent"
            />
            {/* Main background dial circle */}
            <circle
              cx="180"
              cy="180"
              r={radius}
              className="stroke-stone-900"
              strokeWidth="1"
              fill="transparent"
            />
            {/* Active flow progress arc */}
            <circle
              cx="180"
              cy="180"
              r={radius}
              stroke={sessionType === 'work' ? '#f5f5f4' : '#a8a29e'} // stone-100 vs stone-400
              strokeWidth="2.5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-500 ease-out"
            />
          </svg>

          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-6xl sm:text-7xl font-serif text-white font-light tracking-tight">
              {formatTime(secondsLeft)}
            </span>
            <span className="text-[9px] uppercase tracking-widest text-stone-500 font-bold mt-3">
              {sessionType === 'work' ? 'Ultradian Flow Wave' : 'Recovery Period'}
            </span>
          </div>
        </div>

        {/* Quiet distraction tracker */}
        {sessionType === 'work' && (
          <button
            onClick={onAddDistraction}
            className="mt-8 flex items-center space-x-1.5 px-3 py-1.5 rounded-sm bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-400 hover:text-stone-200 text-[10px] font-semibold tracking-wider uppercase transition-colors duration-200"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-stone-500" />
            <span>Logged interruptions: {distractionsCount}</span>
          </button>
        )}
      </div>

      {/* Immersive Tactical Actions */}
      <div className="relative z-10 w-full max-w-xs flex items-center justify-between">
        <button
          onClick={onReset}
          className="p-3.5 rounded-full bg-stone-900 border border-stone-800 text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors duration-200"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {isRunning ? (
          <button
            onClick={onPause}
            className="flex items-center space-x-2 px-8 py-3.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-900 font-bold text-xs tracking-wider uppercase transition-all duration-200"
          >
            <Pause className="w-4 h-4 fill-current" />
            <span>Pause</span>
          </button>
        ) : (
          <button
            onClick={onStart}
            className="flex items-center space-x-2 px-8 py-3.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-900 font-bold text-xs tracking-wider uppercase transition-all duration-200"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Resume</span>
          </button>
        )}

        <button
          onClick={onSkip}
          className="p-3.5 rounded-full bg-stone-900 border border-stone-800 text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors duration-200"
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
