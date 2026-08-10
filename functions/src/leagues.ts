import { onSchedule } from 'firebase-functions/v2/scheduler';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getISOWeekString, LEAGUE_TIERS } from './shared/utils';

/**
 * Scheduled Cloud Function running every Monday at 00:00 UTC
 * Handles matchmaking league promotions, demotions, and weekly score resets.
 */
export const weeklyLeagueMatchmaking = onSchedule(
  { schedule: '0 0 * * 1', timeZone: 'UTC' },
  async () => {
    const db = getFirestore();
    const newWeek = getISOWeekString();

    interface LeagueMemberMove {
      userId: string;
      memberData: Record<string, any>;
      fromTier: string;
      toTier: string;
    }

    const moves: LeagueMemberMove[] = [];

    // Phase 1 (Read-only Analysis): Calculate promotions and demotions
    for (const tier of LEAGUE_TIERS) {
      const membersSnap = await db
        .collection('leagues')
        .doc(tier)
        .collection('members')
        .orderBy('weeklyMinutes', 'desc')
        .get();

      if (membersSnap.empty) continue;

      const members = membersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
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
            memberData: member,
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
      await db.collection('leagues').doc(move.fromTier).collection('members').doc(move.userId).delete();

      // Place member in new tier with reset weekly statistics
      await db.collection('leagues').doc(move.toTier).collection('members').doc(move.userId).set({
        ...move.memberData,
        leagueId: move.toTier,
        weeklyMinutes: 0,
        weeklyCycles: 0,
        ratingSum: 0,
        ratingCount: 0,
        categoryMins: {},
        lastUpdated: Date.now(),
      }, { merge: true });
    }

    // Phase 3: Reset remaining members across all tiers
    for (const tier of LEAGUE_TIERS) {
      const membersSnap = await db.collection('leagues').doc(tier).collection('members').get();

      for (const docSnap of membersSnap.docs) {
        if (!movedUserIds.has(docSnap.id)) {
          await docSnap.ref.set({
            weeklyMinutes: 0,
            weeklyCycles: 0,
            ratingSum: 0,
            ratingCount: 0,
            categoryMins: {},
            lastUpdated: Date.now(),
          }, { merge: true });
        }
      }
    }

    // Phase 4: Reset currentWeek and weeklyMinutes on main leaderboard documents
    const leaderboardSnap = await db.collection('leaderboard').get();
    if (!leaderboardSnap.empty) {
      const batches: Promise<any>[] = [];
      let currentBatch = db.batch();
      let count = 0;

      for (const docSnap of leaderboardSnap.docs) {
        currentBatch.update(docSnap.ref, {
          weeklyMinutes: 0,
          weeklyCycles: 0,
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
