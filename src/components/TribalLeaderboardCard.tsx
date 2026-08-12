import React, { useEffect, useMemo, useState } from 'react';
import { Users, Trophy, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { subscribeToTribes, TribeSummary } from '../services/leaderboardService';

interface TribalLeaderboardCardProps {
  userTribeId?: string;
}

/**
 * Shows only real, server-verified tribe documents. There is intentionally no
 * local starter roster, selector, or fabricated aggregate fallback.
 */
export const TribalLeaderboardCard: React.FC<TribalLeaderboardCardProps> = ({ userTribeId }) => {
  const [tribes, setTribes] = useState<TribeSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToTribes(
      (nextTribes) => {
        setTribes(nextTribes);
        setError(null);
        setIsLoading(false);
      },
      (nextError) => {
        setError(nextError.message || 'Unable to load verified tribe standings.');
        setIsLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  const currentTribe = useMemo(
    () => tribes.find((tribe) => tribe.id === userTribeId) || null,
    [tribes, userTribeId]
  );

  return (
    <section className="w-full p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800/80 shadow-sm text-stone-900 dark:text-stone-100 transition-colors duration-300">
      <header className="flex items-start gap-3 border-b border-stone-100 dark:border-stone-800 pb-4 mb-5">
        <div className="p-2.5 rounded-xl bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 shadow-sm">
          <Users className="w-5 h-5 stroke-[1.5]" />
        </div>
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
            Verified communities
          </span>
          <h3 className="font-serif text-lg font-medium text-stone-950 dark:text-stone-50 mt-1">
            Tribe standings
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            {currentTribe
              ? `Your tribe: ${currentTribe.name}`
              : 'No tribe is selected for this account.'}
          </p>
        </div>
      </header>

      {isLoading && (
        <div className="py-10 text-center text-xs text-stone-500 dark:text-stone-400">
          Loading verified tribe standings…
        </div>
      )}

      {!isLoading && error && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 flex gap-3 text-amber-900 dark:text-amber-200">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="text-xs leading-relaxed">{error}</p>
        </div>
      )}

      {!isLoading && !error && tribes.length === 0 && (
        <div className="py-10 text-center text-stone-500 dark:text-stone-400">
          <Users className="w-8 h-8 mx-auto mb-3 opacity-50" />
          <p className="text-sm font-medium text-stone-700 dark:text-stone-300">No verified tribes yet</p>
          <p className="text-xs mt-1 max-w-sm mx-auto">
            Standings will appear only after a real community has been created and has active members. Ultradian does not show placeholder teams.
          </p>
        </div>
      )}

      {!isLoading && !error && tribes.length > 0 && (
        <div className="border border-stone-200/80 dark:border-stone-800/80 rounded-xl overflow-hidden divide-y divide-stone-100 dark:divide-stone-800/60">
          {tribes.map((tribe, index) => {
            const isUserTribe = tribe.id === userTribeId;
            const weeklyHours = Math.round((tribe.weeklyMinutes / 60) * 10) / 10;
            return (
              <motion.div
                key={tribe.id}
                layout
                className={`flex items-center justify-between p-4 transition-colors ${
                  isUserTribe
                    ? 'bg-stone-100/80 dark:bg-stone-800/60 font-semibold'
                    : 'bg-white dark:bg-stone-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-5 text-center font-bold font-serif text-sm text-stone-500">
                    {index === 0 ? <Trophy className="w-4 h-4 mx-auto text-yellow-500" /> : `#${index + 1}`}
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-bold text-base flex items-center justify-center border border-stone-200/80 dark:border-stone-700/80">
                    {tribe.icon || tribe.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-stone-900 dark:text-stone-100 block">
                      {tribe.name}{isUserTribe ? ' · Your tribe' : ''}
                    </span>
                    <span className="text-[10px] text-stone-400 dark:text-stone-500 block mt-0.5">
                      {tribe.memberCount} {tribe.memberCount === 1 ? 'member' : 'members'} · Primary: {tribe.topCategory}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-serif font-light text-stone-900 dark:text-stone-100 block">
                    {weeklyHours.toFixed(1)} hrs
                  </span>
                  <span className="text-[9px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider block mt-0.5">
                    This week
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
};
