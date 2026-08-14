import React, { useState } from 'react';
import { Users, X, Trophy, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { LeagueTier, LeagueMember, RivalInfo } from '../types';
import { playMilestoneSound } from '../utils/audio';
import { leagueMark } from '../utils/leagueMarks';
import { Sheet } from './Sheet';

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
  wood: { name: 'Wood League', icon: leagueMark('wood'), color: '', border: '' },
  bronze: { name: 'Bronze League', icon: leagueMark('bronze'), color: '', border: '' },
  silver: { name: 'Silver League', icon: leagueMark('silver'), color: '', border: '' },
  gold: { name: 'Gold League', icon: leagueMark('gold'), color: '', border: '' },
  platinum: { name: 'Platinum League', icon: leagueMark('platinum'), color: '', border: '' },
  diamond: { name: 'Diamond League', icon: leagueMark('diamond'), color: '', border: '' },
  ultradian_master: { name: 'Ultradian Master', icon: leagueMark('ultradian_master'), color: '', border: '' },
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

  const handleCopyText = async () => {
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(shareText);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = shareText;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      playMilestoneSound();
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.warn('Clipboard write failed:', err);
    }
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
            <div className="flex items-center justify-between border border-[color:var(--line)] px-4 py-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-200">
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-[color:var(--ink-mute)]">
                    League leader
                  </h4>
                  <p className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                    You hold Rank #1 in {LEAGUE_BADGES[currentLeague].name}!
                  </p>
                </div>
              </div>
              <span className="text-xs text-[color:var(--ink-mute)]">First</span>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-stone-900 text-stone-100 dark:bg-stone-950 border border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
              <div className="flex items-center space-x-3">
                <div className="p-2 text-[color:var(--ink-mute)]">
                  <Zap className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs uppercase tracking-wider text-[color:var(--ink-mute)]">
                      Next rank
                    </span>
                    <span className="text-[10px] text-stone-400">
                      Rank #{rivalInfo.rankAbove}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-stone-200 mt-0.5">
                    Pass {rivalInfo.rivalName} by {rivalInfo.minutesBehind} minutes.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Visual Share Badge Card with Global Rank */}
      <div className="mb-8">
        <div className="grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4">
          <div>
            <p className="text-sm text-[color:var(--ink-mute)]">Rank</p>
            <p className="mt-1 font-serif text-3xl">#{globalRank}</p>
          </div>
          <div>
            <p className="text-sm text-[color:var(--ink-mute)]">Waves</p>
            <p className="mt-1 font-serif text-3xl">{userStats.completedCycles}</p>
          </div>
          <div>
            <p className="text-sm text-[color:var(--ink-mute)]">Hours</p>
            <p className="mt-1 font-serif text-3xl">{userStats.weeklyHours}</p>
          </div>
          <div>
            <p className="text-sm text-[color:var(--ink-mute)]">Domain</p>
            <p className="mt-1 font-serif text-3xl truncate">{userStats.topCategory}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleCopyText}
          className="pressable mt-5 min-h-11 text-sm text-[color:var(--ink-mute)] underline-offset-4 hover:underline"
        >
          {copied ? 'Copied' : 'Copy this week'}
        </button>
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
                <span className="inline-flex h-4 min-w-4 items-center justify-center text-[10px] font-semibold">
                  {badge.icon}
                </span>
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
    return <div className="w-full">{content}</div>;
  }

  return (
    <Sheet open onClose={onClose || (() => undefined)} size="lg">
      <div className="px-5 pb-6 pt-2 sm:px-7">{content}</div>
    </Sheet>
  );
};
