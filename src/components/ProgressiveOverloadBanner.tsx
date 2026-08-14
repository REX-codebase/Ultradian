import React from 'react';
import { motion } from 'motion/react';
import { IconSparkle, IconTrophy } from './icons';

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
    description: '45 min focus / 10 min recovery. Build foundational biological rhythm stamina.',
    icon: '🌱',
  },
  2: {
    title: 'Level 2: Adept',
    badge: 'Adept',
    workMins: 60,
    breakMins: 15,
    requiredSessions: 5,
    description: '60 min focus / 15 min recovery. Elevated cognitive throughput for deep sessions.',
    icon: '⚡',
  },
  3: {
    title: 'Level 3: Ultradian Master',
    badge: 'Ultradian Master',
    workMins: 90,
    breakMins: 20,
    requiredSessions: 5,
    description: '90 min focus / 20 min recovery. Full Kleitman BRAC bio-harmonic cycle.',
    icon: '👑',
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
    <div className="liquid-glass-card w-full p-5 sm:p-6 text-[color:var(--ink)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[color:var(--paper-raised)] text-[color:var(--ink)] border border-[color:var(--line)] flex items-center justify-center font-bold text-lg shadow-xs">
            <span>{currentLevelData.icon}</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[color:var(--ink-mute)]">
                PROGRESSIVE OVERLOAD
              </span>
              <span className="liquid-glass-badge px-2 py-0.2 rounded-full text-[10px] font-mono text-[color:var(--ink-soft)]">
                Level {staminaLevel} of 3
              </span>
            </div>
            <h3 className="font-serif text-lg font-normal text-[color:var(--ink)] mt-0.5">
              {currentLevelData.title}
            </h3>
          </div>
        </div>

        {/* Level Switcher Buttons */}
        <div className="chip-rail pb-1">
          {[1, 2, 3].map((lvl) => {
            const isUnlocked = lvl <= staminaLevel;
            const levelObj = LEVEL_INFO[lvl as 1 | 2 | 3];
            return (
              <motion.button
                key={lvl}
                whileHover={isUnlocked ? { scale: 1.03 } : undefined}
                whileTap={isUnlocked ? { scale: 0.95 } : undefined}
                onClick={() => isUnlocked && onSelectLevelPreset(lvl as 1 | 2 | 3)}
                disabled={!isUnlocked}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  lvl === staminaLevel
                    ? 'bg-[color:var(--ink)] text-[color:var(--paper)] shadow-xs'
                    : isUnlocked
                    ? 'text-[color:var(--ink-soft)] hover:text-[color:var(--ink)] hover:bg-[color:var(--line)]/40'
                    : 'text-[color:var(--ink-mute)] opacity-40 cursor-not-allowed'
                }`}
              >
                <span>{levelObj.icon}</span>
                <span>Lvl {lvl}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Progress Bar & Endowed Progress Effect */}
      <div className="p-4 rounded-2xl bg-[color:var(--paper)] border border-[color:var(--line)]/60 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-[color:var(--ink-soft)]">
            {staminaLevel === 3 ? (
              <span className="font-semibold text-[color:var(--ink)] flex items-center gap-1">
                <IconSparkle size={14} className="text-[color:var(--ink)]" />
                Ultradian Master Unlocked · 90/20 Peak Flow
              </span>
            ) : (
              <span>
                <strong className="text-[color:var(--ink)] font-semibold">{sessionsInCurrentLevel}/{targetSessions} sessions</strong> completed toward <strong className="text-[color:var(--ink)]">{nextLevelTitle}</strong>
              </span>
            )}
          </span>
          <span className="font-mono text-xs font-semibold text-[color:var(--ink)]">
            {progressPercent}%
          </span>
        </div>

        {/* Bar */}
        <div className="w-full h-2 rounded-full bg-[color:var(--line)] overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="h-full rounded-full bg-[color:var(--ink)]"
          />
        </div>

        <p className="text-[11px] text-[color:var(--ink-mute)] font-sans leading-relaxed">
          {currentLevelData.description}
        </p>
      </div>
    </div>
  );
};
