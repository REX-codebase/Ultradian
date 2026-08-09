// Secret Creator VIP Code Engine & Persistence Handler

export const SECRET_VIP_CODE = 'akamsirji1234';
export const MAX_VIP_ATTEMPTS = 2;

const STORAGE_KEYS = {
  UNLOCKED: 'ultradian_vip_unlocked_v1',
  FAILED_ATTEMPTS: 'ultradian_vip_failed_attempts_v1',
  LOCKED_OUT: 'ultradian_vip_locked_out_v1',
};

export interface VipState {
  isUnlocked: boolean;
  failedAttempts: number;
  isLockedOut: boolean;
  remainingAttempts: number;
}

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

export interface VipAttemptResult {
  success: boolean;
  isLockedOut: boolean;
  remainingAttempts: number;
  message: string;
}

export function attemptVipCode(input: string): VipAttemptResult {
  const currentState = getVipState();

  if (currentState.isUnlocked) {
    return {
      success: true,
      isLockedOut: false,
      remainingAttempts: MAX_VIP_ATTEMPTS,
      message: 'Creator VIP Code is already verified! All signed-in & future features are active.',
    };
  }

  if (currentState.isLockedOut) {
    return {
      success: false,
      isLockedOut: true,
      remainingAttempts: 0,
      message: 'Entry stopped: Maximum failed attempts reached (2/2). Access locked.',
    };
  }

  // Clean and sanitize input: lowercase, strip all whitespace
  const sanitizedInput = String(input || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '');

  if (sanitizedInput === SECRET_VIP_CODE) {
    try {
      localStorage.setItem(STORAGE_KEYS.UNLOCKED, 'true');
    } catch (e) {
      // ignore
    }
    return {
      success: true,
      isLockedOut: false,
      remainingAttempts: MAX_VIP_ATTEMPTS,
      message: '✨ Creator VIP Code verified! All signed-in features unlocked permanently.',
    };
  }

  // Failed Attempt
  const newFailedCount = currentState.failedAttempts + 1;
  const isNowLockedOut = newFailedCount >= MAX_VIP_ATTEMPTS;
  const remaining = Math.max(0, MAX_VIP_ATTEMPTS - newFailedCount);

  try {
    localStorage.setItem(STORAGE_KEYS.FAILED_ATTEMPTS, String(newFailedCount));
    if (isNowLockedOut) {
      localStorage.setItem(STORAGE_KEYS.LOCKED_OUT, 'true');
    }
  } catch (e) {
    // ignore
  }

  if (isNowLockedOut) {
    return {
      success: false,
      isLockedOut: true,
      remainingAttempts: 0,
      message: '❌ Incorrect code. Entry stopped after 2 failed attempts. Permanent lockout enforced.',
    };
  }

  return {
    success: false,
    isLockedOut: false,
    remainingAttempts: remaining,
    message: `❌ Incorrect code. Warning: ${remaining} attempt remaining before entry is stopped.`,
  };
}
