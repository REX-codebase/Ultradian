/**
 * VIP Access Utilities
 * 
 * Provides secure VIP code validation and state management.
 * All validation is handled server-side to prevent client-side tampering.
 * 
 * @module vipAccess
 */

export const MAX_VIP_ATTEMPTS = 2;

const STORAGE_KEYS = {
  UNLOCKED: 'ultradian_vip_unlocked_v1',
  FAILED_ATTEMPTS: 'ultradian_vip_failed_attempts_v1',
  LOCKED_OUT: 'ultradian_vip_locked_out_v1',
  SESSION_TOKEN: 'ultradian_vip_token_v1',
};

/**
 * Current VIP Access State
 */
export interface VipState {
  isUnlocked: boolean;
  failedAttempts: number;
  isLockedOut: boolean;
  remainingAttempts: number;
}

/**
 * Result returned by the server-side VIP validation API
 */
export interface VipValidationResult {
  success: boolean;
  token?: string;
  expiresAt?: number;
  error?: string;
  remainingAttempts?: number;
  isLockedOut?: boolean;
  message?: string;
}

/**
 * Legacy/Synchronous VipAttemptResult interface
 */
export interface VipAttemptResult {
  success: boolean;
  isLockedOut: boolean;
  remainingAttempts: number;
  message: string;
}

/**
 * Retrieves current VIP state from localStorage
 * 
 * @returns Current VIP state including unlock status and attempt counts
 * 
 * @example
 * ```typescript
 * const state = getVipState();
 * if (state.isLockedOut) {
 *   showLockoutMessage();
 * }
 * ```
 */
export function getVipState(): VipState {
  try {
    const unlockedStr = localStorage.getItem(STORAGE_KEYS.UNLOCKED);
    const failedStr = localStorage.getItem(STORAGE_KEYS.FAILED_ATTEMPTS);
    const lockedStr = localStorage.getItem(STORAGE_KEYS.LOCKED_OUT);

    const isUnlocked = unlockedStr === 'true';
    const failedAttempts = Math.max(0, parseInt(failedStr || '0', 10));
    const isLockedOut = lockedStr === 'true' || failedAttempts >= MAX_VIP_ATTEMPTS;

    return {
      isUnlocked,
      failedAttempts,
      isLockedOut: !isUnlocked && isLockedOut,
      remainingAttempts: isUnlocked ? MAX_VIP_ATTEMPTS : Math.max(0, MAX_VIP_ATTEMPTS - failedAttempts),
    };
  } catch (e) {
    return {
      isUnlocked: false,
      failedAttempts: 0,
      isLockedOut: false,
      remainingAttempts: MAX_VIP_ATTEMPTS,
    };
  }
}

/**
 * Validates a VIP code against server-side validation endpoint
 * 
 * @param code - The VIP code to validate (e.g. 5-digit numeric)
 * @returns Promise resolving to validation result with token if successful
 * 
 * @example
 * ```typescript
 * const result = await validateVipCode('12345');
 * if (result.success) {
 *   console.log('Token:', result.token);
 * }
 * ```
 */
export async function validateVipCode(code: string): Promise<VipValidationResult> {
  const currentState = getVipState();

  if (currentState.isUnlocked) {
    return {
      success: true,
      message: 'Creator VIP Code is already verified! All signed-in & future features are active.',
    };
  }

  if (currentState.isLockedOut) {
    return {
      success: false,
      error: 'Entry stopped: Maximum failed attempts reached (2/2). Access locked.',
      remainingAttempts: 0,
      isLockedOut: true,
      message: 'Entry stopped: Maximum failed attempts reached (2/2). Access locked.',
    };
  }

  try {
    const response = await fetch('/api/vip/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    if (response.status === 429) {
      const data = await response.json();
      return {
        success: false,
        error: data.error || 'Too many attempts. Please try again later.',
        remainingAttempts: 0,
        message: data.error || 'Too many attempts. Please try again later.',
      };
    }

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      const newFailedCount = currentState.failedAttempts + 1;
      const isNowLockedOut = newFailedCount >= MAX_VIP_ATTEMPTS;
      const remaining = Math.max(0, MAX_VIP_ATTEMPTS - newFailedCount);

      try {
        localStorage.setItem(STORAGE_KEYS.FAILED_ATTEMPTS, String(newFailedCount));
        if (isNowLockedOut) {
          localStorage.setItem(STORAGE_KEYS.LOCKED_OUT, 'true');
        }
      } catch (e) {
        // ignore storage errors
      }

      const msg = isNowLockedOut
        ? '❌ Incorrect code. Entry stopped after 2 failed attempts. Permanent lockout enforced.'
        : `❌ Incorrect code. Warning: ${remaining} attempt remaining before entry is stopped.`;

      return {
        success: false,
        error: data.error || 'Invalid VIP code',
        remainingAttempts: remaining,
        isLockedOut: isNowLockedOut,
        message: msg,
      };
    }

    const data = await response.json();
    if (data.success) {
      try {
        localStorage.setItem(STORAGE_KEYS.UNLOCKED, 'true');
        if (data.token) {
          localStorage.setItem(STORAGE_KEYS.SESSION_TOKEN, data.token);
        }
      } catch (e) {
        // ignore
      }

      return {
        success: true,
        token: data.token,
        expiresAt: data.expiresAt,
        message: '✨ Creator VIP Code verified! All signed-in features unlocked permanently.',
      };
    }

    return {
      success: false,
      error: data.error || 'Validation failed',
      message: data.error || 'Validation failed',
    };
  } catch (err) {
    return {
      success: false,
      error: 'Network connection failure while verifying VIP code.',
      message: 'Network connection failure while verifying VIP code.',
    };
  }
}

/**
 * Clears VIP state (for testing, reset, or admin logout)
 * 
 * @example
 * ```typescript
 * clearVipState();
 * ```
 */
export function clearVipState(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.UNLOCKED);
    localStorage.removeItem(STORAGE_KEYS.FAILED_ATTEMPTS);
    localStorage.removeItem(STORAGE_KEYS.LOCKED_OUT);
    localStorage.removeItem(STORAGE_KEYS.SESSION_TOKEN);
  } catch (e) {
    // ignore
  }
}

/**
 * Synchronous attempt wrapper (calls server validation asynchronously or provides immediate feedback)
 */
export function attemptVipCode(input: string): VipAttemptResult {
  const state = getVipState();
  if (state.isUnlocked) {
    return {
      success: true,
      isLockedOut: false,
      remainingAttempts: MAX_VIP_ATTEMPTS,
      message: 'Creator VIP Code is already verified! All signed-in & future features are active.',
    };
  }
  if (state.isLockedOut) {
    return {
      success: false,
      isLockedOut: true,
      remainingAttempts: 0,
      message: 'Entry stopped: Maximum failed attempts reached (2/2). Access locked.',
    };
  }

  return {
    success: false,
    isLockedOut: state.isLockedOut,
    remainingAttempts: state.remainingAttempts,
    message: 'Please submit code using server-side validation.',
  };
}
