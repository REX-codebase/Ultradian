import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getISOWeekString } from './shared/utils';

/** Maximum realistic focus session length (minutes). Anything above is treated as spoof. */
const MAX_SESSION_MINUTES = 180;
/** Minimum meaningful session to count toward stats. */
const MIN_SESSION_MINUTES = 1;

/**
 * Authoritative, Idempotent Session Processing Trigger
 * Trigger: onDocumentCreated('users/{userId}/sessions/{sessionId}')
 *
 * Security: Client-supplied durationMinutes / focusRating are clamped and validated
 * before any aggregation. Rules also reject out-of-range values on create.
 */
export const onSessionCreate = onDocumentCreated(
  'users/{userId}/sessions/{sessionId}',
  async (event) => {
    const sessionSnap = event.data;
    if (!sessionSnap) return;

    const session = sessionSnap.data();
    if (!session) return;

    const userId = event.params.userId;
    const sessionId = event.params.sessionId;

    // Strict validation: only work sessions with non-zero duration
    const sessionType = session.type || 'work';
    if (sessionType !== 'work') return;

    let durationMinutes = Math.round(
      Number(
        session.durationMinutes ||
        (session.actualSecondsCompleted ? session.actualSecondsCompleted / 60 : 0) ||
        0
      )
    );

    // Clamp + hard reject pathological / spoofed values
    if (!Number.isFinite(durationMinutes) || durationMinutes < MIN_SESSION_MINUTES) {
      console.warn(`Session ${sessionId} rejected: invalid durationMinutes=${durationMinutes}`);
      return;
    }
    if (durationMinutes > MAX_SESSION_MINUTES) {
      console.warn(
        `Session ${sessionId} durationMinutes=${durationMinutes} exceeds max ${MAX_SESSION_MINUTES}; clamping`
      );
      durationMinutes = MAX_SESSION_MINUTES;
    }

    const category = String(session.category || 'General').slice(0, 40);
    const focusRating = Math.min(5, Math.max(1, Number(session.focusRating || 5)));
    if (!Number.isFinite(focusRating)) return;

    const timestamp = Number(session.timestamp || Date.now());
    const weekId = getISOWeekString(new Date(timestamp));

    const db = getFirestore();
    const sessionRef = db.doc(`users/${userId}/sessions/${sessionId}`);

    // Transactionally process session to guarantee idempotency
    await db.runTransaction(async (transaction) => {
      const currentSessionDoc = await transaction.get(sessionRef);
      if (!currentSessionDoc.exists) return;

      const currentData = currentSessionDoc.data();
      // Idempotency check: if already processed, terminate immediately
      if (currentData?.processed === true) {
        console.log(`Session ${sessionId} for user ${userId} already processed. Skipping.`);
        return;
      }

      // Fetch user profile for display name and league
      const userRef = db.doc(`users/${userId}`);
      const userSnap = await transaction.get(userRef);
      const userData = userSnap.exists ? userSnap.data() : {};
      const userName =
        session.userName || userData?.displayName || userData?.username || 'Ultradian Achiever';
      const leagueId = userData?.leagueId || session.leagueId || 'wood';

      // References
      const leaderboardRef = db.doc(`leaderboard/${userId}`);
      const weekRef = db.doc(`leaderboard/${userId}/weeks/${weekId}`);
      const leagueMemberRef = db.doc(`leagues/${leagueId}/members/${userId}`);

      const leaderboardSnap = await transaction.get(leaderboardRef);
      const weekSnap = await transaction.get(weekRef);
      const leagueMemberSnap = await transaction.get(leagueMemberRef);

      // 1. Update Global User Statistics (/leaderboard/{userId})
      if (leaderboardSnap.exists) {
        transaction.update(leaderboardRef, {
          lifetimeMinutes: FieldValue.increment(durationMinutes),
          lifetimeCycles: FieldValue.increment(1),
          weeklyMinutes: FieldValue.increment(durationMinutes),
          weeklyCycles: FieldValue.increment(1),
          currentWeek: weekId,
          leagueId,
          category,
          type: sessionType,
          lastUpdated: Date.now(),
        });
      } else {
        transaction.set(leaderboardRef, {
          userId,
          name: userName,
          lifetimeMinutes: durationMinutes,
          lifetimeCycles: 1,
          weeklyMinutes: durationMinutes,
          weeklyCycles: 1,
          currentWeek: weekId,
          leagueId,
          category,
          type: sessionType,
          lastUpdated: Date.now(),
        });
      }

      // 2. Update Time-boxed Subcollection (/leaderboard/{userId}/weeks/{weekId})
      if (weekSnap.exists) {
        transaction.update(weekRef, {
          weeklyMinutes: FieldValue.increment(durationMinutes),
          completedCycles: FieldValue.increment(1),
          ratingSum: FieldValue.increment(focusRating),
          ratingCount: FieldValue.increment(1),
          [`categoryMins.${category}`]: FieldValue.increment(durationMinutes),
          lastUpdated: Date.now(),
        });
      } else {
        transaction.set(weekRef, {
          userId,
          name: userName,
          weekId,
          weeklyMinutes: durationMinutes,
          completedCycles: 1,
          ratingSum: focusRating,
          ratingCount: 1,
          categoryMins: { [category]: durationMinutes },
          lastUpdated: Date.now(),
        });
      }

      // 3. Update League Roster (/leagues/{leagueId}/members/{userId})
      if (leagueMemberSnap.exists) {
        transaction.update(leagueMemberRef, {
          weeklyMinutes: FieldValue.increment(durationMinutes),
          weeklyCycles: FieldValue.increment(1),
          ratingSum: FieldValue.increment(focusRating),
          ratingCount: FieldValue.increment(1),
          [`categoryMins.${category}`]: FieldValue.increment(durationMinutes),
          lastUpdated: Date.now(),
        });
      } else {
        transaction.set(leagueMemberRef, {
          userId,
          name: userName,
          leagueId,
          weeklyMinutes: durationMinutes,
          weeklyCycles: 1,
          focusScore: Math.round(focusRating * 20),
          ratingSum: focusRating,
          ratingCount: 1,
          categoryMins: { [category]: durationMinutes },
          lastUpdated: Date.now(),
        });
      }

      // Mark session as processed atomically
      transaction.update(sessionRef, {
        processed: true,
        processedAt: Date.now(),
        // Record the clamped value for auditability
        durationMinutesClamped: durationMinutes,
      });
    });
  }
);
