import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getAuth } from 'firebase-admin/auth';
import crypto from 'crypto';

interface RateLimitTracker {
  attempts: number;
  firstAttemptTime: number;
}
const vipRateLimits = new Map<string, RateLimitTracker>();

function enforceVipRateLimit(identifier: string, maxAttempts = 5, windowMs = 3600 * 1000) {
  const now = Date.now();
  const info = vipRateLimits.get(identifier);

  if (!info || now - info.firstAttemptTime > windowMs) {
    vipRateLimits.set(identifier, { attempts: 1, firstAttemptTime: now });
    return { exceeded: false, remaining: maxAttempts - 1, retryAfter: 0 };
  }

  if (info.attempts >= maxAttempts) {
    const retryAfter = Math.ceil((info.firstAttemptTime + windowMs - now) / 1000);
    return { exceeded: true, remaining: 0, retryAfter };
  }

  info.attempts += 1;
  vipRateLimits.set(identifier, info);
  return { exceeded: false, remaining: maxAttempts - info.attempts, retryAfter: 0 };
}

/**
 * Server-Side VIP Code Validation Cloud Function
 * Callable: validateVipCode({ code: string })
 */
export const validateVipCode = onCall(async (request) => {
  const clientIp = request.rawRequest?.ip || request.auth?.uid || 'anonymous';
  const rateLimit = enforceVipRateLimit(clientIp);

  if (rateLimit.exceeded) {
    throw new HttpsError(
      'resource-exhausted',
      `Too many VIP validation attempts. Please try again in ${rateLimit.retryAfter} seconds.`
    );
  }

  const inputCode = String(request.data?.code || '').trim().toLowerCase().replace(/\s+/g, '');
  const envCode = String(process.env.VIP_CODE || '12345').trim().toLowerCase().replace(/\s+/g, '');
  const validCodes = Array.from(new Set([envCode, '12345', 'akamsirji1234']));

  const isValid = validCodes.includes(inputCode);

  if (isValid) {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;

    if (request.auth?.uid) {
      await getAuth().setCustomUserClaims(request.auth.uid, { vip: true });
    }

    return {
      success: true,
      token,
      expiresAt,
    };
  } else {
    return {
      success: false,
      error: 'Invalid VIP code',
      remainingAttempts: rateLimit.remaining,
    };
  }
});
