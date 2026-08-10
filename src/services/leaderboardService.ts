import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  getCountFromServer,
  where,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { FriendProfile, CategoryTag, LeagueTier, LeagueMember, RivalInfo } from '../types';

/**
 * Computes deterministic ISO week string in UTC.
 */
export function getISOWeek(dateInput: Date = new Date()): string {
  const date = typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
}

/**
 * Global Rank calculation using Firestore count aggregation query on the canonical leaderboard.
 */
export async function fetchGlobalRank(userId: string, currentUserMinutes: number): Promise<number> {
  try {
    const q = query(
      collection(db, 'leaderboard'),
      where('weeklyMinutes', '>', currentUserMinutes)
    );
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count + 1;
  } catch (err) {
    console.warn('Global rank count aggregation fallback:', err);
    return 1;
  }
}

/**
 * Subscribes to live League members updates for matchmaking leagues.
 */
export function subscribeToLeagueMembers(
  leagueId: LeagueTier,
  userId: string | undefined,
  onUpdate: (members: LeagueMember[]) => void
) {
  const q = query(collection(db, 'leagues', leagueId, 'members'), orderBy('weeklyMinutes', 'desc'), limit(50));

  return onSnapshot(q, (snapshot) => {
    const list: LeagueMember[] = [];
    let currentRank = 1;

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const docId = docSnap.id;
      const isSelf = userId ? (data.userId === userId || docId === userId) : false;

      const weeklyMinutes = data.weeklyMinutes ?? (data.weeklyHours ? Math.round(data.weeklyHours * 60) : 0);
      const weeklyHours = weeklyMinutes / 60;

      const focusScore = (data.ratingCount && data.ratingCount > 0)
        ? Math.round((data.ratingSum / data.ratingCount) * 20)
        : (data.focusScore ?? 90);

      let topCategory: CategoryTag = 'General';
      if (data.categoryMins) {
        let maxM = 0;
        Object.entries(data.categoryMins).forEach(([cat, mins]) => {
          if ((mins as number) > maxM) {
            maxM = mins as number;
            topCategory = cat as CategoryTag;
          }
        });
      } else if (data.topCategory) {
        topCategory = data.topCategory as CategoryTag;
      }

      list.push({
        id: data.userId || docId,
        name: data.name || 'Ultradian Achiever',
        weeklyHours,
        completedCycles: data.weeklyCycles ?? data.completedCycles ?? 0,
        focusScore,
        topCategory,
        leagueId: (data.leagueId as LeagueTier) || leagueId,
        rank: currentRank++,
        isUser: isSelf,
      });
    });

    onUpdate(list);
  }, (err) => {
    console.error('Error listening to league members:', err);
    onUpdate([]);
  });
}

/**
 * Calculates Rival tracking (Ghost pacing) relative to user's position.
 */
export function calculateGhostRival(
  currentUserId: string,
  allPlayers: (LeagueMember | FriendProfile)[]
): RivalInfo | null {
  if (!allPlayers || !allPlayers.length) return null;

  const sorted = [...allPlayers].sort((a, b) => b.weeklyHours - a.weeklyHours);
  const userIdx = sorted.findIndex((p) => p.id === currentUserId || p.isUser);

  if (userIdx === 0) {
    return {
      rivalName: 'Nobody',
      rivalHours: sorted[0].weeklyHours,
      minutesBehind: 0,
      cyclesToPass: 0,
      rankAbove: 1,
      isLeading: true,
    };
  }

  if (userIdx > 0) {
    const rival = sorted[userIdx - 1];
    const userHours = sorted[userIdx].weeklyHours;
    const diffHours = Math.max(0, rival.weeklyHours - userHours);
    const minutesBehind = Math.round(diffHours * 60);
    const cyclesToPass = Math.ceil(minutesBehind / 90) || 1;

    return {
      rivalName: rival.name,
      rivalHours: rival.weeklyHours,
      minutesBehind,
      cyclesToPass,
      rankAbove: userIdx,
      isLeading: false,
    };
  }

  return null;
}

/**
 * Subscribes to canonical global leaderboard.
 */
export function subscribeToLeaderboard(
  userId: string | undefined,
  onUpdate: (friends: FriendProfile[]) => void
) {
  const q = query(
    collection(db, 'leaderboard'),
    orderBy('weeklyMinutes', 'desc'),
    limit(50)
  );

  return onSnapshot(q, (snapshot) => {
    const list: FriendProfile[] = [];
    let rank = 1;

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const docId = docSnap.id;

      if (docId.startsWith('friend_') || docId.startsWith('seed_')) {
        return;
      }

      const isSelf = userId ? (data.userId === userId || data.id === userId || docId === userId) : false;
      const weeklyMinutes = data.weeklyMinutes ?? (data.weeklyHours ? Math.round(data.weeklyHours * 60) : 0);
      const weeklyHours = weeklyMinutes / 60;
      const completedCycles = data.weeklyCycles ?? data.completedCycles ?? 0;
      const focusScore = data.focusScore ?? 90;

      list.push({
        id: data.userId || data.id || docId,
        name: data.name || 'Ultradian Achiever',
        weeklyHours,
        completedCycles,
        focusScore,
        topCategory: (data.category as CategoryTag) || 'General',
        isUser: isSelf,
        leagueId: data.leagueId || 'wood',
        rank: rank++,
      });
    });

    onUpdate(list);
  }, (err) => {
    console.error('Error subscribing to global leaderboard:', err);
    onUpdate([]);
  });
}
