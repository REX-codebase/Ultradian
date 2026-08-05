import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

/**
 * Helper to get ISO week string (e.g. "2026-W32")
 */
export function getISOWeek(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
}

const LEAGUE_TIERS = ["wood", "bronze", "silver", "gold", "platinum", "diamond", "ultradian_master"];

/**
 * Cloud Function triggered when a new session document is created under users/{userId}/sessions/{sessionId}
 * Atomically increments the user's weekly and lifetime focus statistics via Admin SDK.
 */
export const onSessionCompleted = onDocumentCreated(
  "users/{userId}/sessions/{sessionId}",
  async (event) => {
    const session = event.data?.data();
    if (!session || session.type !== "work") return;

    const userId = event.params.userId;
    const mins = Math.round((session.actualSecondsCompleted || 0) / 60);
    const hours = mins / 60;
    const weekId = getISOWeek(new Date(session.timestamp || Date.now()));
    
    const db = getFirestore();

    // Fetch user display name & league
    const userSnap = await db.collection("users").doc(userId).get();
    const userData = userSnap.data() || {};
    const userName = session.userName || userData.displayName || userData.username || "Ultradian Achiever";
    const leagueId = userData.leagueId || "wood";

    // 1. Time-boxed ISO week subcollection document atomic accumulators
    const weekRef = db.collection("leaderboard").doc(userId).collection("weeks").doc(weekId);
    const weekWrite = weekRef.set({
      userId,
      name: userName,
      weeklyHours: FieldValue.increment(hours),
      completedCycles: FieldValue.increment(1),
      ratingSum: FieldValue.increment(session.focusRating || 5),
      ratingCount: FieldValue.increment(1),
      [`categoryMins.${session.category || 'General'}`]: FieldValue.increment(mins),
      weekId, // enables collectionGroup queries
      lastUpdated: FieldValue.serverTimestamp()
    }, { merge: true });
    
    // 2. Global lifetime stats doc
    const globalRef = db.collection("leaderboard").doc(userId);
    const globalWrite = globalRef.set({
      userId,
      name: userName,
      lifetimeCycles: FieldValue.increment(1),
      lifetimeHours: FieldValue.increment(hours),
      currentWeek: weekId,
      leagueId,
      lastUpdated: FieldValue.serverTimestamp()
    }, { merge: true });

    // 3. Matchmaking League member document atomic update
    const leagueRef = db.collection("leagues").doc(leagueId).collection("members").doc(userId);
    const leagueWrite = leagueRef.set({
      userId,
      name: userName,
      weeklyHours: FieldValue.increment(hours),
      completedCycles: FieldValue.increment(1),
      ratingSum: FieldValue.increment(session.focusRating || 5),
      ratingCount: FieldValue.increment(1),
      [`categoryMins.${session.category || 'General'}`]: FieldValue.increment(mins),
      leagueId,
      lastUpdated: FieldValue.serverTimestamp()
    }, { merge: true });

    await Promise.all([weekWrite, globalWrite, leagueWrite]);
  }
);

/**
 * Scheduled Cloud Function running every Sunday at 23:59 UTC
 * Handles matchmaking league promotions and demotions for active users
 */
export const weeklyLeagueMatchmaking = onSchedule("59 23 * * 0", async () => {
  const db = getFirestore();

  interface Move {
    userId: string;
    memberData: Record<string, any>;
    from: string;
    to: string;
  }

  const moves: Move[] = [];

  // Phase 1 (read-only): Determine promotions and demotions without mutating
  for (const leagueId of LEAGUE_TIERS) {
    const membersSnap = await db
      .collection("leagues")
      .doc(leagueId)
      .collection("members")
      .orderBy("weeklyHours", "desc")
      .get();

    if (membersSnap.empty) continue;

    const members = membersSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    if (members.length < 10) continue; // Skip tiers with < 10 members

    const currentTierIndex = LEAGUE_TIERS.indexOf(leagueId);
    const promoCount = Math.max(1, Math.floor(members.length * 0.2));
    const releCount = Math.max(1, Math.floor(members.length * 0.2));

    for (let i = 0; i < members.length; i++) {
      const member = members[i];
      let targetLeague = leagueId;

      if (i < promoCount && currentTierIndex < LEAGUE_TIERS.length - 1) {
        targetLeague = LEAGUE_TIERS[currentTierIndex + 1];
      } else if (i >= members.length - releCount && currentTierIndex > 0) {
        targetLeague = LEAGUE_TIERS[currentTierIndex - 1];
      }

      if (targetLeague !== leagueId) {
        moves.push({
          userId: member.id,
          memberData: member,
          from: leagueId,
          to: targetLeague,
        });
      }
    }
  }

  // Phase 2 (apply): Execute all moves and reset stats for ALL members across all leagues
  const movedUserIds = new Set(moves.map((m) => m.userId));

  // Execute moves
  for (const move of moves) {
    // 1. Update user profile
    await db.collection("users").doc(move.userId).set({ leagueId: move.to }, { merge: true });

    // 2. Remove from old league
    await db.collection("leagues").doc(move.from).collection("members").doc(move.userId).delete();

    // 3. Add to new league with reset weekly stats
    await db.collection("leagues").doc(move.to).collection("members").doc(move.userId).set({
      ...move.memberData,
      leagueId: move.to,
      weeklyHours: 0,
      completedCycles: 0,
      ratingSum: 0,
      ratingCount: 0,
      categoryMins: {},
      lastUpdated: FieldValue.serverTimestamp(),
    }, { merge: true });
  }

  // Reset all remaining members in every league
  for (const leagueId of LEAGUE_TIERS) {
    const membersSnap = await db
      .collection("leagues")
      .doc(leagueId)
      .collection("members")
      .get();

    for (const docSnap of membersSnap.docs) {
      if (!movedUserIds.has(docSnap.id)) {
        await docSnap.ref.set({
          weeklyHours: 0,
          completedCycles: 0,
          ratingSum: 0,
          ratingCount: 0,
          categoryMins: {},
          lastUpdated: FieldValue.serverTimestamp(),
        }, { merge: true });
      }
    }
  }
});
