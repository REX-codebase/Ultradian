import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import config from '../../firebase-applet-config.json';
import { initAppCheck } from './appCheck';

// 1. Initialize Firebase Auth, Firestore, and Functions using config from env vars / applet config
const firebaseConfig = {
  apiKey: (import.meta as any).env?.VITE_FIREBASE_API_KEY || config.apiKey,
  authDomain: (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN || config.authDomain,
  projectId: (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID || config.projectId,
  storageBucket: (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET || config.storageBucket,
  messagingSenderId: (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID || config.messagingSenderId,
  appId: (import.meta as any).env?.VITE_FIREBASE_APP_ID || config.appId,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const dbId = (config as any).firestoreDatabaseId && (config as any).firestoreDatabaseId !== '(default)'
  ? (config as any).firestoreDatabaseId
  : undefined;

// Export initialized Firebase SDK services
export const auth = getAuth(app);
export const db = dbId ? getFirestore(app, dbId) : getFirestore(app);
export const functions = getFunctions(app);

// Initialize App Check
initAppCheck(app);

// 2. Enable Firestore offline persistence
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Firestore offline persistence failed: Multiple tabs open concurrently.');
    } else if (err.code === 'unimplemented') {
      console.warn('Firestore offline persistence is not supported by this browser.');
    }
  });
}

export { app };
