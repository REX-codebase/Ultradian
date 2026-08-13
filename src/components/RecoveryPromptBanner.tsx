import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { RecoveryPrompt } from '../utils/rhythmEngine';
import { Sheet } from './Sheet';

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
  const [activePromptIndex, setActivePromptIndex] = useState(0);
  const [showBreathingModal, setShowBreathingModal] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Rest'>('Inhale');
  const [breathingTimer, setBreathingTimer] = useState(4);
  const [breathingActive, setBreathingActive] = useState(false);

  const prompt = prompts[activePromptIndex] || prompts[0];

  // Box Breathing Loop
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
    if (prompt.microHabit === 'box_breathing') {
      setShowBreathingModal(true);
      setBreathingActive(true);
    } else {
      onStartMicroHabit(prompt.microHabit);
    }
  };

  return (
    <>
      <div className="mx-auto w-full max-w-xl text-center">
        <div className="flex flex-col items-center gap-3">
          <div>
            <h4 className="font-serif text-lg text-stone-900 dark:text-stone-100">
              {prompt.title}
            </h4>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-stone-500">
              {prompt.message}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleHabitClick}
              className="min-h-11 text-sm text-stone-800 underline-offset-4 hover:underline dark:text-stone-200"
            >
              {prompt.microHabitLabel}
            </button>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Guided Parasympathetic Box Breathing Modal */}
      {showBreathingModal && (
        <Sheet
          open
          onClose={() => {
            setShowBreathingModal(false);
            setBreathingActive(false);
          }}
          size="sm"
        >
          <div className="relative px-6 pb-8 pt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setShowBreathingModal(false);
                setBreathingActive(false);
              }}
              className="pressable absolute right-3 top-3 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-[color:var(--ink-mute)]"
            >
              <X className="h-4 w-4" />
            </button>

            <p className="text-xs tracking-[0.2em] uppercase text-[color:var(--ink-mute)]">Box breathing</p>
            <h3 className="mt-3 font-serif text-2xl text-[color:var(--ink)]">Reset</h3>
            <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-[color:var(--ink-soft)]">
              Follow the circle. Four seconds each side.
            </p>

            <div className="relative mx-auto mb-8 mt-8 flex h-44 w-44 items-center justify-center">
              <div
                className="absolute inset-0 rounded-full border border-[color:var(--line)]"
                style={{
                  transform:
                    breathingPhase === 'Inhale' || breathingPhase === 'Hold' ? 'scale(1.12)' : 'scale(0.88)',
                  transition: 'transform 1000ms var(--ease-whisper)',
                }}
              />
              <div className="relative z-10 text-center">
                <span className="block text-sm tracking-[0.16em] uppercase text-[color:var(--ink-mute)]">
                  {breathingPhase}
                </span>
                <span className="clock-face mt-1 block font-serif text-4xl text-[color:var(--ink)]">
                  {breathingTimer}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setBreathingActive(!breathingActive)}
              className="pressable min-h-12 w-full rounded-full bg-[color:var(--ink)] text-[color:var(--paper)]"
            >
              {breathingActive ? 'Pause' : 'Resume'}
            </button>
          </div>
        </Sheet>
      )}
    </>
  );
};
