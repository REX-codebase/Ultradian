import React, { useState, useEffect } from 'react';
import { Star, CheckCircle2 } from 'lucide-react';
import { SessionRecord, CategoryTag } from '../types';
import { playMilestoneSound } from '../utils/audio';
import { calculateSQI } from '../utils/rhythmEngine';
import { Sheet } from './Sheet';

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
    playMilestoneSound();
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
        return 'Peak';
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
    <Sheet open onClose={onClose} labelledBy="session-complete-title">
      <div className="px-6 pb-8 pt-3 text-[color:var(--ink)]">
        <div className="mb-6 text-center">
          <p className="text-xs tracking-[0.2em] uppercase text-[color:var(--ink-mute)]">Wave complete</p>
          <h2 id="session-complete-title" className="mt-3 font-serif text-3xl tracking-tight">
            {completedSession.durationMinutes} minutes
          </h2>
          <p className="mt-2 text-sm text-[color:var(--ink-soft)]">
            {completedSession.taskName || completedSession.category}
          </p>
        </div>

        {/* Session Accomplishment Summary Card */}
        <div className="mb-6 space-y-2 border-y border-[color:var(--line)] py-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-[color:var(--ink-mute)]">Slips</span>
            <span>{completedSession.distractionsCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[color:var(--ink-mute)]">SQI</span>
            <span className="clock-face">
              {calculateSQI({
                durationMinutes: completedSession.durationMinutes,
                actualSecondsCompleted: completedSession.actualSecondsCompleted,
                focusRating,
                energyLevelBefore: 4,
                energyLevelAfter,
                distractionsCount: completedSession.distractionsCount,
              }).score}
            </span>
          </div>
        </div>

        {/* AI Result Confirmation Toast */}
        {aiResult ? (
          <div className="space-y-3 py-2 text-center">
            <CheckCircle2 className="mx-auto h-5 w-5 text-[color:var(--ink)]" />
            <p className="font-serif text-xl">Saved</p>
            <p className="text-sm text-[color:var(--ink-soft)]">
              {aiResult.category} · {aiResult.focusScore}/5 · energy {aiResult.energyLevelAfter}/5
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
                <span className="text-sm text-[color:var(--ink-mute)]">
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
                      className={`h-7 w-7 ${
                        star <= focusRating
                          ? 'fill-[color:var(--ink)] text-[color:var(--ink)]'
                          : 'text-[color:var(--line)]'
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
                className="w-full rounded-xl border border-[color:var(--line)] bg-transparent px-4 py-3 text-sm text-[color:var(--ink)] placeholder:text-[color:var(--ink-mute)] focus:outline-none"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={analyzing}
                className="pressable flex min-h-12 flex-1 items-center justify-center rounded-full bg-[color:var(--ink)] text-[color:var(--paper)]"
              >
                {analyzing ? <span className="ink-bar w-20" /> : <span>Save and rest</span>}
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
    </Sheet>
  );
};
