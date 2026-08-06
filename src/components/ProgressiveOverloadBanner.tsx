import React, { useState } from 'react';
import { ShieldAlert, Zap, Trophy, Lock, CheckCircle2, Award, ChevronRight, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import { playMilestoneSound } from '../utils/audio';

interface ProgressiveOverloadBannerProps {
  staminaLevel: 1 | 2 | 3;
  level1SessionsCompleted: number;
  level2SessionsCompleted: number;
  level3SessionsCompleted: number;
  onSelectLevelPreset: (level: 1 | 2 | 3) => void;
}

export const LEVEL_INFO = {
  1: {
    title: 'Level 1: Apprentice',
    badge: 'Apprentice',
    workMins: 45,
    breakMins: 10,
    requiredSessions: 5,
    description: '45 min work / 10 min break. Gentle onboarding to build baseline focus stamina.',
    icon: '🌱',
    color: 'from-amber-500/10 via-orange-500/10 to-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400',
  },
  2: {
    title: 'Level 2: Adept',
    badge: 'Adept',
    workMins: 60,
    breakMins: 15,
    requiredSessions: 5,
    description: '60 min work / 15 min break. High cognitive throughput for intense task bursts.',
    icon: '⚡',
    color: 'from-cyan-500/10 via-blue-500/10 to-cyan-500/10 border-cyan-500/30 text-cyan-600 dark:text-cyan-400',
  },
  3: {
    title: 'Level 3: Ultradian Master',
    badge: 'Ultradian Master',
    workMins: 90,
    breakMins: 20,
    requiredSessions: 5,
    description: '90 min work / 20 min break. Full Kleitman BRAC bio-rhythm mastery.',
    icon: '👑',
    color: 'from-emerald-500/10 via-teal-500/10 to-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
  },
};

export const ProgressiveOverloadBanner: React.FC<ProgressiveOverloadBannerProps> = ({
  staminaLevel,
  level1SessionsCompleted,
  level2SessionsCompleted,
  level3SessionsCompleted,
  onSelectLevelPreset,
}) => {
  const currentLevelData = LEVEL_INFO[staminaLevel];
  const sessionsInCurrentLevel =
    staminaLevel === 1
      ? level1SessionsCompleted
      : staminaLevel === 2
      ? level2SessionsCompleted
      : level3SessionsCompleted;

  const targetSessions = 5;
  const progressPercent = Math.min(100, Math.round((sessionsInCurrentLevel / targetSessions) * 100));

  const nextLevelTitle =
    staminaLevel === 1 ? 'Level 2 (Adept)' : staminaLevel === 2 ? 'Level 3 (Ultradian Master)' : 'Max Level Reached!';

  return (
    <div className="w-full p-5 sm:p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800/80 shadow-sm text-stone-900 dark:text-stone-100 transition-colors duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 flex items-center justify-center font-bold text-lg shadow-sm">
            <span>{currentLevelData.icon}</span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                Progressive Overload
              </span>
              <span className="text-xs font-bold text-stone-500 dark:text-stone-400">
                Level {staminaLevel} of 3
              </span>
            </div>
            <h3 className="font-serif text-lg font-medium text-stone-950 dark:text-stone-50 mt-0.5 flex items-center gap-2">
              {currentLevelData.title}
            </h3>
          </div>
        </div>

        {/* Level Switcher Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[1, 2, 3].map((lvl) => {
            const isUnlocked = lvl <= staminaLevel;
            const levelObj = LEVEL_INFO[lvl as 1 | 2 | 3];
            return (
              <button
                key={lvl}
                onClick={() => isUnlocked && onSelectLevelPreset(lvl as 1 | 2 | 3)}
                disabled={!isUnlocked}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  lvl === staminaLevel
                    ? 'bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 border-stone-900 dark:border-stone-100 shadow-xs'
                    : isUnlocked
                    ? 'bg-stone-50 dark:bg-stone-800/50 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:bg-stone-100'
                    : 'bg-stone-100/50 dark:bg-stone-900/30 text-stone-400 dark:text-stone-600 border-stone-200/50 dark:border-stone-800/50 cursor-not-allowed'
                }`}
              >
                <span>{levelObj.icon}</span>
                <span>Lvl {lvl}</span>
                {!isUnlocked && <Lock className="w-3 h-3 text-stone-400 ml-0.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Progress Bar & Endowed Progress Effect */}
      <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200/60 dark:border-stone-800/60 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-stone-700 dark:text-stone-300">
            {staminaLevel === 3 ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Ultradian Master Unlocked! 90/20 Flow Peak
              </span>
            ) : (
              <span>
                <strong className="text-stone-900 dark:text-white">{sessionsInCurrentLevel}/{targetSessions} sessions</strong> completed to unlock <strong className="text-stone-900 dark:text-white">{nextLevelTitle}</strong>
              </span>
            )}
          </span>
          <span className="font-bold text-stone-400 dark:text-stone-500">
            {progressPercent}%
          </span>
        </div>

        {/* Bar */}
        <div className="w-full h-2.5 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden p-0.5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full rounded-full bg-stone-900 dark:bg-stone-100"
          />
        </div>

        <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium leading-relaxed">
          {currentLevelData.description}
        </p>
      </div>
    </div>
  );
};
