import React, { useState, useEffect } from 'react';
import { HeartPulse, Wind, Eye, Activity, Volume2, CheckCircle2, X, Play, RefreshCw } from 'lucide-react';
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

  if (!prompt) return null;

  const handleHabitClick = () => {
    if (prompt.microHabit === 'box_breathing') {
      setShowBreathingModal(true);
      setBreathingActive(true);
    } else {
      onStartMicroHabit(prompt.microHabit);
    }
  };

  const getUrgencyStyles = (urgency: RecoveryPrompt['urgency']) => {
    switch (urgency) {
      case 'critical':
        return 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200';
      case 'recommended':
        return 'bg-indigo-500/10 border-indigo-500/30 text-indigo-900 dark:text-indigo-200';
      default:
        return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200';
    }
  };

  return (
    <>
      <div
        className={`w-full p-4 rounded-2xl border transition-all animate-fade-in ${getUrgencyStyles(
          prompt.urgency
        )}`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-white/80 dark:bg-stone-900/80 shadow-xs shrink-0">
              <HeartPulse className="w-5 h-5 text-amber-500 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                  RECOVERY PROMPT • {prompt.suggestedBreakMins}M REST
                </span>
              </div>
              <h4 className="font-serif text-base font-medium text-stone-900 dark:text-stone-100">
                {prompt.title}
              </h4>
              <p className="text-xs text-stone-600 dark:text-stone-300 mt-0.5 leading-normal max-w-xl">
                {prompt.message}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-end sm:self-center">
            <button
              onClick={handleHabitClick}
              className="px-4 py-2 rounded-xl bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-stone-200 text-stone-100 dark:text-stone-900 text-xs font-bold uppercase tracking-wider shadow-sm transition-all active:scale-95 flex items-center space-x-1.5"
            >
              <Wind className="w-3.5 h-3.5" />
              <span>{prompt.microHabitLabel}</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-fade-in select-none">
          <div className="w-full max-w-md p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl text-center relative overflow-hidden">
            <button
              onClick={() => {
                setShowBreathingModal(false);
                setBreathingActive(false);
              }}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 mb-3 inline-block">
              BOX BREATHING RESTORE
            </span>

            <h3 className="font-serif text-2xl font-medium text-stone-900 dark:text-stone-100 mb-1">
              Parasympathetic Reset
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mb-8 max-w-xs mx-auto">
              Follow the breathing circle to calm vagus nerve tension and restore prefrontal clarity.
            </p>

            {/* Breathing Animation Circle */}
            <div className="relative w-48 h-48 mx-auto mb-8 flex items-center justify-center">
              <div
                className={`absolute inset-0 rounded-full border-4 border-emerald-500/30 transition-all duration-1000 ${
                  breathingPhase === 'Inhale'
                    ? 'scale-125 bg-emerald-500/10 border-emerald-500'
                    : breathingPhase === 'Hold'
                    ? 'scale-125 bg-amber-500/10 border-amber-500'
                    : breathingPhase === 'Exhale'
                    ? 'scale-90 bg-indigo-500/10 border-indigo-500'
                    : 'scale-90 bg-stone-500/10 border-stone-500'
                }`}
              />
              <div className="relative z-10 text-center">
                <span className="block text-xl font-serif font-bold text-stone-900 dark:text-stone-100 uppercase tracking-widest">
                  {breathingPhase}
                </span>
                <span className="text-4xl font-serif font-light text-emerald-600 dark:text-emerald-400 mt-1 block">
                  {breathingTimer}s
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setBreathingActive(!breathingActive)}
                className="flex-1 py-3.5 rounded-full bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 font-bold text-xs uppercase tracking-wider"
              >
                {breathingActive ? 'Pause Exercise' : 'Resume Breathing'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
