import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Flame, Sparkles, Star, ArrowRight, Loader2, CheckCircle2, Mic, SlidersHorizontal } from 'lucide-react';
import { SessionRecord, CategoryTag } from '../types';
import { playMilestoneSound } from '../utils/audio';

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

  const [manualMode, setManualMode] = useState<boolean>(false);
  const [focusRating, setFocusRating] = useState<number>(5);
  const [energyLevelAfter, setEnergyLevelAfter] = useState<number>(4);

  useEffect(() => {
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#eab308', '#3b82f6', '#10b981', '#f97316'],
      });
    } catch (e) {
      console.warn('Confetti error:', e);
    }
  }, []);

  const handleAiAnalysis = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userNote.trim()) {
      // Save default if note is empty
      onSave({
        focusRating: 5,
        energyLevelAfter: 4,
        notes: 'Session completed.',
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
      playMilestoneSound();

      // Auto save after brief magic confirmation toast presentation (1.5 sec)
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
      // Fallback
      onSave({
        focusRating: 4,
        energyLevelAfter: 4,
        notes: userNote,
      });
      onClose();
    } finally {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md p-6 sm:p-8 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800/80 shadow-2xl text-stone-900 dark:text-stone-100">
        {/* Header Icon */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3 border border-amber-500/20 shadow-inner">
            <Sparkles className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20 mb-1">
            Phase 2: AI Reflection Journal
          </span>
          <h2 className="font-serif text-2xl font-medium tracking-tight text-stone-950 dark:text-stone-50">
            Flow Cycle Complete
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
            Completed <strong className="text-stone-900 dark:text-white">{completedSession.durationMinutes} mins</strong> of deep focus. How did it go?
          </p>
        </div>

        {/* AI Magic Result Toast Animation */}
        {aiResult ? (
          <div className="p-5 rounded-2xl bg-gradient-to-br from-stone-900 to-stone-950 border border-amber-500/40 text-stone-100 text-center space-y-3 animate-fade-in shadow-xl">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest">
              AI Session Journal Logged!
            </h4>
            <div className="p-3 rounded-xl bg-stone-800/80 border border-stone-700/80 text-xs text-stone-200 font-mono space-y-1 text-left">
              <div>📍 <strong>Category:</strong> {aiResult.category}</div>
              <div>⚡ <strong>Focus Score:</strong> {aiResult.focusScore}/5</div>
              <div>🔋 <strong>Energy Level:</strong> {aiResult.energyLevelAfter}/5</div>
              {aiResult.distractionSummary && (
                <div>⚠️ <strong>Distraction:</strong> {aiResult.distractionSummary}</div>
              )}
            </div>
            <p className="text-[10px] text-stone-400 font-medium italic">
              Entering recovery break...
            </p>
          </div>
        ) : !manualMode ? (
          /* Single Text Box AI Reflection Form */
          <form onSubmit={handleAiAnalysis} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold tracking-wider uppercase text-stone-500 dark:text-stone-400 mb-2">
                1-Sentence Reflection Note
              </label>
              <textarea
                rows={3}
                value={userNote}
                onChange={(e) => setUserNote(e.target.value)}
                placeholder="e.g. 'Crushed the API design but got distracted by Slack for 5 mins.'"
                className="w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={analyzing}
              className="w-full py-3.5 rounded-full bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-stone-200 text-stone-100 dark:text-stone-900 font-bold text-xs tracking-wider uppercase shadow-md flex items-center justify-center space-x-2 transition-all active:scale-95"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                  <span>Gemini AI Parsing Journal...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Analyze & Save Journal</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setManualMode(true)}
                className="text-[10px] font-bold text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 flex items-center gap-1"
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span>Switch to Manual Form</span>
              </button>
              <span className="text-[10px] text-stone-400 italic">Powered by Gemini 3.5</span>
            </div>
          </form>
        ) : (
          /* Manual Fallback Form */
          <form onSubmit={handleManualSave} className="space-y-4 animate-fade-in">
            <div>
              <label className="block text-[10px] font-bold tracking-wider uppercase text-stone-500 dark:text-stone-400 mb-1.5">
                Focus Quality (1-5 Stars)
              </label>
              <div className="flex items-center justify-center space-x-2 p-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-200 dark:border-stone-800">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setFocusRating(star)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= focusRating
                          ? 'text-amber-500 fill-amber-500'
                          : 'text-stone-300 dark:text-stone-700'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-wider uppercase text-stone-500 dark:text-stone-400 mb-1.5">
                Mental Energy Level
              </label>
              <div className="flex items-center justify-between gap-1">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    type="button"
                    key={lvl}
                    onClick={() => setEnergyLevelAfter(lvl)}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold ${
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
                className="flex-1 py-3 rounded-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-bold uppercase tracking-wider"
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
