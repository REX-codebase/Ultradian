import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { IconClose, IconWind, IconCheckCircle } from './icons';
import { RecoveryPrompt } from '../utils/rhythmEngine';

interface RecoveryPromptBannerProps {
  prompts: RecoveryPrompt[];
  onStartMicroHabit: (microHabit: RecoveryPrompt['microHabit']) => void;
  onDismiss?: () => void;
}

export const RecoveryPromptBanner: React.FC<RecoveryPromptBannerProps> = ({
  prompts,
  onStartMicroHabit,
  onDismiss,
}) => {
  const [activePromptIndex] = useState(0);
  const [showBreathingModal, setShowBreathingModal] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Rest'>('Inhale');
  const [breathingTimer, setBreathingTimer] = useState(4);
  const [breathingActive, setBreathingActive] = useState(false);

  const prompt = prompts[activePromptIndex] || prompts[0];

  const triggerHaptic = useCallback(() => {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(8);
      }
    } catch {}
  }, []);

  // Box Breathing Cycle Timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (showBreathingModal && breathingActive) {
      interval = setInterval(() => {
        setBreathingTimer((prev) => {
          if (prev <= 1) {
            setBreathingPhase((currentPhase) => {
              if (currentPhase === 'Inhale') return 'Hold';
              if (currentPhase === 'Hold') return 'Exhale';
              if (currentPhase === 'Exhale') return 'Rest';
              return 'Inhale';
            });
            return 4;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showBreathingModal, breathingActive]);

  if (!prompt || prompt.urgency === 'gentle') return null;

  const handleHabitClick = () => {
    triggerHaptic();
    if (prompt.microHabit === 'box_breathing') {
      setShowBreathingModal(true);
      setBreathingActive(true);
    } else {
      onStartMicroHabit(prompt.microHabit);
    }
  };

  return (
    <>
      <div className="mx-auto w-full max-w-xl animate-fade-in text-center px-1">
        <div className="liquid-glass-card p-5 sm:p-6 text-center">
          <div className="flex flex-col items-center gap-2.5">
            <span className="liquid-glass-badge inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-[10px] font-mono font-bold tracking-widest uppercase text-[color:var(--ink-soft)]">
              <IconWind size={12} className="text-[color:var(--ink)]" />
              <span>Bio-Recovery Cue</span>
            </span>

            <h4 className="font-serif text-lg text-[color:var(--ink)] font-normal tracking-tight">
              {prompt.title}
            </h4>

            <p className="mx-auto max-w-md text-xs leading-relaxed text-[color:var(--ink-soft)]">
              {prompt.message}
            </p>

            <div className="mt-2 flex items-center gap-3">
              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleHabitClick}
                className="liquid-glass-badge rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide text-[color:var(--ink)] hover:bg-[color:var(--ink)] hover:text-[color:var(--paper)] transition-all"
              >
                {prompt.microHabitLabel}
              </motion.button>

              {onDismiss && (
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic();
                    onDismiss();
                  }}
                  className="rounded-full p-1.5 text-[color:var(--ink-mute)] hover:text-[color:var(--ink)] hover:bg-[color:var(--line)]/50 transition-colors"
                  title="Dismiss cue"
                >
                  <IconClose size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Guided Parasympathetic Box Breathing Modal */}
      <AnimatePresence>
        {showBreathingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md select-none animate-fade-in">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="liquid-glass-card relative w-full max-w-md p-8 text-center overflow-hidden bg-[color:var(--paper-raised)]"
            >
              <button
                type="button"
                onClick={() => {
                  triggerHaptic();
                  setShowBreathingModal(false);
                  setBreathingActive(false);
                }}
                className="absolute top-4 right-4 rounded-full p-2 text-[color:var(--ink-mute)] hover:text-[color:var(--ink)] hover:bg-[color:var(--line)]/50 transition-colors"
                title="Close breathing exercise"
              >
                <IconClose size={16} />
              </button>

              <span className="liquid-glass-badge mb-3 inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-widest text-[color:var(--ink-soft)]">
                PARASYMPATHETIC RESET
              </span>

              <h3 className="font-serif text-2xl font-normal text-[color:var(--ink)] mb-1.5">
                Box Breathing Wave
              </h3>
              <p className="text-xs text-[color:var(--ink-soft)] mb-8 max-w-xs mx-auto leading-relaxed">
                Follow the harmonic ring to calm vagal nerve tension and restore prefrontal cognitive clarity.
              </p>

              {/* Breathing Animation Ring */}
              <div className="relative w-48 h-48 mx-auto mb-8 flex items-center justify-center">
                <div
                  className={`absolute inset-0 rounded-full border-2 border-[color:var(--ink)]/30 transition-all duration-1000 ${
                    breathingPhase === 'Inhale'
                      ? 'scale-125 bg-[color:var(--glow)] border-[color:var(--ink)]'
                      : breathingPhase === 'Hold'
                      ? 'scale-125 bg-[color:var(--glow-2)] border-[color:var(--ink-soft)]'
                      : breathingPhase === 'Exhale'
                      ? 'scale-90 bg-transparent border-[color:var(--ink-mute)]'
                      : 'scale-90 bg-transparent border-[color:var(--line)]'
                  }`}
                />
                <div className="relative z-10 text-center">
                  <span className="block text-xl font-serif text-[color:var(--ink)] uppercase tracking-widest">
                    {breathingPhase}
                  </span>
                  <span className="clock-face text-4xl font-serif font-light text-[color:var(--ink)] mt-1 block">
                    {breathingTimer}s
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    triggerHaptic();
                    setBreathingActive(!breathingActive);
                  }}
                  className="flex-1 min-h-12 rounded-full bg-[color:var(--ink)] text-[color:var(--paper)] font-medium text-xs uppercase tracking-wider shadow-sm transition-opacity hover:opacity-95"
                >
                  {breathingActive ? 'Pause Exercise' : 'Resume Breathing'}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
