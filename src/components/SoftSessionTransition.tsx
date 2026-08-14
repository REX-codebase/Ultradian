import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  IconNeuralFlow,
  IconRestVessel,
  IconSparkle,
  IconArrowRight,
} from './icons';
import { SessionType } from '../types';

interface SoftSessionTransitionProps {
  isVisible: boolean;
  toType: SessionType;
  durationMins: number;
  onContinue: () => void;
}

export const SoftSessionTransition: React.FC<SoftSessionTransitionProps> = ({
  isVisible,
  toType,
  durationMins,
  onContinue,
}) => {
  useEffect(() => {
    if (!isVisible) return;
    const timer = setTimeout(() => {
      onContinue();
    }, 4500);
    return () => clearTimeout(timer);
  }, [isVisible, onContinue]);

  if (!isVisible) return null;

  const isWork = toType === 'work';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-lg text-stone-100 select-none"
      >
        <motion.div
          initial={{ scale: 0.95, y: 10 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: -10 }}
          className="max-w-md w-full p-8 rounded-3xl bg-stone-900 border border-stone-800 text-center space-y-6 shadow-2xl relative overflow-hidden"
        >
          {/* Gentle Breathing Aura Ring */}
          <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-amber-500/10 blur-3xl animate-pulse" />
          <div className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl animate-pulse" />

          {/* Icon Badge */}
          <div className="w-16 h-16 rounded-2xl bg-stone-800 border border-stone-700/80 flex items-center justify-center mx-auto text-amber-400 shadow-inner">
            {isWork ? (
              <IconNeuralFlow size={32} className="animate-bounce" />
            ) : (
              <IconRestVessel size={32} className="text-emerald-400 animate-pulse" />
            )}
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-stone-400 bg-stone-800 px-3 py-1 rounded-full border border-stone-700">
              {isWork ? 'NEW ULTRADIAN WAVE' : 'RECOVERY BREAK INTERVAL'}
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-white">
              {isWork ? 'Ready for Deep Focus?' : 'Time to Unwind & Refuel'}
            </h2>
            <p className="text-xs text-stone-400 max-w-xs mx-auto leading-relaxed">
              {isWork
                ? `Transitioning into a ${durationMins}-minute peak cognitive focus wave. Clear your workspace and lock in.`
                : `Awesome work! Step back for ${durationMins} minutes. Let your prefrontal cortex rest and reset.`}
            </p>
          </div>

          {/* Breathing Guide Animation */}
          <div className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800/80 space-y-2">
            <div className="flex items-center justify-center space-x-2 text-xs font-serif italic text-stone-300">
              <IconSparkle size={14} className="text-amber-400 animate-spin" />
              <span>Inhale deeply... exhale slowly</span>
            </div>
            <div className="w-full bg-stone-800 h-1.5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 4.5, ease: 'linear' }}
                className={`h-full ${isWork ? 'bg-amber-400' : 'bg-emerald-400'}`}
              />
            </div>
          </div>

          <button
            onClick={onContinue}
            className="w-full py-3.5 rounded-full bg-stone-100 text-stone-900 hover:bg-stone-200 font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all active:scale-95 shadow-md"
          >
            <span>{isWork ? 'Begin Focus Wave Now' : 'Start Recovery Break'}</span>
            <IconArrowRight size={16} />
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
