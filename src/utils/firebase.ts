/**
 * Legacy Firebase Compatibility Layer
 * All implementations delegated to canonical services in src/services/ and src/lib/firebase.ts
 */

export { auth, db } from '../lib/firebase';
export {
  initAuthObserver as initAuth,
  signInWithEmail,
  signUpWithEmail,
  updateUserProfile,
  signInAnonymouslyUser,
  signInWithGoogle,
  signOutUser,
  syncUserProfileToCloud,
} from '../services/authService';

export {
  syncSessionToCloud,
  loadCloudSessions,
} from '../services/sessionService';

export {
  getISOWeek,
  fetchGlobalRank,
  subscribeToLeagueMembers,
  calculateGhostRival,
  subscribeToLeaderboard,
} from '../services/leaderboardService';
