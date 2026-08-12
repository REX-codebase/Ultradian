import { collection, doc, getDocs, orderBy, query, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { SessionRecord } from '../types';
import { isSampleSession } from '../utils/sampleRhythm';

/** Persists a genuine focus session to the authenticated user's private Firestore event log. */
export async function syncSessionToCloud(userId: string, record: SessionRecord): Promise<void> {
  if (!userId || !record?.id || isSampleSession(record)) return;

  const sessionDocRef = doc(db, 'users', userId, 'sessions', record.id);
  await setDoc(sessionDocRef, {
    ...record,
    userId,
    processed: false,
  });
}

/**
 * Loads the private canonical session log. Errors intentionally propagate so a
 * missing or misconfigured Firestore database can never be mistaken for an
 * empty history.
 */
export async function loadCloudSessions(userId: string): Promise<SessionRecord[]> {
  if (!userId) return [];

  const sessionsQuery = query(
    collection(db, 'users', userId, 'sessions'),
    orderBy('timestamp', 'desc')
  );
  const snapshot = await getDocs(sessionsQuery);
  const sessions: SessionRecord[] = [];

  snapshot.forEach((docSnap) => {
    const session = docSnap.data() as SessionRecord;
    if (!isSampleSession(session)) sessions.push(session);
  });

  return sessions;
}
