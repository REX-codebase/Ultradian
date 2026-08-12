import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue } from 'firebase-admin/firestore';
import { getUltradianFirestore } from './shared/database';
import crypto from 'crypto';

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_ATTEMPTS = 5;

/**
 * Persistent, distributed rate limiter backed by Firestore.
 * Survives cold starts and works across multiple Cloud Function instances.
 */
async function enforceVipRateLimit(
  identifier: string,
  maxAttempts = MAX_ATTEMPTS,
  windowMs = RATE_LIMIT_WINDOW_MS
): Promise<{ exceeded: boolean; remaining: number; retryAfter: number }> {
  const db = getUltradianFirestore();
  // Sanitize identifier so it is a valid document ID
  const safeId = identifier.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120) || 'anonymous';
  const ref = db.collection('vipRateLimits').doc(safeId);

  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const now = Date.now();

    if (!snap.exists) {
      tx.set(ref, {
        attempts: 1,
        firstAttemptTime: now,
        lastAttemptTime: now,
      });
      return { exceeded: false, remaining: maxAttempts - 1, retryAfter: 0 };
    }

    const data = snap.data()!;
    const firstAttemptTime = Number(data.firstAttemptTime || now);
    let attempts = Number(data.attempts || 0);

    // Window expired → reset
    if (now - firstAttemptTime > windowMs) {
      tx.set(ref, {
        attempts: 1,
        firstAttemptTime: now,
        lastAttemptTime: now,
      });
      return { exceeded: false, remaining: maxAttempts - 1, retryAfter: 0 };
    }

    if (attempts >= maxAttempts) {
      const retryAfter = Math.ceil((firstAttemptTime + windowMs - now) / 1000);
      return { exceeded: true, remaining: 0, retryAfter: Math.max(0, retryAfter) };
    }

    attempts += 1;
    tx.update(ref, {
      attempts,
      lastAttemptTime: now,
    });
    return { exceeded: false, remaining: maxAttempts - attempts, retryAfter: 0 };
  });
}

/**
 * Server-Side VIP Code Validation Cloud Function
 * Callable: validateVipCode({ code: string })
 *
 * Security notes:
 * - Only the environment variable VIP_CODE is accepted (no hardcoded backdoors).
 * - Rate limiting is durable (Firestore) so horizontal scaling cannot bypass it.
 */
export const validateVipCode = onCall(async (request) => {
  const clientIp = request.rawRequest?.ip || request.auth?.uid || 'anonymous';
  const rateLimit = await enforceVipRateLimit(clientIp);

  if (rateLimit.exceeded) {
    throw new HttpsError(
      'resource-exhausted',
      `Too many VIP validation attempts. Please try again in ${rateLimit.retryAfter} seconds.`
    );
  }

  const inputCode = String(request.data?.code || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '');

  // Fail closed: require a real secret from the environment. Never fall back to known defaults.
  const envCodeRaw = process.env.VIP_CODE;
  if (!envCodeRaw || typeof envCodeRaw !== 'string' || envCodeRaw.trim().length < 6) {
    console.error('VIP_CODE environment variable is missing or too short');
    throw new HttpsError('failed-precondition', 'VIP validation is not configured on this deployment.');
  }

  const envCode = envCodeRaw.trim().toLowerCase().replace(/\s+/g, '');
  const isValid = inputCode.length > 0 && inputCode === envCode;

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
  }

  return {
    success: false,
    error: 'Invalid VIP code',
    remainingAttempts: rateLimit.remaining,
  };
});
