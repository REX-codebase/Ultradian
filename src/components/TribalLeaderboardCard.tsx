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
        <p className="py-10 text-center text-sm text-stone-400">Loading tribes…</p>
      )}

      {!isLoading && error && (
        <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-950/20 border border-amber-500/30 flex gap-3 text-amber-900 dark:text-amber-200">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
          <p className="text-xs leading-relaxed">{error}</p>
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
                className={`flex items-center justify-between p-4.5 transition-all duration-200 ${
                  isUserTribe
                    ? 'bg-amber-500/10 dark:bg-amber-400/10 font-semibold border-l-4 border-amber-500'
                    : 'bg-white/60 dark:bg-stone-900/60 hover:bg-stone-50/80 dark:hover:bg-stone-850/80'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span className="w-6 text-center font-bold font-mono text-sm text-stone-500">
                    {index === 0 ? <Trophy className="w-5 h-5 mx-auto text-amber-500 drop-shadow-xs" /> : `#${index + 1}`}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-semibold text-sm flex items-center justify-center border border-stone-200 dark:border-stone-700">
                    {tribeDisplayMark(tribe.icon, tribe.name)}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                      {tribe.name}
                      {isUserTribe && (
                        <span className="px-2 py-0.2 text-[9px] font-mono font-bold tracking-widest uppercase bg-amber-500 text-stone-950 rounded-full">
                          YOU
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
