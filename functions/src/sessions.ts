import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { FieldValue } from 'firebase-admin/firestore';
import { FIRESTORE_DATABASE_ID, getUltradianFirestore } from './shared/database';
import { getISOWeekString } from './shared/utils';

const MAX_SESSION_MINUTES = 180;
const MIN_SESSION_MINUTES = 1;
const AGGREGATE_SOURCE = 'session-aggregation-v2';
const AGGREGATE_SCHEMA_VERSION = 2;
const NON_USER_SESSION_ID = /^(sample|seed|demo|test|friend|local_peer|mock)[_-]/i;

/**
 * Authoritative, idempotent focus-session processor.
 *
 * Only genuine work sessions from a named account can affect public rankings.
 * Legacy sample/demo sessions remain in the private event log for auditability,
 * but are explicitly marked as skipped and never become aggregate data.
 */
export const onSessionCreate = onDocumentCreated(
  {
    document: 'users/{userId}/sessions/{sessionId}',
    database: FIRESTORE_DATABASE_ID,
  },
  async (event) => {
    const sessionSnap = event.data;
    if (!sessionSnap) return;

    const session = sessionSnap.data();
    if (!session) return;

    const userId = event.params.userId;
    const sessionId = event.params.sessionId;

    if (session.isSample === true || NON_USER_SESSION_ID.test(sessionId)) {
      await sessionSnap.ref.update({
        processed: true,
        processedAt: Date.now(),
        processingSkippedReason: 'non_user_session',
      });
      return;
    }

    if ((session.type || 'work') !== 'work') return;

    let durationMinutes = Math.round(
      Number(session.durationMinutes || (session.actualSecondsCompleted ? session.actualSecondsCompleted / 60 : 0))
    );

    if (!Number.isFinite(durationMinutes) || durationMinutes < MIN_SESSION_MINUTES) {
      console.warn(`Session ${sessionId} rejected: invalid durationMinutes=${durationMinutes}`);
      return;
    }
    durationMinutes = Math.min(durationMinutes, MAX_SESSION_MINUTES);

    const category = String(session.category || 'General').slice(0, 40);
    const focusRating = Math.min(5, Math.max(1, Number(session.focusRating || 5)));
    if (!Number.isFinite(focusRating)) return;

    const timestamp = Number(session.timestamp || Date.now());
    const weekId = getISOWeekString(new Date(timestamp));
    const db = getUltradianFirestore();
    const sessionRef = db.doc(`users/${userId}/sessions/${sessionId}`);

    await db.runTransaction(async (transaction) => {
      const currentSessionDoc = await transaction.get(sessionRef);
      if (!currentSessionDoc.exists || currentSessionDoc.data()?.processed === true) return;

      const userRef = db.doc(`users/${userId}`);
      const userSnap = await transaction.get(userRef);
      const userData = userSnap.exists ? userSnap.data() : {};
      const userName = String(
        userData?.displayName || userData?.username || userData?.publicHandle || ''
      ).trim();

      // A private anonymous session may be valid for personal analytics, but never
      // gets a fabricated public name or a public leaderboard entry.
      if (!userName) {
        transaction.update(sessionRef, {
          processed: true,
          processedAt: Date.now(),
          processingSkippedReason: 'missing_public_name',
        });
        return;
      }

      const leagueId = String(userData?.leagueId || session.leagueId || 'wood');
      const leaderboardRef = db.doc(`leaderboard/${userId}`);
      const weekRef = db.doc(`leaderboard/${userId}/weeks/${weekId}`);
      const leagueMemberRef = db.doc(`leagues/${leagueId}/members/${userId}`);

      const [leaderboardSnap, weekSnap, leagueMemberSnap] = await Promise.all([
        transaction.get(leaderboardRef),
        transaction.get(weekRef),
        transaction.get(leagueMemberRef),
      ]);

      const publicAggregate = {
        userId,
        name: userName,
        leagueId,
        source: AGGREGATE_SOURCE,
        schemaVersion: AGGREGATE_SCHEMA_VERSION,
        lastUpdated: Date.now(),
      };

      if (leaderboardSnap.exists) {
        transaction.update(leaderboardRef, {
          ...publicAggregate,
          lifetimeMinutes: FieldValue.increment(durationMinutes),
          lifetimeCycles: FieldValue.increment(1),
          weeklyMinutes: FieldValue.increment(durationMinutes),
          weeklyCycles: FieldValue.increment(1),
          currentWeek: weekId,
          category,
          type: 'work',
        });
      } else {
        transaction.set(leaderboardRef, {
          ...publicAggregate,
          lifetimeMinutes: durationMinutes,
          lifetimeCycles: 1,
          weeklyMinutes: durationMinutes,
          weeklyCycles: 1,
          currentWeek: weekId,
          category,
          type: 'work',
        });
      }

      if (weekSnap.exists) {
        transaction.update(weekRef, {
          weeklyMinutes: FieldValue.increment(durationMinutes),
          completedCycles: FieldValue.increment(1),
          ratingSum: FieldValue.increment(focusRating),
          ratingCount: FieldValue.increment(1),
          [`categoryMins.${category}`]: FieldValue.increment(durationMinutes),
          source: AGGREGATE_SOURCE,
          schemaVersion: AGGREGATE_SCHEMA_VERSION,
          lastUpdated: Date.now(),
        });
      } else {
        transaction.set(weekRef, {
          ...publicAggregate,
          weekId,
          weeklyMinutes: durationMinutes,
          completedCycles: 1,
          ratingSum: focusRating,
          ratingCount: 1,
          categoryMins: { [category]: durationMinutes },
        });
      }

      if (leagueMemberSnap.exists) {
        transaction.update(leagueMemberRef, {
          ...publicAggregate,
          weeklyMinutes: FieldValue.increment(durationMinutes),
          weeklyCycles: FieldValue.increment(1),
          ratingSum: FieldValue.increment(focusRating),
          ratingCount: FieldValue.increment(1),
          [`categoryMins.${category}`]: FieldValue.increment(durationMinutes),
        });
      } else {
        transaction.set(leagueMemberRef, {
          ...publicAggregate,
          weeklyMinutes: durationMinutes,
          weeklyCycles: 1,
          ratingSum: focusRating,
          ratingCount: 1,
          categoryMins: { [category]: durationMinutes },
        });
      }

      transaction.update(sessionRef, {
        processed: true,
        processedAt: Date.now(),
        durationMinutesClamped: durationMinutes,
      });
    });
  }
);
