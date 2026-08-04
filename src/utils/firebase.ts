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
  query,
  orderBy,
  limit,
  onSnapshot,
  getDocs,
  getDocFromServer,
} from 'firebase/firestore';
import config from '../../firebase-applet-config.json';
import { SessionRecord, FriendProfile, CategoryTag } from '../types';

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

// Use the specific firestore databaseId from config
export const db = getFirestore(app, config.firestoreDatabaseId || '(default)');

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
      console.error("Please check your Firebase configuration.");
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
  if (userId.startsWith('simulated_')) {
    // Bypass for preview simulation mode
    return;
  }
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
  if (userId.startsWith('simulated_')) {
    // Bypass for preview simulation mode - fallback entirely to LocalStorage
    return [];
  }
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
 * Update user's public leaderboard presence based on their completed sessions
 */
export async function updateLeaderboardStats(
  userId: string,
  username: string,
  records: SessionRecord[]
): Promise<void> {
  if (userId.startsWith('simulated_')) {
    // Bypass for preview simulation mode - we will update simulated user details locally
    return;
  }
  const path = `leaderboard/${userId}`;
  try {
    const now = Date.now();
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

    // Filter to past 7 days for weekly rankings
    const past7DaysRecords = records.filter((r) => now - r.timestamp <= SEVEN_DAYS_MS);

    // Calculate metrics
    let totFocusMins = 0;
    let completedCycles = 0;
    let sumRatings = 0;
    let ratedCount = 0;
    const categoryMins: Record<string, number> = {};

    records.forEach((r) => {
      if (r.type === 'work') {
        completedCycles += 1;
        if (r.focusRating) {
          sumRatings += r.focusRating;
          ratedCount += 1;
        }
      }
    });

    past7DaysRecords.forEach((r) => {
      if (r.type === 'work') {
        const mins = Math.round(r.actualSecondsCompleted / 60);
        totFocusMins += mins;
        const cat = r.category || 'General';
        categoryMins[cat] = (categoryMins[cat] || 0) + mins;
      }
    });

    const weeklyHours = Math.round((totFocusMins / 60) * 10) / 10;
    const avgRating = ratedCount > 0 ? sumRatings / ratedCount : 5.0;
    const focusScore = Math.round(avgRating * 20); // Scale 5.0 rating to 100

    // Find top category
    let topCategory: CategoryTag = 'General';
    let maxMins = 0;
    Object.entries(categoryMins).forEach(([cat, mins]) => {
      if (mins > maxMins) {
        maxMins = mins;
        topCategory = cat as CategoryTag;
      }
    });

    // Write to global leaderboard collection
    const leaderDocRef = doc(db, 'leaderboard', userId);
    await setDoc(leaderDocRef, {
      id: userId,
      name: username,
      weeklyHours,
      completedCycles,
      focusScore,
      topCategory,
      isUser: false, // will be overridden dynamically by client
      lastUpdated: now,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

/**
 * Subscribe to live leaderboard updates
 */
export function subscribeToLeaderboard(
  userId: string | undefined,
  onUpdate: (friends: FriendProfile[]) => void
) {
  // First, compute the user's local stats as a fallback or for simulated injection
  let weeklyHours = 0.0;
  let completedCycles = 0;
  let focusScore = 0;
  let topCategory: CategoryTag = 'General';
  const isSimulated = userId ? userId.startsWith('simulated_') : false;

  try {
    const raw = localStorage.getItem('ultradian_focus_sessions_v1');
    if (raw) {
      const records: SessionRecord[] = JSON.parse(raw);
      const now = Date.now();
      const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
      const past7DaysRecords = records.filter((r) => now - r.timestamp <= SEVEN_DAYS_MS);

      let totFocusMins = 0;
      let sumRatings = 0;
      let ratedCount = 0;
      let cycles = 0;
      const categoryMins: Record<string, number> = {};

      records.forEach((r) => {
        if (r.type === 'work') {
          cycles += 1;
          if (r.focusRating) {
            sumRatings += r.focusRating;
            ratedCount += 1;
          }
        }
      });

      past7DaysRecords.forEach((r) => {
        if (r.type === 'work') {
          const mins = Math.round(r.actualSecondsCompleted / 60);
          totFocusMins += mins;
          const cat = r.category || 'General';
          categoryMins[cat] = (categoryMins[cat] || 0) + mins;
        }
      });

      weeklyHours = Math.round((totFocusMins / 60) * 10) / 10;
      completedCycles = cycles;
      const avgRating = ratedCount > 0 ? sumRatings / ratedCount : 4.5;
      focusScore = Math.round(avgRating * 20);

      let maxMins = 0;
      Object.entries(categoryMins).forEach(([cat, mins]) => {
        if (mins > maxMins) {
          maxMins = mins;
          topCategory = cat as CategoryTag;
        }
      });
    }
  } catch (e) {
    console.warn('Failed computing local user stats', e);
  }

  const path = 'leaderboard';
  const q = query(collection(db, 'leaderboard'), orderBy('weeklyHours', 'desc'), limit(50));

  return onSnapshot(q, (snapshot) => {
    const list: FriendProfile[] = [];
    let userFound = false;

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const isSelf = userId ? data.id === userId : false;
      if (isSelf) userFound = true;

      list.push({
        id: data.id,
        name: data.name || 'Anonymous Achiever',
        weeklyHours: data.weeklyHours ?? 0,
        completedCycles: data.completedCycles ?? 0,
        focusScore: data.focusScore ?? 0,
        topCategory: data.topCategory || 'General',
        isUser: isSelf,
      });
    });

    // If the user is simulated and not in the DB, inject them dynamically
    if (isSimulated && userId && !userFound) {
      const name = userId === 'simulated_google_user' ? 'Simulated Google WaveRider' : 'Simulated Email WaveRider';
      list.push({
        id: userId,
        name,
        weeklyHours,
        completedCycles,
        focusScore,
        topCategory,
        isUser: true,
      });
      list.sort((a, b) => b.weeklyHours - a.weeklyHours);
    }

    // Fallback: if leaderboard has very few items, let's inject a couple of elegant static presets to keep it populated
    if (list.length < 3) {
      const elenaExists = list.some((f) => f.name === 'Elena Rostova');
      const marcusExists = list.some((f) => f.name === 'Marcus Vance');
      const aishaExists = list.some((f) => f.name === 'Aisha Chen');

      if (!elenaExists) {
        list.push({
          id: 'friend_1',
          name: 'Elena Rostova',
          weeklyHours: 21.0,
          completedCycles: 14,
          focusScore: 95,
          topCategory: 'Design',
        });
      }
      if (!marcusExists) {
        list.push({
          id: 'friend_2',
          name: 'Marcus Vance',
          weeklyHours: 16.2,
          completedCycles: 10,
          focusScore: 88,
          topCategory: 'Research',
        });
      }
      if (!aishaExists) {
        list.push({
          id: 'friend_3',
          name: 'Aisha Chen',
          weeklyHours: 19.8,
          completedCycles: 13,
          focusScore: 91,
          topCategory: 'Strategy',
        });
      }
      list.sort((a, b) => b.weeklyHours - a.weeklyHours);
    }

    onUpdate(list);
  }, (err) => {
    handleFirestoreError(err, OperationType.GET, path);
    // If the Firestore query fails (e.g. offline/permission issue), trigger update with mock list so the UI works fine
    const name = userId === 'simulated_google_user' ? 'Simulated Google WaveRider' : 'Simulated Email WaveRider';
    const simulatedList: FriendProfile[] = [
      {
        id: userId || 'offline_user',
        name: userId ? name : 'Ultradian Achiever',
        weeklyHours,
        completedCycles,
        focusScore,
        topCategory,
        isUser: true,
      },
      {
        id: 'friend_1',
        name: 'Elena Rostova',
        weeklyHours: 21.0,
        completedCycles: 14,
        focusScore: 95,
        topCategory: 'Design',
      },
      {
        id: 'friend_2',
        name: 'Marcus Vance',
        weeklyHours: 16.2,
        completedCycles: 10,
        focusScore: 88,
        topCategory: 'Research',
      },
      {
        id: 'friend_3',
        name: 'Aisha Chen',
        weeklyHours: 19.8,
        completedCycles: 13,
        focusScore: 91,
        topCategory: 'Strategy',
      },
    ];
    simulatedList.sort((a, b) => b.weeklyHours - a.weeklyHours);
    onUpdate(simulatedList);
  });
}
