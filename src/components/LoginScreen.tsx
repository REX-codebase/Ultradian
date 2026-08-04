import React, { useState } from 'react';
import { Clock, Mail, Lock, User, Sparkles, AlertCircle, ArrowRight, Chrome } from 'lucide-react';
import { motion } from 'motion/react';
import { signInWithEmail, signUpWithEmail, signInAnonymouslyUser, signInWithGoogle, updateUserProfile } from '../utils/firebase';
import { FluidCanvas } from './FluidCanvas';

interface LoginScreenProps {
  onAuthSuccess: (user: any) => void;
  onBypassAuth: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onAuthSuccess, onBypassAuth }) => {
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [error, setError] = useState<React.ReactNode | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

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
      let showSimulateButton = true;
      
      if (errCode === 'auth/operation-not-allowed' || errMsg.includes('auth/operation-not-allowed')) {
        errorTitle = 'Firebase: Email/Password Disabled';
        errorDesc = 'The Email/Password sign-in provider is not enabled in your Firebase project.';
      } else if (errCode === 'auth/unauthorized-domain' || errMsg.includes('auth/unauthorized-domain')) {
        errorTitle = 'Firebase: Unauthorized Domain';
        errorDesc = 'This domain is not on your Firebase project\'s authorized domains list.';
      } else {
        if (errMsg.includes('auth/invalid-credential')) {
          errorDesc = 'Invalid email or password. Please try again.';
          showSimulateButton = false;
        } else if (errMsg.includes('auth/email-already-in-use')) {
          errorDesc = 'This email address is already registered.';
          showSimulateButton = false;
        } else if (errMsg.includes('auth/weak-password')) {
          errorDesc = 'Password must be at least 6 characters.';
          showSimulateButton = false;
        } else if (errMsg.includes('auth/invalid-email')) {
          errorDesc = 'Please enter a valid email address.';
          showSimulateButton = false;
        }
      }
      
      setError(
        <div className="space-y-2">
          <p className="font-bold text-red-800 dark:text-red-400">{errorTitle}</p>
          <p className="font-normal text-stone-600 dark:text-stone-300 leading-relaxed">{errorDesc}</p>
          {(errCode === 'auth/unauthorized-domain' || errMsg.includes('auth/unauthorized-domain')) && (
            <div className="p-2.5 rounded-lg bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-[10px] font-mono select-all space-y-1 text-stone-700 dark:text-stone-300">
              <div>ais-dev-2qx2u4lpsjsns7tx4n4zgp-77178230387.asia-southeast1.run.app</div>
              <div>ais-pre-2qx2u4lpsjsns7tx4n4zgp-77178230387.asia-southeast1.run.app</div>
            </div>
          )}
          {showSimulateButton ? (
            <>
              <p className="font-normal text-[11px] leading-relaxed text-stone-500 dark:text-stone-400">
                For rapid preview testing without configuring Firebase, click below to sign in with a simulated email profile instantly.
              </p>
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => {
                    const simulatedUser = {
                      uid: 'simulated_email_user',
                      email: email || 'user@example.com',
                      displayName: displayName || 'Simulated Email WaveRider',
                      photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
                      isAnonymous: false,
                      emailVerified: true
                    };
                    onAuthSuccess(simulatedUser as any);
                  }}
                  className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-[11px] font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span>Simulate Email Sign-In (Bypass)</span>
                </button>
              </div>
            </>
          ) : (
            <div className="mt-3">
              <button
                type="button"
                onClick={() => {
                  const simulatedUser = {
                    uid: 'simulated_email_user',
                    email: email || 'user@example.com',
                    displayName: displayName || 'Simulated Email WaveRider',
                    photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
                    isAnonymous: false,
                    emailVerified: true
                  };
                  onAuthSuccess(simulatedUser as any);
                }}
                className="w-full py-1.5 px-3 rounded-lg border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 text-[10px] font-semibold hover:bg-stone-100 dark:hover:bg-stone-900 transition-all flex items-center justify-center gap-1"
              >
                <span>Bypass & sign in with Simulated Account</span>
              </button>
            </div>
          )}
        </div>
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatedLogin = async (type: 'google' | 'email') => {
    setError(null);
    setLoading(true);
    const simulatedName = type === 'google' ? 'Simulated Google WaveRider' : 'Simulated Email WaveRider';
    const photoURL = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';
    const simulatedEmail = type === 'google' ? 'google-user@example.com' : 'email-user@example.com';
    
    try {
      // Try to do real anonymous sign-in so they get a real UID and can write to DB!
      const user = await signInAnonymouslyUser();
      // Update their profile so it shows their custom simulated name and photo on the leaderboard
      await updateUserProfile(user, { displayName: simulatedName, photoURL });
      onAuthSuccess(user);
    } catch (err) {
      console.warn('Anonymous sign-in for simulation failed, falling back to local simulation', err);
      // Fallback to pure offline simulation
      const simulatedUser = {
        uid: `simulated_${type}_user`,
        email: simulatedEmail,
        displayName: simulatedName,
        photoURL,
        isAnonymous: false,
        emailVerified: true
      };
      onAuthSuccess(simulatedUser as any);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const user = await signInAnonymouslyUser();
      onAuthSuccess(user);
      onBypassAuth();
    } catch (err: any) {
      console.warn('Anonymous login failed, entering local sandbox mode', err);
      // Fallback: enter offline mode immediately
      onBypassAuth();
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
      const errMsg = err?.message || 'An unexpected Google login error occurred.';
      
      let errorTitle = 'Google Sign-In Error';
      let errorDesc = errMsg;
      let showDetails = false;
      
      if (errCode === 'auth/unauthorized-domain' || errMsg.includes('auth/unauthorized-domain')) {
        errorTitle = 'Firebase: Unauthorized Domain';
        errorDesc = 'The Google login popup cannot proceed because this preview domain is not on your Firebase project\'s authorized domains list.';
        showDetails = true;
      } else if (errMsg.includes('auth/popup-blocked')) {
        errorTitle = 'Popup Blocked';
        errorDesc = 'The sign-in popup was blocked by your browser. Please enable popups or use the simulation bypass below.';
      } else if (errMsg.includes('auth/popup-closed-by-user')) {
        errorTitle = 'Popup Closed';
        errorDesc = 'The sign-in popup was closed before completing. You can bypass this using the simulation option below.';
      } else if (errMsg.includes('auth/cancelled-popup-request')) {
        errorTitle = 'Popup Cancelled';
        errorDesc = 'The popup request was cancelled or nested. Try the simulation bypass below.';
      }
      
      setError(
        <div className="space-y-2 text-left">
          <p className="font-bold text-red-800 dark:text-red-400">{errorTitle}</p>
          <p className="font-normal text-stone-600 dark:text-stone-300 leading-relaxed">{errorDesc}</p>
          {showDetails && (
            <div className="p-2.5 rounded-lg bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-[10px] font-mono select-all space-y-1 text-stone-700 dark:text-stone-300">
              <div>ais-dev-2qx2u4lpsjsns7tx4n4zgp-77178230387.asia-southeast1.run.app</div>
              <div>ais-pre-2qx2u4lpsjsns7tx4n4zgp-77178230387.asia-southeast1.run.app</div>
            </div>
          )}
          <p className="font-normal text-[11px] leading-relaxed text-stone-500 dark:text-stone-400">
            For rapid preview testing without popups or domain constraints, click the button below to sign in with a simulated Google account instantly.
          </p>
          <div className="mt-3">
            <button
              type="button"
              onClick={() => handleSimulatedLogin('google')}
              className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-[11px] font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>Simulate Google Sign-In (Bypass)</span>
            </button>
          </div>
        </div>
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-stone-50 dark:bg-stone-950 px-4 py-12 transition-colors duration-500 overflow-hidden select-none">
      {/* Dynamic Interactive Fluid Canvas Background */}
      <FluidCanvas />

      {/* Decorative Warm Light Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[35rem] h-[35rem] bg-stone-200/30 dark:bg-stone-900/10 rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-stone-300/20 dark:bg-stone-900/10 rounded-full blur-[80px] pointer-events-none z-0" />

      {/* Main Container Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md bg-stone-50/70 dark:bg-stone-950/75 backdrop-blur-xl border border-stone-200/80 dark:border-stone-900/80 shadow-2xl p-8 sm:p-10 rounded-2xl"
      >
        {/* Brand Banner */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 mb-4 shadow-lg">
            <Clock className="w-5 h-5 stroke-[1.5]" />
          </div>
          <h1 className="font-serif text-3xl tracking-tight text-center font-medium text-stone-900 dark:text-stone-100">
            Ultradian <span className="italic font-light text-stone-500 dark:text-stone-400">Pulse</span>
          </h1>
          <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-2 font-semibold tracking-wider uppercase text-center">
            Basic Rest-Activity Cycle (BRAC) Companion
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-lg bg-red-50/80 dark:bg-red-950/10 border border-red-200/60 dark:border-red-900/30 flex items-start gap-3"
          >
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div className="text-xs font-semibold text-red-700 dark:text-red-300 leading-normal">
              {error}
            </div>
          </motion.div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                Leaderboard Handle
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500" />
                <input
                  type="text"
                  required
                  placeholder="e.g. WaveRider"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-stone-100/50 dark:bg-stone-900/40 border border-stone-200/60 dark:border-stone-850/60 text-xs font-semibold text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-stone-400 dark:focus:ring-stone-600 focus:border-transparent transition-all"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500" />
              <input
                type="email"
                required
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-stone-100/50 dark:bg-stone-900/40 border border-stone-200/60 dark:border-stone-850/60 text-xs font-semibold text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-stone-400 dark:focus:ring-stone-600 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
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
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-stone-100/50 dark:bg-stone-900/40 border border-stone-200/60 dark:border-stone-850/60 text-xs font-semibold text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-stone-400 dark:focus:ring-stone-600 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 mt-6 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-stone-200 text-stone-100 dark:text-stone-900 text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-stone-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{isSignUp ? 'Create Cloud Profile' : 'Authenticate Wave'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Alternate Action links */}
        <div className="mt-6 flex flex-col items-center gap-4 border-t border-stone-200/60 dark:border-stone-900/60 pt-6">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
            }}
            className="text-[11px] text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200 font-semibold underline underline-offset-4 transition-colors"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have a profile yet? Register"}
          </button>

          <div className="flex items-center gap-2 w-full text-stone-300 dark:text-stone-800">
            <div className="h-[1px] bg-stone-200 dark:bg-stone-900 grow" />
            <span className="text-[9px] uppercase tracking-widest font-extrabold text-stone-400 dark:text-stone-500">
              or
            </span>
            <div className="h-[1px] bg-stone-200 dark:bg-stone-900 grow" />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl border border-stone-200 dark:border-stone-900 bg-white dark:bg-stone-900 hover:bg-stone-100/50 dark:hover:bg-stone-850/50 text-stone-700 dark:text-stone-300 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xs"
          >
            <Chrome className="w-3.5 h-3.5 text-stone-500" />
            <span>Continue with Google</span>
          </button>

          <button
            type="button"
            onClick={handleGuestLogin}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl border border-stone-200 dark:border-stone-900 hover:bg-stone-100/50 dark:hover:bg-stone-900/30 text-stone-600 dark:text-stone-400 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Enter as Guest / Sandbox</span>
          </button>

          <div className="w-full flex items-center gap-2 pt-1">
            <div className="h-[1px] bg-stone-200/50 dark:bg-stone-900/50 grow" />
            <span className="text-[8px] font-bold tracking-widest text-stone-400 dark:text-stone-500 uppercase">Simulated Bypasses</span>
            <div className="h-[1px] bg-stone-200/50 dark:bg-stone-900/50 grow" />
          </div>

          <div className="flex gap-2 w-full mt-1">
            <button
              type="button"
              onClick={() => handleSimulatedLogin('google')}
              className="flex-1 py-1.5 px-2 rounded-lg border border-dashed border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-1"
            >
              <Chrome className="w-3 h-3 text-emerald-500" />
              <span>Simulate Google</span>
            </button>
            
            <button
              type="button"
              onClick={() => handleSimulatedLogin('email')}
              className="flex-1 py-1.5 px-2 rounded-lg border border-dashed border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-1"
            >
              <Mail className="w-3 h-3 text-emerald-500" />
              <span>Simulate Email</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
