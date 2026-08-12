/**
 * VIP Code Gate Component
 * 
 * Provides a secure interface for VIP code validation with dual unlock options:
 * 1. Standard authentication (email/Google)
 * 2. Creator VIP passcode (5-digit numeric)
 * 
 * Features:
 * - Server-side validation endpoint
 * - Rate limiting (2 attempts max client-side, 5 attempts/hr server-side)
 * - Lockout after max failed attempts
 * - Visual feedback for all states
 * - Inline or modal display options
 * 
 * @example
 * ```tsx
 * // Inline usage
 * <VipCodeGate 
 *   featureName="AI Recommendations"
 *   onUnlocked={() => console.log('Unlocked!')}
 * />
 * 
 * // Modal usage
 * <VipCodeGate
 *   isInline={false}
 *   onCloseModal={() => setShowGate(false)}
 * />
 * ```
 */

import React, { useState } from 'react';
import { KeyRound, Lock, ShieldAlert, CheckCircle2, ArrowRight, UserCheck, AlertTriangle, Loader2 } from 'lucide-react';
import { getVipState, validateVipCode, VipState } from '../utils/vipAccess';

export interface VipCodeGateProps {
  featureName?: string;
  featureDescription?: string;
  onUnlocked?: () => void;
  onOpenAuth?: () => void;
  isInline?: boolean;
  onCloseModal?: () => void;
}

export const VipCodeGate: React.FC<VipCodeGateProps> = ({
  featureName = 'Special AI Recommendations',
  featureDescription = 'Access tailored AI focus recommendations, target analysis, weekly rhythm narratives, and all current & future signed-in features.',
  onUnlocked,
  onOpenAuth,
  isInline = true,
  onCloseModal,
}) => {
  const [vipState, setVipState] = useState<VipState>(() => getVipState());
  const [codeInput, setCodeInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success' | 'warning'; text: string } | null>(null);

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeInput.trim() || isVerifying) return;

    setIsVerifying(true);
    setFeedback(null);

    const result = await validateVipCode(codeInput);
    const updatedState = getVipState();
    setVipState(updatedState);
    setIsVerifying(false);

    if (result.success) {
      setFeedback({ type: 'success', text: result.message || 'VIP Access Unlocked!' });
      setCodeInput('');
      if (onUnlocked) {
        onUnlocked();
      }
    } else {
      setFeedback({
        type: result.isLockedOut ? 'error' : 'warning',
        text: result.message || result.error || 'Validation failed',
      });
    }
  };

  const cardContent = (
    <div className="p-4 sm:p-8 rounded-2xl bg-white/95 dark:bg-stone-900/95 border border-amber-500/30 dark:border-amber-500/20 shadow-md relative overflow-hidden space-y-4 sm:space-y-6">
      {/* Top Gradient Bar */}
      <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-500 via-stone-800 to-indigo-600 dark:from-amber-400 dark:via-stone-200 dark:to-indigo-400" />

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 border-b border-stone-200/80 dark:border-stone-800 pb-3 sm:pb-4">
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            <div className="p-2 sm:p-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
              <Lock className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.8]" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
              SIGNED-IN & CREATOR VIP EXCLUSIVE
            </span>
            <h3 className="font-serif text-lg sm:text-2xl font-medium text-stone-900 dark:text-stone-100">
              {featureName}
            </h3>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <span className="px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-full border border-stone-200 dark:border-stone-700">
            {vipState.isLockedOut ? '🔒 Entry Locked (2/2 Failed)' : `Attempts: ${vipState.failedAttempts}/2`}
          </span>
        </div>
      </div>

      <p className="text-[11px] sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed font-sans">
        {featureDescription}
      </p>

      {/* Dual Unlock Options: 1) Sign In   2) Enter Special Code */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-5 pt-1">
        {/* Option 1: Standard Sign In */}
        <div className="p-3 sm:p-5 rounded-xl bg-stone-50 dark:bg-stone-850 border border-stone-200/80 dark:border-stone-800 flex flex-col justify-between space-y-2 sm:space-y-3">
          <div className="space-y-1">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-stone-900 dark:text-stone-100">
              <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Option 1: Sign In or Register</span>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-snug">
              Sign in with your email or Google account to unlock AI recommendations and cloud synchronization.
            </p>
          </div>

          <button
            onClick={onOpenAuth}
            className="w-full py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-stone-100 dark:text-stone-900 text-xs font-bold uppercase tracking-wider transition-all shadow-xs flex items-center justify-center space-x-2 cursor-pointer"
          >
            <span>Sign In Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Option 2: Enter Creator Code */}
        <div className="p-3 sm:p-5 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/30 dark:border-amber-500/20 flex flex-col justify-between space-y-2 sm:space-y-3">
          <div className="space-y-1">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-900 dark:text-amber-200">
              <KeyRound className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Option 2: Enter Creator VIP Passcode</span>
            </div>
            <p className="text-[11px] text-amber-900/80 dark:text-amber-300/80 font-medium leading-snug">
              System Requirement: Enter the numeric passcode (5 numeric digits, e.g. 12345). Entry will be permanently stopped after 2 failed tries.
            </p>
          </div>

          <form onSubmit={handleCodeSubmit} className="space-y-2">
            <div className="relative">
              <input
                type="text"
                disabled={vipState.isLockedOut || vipState.isUnlocked || isVerifying}
                placeholder={vipState.isLockedOut ? 'Entry stopped (2/2 failed tries)' : 'Enter 5-digit numeric code (e.g. 12345)...'}
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-xs font-mono font-bold text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 disabled:bg-stone-100 dark:disabled:bg-stone-800"
              />
            </div>

            <button
              type="submit"
              disabled={vipState.isLockedOut || vipState.isUnlocked || !codeInput.trim() || isVerifying}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-stone-950 text-xs font-bold uppercase tracking-wider transition-all shadow-xs flex items-center justify-center space-x-1.5 disabled:opacity-50 cursor-pointer"
            >
              {isVerifying ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <KeyRound className="w-3.5 h-3.5" />
              )}
              <span>
                {isVerifying
                  ? 'Verifying with Server...'
                  : vipState.isLockedOut
                  ? 'Entry Stopped (Locked Out)'
                  : 'Verify VIP Code'}
              </span>
            </button>
          </form>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-start space-x-2.5 ${
            feedback.type === 'error'
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-900/60 text-rose-800 dark:text-rose-200'
              : feedback.type === 'warning'
              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-900/60 text-amber-800 dark:text-amber-200'
              : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-200'
          }`}
        >
          {feedback.type === 'error' ? (
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
          ) : feedback.type === 'warning' ? (
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
          )}
          <span className="font-semibold">{feedback.text}</span>
        </div>
      )}
    </div>
  );

  if (!isInline) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-md animate-fade-in">
        <div className="w-full max-w-2xl relative">
          {onCloseModal && (
            <button
              onClick={onCloseModal}
              className="absolute top-4 right-4 z-10 p-2 text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
            >
              ✕
            </button>
          )}
          {cardContent}
        </div>
      </div>
    );
  }

  return cardContent;
};
