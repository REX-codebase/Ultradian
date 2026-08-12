import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Check, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { playMilestoneSound } from '../utils/audio';
import { subscribeToTribes, OFFICIAL_DEFAULT_TRIBES, TribeData } from '../services/tribeService';

export type { TribeData };

interface TribalLeaderboardCardProps {
  userTribeId: string;
  onSelectTribe: (tribeId: string) => void;
  userWeeklyHours?: number;
}

export const TribalLeaderboardCard: React.FC<TribalLeaderboardCardProps> = ({
  userTribeId,
  onSelectTribe,
  userWeeklyHours = 0,
}) => {
  const [copied, setCopied] = useState(false);
  const [tribes, setTribes] = useState<TribeData[]>(OFFICIAL_DEFAULT_TRIBES);

  useEffect(() => {
    const unsubscribe = subscribeToTribes((liveTribes) => {
      if (liveTribes && liveTribes.length > 0) {
        setTribes(liveTribes);
      }
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Calculate dynamic weekly hours for user's tribe
  const currentTribe = tribes.find((t) => t.id === userTribeId) || tribes[0] || OFFICIAL_DEFAULT_TRIBES[0];
  const sortedTribes = [...tribes].sort((a, b) => b.weeklyHours - a.weeklyHours);
  const userTribeRank = sortedTribes.findIndex((t) => t.id === userTribeId) + 1 || 1;
  const leadingTribe = sortedTribes[0] || currentTribe;

  const isLeading = userTribeRank === 1;
  const hoursBehind = isLeading ? 0 : Math.round((leadingTribe.weeklyHours - currentTribe.weeklyHours) * 10) / 10;

  const inviteMessage = `🔥 Join my tribe "${currentTribe.name}" on Ultradian Pulse! We're currently Rank #${userTribeRank} on the tribal leaderboards and ${
    isLeading ? 'leading the pack!' : `only ${hoursBehind} hrs behind "${leadingTribe.name}".`
  } Help us crush the gap! Track focus cycles: ${window.location.href}`;

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(inviteMessage);
    setCopied(true);
    playMilestoneSound();
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="w-full p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800/80 shadow-sm text-stone-900 dark:text-stone-100 transition-colors duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-4 mb-5">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 shadow-sm">
            <Users className="w-5 h-5 stroke-[1.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                Tribal Competition
              </span>
              <span className="text-xs font-bold text-stone-500 dark:text-stone-400">
                Your Tribe: {currentTribe.name}
              </span>
            </div>
            <h3 className="font-serif text-lg font-medium text-stone-950 dark:text-stone-50 mt-0.5">
              Tribal Leaderboard Standings
            </h3>
          </div>
        </div>

        {/* Tribe Selector Dropdown */}
        <div className="flex items-center space-x-2">
          <label className="text-xs text-stone-400 font-medium">Switch Tribe:</label>
          <select
            value={userTribeId}
            onChange={(e) => onSelectTribe(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-900 dark:text-stone-100 focus:outline-none"
          >
            {tribes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.icon} {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Viral Loop Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-stone-900 to-stone-950 text-stone-100 border border-stone-800 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 font-bold shrink-0">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-400">
              {isLeading ? '👑 Tribe Dominance' : '🔥 Rally Your Tribe'}
            </h4>
            <p className="text-xs font-medium text-stone-200 mt-0.5 leading-relaxed">
              {isLeading ? (
                <>Your tribe <strong className="text-white">{currentTribe.name}</strong> is leading the world this week!</>
              ) : (
                <>Your tribe <strong className="text-white">{currentTribe.name}</strong> is trailing <strong className="text-amber-300">{leadingTribe.name}</strong> by <strong className="text-emerald-400">{hoursBehind} hrs</strong> this week!</>
              )}
            </p>
          </div>
        </div>

        <button
          onClick={handleCopyInvite}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs uppercase tracking-wider shadow-sm flex items-center justify-center space-x-1.5 transition-all shrink-0 active:scale-95"
        >
          {copied ? <Check className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
          <span>{copied ? 'Invite Copied!' : 'Invite Peers to Close Gap'}</span>
        </button>
      </div>

      {/* Tribal Rankings List */}
      <div className="border border-stone-200/80 dark:border-stone-800/80 rounded-xl overflow-hidden divide-y divide-stone-100 dark:divide-stone-800/60">
        {sortedTribes.map((tribe, idx) => {
          const isUserTribe = tribe.id === userTribeId;
          return (
            <motion.div
              key={tribe.id}
              layout
              className={`flex items-center justify-between p-4 transition-colors ${
                isUserTribe
                  ? 'bg-stone-100/80 dark:bg-stone-800/60 font-semibold'
                  : 'bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800/30'
              }`}
            >
              <div className="flex items-center space-x-3 sm:space-x-4">
                <span
                  className={`w-5 text-center font-bold font-serif text-sm ${
                    idx === 0
                      ? 'text-yellow-500'
                      : idx === 1
                      ? 'text-slate-400'
                      : idx === 2
                      ? 'text-amber-700'
                      : 'text-stone-400 dark:text-stone-500'
                  }`}
                >
                  #{idx + 1}
                </span>

                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-bold text-base flex items-center justify-center border border-stone-200/80 dark:border-stone-700/80">
                    {tribe.icon}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-stone-900 dark:text-stone-100 block flex items-center gap-1.5">
                      <span>{tribe.name}</span>
                      {isUserTribe && (
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900">
                          My Tribe
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] text-stone-400 dark:text-stone-500 block mt-0.5">
                      {tribe.memberCount} members • Primary: {tribe.topCategory}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-sm font-serif font-light text-stone-900 dark:text-stone-100 block">
                  {tribe.weeklyHours.toFixed(1)} hrs
                </span>
                <span className="text-[9px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider block mt-0.5">
                  Accumulated Flow
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
