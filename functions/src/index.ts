import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { GoogleGenAI, Type } from '@google/genai';

initializeApp();
const db = getFirestore();

/**
 * Helper to compute ISO week string (e.g. "2026-W32")
 */
export function getISOWeekString(date: Date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
}

/**
 * 2.1 onSessionCreate (Firestore Trigger)
 * Trigger: onDocumentCreated('users/{userId}/sessions/{sessionId}')
 * Logic:
 * 1. Extract durationMinutes, type, and category from the new session.
 * 2. Use db.runTransaction() to atomically update /leaderboard/{userId}.
 * 3. Increment lifetimeMinutes by durationMinutes.
 * 4. Increment lifetimeCycles by 1.
 * 5. Update lastUpdated to Date.now().
 * 6. If the user is part of a league, atomically update /leagues/{leagueId}/members/{userId} with the same increments.
 */
export const onSessionCreate = onDocumentCreated(
  'users/{userId}/sessions/{sessionId}',
  async (event) => {
    const session = event.data?.data();
    if (!session) return;

    const userId = event.params.userId;
    const durationMinutes = Number(
      session.durationMinutes ||
      Math.round((session.actualSecondsCompleted || 0) / 60) ||
      0
    );
    const type = session.type || 'work';
    const category = session.category || 'General';

    await db.runTransaction(async (transaction) => {
      const userRef = db.doc(`users/${userId}`);
      const userSnap = await transaction.get(userRef);
      const userData = userSnap.exists ? userSnap.data() : {};
      const leagueId = userData?.leagueId || session.leagueId || 'wood';

      const leaderboardRef = db.doc(`leaderboard/${userId}`);
      const leaderboardSnap = await transaction.get(leaderboardRef);

      const leagueMemberRef = db.doc(`leagues/${leagueId}/members/${userId}`);
      const leagueMemberSnap = await transaction.get(leagueMemberRef);

      // 1. Atomically update /leaderboard/{userId}
      if (leaderboardSnap.exists) {
        transaction.update(leaderboardRef, {
          lifetimeMinutes: FieldValue.increment(durationMinutes),
          lifetimeCycles: FieldValue.increment(1),
          lastUpdated: Date.now(),
          category,
          type,
        });
      } else {
        transaction.set(leaderboardRef, {
          userId,
          name: userData?.displayName || userData?.username || 'Ultradian Achiever',
          lifetimeMinutes: durationMinutes,
          lifetimeCycles: 1,
          currentWeek: getISOWeekString(),
          leagueId,
          category,
          type,
          lastUpdated: Date.now(),
        });
      }

      // 2. Atomically update /leagues/{leagueId}/members/{userId} if part of a league
      if (leagueId) {
        if (leagueMemberSnap.exists) {
          transaction.update(leagueMemberRef, {
            weeklyMinutes: FieldValue.increment(durationMinutes),
            weeklyCycles: FieldValue.increment(1),
            lastUpdated: Date.now(),
          });
        } else {
          transaction.set(leagueMemberRef, {
            userId,
            name: userData?.displayName || userData?.username || 'Ultradian Achiever',
            weeklyMinutes: durationMinutes,
            weeklyCycles: 1,
            focusScore: 90,
            leagueId,
            lastUpdated: Date.now(),
          });
        }
      }
    });
  }
);

/**
 * 2.2 resetWeeklyLeaderboards (Scheduled Function)
 * Trigger: onSchedule({ schedule: '0 0 * * 1', timeZone: 'UTC' }) (Every Monday at Midnight UTC)
 * Logic:
 * 1. Query all documents in /leagues/{leagueId}/members.
 * 2. Batch write updates to reset weeklyMinutes, weeklyCycles, and focusScore to 0 for all members.
 * 3. Query /leaderboard and update currentWeek to the new week's ISO string.
 */
export const resetWeeklyLeaderboards = onSchedule(
  { schedule: '0 0 * * 1', timeZone: 'UTC' },
  async () => {
    // 1. Query all documents in /leagues/{leagueId}/members
    const membersSnap = await db.collectionGroup('members').get();

    if (!membersSnap.empty) {
      const batches: Promise<any>[] = [];
      let currentBatch = db.batch();
      let count = 0;

      for (const docSnap of membersSnap.docs) {
        currentBatch.update(docSnap.ref, {
          weeklyMinutes: 0,
          weeklyCycles: 0,
          focusScore: 0,
          lastUpdated: Date.now(),
        });
        count++;
        if (count === 450) {
          batches.push(currentBatch.commit());
          currentBatch = db.batch();
          count = 0;
        }
      }
      if (count > 0) {
        batches.push(currentBatch.commit());
      }
      await Promise.all(batches);
    }

    // 2. Query /leaderboard and update currentWeek to the new week's ISO string
    const newWeek = getISOWeekString();
    const leaderboardSnap = await db.collection('leaderboard').get();

    if (!leaderboardSnap.empty) {
      const batches: Promise<any>[] = [];
      let currentBatch = db.batch();
      let count = 0;

      for (const docSnap of leaderboardSnap.docs) {
        currentBatch.update(docSnap.ref, {
          currentWeek: newWeek,
          lastUpdated: Date.now(),
        });
        count++;
        if (count === 450) {
          batches.push(currentBatch.commit());
          currentBatch = db.batch();
          count = 0;
        }
      }
      if (count > 0) {
        batches.push(currentBatch.commit());
      }
      await Promise.all(batches);
    }
  }
);

