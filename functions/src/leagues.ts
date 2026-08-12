import { onSchedule } from 'firebase-functions/v2/scheduler';
import { FieldValue } from 'firebase-admin/firestore';
import { getUltradianFirestore } from './shared/database';
import { getISOWeekString, LEAGUE_TIERS } from './shared/utils';

const PAGE_SIZE = 400; // Keep memory footprint predictable per page

/**
 * Fetch an entire ordered collection using cursor pagination so we never
 * materialize unbounded result sets into a single in-memory array at once
 * beyond PAGE_SIZE chunks.
 */
async function fetchAllMembersPaginated(
  db: FirebaseFirestore.Firestore,
  tier: string
): Promise<Array<{ id: string; data: FirebaseFirestore.DocumentData }>> {
  const members: Array<{ id: string; data: FirebaseFirestore.DocumentData }> = [];
  let lastDoc: FirebaseFirestore.QueryDocumentSnapshot | null = null;

  // Safety cap: never load more than ~20k members into one function invocation.
  // Beyond that the system should move to Cloud Tasks / multiple jobs.
  const HARD_CAP = 20000;

  while (members.length < HARD_CAP) {
    let q = db
      .collection('leagues')
      .doc(tier)
      .collection('members')
      .orderBy('weeklyMinutes', 'desc')
      .limit(PAGE_SIZE);

    if (lastDoc) {
      q = q.startAfter(lastDoc);
    }

    const snap = await q.get();
    if (snap.empty) break;

    for (const d of snap.docs) {
      members.push({ id: d.id, data: d.data() });
    }

    lastDoc = snap.docs[snap.docs.length - 1];
    if (snap.size < PAGE_SIZE) break;
  }

  if (members.length >= HARD_CAP) {
    console.warn(
      `League tier "${tier}" hit hard cap of ${HARD_CAP} members during matchmaking. Consider sharded processing.`
    );
  }

  return members;
}

/**
 * Scheduled Cloud Function running every Monday at 00:00 UTC
 * Handles matchmaking league promotions, demotions, and weekly score resets.
 */
export const weeklyLeagueMatchmaking = onSchedule(
  { schedule: '0 0 * * 1', timeZone: 'UTC', memory: '512MiB', timeoutSeconds: 540 },
  async () => {
    const db = getUltradianFirestore();
    const newWeek = getISOWeekString();

    interface LeagueMemberMove {
      userId: string;
      memberData: Record<string, any>;
      fromTier: string;
      toTier: string;
    }

    const moves: LeagueMemberMove[] = [];

    // Phase 1 (Read-only Analysis): Calculate promotions and demotions with pagination
    for (const tier of LEAGUE_TIERS) {
      const members = await fetchAllMembersPaginated(db, tier);

      if (members.length === 0) continue;

      const tierIndex = LEAGUE_TIERS.indexOf(tier);

      // Skip tier movement if population < 5 for small leagues
      if (members.length < 5) continue;

      const promoCount = Math.max(1, Math.floor(members.length * 0.2));
      const releCount = Math.max(1, Math.floor(members.length * 0.2));

      for (let i = 0; i < members.length; i++) {
        const member = members[i];
        let targetTier = tier;

        if (i < promoCount && tierIndex < LEAGUE_TIERS.length - 1) {
          targetTier = LEAGUE_TIERS[tierIndex + 1];
        } else if (i >= members.length - releCount && tierIndex > 0) {
          targetTier = LEAGUE_TIERS[tierIndex - 1];
        }

        if (targetTier !== tier) {
          moves.push({
            userId: member.id,
            memberData: member.data,
            fromTier: tier,
            toTier: targetTier,
          });
        }
      }
    }

    // Phase 2 (Transactional Execution): Apply league relocations
    const movedUserIds = new Set(moves.map((m) => m.userId));

    for (const move of moves) {
      // Update user profile leagueId
      await db.collection('users').doc(move.userId).set({ leagueId: move.toTier }, { merge: true });

      // Remove member from old tier
      await db
        .collection('leagues')
        .doc(move.fromTier)
        .collection('members')
        .doc(move.userId)
        .delete();

      // Place member in new tier with reset weekly statistics
      await db
        .collection('leagues')
        .doc(move.toTier)
        .collection('members')
        .doc(move.userId)
        .set(
          {
            ...move.memberData,
            leagueId: move.toTier,
            weeklyMinutes: 0,
            weeklyCycles: 0,
            ratingSum: 0,
            ratingCount: 0,
            categoryMins: {},
            lastUpdated: Date.now(),
          },
          { merge: true }
        );
    }

    // Phase 3: Reset remaining members across all tiers (also paginated)
    for (const tier of LEAGUE_TIERS) {
      let lastDoc: FirebaseFirestore.QueryDocumentSnapshot | null = null;

      while (true) {
        let q = db.collection('leagues').doc(tier).collection('members').limit(PAGE_SIZE);
        if (lastDoc) q = q.startAfter(lastDoc);

        const membersSnap = await q.get();
        if (membersSnap.empty) break;

        const batch = db.batch();
        let ops = 0;

        for (const docSnap of membersSnap.docs) {
          if (!movedUserIds.has(docSnap.id)) {
            batch.set(
              docSnap.ref,
              {
                weeklyMinutes: 0,
                weeklyCycles: 0,
                ratingSum: 0,
                ratingCount: 0,
                categoryMins: {},
                lastUpdated: Date.now(),
              },
              { merge: true }
            );
            ops++;
          }
        }

        if (ops > 0) {
          await batch.commit();
        }

        lastDoc = membersSnap.docs[membersSnap.docs.length - 1];
        if (membersSnap.size < PAGE_SIZE) break;
      }
    }

    // Phase 4: Reset currentWeek and weeklyMinutes on main leaderboard documents (batched)
    let lastLbDoc: FirebaseFirestore.QueryDocumentSnapshot | null = null;
    while (true) {
      let q = db.collection('leaderboard').limit(450);
      if (lastLbDoc) q = q.startAfter(lastLbDoc);

      const leaderboardSnap = await q.get();
      if (leaderboardSnap.empty) break;

      const batch = db.batch();
      for (const docSnap of leaderboardSnap.docs) {
        batch.update(docSnap.ref, {
          weeklyMinutes: 0,
          weeklyCycles: 0,
          currentWeek: newWeek,
          lastUpdated: Date.now(),
        });
      }
      await batch.commit();

      lastLbDoc = leaderboardSnap.docs[leaderboardSnap.docs.length - 1];
      if (leaderboardSnap.size < 450) break;
    }
  }
);
