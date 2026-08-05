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

    // 1. Time-boxed ISO week subcollection document atomic increment
    const weekRef = db.collection("leaderboard").doc(userId).collection("weeks").doc(weekId);
    await weekRef.set({
      userId,
      name: userName,
      weeklyHours: FieldValue.increment(hours),
      completedCycles: FieldValue.increment(1),
      focusScore: FieldValue.increment(session.focusRating || 5),
      topCategory: session.category || "General",
      lastUpdated: FieldValue.serverTimestamp()
    }, { merge: true });
    
    // 2. Global lifetime stats doc
    const globalRef = db.collection("leaderboard").doc(userId);
    await globalRef.set({
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
    await leagueRef.set({
      userId,
      name: userName,
      weeklyHours: FieldValue.increment(hours),
      completedCycles: FieldValue.increment(1),
      focusScore: FieldValue.increment(session.focusRating || 5),
      topCategory: session.category || "General",
      leagueId,
      lastUpdated: FieldValue.serverTimestamp()
    }, { merge: true });
  }
);

/**
 * Scheduled Cloud Function running every Sunday at 23:59 UTC
 * Handles matchmaking league promotions and demotions for active users
 */
export const weeklyLeagueMatchmaking = onSchedule("59 23 * * 0", async () => {
  const db = getFirestore();

  for (const leagueId of LEAGUE_TIERS) {
    const membersSnap = await db
      .collection("leagues")
      .doc(leagueId)
      .collection("members")
      .orderBy("weeklyHours", "desc")
      .get();

    if (membersSnap.empty) continue;

    const members = membersSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    const currentTierIndex = LEAGUE_TIERS.indexOf(leagueId);

    for (let i = 0; i < members.length; i++) {
      const member = members[i];
      let targetLeague = leagueId;

      // Top 10 promoted
      if (i < 10 && currentTierIndex < LEAGUE_TIERS.length - 1) {
        targetLeague = LEAGUE_TIERS[currentTierIndex + 1];
      } else if (i >= members.length - 10 && members.length >= 20 && currentTierIndex > 0) {
        // Bottom 10 demoted
        targetLeague = LEAGUE_TIERS[currentTierIndex - 1];
      }

      if (targetLeague !== leagueId) {
        // Update user profile with new league ID
        await db.collection("users").doc(member.id).set({ leagueId: targetLeague }, { merge: true });
        
        // Remove from current league
        await db.collection("leagues").doc(leagueId).collection("members").doc(member.id).delete();
        
        // Insert into new league
        await db.collection("leagues").doc(targetLeague).collection("members").doc(member.id).set({
          ...member,
          leagueId: targetLeague,
          weeklyHours: 0, // reset for the new week
          completedCycles: 0,
          lastUpdated: FieldValue.serverTimestamp(),
        });
      }
    }
  }
});
