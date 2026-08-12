import React, { useState } from 'react';
import {
  Share2,
  Copy,
  Check,
  Flame,
  Clock,
  Sparkles,
  Users,
  X,
  Trophy,
  Zap,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { motion } from 'motion/react';
import { LeagueTier, LeagueMember, RivalInfo } from '../types';
import { playMilestoneSound } from '../utils/audio';

interface SocialShareModalProps {
  userStats: {
    weeklyHours: number;
    completedCycles: number;
    focusScore: number;
    topCategory: string;
  };
  globalRank?: number;
  rivalInfo?: RivalInfo | null;
  currentLeague?: LeagueTier;
  leagueMembers?: LeagueMember[];
  onSelectLeague?: (league: LeagueTier) => void;
  onClose?: () => void;
  isInline?: boolean;
}

const LEAGUE_BADGES: Record<LeagueTier, { name: string; icon: string; color: string; border: string }> = {
  wood: { name: 'Wood League', icon: '🪵', color: 'from-amber-900/20 to-amber-950/20 text-amber-700 dark:text-amber-400', border: 'border-amber-700/30' },
  bronze: { name: 'Bronze League', icon: '🥉', color: 'from-orange-900/20 to-orange-950/20 text-orange-700 dark:text-orange-400', border: 'border-orange-700/30' },
  silver: { name: 'Silver League', icon: '🥈', color: 'from-slate-400/20 to-slate-500/20 text-slate-700 dark:text-slate-300', border: 'border-slate-400/30' },
  gold: { name: 'Gold League', icon: '🥇', color: 'from-amber-400/20 to-yellow-500/20 text-yellow-700 dark:text-yellow-400', border: 'border-yellow-500/30' },
  platinum: { name: 'Platinum League', icon: '💎', color: 'from-cyan-400/20 to-blue-500/20 text-cyan-700 dark:text-cyan-300', border: 'border-cyan-400/30' },
  diamond: { name: 'Diamond League', icon: '💠', color: 'from-indigo-400/20 to-violet-500/20 text-indigo-700 dark:text-indigo-300', border: 'border-indigo-400/30' },
  ultradian_master: { name: 'Ultradian Master', icon: '⚡', color: 'from-emerald-400/20 to-teal-500/20 text-emerald-700 dark:text-emerald-300', border: 'border-emerald-400/30' },
};

export const SocialShareModal: React.FC<SocialShareModalProps> = ({
  userStats,
  globalRank = 1,
  rivalInfo,
  currentLeague = 'wood',
  leagueMembers = [],
  onSelectLeague,
  onClose,
  isInline = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<LeagueTier>(currentLeague);

  const shareText = `Ultradian — ${userStats.weeklyHours}h this week, ${userStats.completedCycles} waves, rank #${globalRank}.`;

  const handleCopyText = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    playMilestoneSound();
    setTimeout(() => setCopied(false), 2500);
  };

  const handleTabChange = (tier: LeagueTier) => {
    setActiveTab(tier);
    if (onSelectLeague) onSelectLeague(tier);
  };

  // Never fall back to local peers or global documents. Empty means no verified
  // Firebase members are currently present in this selected league.
  const displayList = leagueMembers;

  const sortedLeaderboard = [...displayList].sort((a, b) => b.weeklyHours - a.weeklyHours);

  const content = (
    <div className={`w-full ${isInline ? 'max-w-xl mx-auto' : 'max-w-xl my-auto'} text-stone-900 dark:text-stone-100 ${isInline ? '' : 'p-6 sm:p-8 rounded-2xl bg-[color:var(--paper)] border border-stone-200/80 dark:border-stone-800/80'}`}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-serif text-xl text-stone-900 dark:text-stone-50">League</h2>
          <p className="mt-1 text-sm text-stone-500">This week’s verified standings.</p>
        </div>
        {!isInline && onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* STEP 2.1: Ghost Pacing (Rival Tracking) Banner */}
      {rivalInfo && (
        <div className="mb-6">
          {rivalInfo.isLeading ? (
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-500/10 border border-yellow-500/40 text-stone-900 dark:text-stone-100 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-yellow-500/20 text-yellow-600 dark:text-yellow-300 font-bold">
                  👑
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-yellow-700 dark:text-yellow-400">
                    League Leader
                  </h4>
                  <p className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                    You hold Rank #1 in {LEAGUE_BADGES[currentLeague].name}!
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded bg-yellow-500/20 text-yellow-700 dark:text-yellow-300">
                Pacesetter
              </span>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-stone-900 text-stone-100 dark:bg-stone-950 border border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-red-500/20 text-red-400 font-bold animate-pulse">
                  <Zap className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">
                      Rival Target Ahead
                    </span>
                    <span className="text-[10px] text-stone-400">
                      Rank #{rivalInfo.rankAbove}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-stone-200 mt-0.5">
                    Pass <span className="font-bold text-white">{rivalInfo.rivalName}</span> in{' '}
                    <span className="font-bold text-emerald-400">{rivalInfo.minutesBehind} mins</span> ({rivalInfo.cyclesToPass} wave cycle) to claim Rank #{rivalInfo.rankAbove}!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Visual Share Badge Card with Global Rank */}
      <div className="relative p-5 sm:p-6 rounded-xl bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 border border-stone-200/80 dark:border-stone-800/80 overflow-hidden mb-6">
        <div className="flex items-center justify-between border-b border-dashed border-stone-200 dark:border-stone-800 pb-3 mb-4">
          <div className="flex items-center space-x-2">
            <span className="font-serif italic text-sm tracking-wide text-stone-900 dark:text-stone-100 font-medium">
              Ultradian Rhythm Ledger
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {/* STEP 2.2: True Global Rank Badge */}
            <span className="text-[10px] font-bold tracking-wider uppercase bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 px-2.5 py-1 rounded-md shadow-xs flex items-center gap-1">
              <Trophy className="w-3 h-3 text-yellow-400 fill-current" />
              <span>Global Rank #{globalRank}</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 my-4">
          <div className="p-3.5 sm:p-4 border border-stone-200/60 dark:border-stone-800/60 bg-white dark:bg-stone-900/60 rounded-xl">
            <span className="text-[9px] uppercase font-bold tracking-wider text-stone-400 dark:text-stone-500 block mb-1">
              Completed Cycles
            </span>
            <span className="text-xl sm:text-2xl font-serif font-light text-stone-900 dark:text-stone-100 block">
              {userStats.completedCycles} <span className="text-xs font-sans font-semibold uppercase text-stone-400 tracking-wider">BRAC</span>
            </span>
          </div>

          <div className="p-3.5 sm:p-4 border border-stone-200/60 dark:border-stone-800/60 bg-white dark:bg-stone-900/60 rounded-xl">
            <span className="text-[9px] uppercase font-bold tracking-wider text-stone-400 dark:text-stone-500 block mb-1">
              Flow Accumulation
            </span>
            <span className="text-xl sm:text-2xl font-serif font-light text-stone-900 dark:text-stone-100 block">
              {userStats.weeklyHours} <span className="text-xs font-sans font-semibold uppercase text-stone-400 tracking-wider">Hrs</span>
            </span>
          </div>

          <div className="p-3.5 sm:p-4 border border-stone-200/60 dark:border-stone-800/60 bg-white dark:bg-stone-900/60 rounded-xl">
            <span className="text-[9px] uppercase font-bold tracking-wider text-stone-400 dark:text-stone-500 block mb-1">
              Active Matchmaking League
            </span>
            <span className="text-sm font-bold tracking-wide text-stone-800 dark:text-stone-200 block truncate mt-1 flex items-center gap-1.5">
              <span>{LEAGUE_BADGES[currentLeague].icon}</span>
              <span>{LEAGUE_BADGES[currentLeague].name}</span>
            </span>
          </div>

          <div className="p-3.5 sm:p-4 border border-stone-200/60 dark:border-stone-800/60 bg-white dark:bg-stone-900/60 rounded-xl">
            <span className="text-[9px] uppercase font-bold tracking-wider text-stone-400 dark:text-stone-500 block mb-1">
              Primary Domain
            </span>
            <span className="text-xs sm:text-sm font-bold tracking-wide text-stone-800 dark:text-stone-200 block truncate mt-1">
              {userStats.topCategory}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-dashed border-stone-200 dark:border-stone-800">
          <span className="text-[10px] text-stone-400 dark:text-stone-500 font-medium">
            Verified Cloud Function atomic calculation.
          </span>
          <button
            onClick={handleCopyText}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-stone-200 text-stone-100 dark:text-stone-900 font-bold text-[10px] tracking-wider uppercase transition-all duration-200 active:scale-95"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Ledger Copied!' : 'Copy Ledger'}</span>
          </button>
        </div>
      </div>

      {/* STEP 2.3: Matchmaking Leagues Tier Selector */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 flex items-center">
            <Users className="w-4 h-4 mr-1.5 text-stone-500" />
            League Division Standings
          </h3>

        </div>

        {/* League Tier Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {(Object.keys(LEAGUE_BADGES) as LeagueTier[]).map((tier) => {
            const badge = LEAGUE_BADGES[tier];
            const isActive = activeTab === tier;
            return (
              <button
                key={tier}
                onClick={() => handleTabChange(tier)}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap border transition-all ${
                  isActive
                    ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 border-stone-900 dark:border-stone-100 shadow-xs'
                    : 'bg-stone-50 dark:bg-stone-950 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-900'
                }`}
              >
                <span>{badge.icon}</span>
                <span>{badge.name}</span>
              </button>
            );
          })}
        </div>


        {/* STEP 3.1: Real-Time Layout Animated Leaderboard List */}
        <div className="border border-stone-200/80 dark:border-stone-800/80 rounded-xl overflow-hidden divide-y divide-stone-100 dark:divide-stone-800/60">
          {sortedLeaderboard.length === 0 ? (
            <div className="p-8 text-center text-stone-400 dark:text-stone-500">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs font-medium">No live members in {LEAGUE_BADGES[activeTab].name} yet.</p>
              <p className="text-[10px] mt-1 text-stone-400">Complete work sessions to move into higher leagues!</p>
            </div>
          ) : (
            sortedLeaderboard.map((friend, idx) => (
              <motion.div
                key={friend.id}
                layout
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                className={`flex items-center justify-between p-4 transition-colors ${
                  friend.isUser
                    ? 'bg-stone-100/70 dark:bg-stone-800/50 font-semibold'
                    : 'bg-white dark:bg-stone-900 hover:bg-stone-50/50 dark:hover:bg-stone-800/30'
                }`}
              >
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <span
                    className={`w-5 text-center font-bold font-serif text-sm ${
                      idx === 0
                        ? 'text-yellow-600 dark:text-yellow-400'
                        : idx === 1
                        ? 'text-slate-400'
                        : idx === 2
                        ? 'text-amber-700'
                        : 'text-stone-400 dark:text-stone-500'
                    }`}
                  >
                    {idx + 1}
                  </span>

                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-bold text-xs flex items-center justify-center border border-stone-200/80 dark:border-stone-700/80">
                      {friend.name.charAt(0)}
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-stone-900 dark:text-stone-100 block flex items-center gap-1.5">
                        <span>{friend.name}</span>
                        {friend.isUser && (
                          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900">
                            You
                          </span>
                        )}
                      </span>
                      <span className="text-[10px] text-stone-400 dark:text-stone-500 block mt-0.5">
                        {friend.completedCycles} waves • {friend.topCategory}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-serif font-light text-stone-900 dark:text-stone-100 block">
                    {friend.weeklyHours} hrs
                  </span>
                  <span className="text-[9px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider block mt-0.5">
                    {friend.focusScore} clarity
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  if (isInline) {
    return <div className="w-full animate-fade-in">{content}</div>;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-md p-4 sm:p-6 flex items-start sm:items-center justify-center min-h-screen py-8 sm:py-12 animate-fade-in">
      {content}
    </div>
  );
};
