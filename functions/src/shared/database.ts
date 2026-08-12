import { getApp, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

/**
 * Ultradian's live Firestore database is named, not `(default)`. Every Admin
 * SDK handler must resolve this database explicitly or it will read an empty
 * default database and silently diverge from the client application.
 */
export const FIRESTORE_DATABASE_ID = 'ai-studio-ultradianfocuspu-43134014-ac79-4dd7-bc54-b2d2b1a8658f';

export function getUltradianFirestore() {
  const app = getApps().length ? getApp() : initializeApp();
  return getFirestore(app, FIRESTORE_DATABASE_ID);
}
