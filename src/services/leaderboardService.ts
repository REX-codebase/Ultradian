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
import { CategoryTag, LeagueTier, LeagueMember, RivalInfo } from '../types';

/** Every social aggregate must be produced by the session Cloud Function. */
export const AGGREGATE_SOURCE = 'session-aggregation-v2';
export const AGGREGATE_SCHEMA_VERSION = 2;

/** Computes an ISO week identifier in UTC for legacy service consumers. */
export function getISOWeek(dateInput: Date = new Date()): string {
  const date = new Date(Date.UTC(dateInput.getFullYear(), dateInput.getMonth(), dateInput.getDate()));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

export interface TribeSummary {
  id: string;
  name: string;
  description: string;
  weeklyMinutes: number;
  memberCount: number;
  topCategory: CategoryTag;
  icon?: string;
}

function isFiniteNonNegative(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function isVerifiedAggregate(data: Record<string, unknown>, id: string): boolean {
  return (
    data.userId === id &&
    typeof data.name === 'string' &&
    data.name.trim().length > 0 &&
    data.source === AGGREGATE_SOURCE &&
    data.schemaVersion === AGGREGATE_SCHEMA_VERSION &&
    isFiniteNonNegative(data.weeklyMinutes)
  );
}

/** Computes a global rank from verified aggregate records only. */
export async function fetchGlobalRank(userId: string, currentUserMinutes: number): Promise<number | null> {
  if (!userId) return null;

  try {
    const q = query(
      collection(db, 'leaderboard'),
      where('source', '==', AGGREGATE_SOURCE),
      where('weeklyMinutes', '>', Math.max(0, currentUserMinutes))
    );
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count + 1;
  } catch (err) {
    console.warn('Unable to fetch verified global rank:', err);
    return null;
  }
}

/** Subscribes to verified members in one Firebase-backed matchmaking league. */
export function subscribeToLeagueMembers(
  leagueId: LeagueTier,
  userId: string | undefined,
  onUpdate: (members: LeagueMember[]) => void,
  onError?: (error: Error) => void
) {
  const q = query(
    collection(db, 'leagues', leagueId, 'members'),
    where('source', '==', AGGREGATE_SOURCE),
    orderBy('weeklyMinutes', 'desc'),
    limit(50)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const members: LeagueMember[] = [];

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (!isVerifiedAggregate(data, docSnap.id)) return;

        const weeklyMinutes = data.weeklyMinutes as number;
        const ratingSum = isFiniteNonNegative(data.ratingSum) ? data.ratingSum : 0;
        const ratingCount = isFiniteNonNegative(data.ratingCount) ? data.ratingCount : 0;
        const focusScore = ratingCount > 0
          ? Math.round((ratingSum / ratingCount) * 20)
          : 0;

        let topCategory: CategoryTag = 'General';
        if (data.categoryMins && typeof data.categoryMins === 'object') {
          let maximumMinutes = 0;
          Object.entries(data.categoryMins as Record<string, unknown>).forEach(([category, minutes]) => {
            if (isFiniteNonNegative(minutes) && minutes > maximumMinutes) {
              maximumMinutes = minutes;
              topCategory = category as CategoryTag;
            }
          });
        }

        members.push({
          id: docSnap.id,
          name: (data.name as string).trim(),
          weeklyHours: Math.round((weeklyMinutes / 60) * 10) / 10,
          completedCycles: isFiniteNonNegative(data.weeklyCycles) ? data.weeklyCycles : 0,
          focusScore,
          topCategory,
          leagueId,
          rank: 0,
          isUser: docSnap.id === userId,
        });
      });

      onUpdate(members.map((member, index) => ({ ...member, rank: index + 1 })));
    },
    (error) => {
      console.error('Error listening to verified league members:', error);
      onUpdate([]);
      onError?.(error as Error);
    }
  );
}

/** Calculates rival tracking from a verified league roster. */
export function calculateGhostRival(
  currentUserId: string,
  allPlayers: LeagueMember[]
): RivalInfo | null {
  if (!currentUserId || allPlayers.length === 0) return null;

  const sorted = [...allPlayers].sort((a, b) => b.weeklyHours - a.weeklyHours);
  const userIndex = sorted.findIndex((player) => player.id === currentUserId || player.isUser);
  if (userIndex < 0) return null;

  if (userIndex === 0) {
    return {
      rivalName: 'No active rival',
      rivalHours: sorted[0].weeklyHours,
      minutesBehind: 0,
      cyclesToPass: 0,
      rankAbove: 1,
      isLeading: true,
    };
  }

  const rival = sorted[userIndex - 1];
  const user = sorted[userIndex];
  const minutesBehind = Math.max(0, Math.round((rival.weeklyHours - user.weeklyHours) * 60));

  return {
    rivalName: rival.name,
    rivalHours: rival.weeklyHours,
    minutesBehind,
    cyclesToPass: Math.ceil(minutesBehind / 90) || 1,
    rankAbove: userIndex,
    isLeading: false,
  };
}

/** Reads only versioned, server-owned global leaderboard entries. */
export function subscribeToLeaderboard(
  userId: string | undefined,
  onUpdate: (members: LeagueMember[]) => void,
  onError?: (error: Error) => void
) {
  const q = query(
    collection(db, 'leaderboard'),
    where('source', '==', AGGREGATE_SOURCE),
    orderBy('weeklyMinutes', 'desc'),
    limit(50)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const members: LeagueMember[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (!isVerifiedAggregate(data, docSnap.id)) return;

        members.push({
          id: docSnap.id,
          name: (data.name as string).trim(),
          weeklyHours: Math.round(((data.weeklyMinutes as number) / 60) * 10) / 10,
          completedCycles: isFiniteNonNegative(data.weeklyCycles) ? data.weeklyCycles : 0,
          focusScore: isFiniteNonNegative(data.focusScore) ? data.focusScore : 0,
          topCategory: (data.category as CategoryTag) || 'General',
          leagueId: (data.leagueId as LeagueTier) || 'wood',
          rank: 0,
          isUser: docSnap.id === userId,
        });
      });
      onUpdate(members.map((member, index) => ({ ...member, rank: index + 1 })));
    },
    (error) => {
      console.error('Error listening to verified global leaderboard:', error);
      onUpdate([]);
      onError?.(error as Error);
    }
  );
}

/** Reads only real, server-managed tribe documents; there is no local tribe fallback. */
export function subscribeToTribes(
  onUpdate: (tribes: TribeSummary[]) => void,
  onError?: (error: Error) => void
) {
  const q = query(
    collection(db, 'tribes'),
    where('source', '==', AGGREGATE_SOURCE),
    orderBy('weeklyMinutes', 'desc'),
    limit(50)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const tribes: TribeSummary[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (
          typeof data.name !== 'string' ||
          !data.name.trim() ||
          !isFiniteNonNegative(data.weeklyMinutes) ||
          !isFiniteNonNegative(data.memberCount) ||
          data.source !== AGGREGATE_SOURCE ||
          data.schemaVersion !== AGGREGATE_SCHEMA_VERSION
        ) {
          return;
        }

        tribes.push({
          id: docSnap.id,
          name: data.name.trim(),
          description: typeof data.description === 'string' ? data.description : '',
          weeklyMinutes: data.weeklyMinutes,
          memberCount: data.memberCount,
          topCategory: (data.topCategory as CategoryTag) || 'General',
          icon: typeof data.icon === 'string' ? data.icon : undefined,
        });
      });
      onUpdate(tribes);
    },
    (error) => {
      console.error('Error listening to verified tribes:', error);
      onUpdate([]);
      onError?.(error as Error);
    }
  );
}
