import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  collectionGroup,
  query,
  orderBy,
  limit,
  onSnapshot,
  getDocs,
  getCountFromServer,
  where,
  getDocFromServer,
} from 'firebase/firestore';
import config from '../../firebase-applet-config.json';
import { SessionRecord, FriendProfile, CategoryTag, LeagueTier, LeagueMember, RivalInfo } from '../types';

// Initialize Firebase
const app = initializeApp({
  apiKey: config.apiKey,
  authDomain: config.authDomain,
  projectId: config.projectId,
  storageBucket: config.storageBucket,
  messagingSenderId: config.messagingSenderId,
  appId: config.appId,
});

export const auth = getAuth(app);

// Use the specific firestore databaseId from config if custom
export const db = (config.firestoreDatabaseId && config.firestoreDatabaseId !== '(default)')
  ? getFirestore(app, config.firestoreDatabaseId)
  : getFirestore(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firestore connection notice: client currently offline.");
    }
  }
}
testConnection();

/**
 * Listen to auth state changes to synchronize user context
 */
export function initAuth(
  onUserChange: (user: FirebaseUser | null) => void,
  onAuthError?: (err: any) => void
) {
  return onAuthStateChanged(auth, (user) => {
    onUserChange(user);
  }, (err) => {
    console.error('Auth state observation failure', err);
    if (onAuthError) onAuthError(err);
  });
}

/**
 * Sign in using email and password
 */
export async function signInWithEmail(email: string, password: string): Promise<FirebaseUser> {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

/**
 * Register a new user with email, password, and custom display name
 */
export async function signUpWithEmail(email: string, password: string, displayName: string): Promise<FirebaseUser> {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName });
  return cred.user;
}

/**
 * Update user profile details
 */
export async function updateUserProfile(user: FirebaseUser, profile: { displayName?: string; photoURL?: string }): Promise<void> {
  await updateProfile(user, profile);
}

/**
 * Express sign-in as anonymous guest
 */
export async function signInAnonymouslyUser(): Promise<FirebaseUser> {
  const cred = await signInAnonymously(auth);
  return cred.user;
}

/**
 * Sign in using Google OAuth popup
 */
export async function signInWithGoogle(): Promise<FirebaseUser> {
  const provider = new GoogleAuthProvider();
  // Request profile and email scopes
  provider.addScope('profile');
  provider.addScope('email');
  const cred = await signInWithPopup(auth, provider);
  return cred.user;
}

/**
 * Sign out current user
 */
export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

/**
 * Sync a single session record to Firebase Firestore under the user's sessions subcollection
 */
export async function syncSessionToCloud(userId: string, record: SessionRecord): Promise<void> {
  const path = `users/${userId}/sessions/${record.id}`;
  try {
    const sessionDocRef = doc(db, 'users', userId, 'sessions', record.id);
    await setDoc(sessionDocRef, record);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

/**
 * Fetch all sessions from Firestore for the user
 */
export async function loadCloudSessions(userId: string): Promise<SessionRecord[]> {
  const path = `users/${userId}/sessions`;
  try {
    const q = query(collection(db, 'users', userId, 'sessions'), orderBy('timestamp', 'desc'));
    const snap = await getDocs(q);
    const sessions: SessionRecord[] = [];
    snap.forEach((docSnap) => {
      sessions.push(docSnap.data() as SessionRecord);
    });
    return sessions;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
    return [];
  }
}

/**
 * Sync user profile to Firestore
 */
export async function syncUserProfileToCloud(user: FirebaseUser): Promise<void> {
  const path = `users/${user.uid}`;
  try {
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(
      userDocRef,
      {
        uid: user.uid,
        displayName: user.displayName || 'Ultradian Focus User',
        email: user.email || '',
        photoURL: user.photoURL || '',
        lastLoginAt: Date.now(),
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

/**
 * Helper to get ISO week string (e.g. "2026-W32")
 */
export function getISOWeek(date: Date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
}

/**
 * Step 2.2: True Global Rank calculation via Firestore Count Aggregation Query
 */
export async function fetchGlobalRank(userId: string, currentUserHours: number): Promise<number> {
  try {
    const q = query(
      collectionGroup(db, 'weeks'),
      where('weeklyHours', '>', currentUserHours)
    );
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count + 1;
  } catch (err) {
    console.warn('Global rank count aggregation fallback:', err);
    return 1;
  }
}

/**
 * Step 2.3: Subscribe to live League members updates for matchmaking leagues
 */
export function subscribeToLeagueMembers(
  leagueId: LeagueTier,
  userId: string | undefined,
  onUpdate: (members: LeagueMember[]) => void
) {
  const path = `leagues/${leagueId}/members`;
  const q = query(collection(db, 'leagues', leagueId, 'members'), orderBy('weeklyHours', 'desc'), limit(50));

  return onSnapshot(q, (snapshot) => {
    const list: LeagueMember[] = [];
    let currentRank = 1;

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const docId = docSnap.id;
      const isSelf = userId ? (data.userId === userId || docId === userId) : false;

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
        weeklyHours: data.weeklyHours ?? 0,
        completedCycles: data.completedCycles ?? 0,
        focusScore,
        topCategory,
        leagueId: (data.leagueId as LeagueTier) || leagueId,
        rank: currentRank++,
        isUser: isSelf,
      });
    });

    onUpdate(list);
  }, (err) => {
    handleFirestoreError(err, OperationType.GET, path);
    onUpdate([]);
  });
}

/**
 * Step 2.1: Calculate Ghost Pacing (Rival Tracking)
 * Finds the rival immediately preceding the logged-in user in weeklyHours
 */
export function calculateGhostRival(
  currentUserId: string,
  allPlayers: (LeagueMember | FriendProfile)[]
): RivalInfo | null {
  if (!allPlayers || !allPlayers.length) return null;

  const sorted = [...allPlayers].sort((a, b) => b.weeklyHours - a.weeklyHours);
  const userIdx = sorted.findIndex((p) => p.id === currentUserId || p.isUser);

  if (userIdx === 0) {
    // User is Rank 1
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
      rankAbove: userIdx, // 1-indexed rank of rival
      isLeading: false,
    };
  }

  return null;
}

/**
 * Subscribe to live leaderboard updates
 */
export function subscribeToLeaderboard(
  userId: string | undefined,
  onUpdate: (friends: FriendProfile[]) => void
) {
  const path = 'leaderboard';
  const q = query(
    collectionGroup(db, 'weeks'),
    where('weekId', '==', getISOWeek()),
    orderBy('weeklyHours', 'desc'),
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
      const weeklyHours = data.weeklyHours ?? 0;
      const completedCycles = data.completedCycles ?? 0;
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
        id: data.userId || data.id || docId,
        name: data.name || 'Ultradian Achiever',
        weeklyHours,
        completedCycles,
        focusScore,
        topCategory,
        isUser: isSelf,
        leagueId: data.leagueId || 'wood',
        rank: rank++,
      });
    });

    onUpdate(list);
  }, (err) => {
    handleFirestoreError(err, OperationType.GET, path);
    onUpdate([]);
  });
}
