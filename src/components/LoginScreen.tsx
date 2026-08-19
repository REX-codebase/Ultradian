import React, { useState } from 'react';
import { Mail, Lock, User, AlertCircle, ArrowRight, X } from 'lucide-react';
import {
  signInWithEmail,
  signUpWithEmail,
  signInAnonymouslyUser,
  signInWithGoogle,
} from '../services/authService';
import { Sheet } from './Sheet';

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

      let errorTitle = 'Could not sign in';
      let errorDesc = errMsg;

      if (errCode === 'auth/operation-not-allowed' || errMsg.includes('operation-not-allowed')) {
        errorTitle = 'Email sign-in is off';
        errorDesc = 'Email sign-in is disabled in Firebase. Use Google, or stay on this device.';
      } else if (errCode === 'auth/unauthorized-domain' || errMsg.includes('unauthorized-domain')) {
        errorTitle = 'Domain not allowed';
        errorDesc = 'This preview domain is not authorized for popups.';
      } else if (errMsg.includes('auth/invalid-credential') || errMsg.includes('auth/user-not-found') || errMsg.includes('auth/wrong-password')) {
        errorTitle = 'Sign in failed';
        errorDesc = 'Email or password did not match. Register, or stay local.';
      } else if (errMsg.includes('auth/email-already-in-use')) {
        errorTitle = 'Account exists';
        errorDesc = 'This email is already registered. Switch to sign in.';
      } else if (errMsg.includes('auth/weak-password')) {
        errorTitle = 'Password too short';
        errorDesc = 'Use at least 6 characters.';
      } else if (errMsg.includes('auth/invalid-email')) {
        errorTitle = 'Invalid email';
        errorDesc = 'Enter a valid email address.';
      }

      setError(
        <div className="space-y-1 text-left">
          <p className="font-medium text-[color:var(--ink)]">{errorTitle}</p>
          <p className="text-sm leading-relaxed text-[color:var(--ink-soft)]">{errorDesc}</p>
        </div>
      );
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
    } catch (err: any) {
      console.error('Anonymous login failed:', err);
      const errMsg = err?.message || '';
      if (errMsg.includes('operation-not-allowed')) {
        setError(
          <div className="space-y-1 text-left">
            <p className="font-medium text-[color:var(--ink)]">Guest sign-in is off</p>
            <p className="text-sm leading-relaxed text-[color:var(--ink-soft)]">
              Anonymous sign-in is disabled. Register with email, or keep working on this device.
            </p>
          </div>
        );
      } else {
        setError('Guest sign-in failed. Try email instead.');
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

      let errorTitle = 'Google sign-in';
      let errorDesc = errMsg;

      if (errCode === 'auth/unauthorized-domain' || errMsg.includes('unauthorized-domain')) {
        errorTitle = 'Domain not allowed';
        errorDesc = 'Google needs this domain authorized. Use email, or stay local.';
      } else if (errMsg.includes('auth/popup-blocked')) {
        errorTitle = 'Popup blocked';
        errorDesc = 'Allow popups, or use email sign-in.';
      } else if (errMsg.includes('auth/popup-closed-by-user')) {
        errorTitle = 'Window closed';
        errorDesc = 'The Google window closed before finishing.';
      }

      setError(
        <div className="space-y-1 text-left">
          <p className="font-medium text-[color:var(--ink)]">{errorTitle}</p>
          <p className="text-sm leading-relaxed text-[color:var(--ink-soft)]">{errorDesc}</p>
        </div>
      );
    } finally {
      setLoading(false);
    }
  };

  const fieldClass =
    'w-full rounded-xl border border-[color:var(--line)] bg-transparent px-4 py-3 text-[color:var(--ink)] placeholder:text-[color:var(--ink-mute)] focus:border-[color:var(--ink-mute)] focus:outline-none';

  const content = (
    <div className="px-5 pb-6 pt-2 sm:px-7 sm:pb-8">
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="pressable absolute right-3 top-3 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-[color:var(--ink-mute)]"
          title="Close sign in"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      <div className="mb-6 text-center">
        <h1 className="font-serif text-3xl tracking-tight text-[color:var(--ink)]">Ultradian</h1>
        <p className="mt-2 text-sm text-[color:var(--ink-mute)]">
          Sessions stay on this device until you sign in.
        </p>
      </div>

      <div className="mb-5 flex rounded-full bg-[color:var(--line)]/50 p-1">
        <button
          type="button"
          onClick={() => {
            setIsSignUp(false);
            setError(null);
          }}
          className={`pressable min-h-10 flex-1 rounded-full text-sm ${
            !isSignUp ? 'bg-[color:var(--paper-raised)] text-[color:var(--ink)]' : 'text-[color:var(--ink-mute)]'
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => {
            setIsSignUp(true);
            setError(null);
          }}
          className={`pressable min-h-10 flex-1 rounded-full text-sm ${
            isSignUp ? 'bg-[color:var(--paper-raised)] text-[color:var(--ink)]' : 'text-[color:var(--ink-mute)]'
          }`}
        >
          Register
        </button>
      </div>

      {error && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-[color:var(--line)] px-3.5 py-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--ink-mute)]" />
          <div className="text-sm text-[color:var(--ink-soft)]">{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {isSignUp && (
          <label htmlFor="login-display-name" className="block">
            <span className="mb-1.5 block text-xs uppercase tracking-wider text-[color:var(--ink-mute)]">
              Display name
            </span>
            <span className="relative block">
              <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--ink-mute)]" />
              <input
                id="login-display-name"
                name="displayName"
                aria-label="Display name"
                type="text"
                required
                placeholder="How you appear on the league"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className={`${fieldClass} pl-10`}
              />
            </span>
          </label>
        )}

        <label htmlFor="login-email" className="block">
          <span className="mb-1.5 block text-xs uppercase tracking-wider text-[color:var(--ink-mute)]">Email</span>
          <span className="relative block">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--ink-mute)]" />
            <input
              id="login-email"
              name="email"
              aria-label="Email"
              type="email"
              required
              placeholder="name@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`${fieldClass} pl-10`}
              autoComplete="email"
            />
          </span>
        </label>

        <label htmlFor="login-password" className="block">
          <span className="mb-1.5 block text-xs uppercase tracking-wider text-[color:var(--ink-mute)]">Password</span>
          <span className="relative block">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--ink-mute)]" />
            <input
              id="login-password"
              name="password"
              aria-label="Password"
              type="password"
              required
              placeholder={isSignUp ? 'At least 6 characters' : '••••••••'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${fieldClass} pl-10`}
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
            />
          </span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="pressable mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[color:var(--ink)] text-[color:var(--paper)] disabled:opacity-50"
        >
          {loading ? (
            <span className="ink-bar w-16" />
          ) : (
            <>
              <span>{isSignUp ? 'Create account' : 'Sign in'}</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 space-y-2 border-t border-[color:var(--line)] pt-5">
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="pressable min-h-12 w-full rounded-full border border-[color:var(--line)] text-sm text-[color:var(--ink-soft)]"
        >
          Continue with Google
        </button>
        <button
          type="button"
          onClick={() => {
            if (onClose) onClose();
            else handleGuestLogin();
          }}
          disabled={loading}
          className="pressable min-h-12 w-full text-sm text-[color:var(--ink-mute)]"
        >
          Stay on this device
        </button>
      </div>
    </div>
  );

  if (isModal || onClose) {
    return (
      <Sheet open onClose={onClose || (() => undefined)} size="sm">
        {content}
      </Sheet>
    );
  }

  return (
    <div className="app-shell flex min-h-dvh items-center justify-center p-4">
      <div className="sheet-panel relative w-full max-w-md rounded-[1.5rem]">{content}</div>
    </div>
  );
};
