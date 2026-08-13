import React, { useEffect, useMemo, useState } from 'react';
import { Users, Trophy, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { subscribeToTribes, TribeSummary } from '../services/leaderboardService';
import { tribeDisplayMark } from '../utils/leagueMarks';

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
    <section className="w-full">
      <header className="mb-6">
        <h2 className="font-serif text-xl text-stone-900 dark:text-stone-50">Tribes</h2>
        <p className="mt-1 text-sm text-stone-500">
          {currentTribe ? currentTribe.name : 'No tribe yet.'}
        </p>
      </header>

      {isLoading && (
        <div className="space-y-3" aria-busy="true" aria-label="Loading tribes">
          <div className="skeleton-line h-14 w-full rounded-xl" />
          <div className="skeleton-line h-14 w-full rounded-xl" />
          <div className="skeleton-line h-14 w-full rounded-xl" />
        </div>
      )}

      {!isLoading && error && (
        <div className="flex gap-3 border border-[color:var(--line)] px-4 py-3 text-[color:var(--ink-soft)]">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--ink-mute)]" />
          <p className="text-sm leading-relaxed">{error}</p>
        </div>
      )}

      {!isLoading && !error && tribes.length === 0 && (
        <div className="py-12 text-center text-stone-500 dark:text-stone-400">
          <Users className="w-10 h-10 mx-auto mb-3 text-stone-400 dark:text-stone-600 opacity-60" />
          <p className="text-sm font-semibold text-stone-800 dark:text-stone-200">No verified tribes present</p>
          <p className="text-xs mt-1 max-w-sm mx-auto text-stone-500 dark:text-stone-400">
            Standings populate automatically when active community rosters sync to Firebase. Ultradian never displays placeholder accounts.
          </p>
        </div>
      )}

      {!isLoading && !error && tribes.length > 0 && (
        <div className="border border-stone-200/80 dark:border-stone-800/80 rounded-2xl overflow-hidden divide-y divide-stone-100 dark:divide-stone-800/60 shadow-xs">
          {tribes.map((tribe, index) => {
            const isUserTribe = tribe.id === userTribeId;
            const weeklyHours = Math.round((tribe.weeklyMinutes / 60) * 10) / 10;
            return (
              <motion.div
                key={tribe.id}
                layout
                className={`flex items-center justify-between p-4 ${
                  isUserTribe ? 'bg-[color:var(--ink)]/5' : ''
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span className="w-6 text-center font-serif text-sm text-[color:var(--ink-mute)]">
                    {index === 0 ? <Trophy className="mx-auto h-4 w-4" /> : `#${index + 1}`}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-semibold text-sm flex items-center justify-center border border-stone-200 dark:border-stone-700">
                    {tribeDisplayMark(tribe.icon, tribe.name)}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                      {tribe.name}
                      {isUserTribe && (
                        <span className="rounded-full bg-[color:var(--ink)] px-2 py-0.5 text-[10px] uppercase tracking-wider text-[color:var(--paper)]">
                          You
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] font-mono text-stone-500 dark:text-stone-400 block mt-0.5">
                      {tribe.memberCount} {tribe.memberCount === 1 ? 'member' : 'members'} · Focus: {tribe.topCategory}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-base font-serif font-medium text-stone-900 dark:text-stone-100 block">
                    {weeklyHours.toFixed(1)} hrs
                  </span>
                  <span className="text-[9px] font-mono font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider block mt-0.5">
                    THIS WEEK
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