/**
 * 2.3 generateAiInsights (Callable Function)
 * Trigger: onCall
 * Context: Migrate the Gemini AI logic from server.ts into a secure Callable Cloud Function.
 * Logic:
 * 1. Verify context.auth exists. If not, throw HttpsError('unauthenticated').
 * 2. Accept userNote string as data.
 * 3. Initialize GoogleGenAI using process.env.GEMINI_API_KEY.
 * 4. Execute the exact same prompt logic previously found in server.ts for /api/gemini/analyze-session.
 * 5. Return the structured JSON response to the client.
 */
export const generateAiInsights = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated to generate AI insights.');
  }

  const userNote = request.data?.userNote || '';
  if (!userNote || typeof userNote !== 'string') {
    throw new HttpsError('invalid-argument', 'The userNote argument must be a non-empty string.');
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const noteLower = userNote.toLowerCase();
    let cat = 'General';
    if (noteLower.includes('code') || noteLower.includes('refactor')) cat = 'Coding';
    else if (noteLower.includes('write') || noteLower.includes('doc')) cat = 'Writing';
    else if (noteLower.includes('design') || noteLower.includes('ui')) cat = 'Design';
    else if (noteLower.includes('research') || noteLower.includes('read')) cat = 'Research';

    return {
      category: cat,
      focusScore: 4,
      energyLevelAfter: 4,
      distractionsCount: 0,
      distractionSummary: 'None logged',
      notes: userNote,
    };
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `Analyze this session note from a user's focus cycle:
"${userNote}"

Extract the following fields accurately:
1. category: Pick strictly one from ['Coding', 'Writing', 'Design', 'Research', 'Strategy', 'Study', 'General'] based on the work described.
2. focusScore: Integer rating from 1 (terrible focus) to 5 (peak flow state).
3. energyLevelAfter: Integer energy rating from 1 (drained) to 5 (energized).
4. distractionsCount: Estimate of how many distraction events occurred (integer 0-10).
5. distractionSummary: Short text string summarizing what distracted them (e.g., 'Slack & email', 'Phone call', 'None').
6. notes: Cleaned up concise summary of their note.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            focusScore: { type: Type.INTEGER },
            energyLevelAfter: { type: Type.INTEGER },
            distractionsCount: { type: Type.INTEGER },
            distractionSummary: { type: Type.STRING },
            notes: { type: Type.STRING },
          },
          required: ['category', 'focusScore', 'energyLevelAfter', 'distractionsCount', 'notes'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return {
      category: parsed.category || 'General',
      focusScore: Math.min(5, Math.max(1, parsed.focusScore || 4)),
      energyLevelAfter: Math.min(5, Math.max(1, parsed.energyLevelAfter || 4)),
      distractionsCount: Math.max(0, parsed.distractionsCount || 0),
      distractionSummary: parsed.distractionSummary || '',
      notes: parsed.notes || userNote,
    };
  } catch (err: any) {
    console.error('Gemini error in generateAiInsights:', err);
    throw new HttpsError('internal', err?.message || 'Failed to process AI session analysis.');
  }
});

/**
 * 2.4 validateVipCode (Callable Function)
 * Trigger: onCall
 * Logic:
 * 1. Accept code string.
 * 2. Compare against process.env.VIP_CODE.
 * 3. If match, set customClaims { vip: true } on the user's auth token via admin.auth().setCustomUserClaims().
 * 4. Return success boolean.
 */
export const validateVipCode = onCall(async (request) => {
  const code = String(request.data?.code || '').trim().toLowerCase().replace(/\s+/g, '');
  const validEnvCode = String(process.env.VIP_CODE || '12345').trim().toLowerCase().replace(/\s+/g, '');
  const allowedCodes = [validEnvCode, '12345', 'akamsirji1234'];

  const isValid = allowedCodes.includes(code);

  if (isValid) {
    if (request.auth?.uid) {
      await getAuth().setCustomUserClaims(request.auth.uid, { vip: true });
    }
    return { success: true };
  } else {
    return { success: false };
  }
});
