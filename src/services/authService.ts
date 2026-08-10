import {
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
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export function initAuthObserver(
  onUserChange: (user: FirebaseUser | null) => void,
  onAuthError?: (err: any) => void
) {
  return onAuthStateChanged(
    auth,
    (user) => onUserChange(user),
    (err) => {
      console.error('Auth state observation failure:', err);
      if (onAuthError) onAuthError(err);
    }
  );
}

export async function signInWithEmail(email: string, pass: string): Promise<FirebaseUser> {
  const cred = await signInWithEmailAndPassword(auth, email, pass);
  return cred.user;
}

export async function signUpWithEmail(email: string, pass: string, displayName: string): Promise<FirebaseUser> {
  const cred = await createUserWithEmailAndPassword(auth, email, pass);
  await updateProfile(cred.user, { displayName });
  await syncUserProfileToCloud(cred.user);
  return cred.user;
}

export async function signInAnonymouslyUser(): Promise<FirebaseUser> {
  const cred = await signInAnonymously(auth);
  return cred.user;
}

export async function signInWithGoogle(): Promise<FirebaseUser> {
  const provider = new GoogleAuthProvider();
  provider.addScope('profile');
  provider.addScope('email');
  const cred = await signInWithPopup(auth, provider);
  await syncUserProfileToCloud(cred.user);
  return cred.user;
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

export async function updateUserProfile(user: FirebaseUser, profile: { displayName?: string; photoURL?: string }): Promise<void> {
  await updateProfile(user, profile);
}

export async function syncUserProfileToCloud(user: FirebaseUser, extraFields?: Record<string, any>): Promise<void> {
  if (!user?.uid) return;
  const userDocRef = doc(db, 'users', user.uid);
  await setDoc(
    userDocRef,
    {
      uid: user.uid,
      displayName: user.displayName || 'Ultradian Focus User',
      email: user.email || '',
      photoURL: user.photoURL || '',
      lastLoginAt: Date.now(),
      ...(extraFields || {}),
    },
    { merge: true }
  );
}
