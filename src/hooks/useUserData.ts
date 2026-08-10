import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export interface UserProfileData {
  uid?: string;
  displayName?: string;
  email?: string;
  photoURL?: string;
  leagueId?: string;
  current_level?: number;
  session_count?: number;
  tribe_id?: string;
  lastLoginAt?: number;
  [key: string]: any;
}

export interface LeaderboardData {
  userId?: string;
  name?: string;
  lifetimeMinutes?: number;
  lifetimeCycles?: number;
  weeklyMinutes?: number;
  weeklyCycles?: number;
  focusScore?: number;
  currentWeek?: string;
  leagueId?: string;
  category?: string;
  type?: string;
  lastUpdated?: number;
  [key: string]: any;
}

export interface UseUserDataState {
  user: User | null;
  profile: UserProfileData | null;
  leaderboard: LeaderboardData | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Custom React hook providing real-time synchronized user profile and leaderboard state
 */
export function useUserData(): UseUserDataState {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;
    let unsubscribeLeaderboard: (() => void) | null = null;

    // 1. Listen to auth.onAuthStateChanged
    const unsubscribeAuth = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);

        // Clean up previous document listeners on auth state change
        if (unsubscribeProfile) {
          unsubscribeProfile();
          unsubscribeProfile = null;
        }
        if (unsubscribeLeaderboard) {
          unsubscribeLeaderboard();
          unsubscribeLeaderboard = null;
        }

        if (currentUser) {
          setLoading(true);

          // 2. Real-time onSnapshot listener to /users/{uid}
          const userDocRef = doc(db, 'users', currentUser.uid);
          unsubscribeProfile = onSnapshot(
            userDocRef,
            (snapshot) => {
              if (snapshot.exists()) {
                setProfile(snapshot.data() as UserProfileData);
              } else {
                setProfile(null);
              }
              setLoading(false);
            },
            (err) => {
              console.error('Error listening to /users/{uid}:', err);
              setError(err as Error);
              setLoading(false);
            }
          );

          // 3. Real-time onSnapshot listener to /leaderboard/{uid}
          const leaderboardDocRef = doc(db, 'leaderboard', currentUser.uid);
          unsubscribeLeaderboard = onSnapshot(
            leaderboardDocRef,
            (snapshot) => {
              if (snapshot.exists()) {
                setLeaderboard(snapshot.data() as LeaderboardData);
              } else {
                setLeaderboard(null);
              }
            },
            (err) => {
              console.error('Error listening to /leaderboard/{uid}:', err);
              setError(err as Error);
            }
          );
        } else {
          setProfile(null);
          setLeaderboard(null);
          setLoading(false);
        }
      },
      (err) => {
        console.error('Auth state observation error:', err);
        setError(err as Error);
        setLoading(false);
      }
    );

    // 5. Cleanup function
    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
      if (unsubscribeLeaderboard) unsubscribeLeaderboard();
    };
  }, []);

  // 4. Returns unified state object
  return { user, profile, leaderboard, loading, error };
}
