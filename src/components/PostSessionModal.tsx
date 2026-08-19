import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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

  const triggerHaptic = useCallback(() => {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(8);
      }
    } catch {}
  }, []);

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
        return 'Peak Clarity';
      default:
        return 'High Quality';
    }
  };

  const handleAiAnalysis = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    triggerHaptic();
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
    } finally {
      setAnalyzing(false);
    }
  };

  const handleManualSave = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic();
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
          <p className="text-xs tracking-[0.2em] uppercase font-mono text-[color:var(--ink-mute)]">Wave complete</p>
          <motion.h2
            id="session-complete-title"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="mt-3 font-serif text-3xl sm:text-4xl tracking-tight text-[color:var(--ink)]"
          >
            {completedSession.durationMinutes} minutes
          </motion.h2>
          <p className="mt-2 text-sm text-[color:var(--ink-soft)]">
            {completedSession.taskName || completedSession.category}
          </p>
        </div>

        {/* Session Accomplishment Summary Card */}
        <div className="mb-6 swift-grouped-list p-4 text-sm shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[color:var(--ink-mute)]">Slips</span>
            <span className="font-mono font-semibold text-[color:var(--ink)]">{completedSession.distractionsCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[color:var(--ink-mute)]">SQI Score</span>
            <span className="font-mono font-semibold text-[color:var(--ink)]">
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
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-3 py-2 text-center"
          >
            <CheckCircle2 className="mx-auto h-6 w-6 text-[color:var(--ink)]" />
            <p className="font-serif text-xl">Saved</p>
            <p className="text-sm text-[color:var(--ink-soft)]">
              {aiResult.category} · {aiResult.focusScore}/5 · energy {aiResult.energyLevelAfter}/5
            </p>
          </motion.div>
        ) : !manualMode ? (
          /* Single Text Box AI Reflection Form */
          <form onSubmit={handleAiAnalysis} className="space-y-5">
            {/* Focus Quality Star Picker */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] font-mono font-bold tracking-wider uppercase text-[color:var(--ink-mute)]">
                  Focus Quality Rating
                </label>
                <span className="text-xs font-medium text-[color:var(--ink-soft)]">
                  {getFocusLabel(focusRating)}
                </span>
              </div>

              <div className="flex items-center justify-center space-x-3 p-3.5 bg-[color:var(--line)]/30 rounded-2xl border border-[color:var(--line)]/60 shadow-xs">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    type="button"
                    key={star}
                    whileHover={{ scale: 1.25, y: -2 }}
                    whileTap={{ scale: 0.88 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    onClick={() => {
                      triggerHaptic();
                      setFocusRating(star);
                    }}
                    className="p-1 cursor-pointer"
                  >
                    <Star
                      className={`h-7 w-7 transition-colors duration-150 ${
                        star <= focusRating
                          ? 'fill-[color:var(--ink)] text-[color:var(--ink)]'
                          : 'text-[color:var(--line)]'
                      }`}
                    />
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Note Input */}
            <div>
              <label htmlFor="post-session-reflection-note" className="block text-[10px] font-mono font-bold tracking-wider uppercase text-[color:var(--ink-mute)] mb-2">
                Reflection Note (Optional)
              </label>
              <textarea
                id="post-session-reflection-note"
                name="reflectionNote"
                aria-label="Reflection Note (Optional)"
                rows={2}
                value={userNote}
                onChange={(e) => setUserNote(e.target.value)}
                placeholder="e.g. 'Finished the core UI layout smoothly, zero distractions.'"
                className="w-full rounded-2xl border border-[color:var(--line)] bg-[color:var(--paper)] px-4 py-3 text-sm text-[color:var(--ink)] placeholder:text-[color:var(--ink-mute)] focus:outline-none focus:border-[color:var(--ink)] shadow-xs"
              />
            </div>

            <div className="flex gap-2">
              <motion.button
                type="submit"
                disabled={analyzing}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                className="swift-pill-cta flex min-h-12 flex-1 items-center justify-center text-sm font-medium cursor-pointer shadow-md"
              >
                {analyzing ? <span className="ink-bar w-20" /> : <span>Save and rest</span>}
              </motion.button>
            </div>
          </form>
        ) : (
          /* Manual Fallback Form */
          <form onSubmit={handleManualSave} className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono font-bold tracking-wider uppercase text-[color:var(--ink-mute)] mb-1.5">
                Mental Energy Level After
              </label>
              <div className="flex items-center justify-between gap-1.5">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <motion.button
                    type="button"
                    key={lvl}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => {
                      triggerHaptic();
                      setEnergyLevelAfter(lvl);
                    }}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      energyLevelAfter === lvl
                        ? 'bg-[color:var(--ink)] text-[color:var(--paper)] shadow-xs'
                        : 'bg-[color:var(--paper)] text-[color:var(--ink-soft)] border border-[color:var(--line)]'
                    }`}
                  >
                    {lvl}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setManualMode(false)}
                className="px-4 py-3 rounded-full border border-[color:var(--line)] text-xs font-medium cursor-pointer"
              >
                Back
              </motion.button>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                className="swift-pill-cta flex-1 py-3 rounded-full text-xs font-medium cursor-pointer"
              >
                Save Session
              </motion.button>
            </div>
          </form>
        )}
      </div>
    </Sheet>
  );
};
