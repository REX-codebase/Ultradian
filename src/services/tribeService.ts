import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { CategoryTag } from '../types';

export interface TribeData {
  id: string;
  name: string;
  description: string;
  weeklyHours: number;
  memberCount: number;
  topCategory: CategoryTag;
  icon: string;
}

export const OFFICIAL_DEFAULT_TRIBES: TribeData[] = [
  {
    id: 'yc_founders',
    name: 'YCombinator Founders',
    description: 'High-speed startup builders scaling zero-to-one.',
    weeklyHours: 0,
    memberCount: 1,
    topCategory: 'Strategy',
    icon: '🚀',
  },
  {
    id: 'react_devs',
    name: 'React Devs',
    description: 'Frontend engineers crafting responsive UI architectures.',
    weeklyHours: 0,
    memberCount: 1,
    topCategory: 'Coding',
    icon: '⚛️',
  },
  {
    id: 'indie_hackers',
    name: 'Indie Hackers',
    description: 'Bootstrapped founders shipping profitable products.',
    weeklyHours: 0,
    memberCount: 1,
    topCategory: 'Coding',
    icon: '🛠️',
  },
  {
    id: 'ai_builders',
    name: 'AI Builders',
    description: 'LLM researchers and agentic software creators.',
    weeklyHours: 0,
    memberCount: 1,
    topCategory: 'Research',
    icon: '🧠',
  },
  {
    id: 'designers',
    name: 'Designers & Creators',
    description: 'Visual designers, writers, and creative directors.',
    weeklyHours: 0,
    memberCount: 1,
    topCategory: 'Design',
    icon: '🎨',
  },
];

/**
 * Seeds official default tribes in Firestore if the tribes collection is empty.
 */
export async function seedDefaultTribes(): Promise<void> {
  try {
    const tribesRef = collection(db, 'tribes');
    const snap = await getDocs(tribesRef);

    if (snap.empty) {
      for (const tribe of OFFICIAL_DEFAULT_TRIBES) {
        await setDoc(doc(db, 'tribes', tribe.id), {
          ...tribe,
          createdAt: Date.now(),
        });
      }
    }
  } catch (err) {
    console.warn('Error seeding default tribes in Firestore:', err);
  }
}

/**
 * Subscribes to live Tribes leaderboard updates from Firestore.
 */
export function subscribeToTribes(onUpdate: (tribes: TribeData[]) => void) {
  // Ensure default tribes are seeded if missing
  seedDefaultTribes();

  const q = query(collection(db, 'tribes'), orderBy('weeklyHours', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const tribes: TribeData[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        tribes.push({
          id: docSnap.id,
          name: data.name || 'Unnamed Tribe',
          description: data.description || '',
          weeklyHours: data.weeklyHours || 0,
          memberCount: data.memberCount || 0,
          topCategory: (data.topCategory as CategoryTag) || 'General',
          icon: data.icon || '⚔️',
        });
      });

      if (tribes.length === 0) {
        onUpdate(OFFICIAL_DEFAULT_TRIBES);
      } else {
        onUpdate(tribes);
      }
    },
    (err) => {
      console.warn('Firestore tribes subscription error, using fallback default tribes:', err);
      onUpdate(OFFICIAL_DEFAULT_TRIBES);
    }
  );
}

/**
 * Updates a user's selected tribe in Firestore.
 */
export async function updateUserTribeSelection(userId: string, tribeId: string): Promise<void> {
  if (!userId || !tribeId) return;
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      tribeId,
      updatedAt: Date.now(),
    });
  } catch (err) {
    console.warn('Error updating user tribe in Firestore:', err);
  }
}
