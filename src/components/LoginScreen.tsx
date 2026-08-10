import React, { useState } from 'react';
import { Clock, Mail, Lock, User, Sparkles, AlertCircle, ArrowRight, Chrome, CheckCircle2, X, Cloud, KeyRound, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';
import {
  signInWithEmail,
  signUpWithEmail,
  signInAnonymouslyUser,
  signInWithGoogle,
} from '../services/authService';
import { getVipState, attemptVipCode } from '../utils/vipAccess';
import { FluidCanvas } from './FluidCanvas';

interface LoginScreenProps {
  onAuthSuccess: (user: any) => void;
  onBypassAuth?: () => void;
  onClose?: () => void;
  isModal?: boolean;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onAuthSuccess, onClose, isModal = false }) => {
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [error, setError] = useState<React.ReactNode | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Creator VIP Code State
  const [vipCodeInput, setVipCodeInput] = useState<string>('');
  const [vipState, setVipState] = useState(() => getVipState());
  const [showVipSection, setShowVipSection] = useState<boolean>(false);

  const handleVipSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vipCodeInput.trim()) return;

    const res = attemptVipCode(vipCodeInput);
    const updated = getVipState();
    setVipState(updated);

    if (res.success) {
      setError(
        <div className="space-y-1 text-left text-xs">
          <p className="font-bold text-emerald-800 dark:text-emerald-400">✨ Creator VIP Code Verified!</p>
          <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
            All current and future features are now unlocked for you without signing in.
          </p>
        </div>
      );
      setTimeout(() => {
        if (onClose) onClose();
      }, 1200);
    } else {
      setError(
        <div className="space-y-1 text-left text-xs">
          <p className="font-bold text-red-800 dark:text-red-400">
            {res.isLockedOut ? '🚫 Entry Stopped (Locked Out)' : '❌ Incorrect VIP Code'}
          </p>
          <p className="text-stone-600 dark:text-stone-300 leading-relaxed">{res.message}</p>
        </div>
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        if (!displayName.trim()) {
          throw new Error('Please enter a display name for the leaderboard.');
        }
        const user = await signUpWithEmail(email, password, displayName);
        onAuthSuccess(user);
      } else {
        const user = await signInWithEmail(email, password);
        onAuthSuccess(user);
      }
    } catch (err: any) {
      console.error('Authentication Error:', err);
      const errCode = err?.code || '';
      const errMsg = err?.message || 'An unexpected authentication error occurred.';

      let errorTitle = 'Authentication Error';
      let errorDesc = errMsg;

      if (errCode === 'auth/operation-not-allowed' || errMsg.includes('operation-not-allowed')) {
        errorTitle = 'Email/Password Authentication Disabled';
        errorDesc = 'Email/Password sign-in is not enabled in Firebase Auth settings. You can still sign in as a Guest or with Google.';
      } else if (errCode === 'auth/unauthorized-domain' || errMsg.includes('unauthorized-domain')) {
        errorTitle = 'Unauthorized Domain';
        errorDesc = 'This preview domain is not in the authorized domains list for popups.';
      } else if (errMsg.includes('auth/invalid-credential') || errMsg.includes('auth/user-not-found') || errMsg.includes('auth/wrong-password')) {
        errorTitle = 'Sign In Failed';
        errorDesc = 'Invalid email or password. If you don\'t have an account yet, switch to Register or use Quick Test Account below.';
      } else if (errMsg.includes('auth/email-already-in-use')) {
        errorTitle = 'Account Exists';
        errorDesc = 'This email address is already registered. Switch to Sign In to log in with this email.';
      } else if (errMsg.includes('auth/weak-password')) {
        errorTitle = 'Weak Password';
        errorDesc = 'Password must be at least 6 characters long.';
      } else if (errMsg.includes('auth/invalid-email')) {
        errorTitle = 'Invalid Email';
        errorDesc = 'Please enter a valid email address.';
      }

      setError(
        <div className="space-y-1.5 text-left">
          <p className="font-bold text-red-800 dark:text-red-400">{errorTitle}</p>
          <p className="font-normal text-stone-600 dark:text-stone-300 leading-relaxed text-xs">{errorDesc}</p>
        </div>
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFillTestCredentials = () => {
    setEmail('tester@ultradian.app');
    setPassword('test123456');
    if (isSignUp && !displayName) {
      setDisplayName('Focus Tester');
    }
  };

  const handleGuestLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const user = await signInAnonymouslyUser();
      onAuthSuccess(user);
    } catch (err: any) {
      console.error('Anonymous login failed:', err);
      const errMsg = err?.message || '';
      if (errMsg.includes('operation-not-allowed')) {
        setError(
          <div className="space-y-1 text-left text-xs">
            <p className="font-bold text-amber-800 dark:text-amber-400">Guest Sign-In Notice</p>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
              Anonymous sign-in is disabled in Firebase Console. Please register or sign in with Email & Password.
            </p>
          </div>
        );
      } else {
        setError('Failed to sign in as guest. Please try email sign in.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const user = await signInWithGoogle();
      onAuthSuccess(user);
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      const errCode = err?.code || '';
      const errMsg = err?.message || 'Google login error occurred.';

      let errorTitle = 'Google Sign-In Notice';
      let errorDesc = errMsg;

      if (errCode === 'auth/unauthorized-domain' || errMsg.includes('unauthorized-domain')) {
        errorTitle = 'Domain Authorization Required';
        errorDesc = 'Google OAuth popup requires domain authorization. Please use Email/Password Sign-In or Guest Sign-In below for preview testing.';
      } else if (errMsg.includes('auth/popup-blocked')) {
        errorTitle = 'Popup Blocked';
        errorDesc = 'The sign-in popup was blocked by your browser. Please allow popups or use Email/Password sign-in.';
      } else if (errMsg.includes('auth/popup-closed-by-user')) {
        errorTitle = 'Popup Closed';
        errorDesc = 'The Google sign-in window was closed before completing.';
      }

      setError(
        <div className="space-y-1.5 text-left text-xs">
          <p className="font-bold text-red-800 dark:text-red-400">{errorTitle}</p>
          <p className="font-normal text-stone-600 dark:text-stone-300 leading-relaxed">{errorDesc}</p>
        </div>
      );
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-10 w-full max-w-md my-auto bg-stone-50/95 dark:bg-stone-950/95 backdrop-blur-xl border border-stone-200/80 dark:border-stone-900/80 shadow-2xl p-5 sm:p-7 rounded-2xl max-h-[85vh] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-stone-300 dark:[&::-webkit-scrollbar-thumb]:bg-stone-700"
    >
      {/* Close Button if Modal or onClose provided */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/50 dark:hover:bg-stone-800/50 transition-colors z-20"
          title="Close sign in"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Brand Banner */}
      <div className="flex flex-col items-center mb-6">
        <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 mb-3 shadow-lg">
          <Clock className="w-5 h-5 stroke-[1.5]" />
        </div>
        <h1 className="font-serif text-2xl tracking-tight text-center font-medium text-stone-900 dark:text-stone-100">
          Ultradian <span className="italic font-light text-stone-500 dark:text-stone-400">Pulse</span>
        </h1>
        <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-1 font-semibold tracking-wider uppercase text-center">
          Basic Rest-Activity Cycle (BRAC) Companion
        </p>
      </div>

      {/* Guest Mode Notice Banner */}
      <div className="mb-5 p-3 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-200/70 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-300 flex items-start gap-2.5">
        <Cloud className="w-4 h-4 text-stone-800 dark:text-stone-200 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-stone-900 dark:text-stone-100 block">Guest Mode is Active</strong>
          All focus waves and settings are saved locally on your device. Sign in or register to sync data to the cloud.
        </div>
      </div>

      {/* Auth Mode Selector Tabs */}
      <div className="flex bg-stone-200/60 dark:bg-stone-900/60 p-1 rounded-xl mb-5">
        <button
          type="button"
          onClick={() => {
            setIsSignUp(false);
            setError(null);
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            !isSignUp
              ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-sm'
              : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setIsSignUp(true);
            setError(null);
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            isSignUp
              ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-sm'
              : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          Register / Sync
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 p-3.5 rounded-xl bg-red-50/90 dark:bg-red-950/30 border border-red-200/60 dark:border-red-900/40 flex items-start gap-3"
        >
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div className="text-xs font-semibold text-red-700 dark:text-red-300 leading-normal grow">
            {error}
          </div>
        </motion.div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {isSignUp && (
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
              Leaderboard Handle / Display Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500" />
              <input
                type="text"
                required
                placeholder="e.g. WaveRider"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-100/60 dark:bg-stone-900/50 border border-stone-200/80 dark:border-stone-800/80 text-xs font-semibold text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-stone-400 dark:focus:ring-stone-600 focus:border-transparent transition-all"
              />
            </div>
          </div>
        )}

        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
              Email Address
            </label>
            <button
              type="button"
              onClick={handleFillTestCredentials}
              className="text-[10px] text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 font-semibold flex items-center gap-1 transition-colors"
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Fill Test Credentials</span>
            </button>
          </div>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500" />
            <input
              type="email"
              required
              placeholder="name@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-100/60 dark:bg-stone-900/50 border border-stone-200/80 dark:border-stone-800/80 text-xs font-semibold text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-stone-400 dark:focus:ring-stone-600 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500" />
            <input
              type="password"
              required
              placeholder={isSignUp ? 'At least 6 characters' : '••••••••'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-100/60 dark:bg-stone-900/50 border border-stone-200/80 dark:border-stone-800/80 text-xs font-semibold text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-stone-400 dark:focus:ring-stone-600 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 mt-4 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-stone-200 text-stone-100 dark:text-stone-900 text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-stone-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>{isSignUp ? 'Sync Local Data to Account' : 'Sign In & Sync Cloud'}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Alternate Firebase Auth Options */}
      <div className="mt-5 flex flex-col items-center gap-2.5 border-t border-stone-200/60 dark:border-stone-900/60 pt-5">
        <div className="flex items-center gap-2 w-full text-stone-300 dark:text-stone-800">
          <div className="h-[1px] bg-stone-200 dark:bg-stone-900 grow" />
          <span className="text-[9px] uppercase tracking-widest font-extrabold text-stone-400 dark:text-stone-500">
            or sign in with
          </span>
          <div className="h-[1px] bg-stone-200 dark:bg-stone-900 grow" />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-xl border border-stone-200 dark:border-stone-900 bg-white dark:bg-stone-900 hover:bg-stone-100/50 dark:hover:bg-stone-800/50 text-stone-700 dark:text-stone-300 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xs"
        >
          <Chrome className="w-3.5 h-3.5 text-stone-500" />
          <span>Google Sign-In</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (onClose) {
              onClose();
            } else {
              handleGuestLogin();
            }
          }}
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-xl border border-stone-200 dark:border-stone-900 hover:bg-stone-100/50 dark:hover:bg-stone-900/30 text-stone-600 dark:text-stone-400 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Continue in Local Guest Mode</span>
        </button>

        {/* Creator VIP Code Section */}
        <div className="w-full pt-2">
          <button
            type="button"
            onClick={() => setShowVipSection(!showVipSection)}
            className="w-full py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-between cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-amber-500" />
              <span>Have Creator VIP Passcode?</span>
            </span>
            <span className="text-[10px] font-mono font-bold bg-amber-500/20 px-2 py-0.5 rounded-md">
              {vipState.isUnlocked ? 'Verified ✓' : vipState.isLockedOut ? 'Locked Out' : `${vipState.failedAttempts}/2 Tries`}
            </span>
          </button>

          {showVipSection && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              onSubmit={handleVipSubmit}
              className="mt-2 p-3 rounded-xl bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/20 space-y-2 text-left"
            >
              <div className="space-y-0.5">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                  <span>Enter 5-Word Numeric Code</span>
                  <span>{vipState.isLockedOut ? '0 Tries Left' : `${2 - vipState.failedAttempts} Try Remaining`}</span>
                </div>
                <p className="text-[10px] text-amber-700/80 dark:text-amber-400/80">
                  System passcode: 5 numeric digits (e.g. 12345). Entry stopped after 2 failed tries.
                </p>
              </div>

              <input
                type="text"
                disabled={vipState.isLockedOut || vipState.isUnlocked}
                placeholder={vipState.isLockedOut ? 'Entry stopped (2/2 failed tries)' : 'Enter 5-digit numeric code (e.g. 12345)...'}
                value={vipCodeInput}
                onChange={(e) => setVipCodeInput(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-xs font-mono font-bold text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:opacity-50"
              />

              <button
                type="submit"
                disabled={vipState.isLockedOut || vipState.isUnlocked || !vipCodeInput.trim()}
                className="w-full py-2 px-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-white dark:text-stone-950 font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
              >
                {vipState.isUnlocked ? 'VIP Unlocked ✓' : vipState.isLockedOut ? 'Entry Stopped (Locked Out)' : 'Verify Creator Code'}
              </button>
            </motion.form>
          )}
        </div>
      </div>
    </motion.div>
  );

  if (isModal || onClose) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-stone-950/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
        {content}
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-stone-50 dark:bg-stone-950 p-4 sm:p-6 transition-colors duration-500 overflow-y-auto select-none">
      {/* Dynamic Interactive Fluid Canvas Background */}
      <FluidCanvas />

      {/* Decorative Warm Light Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[35rem] h-[35rem] bg-stone-200/30 dark:bg-stone-900/10 rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-stone-300/20 dark:bg-stone-900/10 rounded-full blur-[80px] pointer-events-none z-0" />

      {content}
    </div>
  );
};
