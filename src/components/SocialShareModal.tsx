import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LeagueTier, LeagueMember, RivalInfo } from '../types';
import { playMilestoneSound } from '../utils/audio';
import { leagueMark } from '../utils/leagueMarks';
import { Sheet } from './Sheet';
import {
  IconTrophy,
  IconClose,
  IconSparkle,
  IconCheck,
  IconTribe,
} from './icons';

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

const LEAGUE_BADGES: Record<LeagueTier, { name: string; icon: string; minHours: number }> = {
  wood: { name: 'Wood League', icon: leagueMark('wood'), minHours: 0 },
  bronze: { name: 'Bronze League', icon: leagueMark('bronze'), minHours: 5 },
  silver: { name: 'Silver League', icon: leagueMark('silver'), minHours: 12 },
  gold: { name: 'Gold League', icon: leagueMark('gold'), minHours: 20 },
  platinum: { name: 'Platinum League', icon: leagueMark('platinum'), minHours: 30 },
  diamond: { name: 'Diamond League', icon: leagueMark('diamond'), minHours: 45 },
  ultradian_master: { name: 'Ultradian Master', icon: leagueMark('ultradian_master'), minHours: 60 },
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
  const [activeTier, setActiveTier] = useState<LeagueTier>(currentLeague);

  const triggerHaptic = useCallback(() => {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(8);
      }
    } catch {}
  }, []);

  const shareText = `Ultradian — ${userStats.weeklyHours}h this week, ${userStats.completedCycles} waves, rank #${globalRank}.`;

  const handleCopyText = async () => {
    try {
      triggerHaptic();
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

  const handleTierChange = (tier: LeagueTier) => {
    triggerHaptic();
    setActiveTier(tier);
    if (onSelectLeague) onSelectLeague(tier);
  };

  const sortedLeaderboard = [...leagueMembers].sort((a, b) => b.weeklyHours - a.weeklyHours);

  const content = (
    <div className={`w-full ${isInline ? 'max-w-xl mx-auto space-y-6' : 'max-w-xl my-auto space-y-6'}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="liquid-glass-badge inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-widest text-[color:var(--ink-soft)] mb-1">
            <IconTrophy size={12} className="text-[color:var(--ink)]" />
            <span>Competitive Division</span>
          </span>
          <h2 className="font-serif text-2xl text-[color:var(--ink)] font-normal">League Standings</h2>
        </div>
        {!isInline && onClose && (
          <button
            type="button"
            onClick={() => {
              triggerHaptic();
              onClose();
            }}
            className="rounded-full p-2 text-[color:var(--ink-mute)] hover:text-[color:var(--ink)] hover:bg-[color:var(--line)]/50 transition-colors"
            title="Close modal"
          >
            <IconClose size={18} />
          </button>
        )}
      </div>

      {/* 1. Ghost Rival Pacing Card */}
      {rivalInfo && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="liquid-glass-card p-4 sm:p-5"
        >
          {rivalInfo.isLeading ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="liquid-glass-badge p-2 rounded-xl">
                  <IconTrophy size={18} className="text-[color:var(--ink)]" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[color:var(--ink-mute)]">
                    LEAGUE LEADER
                  </span>
                  <p className="text-xs font-semibold text-[color:var(--ink)] mt-0.5">
                    You hold Rank #1 in {LEAGUE_BADGES[currentLeague].name}!
                  </p>
                </div>
              </div>
              <span className="liquid-glass-badge rounded-full px-3 py-1 text-[10px] font-mono font-bold uppercase text-[color:var(--ink)]">
                1st Place
              </span>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="liquid-glass-badge p-2 rounded-xl">
                  <IconSparkle size={18} className="text-[color:var(--ink)]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[color:var(--ink-mute)]">
                      RIVAL PACING · NEXT RANK #{rivalInfo.rankAbove}
                    </span>
                  </div>
                  <p className="text-xs text-[color:var(--ink)] font-medium mt-0.5">
                    Surpass <strong className="font-semibold">{rivalInfo.rivalName}</strong> with another <strong className="font-mono">{rivalInfo.minutesBehind}m</strong> focus.
                  </p>
                </div>
              </div>
              <span className="liquid-glass-badge rounded-full px-3 py-1 text-[10px] font-mono text-[color:var(--ink-soft)] shrink-0">
                +{rivalInfo.minutesBehind}m to overtake
              </span>
            </div>
          )}
        </motion.div>
      )}

      {/* 2. Visual Stat Blocks */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="editorial-stat-card">
          <p className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[color:var(--ink-mute)]">Global Rank</p>
          <p className="clock-face font-serif text-3xl text-[color:var(--ink)] mt-1">#{globalRank}</p>
        </div>
        <div className="editorial-stat-card">
          <p className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[color:var(--ink-mute)]">Waves</p>
          <p className="clock-face font-serif text-3xl text-[color:var(--ink)] mt-1">{userStats.completedCycles}</p>
        </div>
        <div className="editorial-stat-card">
          <p className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[color:var(--ink-mute)]">Hours</p>
          <p className="clock-face font-serif text-3xl text-[color:var(--ink)] mt-1">{userStats.weeklyHours}h</p>
        </div>
        <div className="editorial-stat-card">
          <p className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[color:var(--ink-mute)]">Top Domain</p>
          <p className="font-serif text-2xl truncate text-[color:var(--ink)] mt-1">{userStats.topCategory}</p>
        </div>
      </div>

      <div className="flex justify-end">
        <motion.button
          type="button"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          onClick={handleCopyText}
          className="liquid-glass-badge rounded-full px-4 py-1.5 text-xs font-medium text-[color:var(--ink)] hover:bg-[color:var(--ink)] hover:text-[color:var(--paper)] transition-all flex items-center gap-1.5 cursor-pointer"
        >
          {copied ? (
            <>
              <IconCheck size={13} />
              <span>Copied to clipboard</span>
            </>
          ) : (
            <span>Copy summary snippet</span>
          )}
        </motion.button>
      </div>

      {/* 3. Tier Navigation Control Track */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-[color:var(--ink-mute)] flex items-center gap-1.5">
            <IconTribe size={14} className="text-[color:var(--ink-mute)]" />
            <span>Division Standings</span>
          </h3>
        </div>

        {/* Tier Selector Chips */}
        <div className="chip-rail max-w-full pb-1">
          {(Object.keys(LEAGUE_BADGES) as LeagueTier[]).map((tier) => {
            const badge = LEAGUE_BADGES[tier];
            const isActive = activeTier === tier;
            return (
              <motion.button
                key={tier}
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleTierChange(tier)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[color:var(--ink)] text-[color:var(--paper)] shadow-xs'
                    : 'text-[color:var(--ink-mute)] hover:text-[color:var(--ink)] hover:bg-[color:var(--line)]/40'
                }`}
              >
                <span className="text-xs">{badge.icon}</span>
                <span>{badge.name}</span>
              </motion.button>
            );
          })}
        </div>

        {/* 4. Real-Time Animated Leaderboard List */}
        <div className="liquid-glass-card overflow-hidden divide-y divide-[color:var(--line)]/60">
          {sortedLeaderboard.length === 0 ? (
            <div className="p-10 text-center text-[color:var(--ink-mute)]">
              <IconTrophy size={32} className="mx-auto mb-2 opacity-40 text-[color:var(--ink-mute)]" />
              <p className="text-xs font-medium text-[color:var(--ink)]">No live verified members in {LEAGUE_BADGES[activeTier].name} yet.</p>
              <p className="text-[11px] mt-1 text-[color:var(--ink-soft)]">Complete focus waves to climb the ranks and move into higher leagues.</p>
            </div>
          ) : (
            sortedLeaderboard.map((member, idx) => (
              <motion.div
                key={member.id}
                layout
                transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                className={`flex items-center justify-between p-4 sm:p-4.5 transition-colors ${
                  member.isUser
                    ? 'bg-[color:var(--ink)]/5 font-semibold'
                    : 'hover:bg-[color:var(--line)]/20'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span
                    className={`w-5 text-center font-mono font-bold text-sm ${
                      idx === 0
                        ? 'text-[color:var(--ink)] font-extrabold'
                        : 'text-[color:var(--ink-mute)]'
                    }`}
                  >
                    {idx === 0 ? <IconTrophy size={16} className="mx-auto text-[color:var(--ink)]" /> : `#${idx + 1}`}
                  </span>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[color:var(--paper-raised)] text-[color:var(--ink)] font-bold text-xs flex items-center justify-center border border-[color:var(--line)] shadow-xs">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-semibold text-[color:var(--ink)] flex items-center gap-2">
                        <span>{member.name}</span>
                        {member.isUser && (
                          <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-[color:var(--ink)] text-[color:var(--paper)]">
                            You
                          </span>
                        )}
                      </span>
                      <span className="text-[10px] font-mono text-[color:var(--ink-mute)] block mt-0.5">
                        {member.completedCycles} waves · {member.topCategory}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="clock-face text-sm sm:text-base font-serif font-medium text-[color:var(--ink)] block">
                    {member.weeklyHours}h
                  </span>
                  <span className="text-[9px] font-mono text-[color:var(--ink-mute)] uppercase tracking-wider block mt-0.5">
                    {member.focusScore} clarity
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
