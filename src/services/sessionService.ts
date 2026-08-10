import { doc, setDoc, collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { SessionRecord } from '../types';

/**
 * Persists a focus session to the user's sessions subcollection in Firestore.
 */
export async function syncSessionToCloud(userId: string, record: SessionRecord): Promise<void> {
  if (!userId || !record?.id) return;
  const sessionDocRef = doc(db, 'users', userId, 'sessions', record.id);
  await setDoc(sessionDocRef, {
    ...record,
    userId,
    processed: false, // Cloud Function trigger will transition to true atomically
  });
}

/**
 * Loads all historic session records for a user from Firestore.
 */
export async function loadCloudSessions(userId: string): Promise<SessionRecord[]> {
  if (!userId) return [];
  try {
    const q = query(collection(db, 'users', userId, 'sessions'), orderBy('timestamp', 'desc'));
    const snap = await getDocs(q);
    const sessions: SessionRecord[] = [];
    snap.forEach((docSnap) => {
      sessions.push(docSnap.data() as SessionRecord);
    });
    return sessions;
  } catch (err) {
    console.error('Error loading cloud sessions:', err);
    return [];
  }
}
