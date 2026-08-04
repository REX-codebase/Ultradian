import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Star, Flame, ArrowRight } from 'lucide-react';
import { SessionRecord, CategoryTag } from '../types';

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
  const [focusRating, setFocusRating] = useState<number>(5);
  const [energyLevelAfter, setEnergyLevelAfter] = useState<number>(4);
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#78716c', '#44403c', '#a8a29e', '#1c1917'],
      });
    } catch (e) {
      console.warn('Confetti error:', e);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      focusRating,
      energyLevelAfter,
      notes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md p-8 rounded-xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800/80 shadow-xs text-stone-900 dark:text-stone-100">
        {/* Header Icon */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-sm bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 flex items-center justify-center mb-3.5">
            <Flame className="w-5 h-5" />
          </div>
          <h2 className="font-serif text-2xl font-medium tracking-tight text-stone-950 dark:text-stone-50">
            Flow Wave Complete
          </h2>
          <p className="text-xs text-stone-400 dark:text-stone-500 mt-1.5 leading-relaxed">
            You completed <strong className="text-stone-900 dark:text-white font-semibold">{completedSession.durationMinutes} minutes</strong> of deep focus. Step back and register your rhythm metrics.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Focus Rating Stars */}
          <div>
            <label className="block text-[10px] font-bold tracking-wider uppercase text-stone-400 dark:text-stone-500 mb-2">
              Focus & Flow Quality
            </label>
            <div className="flex items-center justify-center space-x-2.5 p-3.5 bg-stone-50 dark:bg-stone-900/50 rounded-md border border-stone-200/60 dark:border-stone-800/60">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setFocusRating(star)}
                  className="p-1 transition-transform hover:scale-115"
                >
                  <Star
                    className={`w-6.5 h-6.5 ${
                      star <= focusRating
                        ? 'text-stone-900 dark:text-stone-100 fill-stone-900 dark:fill-stone-100'
                        : 'text-stone-200 dark:text-stone-700'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Energy Level Rating */}
          <div>
            <label className="block text-[10px] font-bold tracking-wider uppercase text-stone-400 dark:text-stone-500 mb-2">
              Mental Energy Level (Post-Wave)
            </label>
            <div className="flex items-center justify-between gap-1.5">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <button
                  type="button"
                  key={lvl}
                  onClick={() => setEnergyLevelAfter(lvl)}
                  className={`flex-1 py-2.5 rounded-sm text-xs font-semibold transition-all duration-150 ${
                    energyLevelAfter === lvl
                      ? 'bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900'
                      : 'bg-stone-50 dark:bg-stone-800/50 text-stone-600 dark:text-stone-400 border border-stone-200/50 dark:border-stone-800/60 hover:bg-stone-100'
                  }`}
                >
                  {lvl === 1 ? 'Low' : lvl === 5 ? 'Peak' : lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Reflection notes */}
          <div>
            <label className="block text-[10px] font-bold tracking-wider uppercase text-stone-400 dark:text-stone-500 mb-2">
              Wave Insights & Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Breakthroughs, obstacles, or ambient state insights..."
              className="w-full px-4 py-3 rounded-sm bg-stone-50 dark:bg-stone-800/50 border border-stone-200/60 dark:border-stone-800/60 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:border-stone-400"
            />
          </div>

          {/* Action button */}
          <button
            type="submit"
            className="w-full py-4 rounded-full bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-stone-200 text-stone-100 dark:text-stone-900 font-semibold text-xs tracking-wider uppercase shadow-xs flex items-center justify-center space-x-2 transition-all duration-200"
          >
            <span>Enter Recovery Wave</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
