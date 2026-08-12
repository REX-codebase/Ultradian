import { getApps, initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import * as fs from 'node:fs';
import * as path from 'node:path';

const AGGREGATE_SOURCE = 'session-aggregation-v2';
const AGGREGATE_SCHEMA_VERSION = 2;
const NON_USER_SESSION_ID = /^(sample|seed|demo|test|friend|local_peer|mock)[_-]/i;

function getISOWeek(date: Date): string {
  const value = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = value.getUTCDay() || 7;
  value.setUTCDate(value.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(value.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((value.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${value.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

function getFirestoreDb() {
  let projectId: string | undefined;
  let databaseId: string | undefined;

  const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    projectId = config.projectId;
    databaseId = config.firestoreDatabaseId !== '(default)' ? config.firestoreDatabaseId : undefined;
  }

  if (!getApps().length) initializeApp(projectId ? { projectId } : undefined);
  return databaseId ? getFirestore(databaseId) : getFirestore();
}

function validSession(sessionId: string, data: Record<string, unknown>): boolean {
  if (NON_USER_SESSION_ID.test(sessionId) || data.isSample === true || data.type !== 'work') return false;
  const seconds = Number(data.actualSecondsCompleted);
  const minutes = Number(data.durationMinutes);
  return (Number.isFinite(seconds) && seconds > 0) || (Number.isFinite(minutes) && minutes > 0);
}

/**
 * Rebuilds versioned public aggregates from genuine private sessions. This
 * intentionally ignores every old leaderboard value, preventing double counts
 * and preventing historical demo documents from re-entering public standings.
 */
export async function rebuildVerifiedLeaderboard() {
  const db = getFirestoreDb();
  const currentWeek = getISOWeek(new Date());
  const users = await db.collection('users').get();

  for (const userDoc of users.docs) {
    const user = userDoc.data();
    const name = String(user.displayName || user.username || user.publicHandle || '').trim();
    if (!name) continue;

    const leagueId = String(user.leagueId || 'wood');
    const sessions = await userDoc.ref.collection('sessions').get();
    let lifetimeMinutes = 0;
    let lifetimeCycles = 0;
    let weeklyMinutes = 0;
    let weeklyCycles = 0;
    let ratingSum = 0;
    let ratingCount = 0;
    const categoryMins: Record<string, number> = {};

    sessions.forEach((sessionDoc) => {
      const session = sessionDoc.data();
      if (!validSession(sessionDoc.id, session)) return;

      const minutes = Math.round(
        Number(session.actualSecondsCompleted || Number(session.durationMinutes || 0) * 60) / 60
      );
      if (minutes < 1 || minutes > 180) return;

      lifetimeMinutes += minutes;
      lifetimeCycles += 1;
      if (getISOWeek(new Date(Number(session.timestamp || 0))) !== currentWeek) return;

      weeklyMinutes += minutes;
      weeklyCycles += 1;
      const category = String(session.category || 'General').slice(0, 40);
      categoryMins[category] = (categoryMins[category] || 0) + minutes;
      const rating = Number(session.focusRating);
      if (Number.isFinite(rating) && rating >= 1 && rating <= 5) {
        ratingSum += rating;
        ratingCount += 1;
      }
    });

    const topCategory = Object.entries(categoryMins).sort(([, a], [, b]) => b - a)[0]?.[0] || 'General';
    const aggregate = {
      userId: userDoc.id,
      name,
      leagueId,
      source: AGGREGATE_SOURCE,
      schemaVersion: AGGREGATE_SCHEMA_VERSION,
      lastUpdated: FieldValue.serverTimestamp(),
    };

    const batch = db.batch();
    batch.set(db.collection('leaderboard').doc(userDoc.id), {
      ...aggregate,
      lifetimeMinutes,
      lifetimeCycles,
      weeklyMinutes,
      weeklyCycles,
      currentWeek,
      category: topCategory,
      type: 'work',
    });
    batch.set(db.collection('leaderboard').doc(userDoc.id).collection('weeks').doc(currentWeek), {
      ...aggregate,
      weekId: currentWeek,
      weeklyMinutes,
      completedCycles: weeklyCycles,
      ratingSum,
      ratingCount,
      categoryMins,
    });
    batch.set(db.collection('leagues').doc(leagueId).collection('members').doc(userDoc.id), {
      ...aggregate,
      weeklyMinutes,
      weeklyCycles,
      ratingSum,
      ratingCount,
      categoryMins,
    });
    await batch.commit();
  }
}

if (process.argv[1]?.includes('migrate-leaderboard')) {
  rebuildVerifiedLeaderboard().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
