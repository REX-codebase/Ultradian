import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import * as fs from "fs";
import * as path from "path";

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

function getFirestoreDb() {
  let projectId = undefined;
  let databaseId = undefined;

  try {
    const configPath = path.resolve(process.cwd(), "firebase-applet-config.json");
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      projectId = config.projectId;
      if (config.firestoreDatabaseId && config.firestoreDatabaseId !== "(default)") {
        databaseId = config.firestoreDatabaseId;
      }
    }
  } catch (e) {
    console.warn("Could not load custom firestore databaseId from config, using default", e);
  }

  if (!getApps().length) {
    initializeApp(projectId ? { projectId } : undefined);
  }

  return databaseId ? getFirestore(databaseId) : getFirestore();
}

export async function migrateLeaderboardToTimeboxedSubcollections() {
  const db = getFirestoreDb();
  const currentWeekId = getISOWeek(new Date());

  console.log(`Starting Canonical Leaderboard Migration to ISO Week: ${currentWeekId}...`);

  const userIds = new Set<string>();

  const usersSnap = await db.collection("users").get();
  usersSnap.docs.forEach((doc) => userIds.add(doc.id));

  const leaderboardSnap = await db.collection("leaderboard").get();
  leaderboardSnap.docs.forEach((doc) => {
    if (!doc.id.startsWith("friend_") && !doc.id.startsWith("seed_")) {
      userIds.add(doc.id);
    }
  });

  for (const userId of userIds) {
    const userDocSnap = await db.collection("users").doc(userId).get();
    const userData = userDocSnap.data() || {};

    const oldLeaderboardSnap = await db.collection("leaderboard").doc(userId).get();
    const oldData = oldLeaderboardSnap.data() || {};

    const sessionsSnap = await db.collection("users").doc(userId).collection("sessions").get();
    
    let weeklyMins = 0;
    let lifetimeMins = oldData.lifetimeMinutes || 0;
    let completedCycles = 0;
    let lifetimeCycles = oldData.lifetimeCycles || 0;
    let sumRatings = 0;
    let ratingCount = 0;
    const categoryMins: Record<string, number> = {};

    sessionsSnap.forEach((sDoc) => {
      const s = sDoc.data();
      if (s.type === "work") {
        const sessionDate = new Date(s.timestamp || Date.now());
        const sessionWeek = getISOWeek(sessionDate);
        const mins = Math.round(Number(s.durationMinutes || (s.actualSecondsCompleted ? s.actualSecondsCompleted / 60 : 0) || 0));

        lifetimeMins += mins;
        lifetimeCycles += 1;

        if (sessionWeek === currentWeekId) {
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
    const userName = userData.displayName || userData.username || oldData.name || "Ultradian Achiever";
    const leagueId = userData.leagueId || oldData.leagueId || "wood";

    // Write to time-boxed subcollection /leaderboard/{userId}/weeks/{weekId}
    const weekRef = db.collection("leaderboard").doc(userId).collection("weeks").doc(currentWeekId);
    await weekRef.set({
      userId,
      name: userName,
      weeklyMinutes: weeklyMins,
      weeklyHours,
      completedCycles,
      ratingSum: sumRatings,
      ratingCount,
      categoryMins,
      weekId: currentWeekId,
      lastUpdated: FieldValue.serverTimestamp(),
    }, { merge: true });

    // Update top-level leaderboard doc
    const globalRef = db.collection("leaderboard").doc(userId);
    await globalRef.set({
      userId,
      name: userName,
      weeklyMinutes: weeklyMins,
      lifetimeMinutes: lifetimeMins,
      lifetimeCycles,
      currentWeek: currentWeekId,
      leagueId,
      lastUpdated: FieldValue.serverTimestamp(),
    }, { merge: true });

    // Update league member document
    const leagueRef = db.collection("leagues").doc(leagueId).collection("members").doc(userId);
    await leagueRef.set({
      userId,
      name: userName,
      weeklyMinutes: weeklyMins,
      weeklyHours,
      completedCycles,
      ratingSum: sumRatings,
      ratingCount,
      categoryMins,
      leagueId,
      lastUpdated: FieldValue.serverTimestamp(),
    }, { merge: true });

    console.log(`Migrated user ${userId} (${userName}) -> week ${currentWeekId} with ${weeklyMins} mins`);
  }

  console.log("Canonical Leaderboard Migration Complete!");
}

if (process.argv[1]?.includes("migrate-leaderboard")) {
  migrateLeaderboardToTimeboxedSubcollections().catch(console.error);
}
