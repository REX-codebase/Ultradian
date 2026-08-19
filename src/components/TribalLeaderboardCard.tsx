import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { IconTribe, IconTrophy, IconAlert } from './icons';
import { subscribeToTribes, TribeSummary } from '../services/leaderboardService';
import { tribeDisplayMark } from '../utils/leagueMarks';

interface TribalLeaderboardCardProps {
  userTribeId?: string;
}

/**
 * Shows only real, server-verified tribe documents.
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
    <section className="w-full space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <span className="liquid-glass-badge inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-widest text-[color:var(--ink-soft)] mb-1">
            <IconTribe size={12} className="text-[color:var(--ink)]" />
            <span>Tribal Resonance</span>
          </span>
          <h2 className="font-serif text-2xl text-[color:var(--ink)] font-normal">Tribe Standings</h2>
        </div>
        {currentTribe && (
          <span className="liquid-glass-badge rounded-full px-3 py-1 text-xs font-mono text-[color:var(--ink)]">
            Tribe: {currentTribe.name}
          </span>
        )}
      </header>

      {isLoading && (
        <div className="liquid-glass-card py-12 text-center text-xs font-mono text-[color:var(--ink-mute)]">
          <div className="ink-dot mx-auto mb-2" />
          <p>Syncing verified tribe standings…</p>
        </div>
      )}

      {!isLoading && error && (
        <div className="liquid-glass-card p-4 flex gap-3 text-xs text-[color:var(--ink-soft)]">
          <IconAlert size={16} className="shrink-0 mt-0.5 text-[color:var(--ink)]" />
          <p className="leading-relaxed">{error}</p>
        </div>
      )}

      {!isLoading && !error && tribes.length === 0 && (
        <div className="liquid-glass-card py-12 px-6 text-center text-[color:var(--ink-mute)]">
          <IconTribe size={36} className="mx-auto mb-3 text-[color:var(--ink-mute)] opacity-50" />
          <p className="text-sm font-medium text-[color:var(--ink)]">No verified tribes active</p>
          <p className="text-xs mt-1.5 max-w-sm mx-auto text-[color:var(--ink-soft)] leading-relaxed">
            Standings populate automatically when active community rosters sync to Firebase. Ultradian never displays placeholder accounts.
          </p>
        </div>
      )}

      {!isLoading && !error && tribes.length > 0 && (
        <div className="swift-glass-card overflow-hidden divide-y divide-[color:var(--line)]/60 shadow-sm">
          {tribes.map((tribe, index) => {
            const isUserTribe = tribe.id === userTribeId;
            const weeklyHours = Math.round((tribe.weeklyMinutes / 60) * 10) / 10;
            return (
              <motion.div
                key={tribe.id}
                layout
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                className={`flex items-center justify-between p-4 sm:p-5 transition-colors ${
                  isUserTribe
                    ? 'bg-[color:var(--ink)]/5 font-semibold'
                    : 'hover:bg-[color:var(--line)]/20'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span className="w-6 text-center font-mono font-bold text-sm text-[color:var(--ink-mute)]">
                    {index === 0 ? (
                      <IconTrophy size={18} className="mx-auto text-[color:var(--ink)]" />
                    ) : (
                      `#${index + 1}`
                    )}
                  </span>
                  
                  <div className="w-10 h-10 rounded-2xl bg-[color:var(--paper-raised)] text-[color:var(--ink)] font-semibold text-sm flex items-center justify-center border border-[color:var(--line)] shadow-xs">
                    {tribeDisplayMark(tribe.icon, tribe.name)}
                  </div>

                  <div>
                    <span className="text-xs sm:text-sm font-semibold text-[color:var(--ink)] flex items-center gap-2">
                      <span>{tribe.name}</span>
                      {isUserTribe && (
                        <span className="px-2 py-0.2 text-[9px] font-mono font-bold tracking-widest uppercase bg-[color:var(--ink)] text-[color:var(--paper)] rounded-full">
                          YOU
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] font-mono text-[color:var(--ink-mute)] block mt-0.5">
                      {tribe.memberCount} {tribe.memberCount === 1 ? 'member' : 'members'} · Focus: {tribe.topCategory}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="clock-face text-base sm:text-lg font-serif font-medium text-[color:var(--ink)] block">
                    {weeklyHours.toFixed(1)}h
                  </span>
                  <span className="text-[9px] font-mono font-semibold text-[color:var(--ink-mute)] uppercase tracking-wider block mt-0.5">
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
