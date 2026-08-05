import React, { useState } from 'react';
import {
  Share2,
  Copy,
  Check,
  Flame,
  Clock,
  Sparkles,
  Users,
  Plus,
  X,
} from 'lucide-react';
import { FriendProfile } from '../types';

interface SocialShareModalProps {
  userStats: {
    weeklyHours: number;
    completedCycles: number;
    focusScore: number;
    topCategory: string;
  };
  friends: FriendProfile[];
  onAddFriend: (name: string, weeklyHours: number) => void;
  onClose?: () => void;
  isInline?: boolean;
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({
  userStats,
  friends,
  onAddFriend,
  onClose,
  isInline = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [newFriendName, setNewFriendName] = useState('');
  const [newFriendHours, setNewFriendHours] = useState('15.0');
  const [showAddForm, setShowAddForm] = useState(false);

  const shareText = `🧠 Ultradian Focus Pulse Stats:
⚡ Completed ${userStats.completedCycles} Ultradian (BRAC) Cycles
⏱️ ${userStats.weeklyHours} hours of deep flow state this week
🎯 Focus Quality Score: ${userStats.focusScore}/100
🔥 Primary Domain: ${userStats.topCategory}

Optimize your bio-rhythms with Ultradian Focus Pulse!`;

  const handleCopyText = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleAddFriendSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFriendName.trim()) return;
    onAddFriend(newFriendName.trim(), parseFloat(newFriendHours) || 10);
    setNewFriendName('');
    setShowAddForm(false);
  };

  const sortedLeaderboard = [...friends].sort((a, b) => b.weeklyHours - a.weeklyHours);

  const content = (
    <div className={`w-full ${isInline ? 'max-w-3xl mx-auto' : 'max-w-xl my-auto'} p-6 sm:p-8 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800/80 shadow-xl text-stone-900 dark:text-stone-100 transition-colors duration-300`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-5 mb-6">
        <div className="flex items-center space-x-3.5">
          <div className="p-2.5 rounded-xl bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 shadow-sm">
            <Share2 className="w-5 h-5 stroke-[1.5]" />
          </div>
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-medium text-stone-950 dark:text-stone-50">
              Community Leaderboard & Ledger
            </h2>
            <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">
              Compare weekly bio-rhythm stats & share verified focus waves
            </p>
          </div>
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

      {/* Visual Share Badge Card */}
      <div className="relative p-5 sm:p-6 rounded-xl bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 border border-stone-200/80 dark:border-stone-800/80 overflow-hidden mb-6">
        {/* Print ticket dotted line dividers */}
        <div className="flex items-center justify-between border-b border-dashed border-stone-200 dark:border-stone-800 pb-3 mb-4">
          <div className="flex items-center space-x-2">
            <span className="font-serif italic text-sm tracking-wide text-stone-900 dark:text-stone-100 font-medium">
              Ultradian Rhythm Ledger
            </span>
          </div>
          <span className="text-[9px] font-bold tracking-widest uppercase bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 px-2.5 py-1 rounded-md shadow-xs">
            VERIFIED WAVES
          </span>
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
              Clarity Quality Score
            </span>
            <span className="text-xl sm:text-2xl font-serif font-light text-stone-900 dark:text-stone-100 block">
              {userStats.focusScore} <span className="text-xs font-sans font-semibold uppercase text-stone-400 tracking-wider">/ 100</span>
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
            Verified cryptographic rhythm signature.
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

      {/* Comparison Leaderboard */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 flex items-center">
            <Users className="w-4 h-4 mr-1.5 text-stone-500" />
            Community Rhythm Standings
          </h3>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="text-xs font-bold text-stone-600 dark:text-stone-300 flex items-center hover:underline"
          >
            <Plus className="w-3.5 h-3.5 mr-0.5" />
            <span>Add peer to compare</span>
          </button>
        </div>

        {showAddForm && (
          <form
            onSubmit={handleAddFriendSubmit}
            className="p-4 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-center gap-2"
          >
            <input
              type="text"
              placeholder="Peer Handle..."
              value={newFriendName}
              onChange={(e) => setNewFriendName(e.target.value)}
              className="flex-1 w-full px-3.5 py-2 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs font-semibold text-stone-900 dark:text-stone-100 focus:outline-none"
            />
            <input
              type="number"
              placeholder="Weekly Hours"
              value={newFriendHours}
              onChange={(e) => setNewFriendHours(e.target.value)}
              className="w-full sm:w-28 px-3.5 py-2 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs font-semibold text-stone-900 dark:text-stone-100 focus:outline-none"
            />
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 font-bold text-xs uppercase tracking-wider"
            >
              Add Peer
            </button>
          </form>
        )}

        <div className="border border-stone-200/80 dark:border-stone-800/80 rounded-xl overflow-hidden divide-y divide-stone-100 dark:divide-stone-800/60">
          {sortedLeaderboard.length === 0 ? (
            <div className="p-8 text-center text-stone-400 dark:text-stone-500">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs font-medium">No live community standings recorded yet.</p>
              <p className="text-[10px] mt-1 text-stone-400">Complete focus sessions to sync your real rankings to Firebase!</p>
            </div>
          ) : (
            sortedLeaderboard.map((friend, idx) => (
              <div
                key={friend.id}
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
                        ? 'text-stone-900 dark:text-stone-100'
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
                      <span className="text-xs font-semibold text-stone-900 dark:text-stone-100 block">
                        {friend.name} {friend.isUser && '(You)'}
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
              </div>
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
