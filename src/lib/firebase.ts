import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import config from '../../firebase-applet-config.json';
import { initAppCheck } from './appCheck';

// 1. Initialize Firebase Auth, Firestore, and Functions using config from env vars / applet config
const rawConfig = (config || {}) as Record<string, any>;
const env = (import.meta as any).env || {};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || rawConfig.apiKey || 'AIzaSy-demo-key-for-offline-build',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || rawConfig.authDomain || 'ultradian-demo.firebaseapp.com',
  projectId: env.VITE_FIREBASE_PROJECT_ID || rawConfig.projectId || 'ultradian-demo',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || rawConfig.storageBucket || 'ultradian-demo.firebasestorage.app',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || rawConfig.messagingSenderId || '000000000000',
  appId: env.VITE_FIREBASE_APP_ID || rawConfig.appId || '1:000000000000:web:demo0000000000',
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const dbId = rawConfig.firestoreDatabaseId && rawConfig.firestoreDatabaseId !== '(default)'
  ? rawConfig.firestoreDatabaseId
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
