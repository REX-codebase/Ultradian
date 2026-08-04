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
  onClose: () => void;
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({
  userStats,
  friends,
  onAddFriend,
  onClose,
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto p-8 rounded-xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800/80 shadow-xs text-stone-900 dark:text-stone-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-5 mb-6">
          <div className="flex items-center space-x-3.5">
            <div className="p-2 rounded-sm bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900">
              <Share2 className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-medium text-stone-950 dark:text-stone-50">
                Weekly Performance Badge
              </h2>
              <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-0.5">
                Share your certified bio-rhythm stats and compare performance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Visual Share Badge Card - Redesigned as a stunning crisp architectural print ticket */}
        <div className="relative p-6 rounded-md bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-stone-800 overflow-hidden mb-6">
          {/* Print ticket dotted line dividers */}
          <div className="flex items-center justify-between border-b border-dashed border-stone-200 dark:border-stone-850 pb-3 mb-4">
            <div className="flex items-center space-x-2">
              <span className="font-serif italic text-sm tracking-wide text-stone-900 dark:text-stone-105 font-medium">
                Ultradian Rhythm Ledger
              </span>
            </div>
            <span className="text-[9px] font-bold tracking-widest uppercase bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 px-2 py-0.5 rounded-sm">
              VERIFIED WAVES
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 my-4">
            <div className="p-4 border border-stone-200/60 dark:border-stone-850/60 bg-white dark:bg-stone-900/40 rounded-sm">
              <span className="text-[9px] uppercase font-bold tracking-wider text-stone-400 block mb-1">
                Completed Cycles
              </span>
              <span className="text-2xl font-serif font-light text-stone-900 dark:text-stone-50 block">
                {userStats.completedCycles} <span className="text-xs font-sans font-medium uppercase text-stone-400 tracking-wider">BRAC</span>
              </span>
            </div>

            <div className="p-4 border border-stone-200/60 dark:border-stone-850/60 bg-white dark:bg-stone-900/40 rounded-sm">
              <span className="text-[9px] uppercase font-bold tracking-wider text-stone-400 block mb-1">
                Flow Accumulation
              </span>
              <span className="text-2xl font-serif font-light text-stone-900 dark:text-stone-50 block">
                {userStats.weeklyHours} <span className="text-xs font-sans font-medium uppercase text-stone-400 tracking-wider">Hrs</span>
              </span>
            </div>

            <div className="p-4 border border-stone-200/60 dark:border-stone-850/60 bg-white dark:bg-stone-900/40 rounded-sm">
              <span className="text-[9px] uppercase font-bold tracking-wider text-stone-400 block mb-1">
                Clarity Quality Score
              </span>
              <span className="text-2xl font-serif font-light text-stone-900 dark:text-stone-50 block">
                {userStats.focusScore} <span className="text-xs font-sans font-medium uppercase text-stone-400 tracking-wider">/ 100</span>
              </span>
            </div>

            <div className="p-4 border border-stone-200/60 dark:border-stone-850/60 bg-white dark:bg-stone-900/40 rounded-sm">
              <span className="text-[9px] uppercase font-bold tracking-wider text-stone-400 block mb-1">
                Primary Domain
              </span>
              <span className="text-sm font-bold tracking-wide text-stone-800 dark:text-stone-200 block truncate mt-1">
                {userStats.topCategory}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-dashed border-stone-200 dark:border-stone-850">
            <span className="text-[10px] text-stone-400 dark:text-stone-500 font-medium">
              Verified cryptographic rhythm signature.
            </span>
            <button
              onClick={handleCopyText}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-full bg-stone-900 dark:bg-stone-100 hover:bg-stone-850 dark:hover:bg-stone-200 text-stone-100 dark:text-stone-900 font-bold text-[10px] tracking-wider uppercase transition-all duration-200"
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
              <Users className="w-4 h-4 mr-1.5" />
              Community Rhythm Comparisons
            </h3>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="text-[11px] font-bold text-stone-600 dark:text-stone-300 flex items-center hover:underline"
            >
              <Plus className="w-3.5 h-3.5 mr-0.5" />
              <span>Add compare</span>
            </button>
          </div>

          {showAddForm && (
            <form
              onSubmit={handleAddFriendSubmit}
              className="p-4 rounded-md bg-stone-50 dark:bg-stone-900/45 border border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-center gap-2"
            >
              <input
                type="text"
                placeholder="Name..."
                value={newFriendName}
                onChange={(e) => setNewFriendName(e.target.value)}
                className="flex-1 w-full px-3 py-2 rounded-sm bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-850 text-xs text-stone-900 dark:text-white"
              />
              <input
                type="number"
                placeholder="Weekly Hours"
                value={newFriendHours}
                onChange={(e) => setNewFriendHours(e.target.value)}
                className="w-full sm:w-28 px-3 py-2 rounded-sm bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-850 text-xs text-stone-900 dark:text-white"
              />
              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2 rounded-sm bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 font-bold text-xs uppercase tracking-wider"
              >
                Add
              </button>
            </form>
          )}

          <div className="border border-stone-200 dark:border-stone-800 rounded-md overflow-hidden divide-y divide-stone-100 dark:divide-stone-800/80">
            {sortedLeaderboard.map((friend, idx) => (
              <div
                key={friend.id}
                className={`flex items-center justify-between p-4 transition-colors ${
                  friend.isUser
                    ? 'bg-stone-50 dark:bg-stone-900/50 font-semibold'
                    : 'bg-white dark:bg-stone-900 hover:bg-stone-50/40 dark:hover:bg-stone-850/20'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <span
                    className={`w-5 text-center font-bold font-serif text-sm ${
                      idx === 0
                        ? 'text-stone-900 dark:text-stone-100'
                        : 'text-stone-400'
                    }`}
                  >
                    {idx + 1}
                  </span>

                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-sm bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-350 font-bold text-xs flex items-center justify-center border border-stone-200/50 dark:border-stone-700/50">
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
                  <span className="text-[9px] font-bold text-stone-450 uppercase tracking-wider block mt-0.5">
                    {friend.focusScore} clarity
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
