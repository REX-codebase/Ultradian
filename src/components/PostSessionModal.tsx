import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Flame,
  Sparkles,
  Star,
  CheckCircle2,
  Loader2,
  SlidersHorizontal,
  Battery,
  Trophy,
  Coffee,
  ArrowRight,
  Target,
  Zap,
} from 'lucide-react';
import { SessionRecord, CategoryTag } from '../types';
import { playMilestoneSound } from '../utils/audio';
import { calculateSQI, NON_BIOLOGICAL_DISCLAIMER } from '../utils/rhythmEngine';

interface PostSessionModalProps {
  completedSession: {
    durationMinutes: number;
    actualSecondsCompleted: number;
    taskName: string;
    category: CategoryTag;
    distractionsCount: number;
  };
  onSave: (record: Partial<SessionRecord>) => void;
  onClose: () => void;
}

export const PostSessionModal: React.FC<PostSessionModalProps> = ({
  completedSession,
  onSave,
  onClose,
}) => {
  const [userNote, setUserNote] = useState<string>('');
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<{
    category: CategoryTag;
    focusScore: number;
    energyLevelAfter: number;
    distractionsCount: number;
    distractionSummary: string;
    notes: string;
  } | null>(null);

  const [focusRating, setFocusRating] = useState<number>(5);
  const [energyLevelAfter, setEnergyLevelAfter] = useState<number>(4);
  const [manualMode, setManualMode] = useState<boolean>(false);

  useEffect(() => {
    // Play celebratory sound & trigger confetti shower
    playMilestoneSound();
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#10b981', '#6366f1', '#ec4899'],
      });
    } catch (e) {
      console.warn('Confetti error:', e);
    }
  }, []);

  const getFocusLabel = (score: number) => {
    switch (score) {
      case 1:
        return 'Heavily Distracted';
      case 2:
        return 'Moderate Focus';
      case 3:
        return 'Solid Concentration';
      case 4:
        return 'Deep Flow State';
      case 5:
        return 'Peak Cognitive Mastery 🧠';
      default:
        return 'High Quality';
    }
  };

  const handleAiAnalysis = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userNote.trim()) {
      onSave({
        focusRating,
        energyLevelAfter,
        notes: 'Session completed successfully.',
      });
      onClose();
      return;
    }

    setAnalyzing(true);
    try {
      const response = await fetch('/api/gemini/analyze-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userNote }),
      });

      if (!response.ok) {
        throw new Error(`Server status ${response.status}`);
      }

      const data = await response.json();
      setAiResult(data);

      setTimeout(() => {
        onSave({
          category: data.category as CategoryTag,
          focusRating: data.focusScore,
          energyLevelAfter: data.energyLevelAfter,
          distractionsCount: data.distractionsCount,
          notes: data.notes || userNote,
        });
        onClose();
      }, 1600);
    } catch (err) {
      console.warn('AI analysis fallback:', err);
      onSave({
        focusRating,
        energyLevelAfter,
        notes: userNote,
      });
      onClose();
    } fonting: {
      setAnalyzing(false);
    }
  };

  const handleManualSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      focusRating,
      energyLevelAfter,
      notes: userNote,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800/90 shadow-2xl text-stone-900 dark:text-stone-100 relative overflow-hidden">
        {/* Top Decorative Lights */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-500 via-emerald-500 to-indigo-500" />

        {/* Accomplishment Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3 border border-amber-500/20 shadow-inner">
            <Trophy className="w-8 h-8 animate-bounce" />
          </div>

          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 mb-2">
            ULTRADIAN WAVE COMPLETED
          </span>

          <h2 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-stone-950 dark:text-stone-50">
            Flow Session Mastered
          </h2>

          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-sm">
            Completed <strong className="text-stone-900 dark:text-white">{completedSession.durationMinutes} minutes</strong> of undivided focus.
          </p>
        </div>

        {/* Session Accomplishment Summary Card */}
        <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-750 mb-6 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-amber-500" />
              <span className="font-serif text-sm font-medium text-stone-900 dark:text-stone-100 truncate max-w-[200px]">
                {completedSession.taskName || 'Focus Objective'}
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 text-[10px] font-bold">
              {completedSession.category}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs pt-1 border-t border-stone-200/60 dark:border-stone-700/60">
            <span className="text-stone-500 dark:text-stone-400">Interruption Register:</span>
            {completedSession.distractionsCount === 0 ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 0 Distractions (Flawless Flow)
              </span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400 font-semibold">
                {completedSession.distractionsCount} Distractions Logged
              </span>
            )}
          </div>

          <div className="flex items-center justify-between text-xs pt-1 border-t border-stone-200/60 dark:border-stone-700/60">
            <span className="text-stone-500 dark:text-stone-400">Calculated SQI:</span>
            <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
              {calculateSQI({
                durationMinutes: completedSession.durationMinutes,
                actualSecondsCompleted: completedSession.actualSecondsCompleted,
                focusRating,
                energyLevelBefore: 4,
                energyLevelAfter,
                distractionsCount: completedSession.distractionsCount,
              }).score}/100 Index
            </span>
          </div>
        </div>

        {/* AI Result Confirmation Toast */}
        {aiResult ? (
          <div className="p-5 rounded-2xl bg-gradient-to-br from-stone-900 to-stone-950 border border-amber-500/40 text-stone-100 text-center space-y-3 animate-fade-in shadow-xl">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest">
              Session Logged & Analyzed!
            </h4>
            <div className="p-3 rounded-xl bg-stone-800/80 border border-stone-700/80 text-xs text-stone-200 font-mono space-y-1 text-left">
              <div>📍 <strong>Domain:</strong> {aiResult.category}</div>
              <div>⚡ <strong>Focus Score:</strong> {aiResult.focusScore}/5 ({getFocusLabel(aiResult.focusScore)})</div>
              <div>🔋 <strong>Post Energy:</strong> {aiResult.energyLevelAfter}/5</div>
            </div>
            <p className="text-[10px] text-stone-400 italic">
              Entering recovery break...
            </p>
          </div>
        ) : !manualMode ? (
          /* Single Text Box AI Reflection Form */
          <form onSubmit={handleAiAnalysis} className="space-y-5">
            {/* Focus Quality Star Picker */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] font-mono font-bold tracking-wider uppercase text-stone-500 dark:text-stone-400">
                  Focus Quality Rating
                </label>
                <span className="text-xs font-serif italic text-amber-600 dark:text-amber-400 font-semibold">
                  {getFocusLabel(focusRating)}
                </span>
              </div>

              <div className="flex items-center justify-center space-x-2 p-3 bg-stone-50 dark:bg-stone-800/50 rounded-2xl border border-stone-200 dark:border-stone-800">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setFocusRating(star)}
                    className="p-1 transition-transform hover:scale-125 active:scale-95"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= focusRating
                          ? 'text-amber-500 fill-amber-500 drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]'
                          : 'text-stone-300 dark:text-stone-700'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Note Input */}
            <div>
              <label className="block text-[10px] font-mono font-bold tracking-wider uppercase text-stone-500 dark:text-stone-400 mb-2">
                Reflection Note (Optional)
              </label>
              <textarea
                rows={2}
                value={userNote}
                onChange={(e) => setUserNote(e.target.value)}
                placeholder="e.g. 'Finished the core UI layout smoothly, zero distractions.'"
                className="w-full px-4 py-3 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={analyzing}
                className="flex-1 py-4 rounded-full bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-stone-200 text-stone-100 dark:text-stone-900 font-bold text-xs tracking-wider uppercase shadow-lg flex items-center justify-center space-x-2 transition-all active:scale-95"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                    <span>Gemini AI Parsing Reflection...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Complete Session & Rest</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Manual Fallback Form */
          <form onSubmit={handleManualSave} className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono font-bold tracking-wider uppercase text-stone-500 dark:text-stone-400 mb-1.5">
                Mental Energy Level After
              </label>
              <div className="flex items-center justify-between gap-1.5">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    type="button"
                    key={lvl}
                    onClick={() => setEnergyLevelAfter(lvl)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      energyLevelAfter === lvl
                        ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
                        : 'bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setManualMode(false)}
                className="px-4 py-3 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-bold"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 py-3.5 rounded-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-bold uppercase tracking-wider"
              >
                Save Session
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
