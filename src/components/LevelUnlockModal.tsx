import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Sparkles, ArrowRight, CheckCircle, Zap } from 'lucide-react';
import { playMilestoneSound } from '../utils/audio';

interface LevelUnlockModalProps {
  unlockedLevel: 2 | 3;
  onClaimLevel: () => void;
}

export const LevelUnlockModal: React.FC<LevelUnlockModalProps> = ({
  unlockedLevel,
  onClaimLevel,
}) => {
  useEffect(() => {
    try {
      playMilestoneSound();
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#eab308', '#3b82f6', '#10b981', '#f97316', '#a855f7'],
      });
    } catch (e) {
      console.warn('Confetti error:', e);
    }
  }, []);

  const title = unlockedLevel === 2 ? 'Level 2: Adept Unlocked!' : 'Level 3: Ultradian Master Unlocked!';
  const desc =
    unlockedLevel === 2
      ? 'Congratulations! You completed 5 Apprentice sessions (45 min) and built core focus stamina. You can now level up to 60-minute Adept cycles!'
      : 'Phenomenal mental stamina! You mastered Level 2. You have unlocked the full 90-minute Ultradian BRAC Master cycle!';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md p-8 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800/80 shadow-2xl text-stone-900 dark:text-stone-100 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-4 border border-amber-500/20 shadow-inner">
          <Trophy className="w-8 h-8" />
        </div>

        <span className="text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 inline-block mb-2">
          Stamina Overload Breakthrough
        </span>

        <h2 className="font-serif text-2xl font-medium text-stone-950 dark:text-stone-50 mb-2">
          {title}
        </h2>

        <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed mb-6">
          {desc}
        </p>

        <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200/60 dark:border-stone-800/60 mb-6 text-left space-y-2">
          <div className="flex items-center space-x-2 text-xs font-semibold text-stone-800 dark:text-stone-200">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span>New Focus Cycle Duration: {unlockedLevel === 2 ? '60 mins' : '90 mins'}</span>
          </div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-stone-800 dark:text-stone-200">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span>New Recovery Break: {unlockedLevel === 2 ? '15 mins' : '20 mins'}</span>
          </div>
        </div>

        <button
          onClick={onClaimLevel}
          className="w-full py-4 rounded-full bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-stone-200 text-stone-100 dark:text-stone-900 font-bold text-xs uppercase tracking-wider shadow-md flex items-center justify-center space-x-2 transition-all duration-200"
        >
          <span>Level Up Now</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
