import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

/**
 * Helper to get ISO week string (e.g. "2026-W32")
 */
function getISOWeek(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
}

export async function migrateLeaderboardToTimeboxedSubcollections() {
  if (!getApps().length) {
    initializeApp();
  }
  const db = getFirestore();
  const currentWeekId = getISOWeek(new Date());

  console.log(`Starting Leaderboard Migration to ISO Week: ${currentWeekId}...`);

  const leaderboardSnap = await db.collection("leaderboard").get();

  for (const userDoc of leaderboardSnap.docs) {
    const userId = userDoc.id;
    const oldData = userDoc.data();

    // Fetch user sessions history
    const sessionsSnap = await db.collection("users").doc(userId).collection("sessions").get();
    
    let weeklyMins = 0;
    let completedCycles = 0;
    let sumRatings = 0;
    let ratingCount = 0;
    const categoryMins: Record<string, number> = {};

    sessionsSnap.forEach((sDoc) => {
      const s = sDoc.data();
      if (s.type === "work") {
        const sessionDate = new Date(s.timestamp || Date.now());
        const sessionWeek = getISOWeek(sessionDate);

        if (sessionWeek === currentWeekId) {
          const mins = Math.round((s.actualSecondsCompleted || 0) / 60);
          weeklyMins += mins;
          completedCycles += 1;
          if (s.focusRating) {
            sumRatings += s.focusRating;
            ratingCount += 1;
          }
          const cat = s.category || "General";
          categoryMins[cat] = (categoryMins[cat] || 0) + mins;
        }
      }
    });

    const weeklyHours = Math.round((weeklyMins / 60) * 10) / 10;
    const avgRating = ratingCount > 0 ? sumRatings / ratingCount : 5.0;
    const focusScore = Math.round(avgRating * 20);

    let topCategory = "General";
    let maxMins = 0;
    Object.entries(categoryMins).forEach(([cat, m]) => {
      if (m > maxMins) {
        maxMins = m;
        topCategory = cat;
      }
    });

    const userName = oldData.name || "Ultradian Achiever";

    // Write to time-boxed subcollection /leaderboard/{userId}/weeks/{weekId}
    const weekRef = db.collection("leaderboard").doc(userId).collection("weeks").doc(currentWeekId);
    await weekRef.set({
      userId,
      name: userName,
      weeklyHours: weeklyHours > 0 ? weeklyHours : (oldData.weeklyHours || 0),
      completedCycles: completedCycles > 0 ? completedCycles : (oldData.completedCycles || 0),
      focusScore: focusScore > 0 ? focusScore : (oldData.focusScore || 90),
      topCategory,
      lastUpdated: FieldValue.serverTimestamp(),
    }, { merge: true });

    // Update league document
    const leagueId = oldData.leagueId || "wood";
    const leagueRef = db.collection("leagues").doc(leagueId).collection("members").doc(userId);
    await leagueRef.set({
      userId,
      name: userName,
      weeklyHours: weeklyHours > 0 ? weeklyHours : (oldData.weeklyHours || 0),
      completedCycles: completedCycles > 0 ? completedCycles : (oldData.completedCycles || 0),
      focusScore: focusScore > 0 ? focusScore : (oldData.focusScore || 90),
      topCategory,
      leagueId,
      lastUpdated: FieldValue.serverTimestamp(),
    }, { merge: true });

    console.log(`Migrated user ${userId} (${userName}) -> week ${currentWeekId}`);
  }

  console.log("Leaderboard Migration Complete!");
}

if (process.argv[1]?.includes("migrate-leaderboard")) {
  migrateLeaderboardToTimeboxedSubcollections().catch(console.error);
}
