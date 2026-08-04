import { SessionRecord, UserSettings, FriendProfile, UltradianPreset } from '../types';

const STORAGE_KEYS = {
  SESSIONS: 'ultradian_focus_sessions_v1',
  SETTINGS: 'ultradian_focus_settings_v1',
  FRIENDS: 'ultradian_focus_friends_v1',
};

export const DEFAULT_PRESETS: UltradianPreset[] = [
  {
    id: 'classic_ultradian',
    name: 'Classic Ultradian (90/20)',
    description: 'Based on Kleitman BRAC science. 90 mins deep flow + 20 mins recovery.',
    workMinutes: 90,
    shortBreakMinutes: 20,
    longBreakMinutes: 30,
    cyclesBeforeLongBreak: 2,
  },
  {
    id: 'high_intensity',
    name: 'High Intensity Flow (60/15)',
    description: 'Shorter 60 min intense burst + 15 min rest. Great for dense cognitive tasks.',
    workMinutes: 60,
    shortBreakMinutes: 15,
    longBreakMinutes: 25,
    cyclesBeforeLongBreak: 3,
  },
  {
    id: 'deep_sprint',
    name: 'Flow State Peak (110/25)',
    description: 'Extended 110 min deep work immersion + 25 min rejuvenation.',
    workMinutes: 110,
    shortBreakMinutes: 25,
    longBreakMinutes: 35,
    cyclesBeforeLongBreak: 2,
  },
  {
    id: 'micro_burst',
    name: 'Sprint Burst (50/10)',
    description: 'Quick 50 min focused sprint + 10 min break. Higher cycle frequency.',
    workMinutes: 50,
    shortBreakMinutes: 10,
    longBreakMinutes: 20,
    cyclesBeforeLongBreak: 3,
  },
];

export const DEFAULT_SETTINGS: UserSettings = {
  workMinutes: 90,
  shortBreakMinutes: 20,
  longBreakMinutes: 30,
  cyclesBeforeLongBreak: 2,
  activePresetId: 'classic_ultradian',
  soundEffect: 'tibetan_bowl',
  soundVolume: 0.8,
  ambientType: 'none',
  ambientVolume: 0.4,
  autoStartBreaks: false,
  autoStartWork: false,
  notificationsEnabled: true,
  dailyGoalCycles: 3,
  darkMode: true,
  username: 'Ultradian Achiever',
};

export const INITIAL_FRIENDS: FriendProfile[] = [
  {
    id: 'user_self',
    name: 'You (Ultradian Achiever)',
    weeklyHours: 0.0,
    completedCycles: 0,
    focusScore: 0,
    topCategory: 'General',
    isUser: true,
  },
  {
    id: 'friend_1',
    name: 'Elena Rostova',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    weeklyHours: 21.0,
    completedCycles: 14,
    focusScore: 95,
    topCategory: 'Design',
  },
  {
    id: 'friend_2',
    name: 'Marcus Vance',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    weeklyHours: 16.2,
    completedCycles: 10,
    focusScore: 88,
    topCategory: 'Research',
  },
  {
    id: 'friend_3',
    name: 'Aisha Chen',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    weeklyHours: 19.8,
    completedCycles: 13,
    focusScore: 91,
    topCategory: 'Strategy',
  },
];

export function loadSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.warn('Failed loading settings', e);
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed saving settings', e);
  }
}

export function loadSessionRecords(): SessionRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (raw) {
      const records: SessionRecord[] = JSON.parse(raw);
      if (records && records.length > 0) return records;
    }
  } catch (e) {
    console.warn('Failed loading session records', e);
  }

  // No mock placeholder data in production-ready environment; start from scratch
  return [];
}

export function saveSessionRecords(records: SessionRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(records));
  } catch (e) {
    console.warn('Failed saving session records', e);
  }
}

export function addSessionRecord(record: SessionRecord): SessionRecord[] {
  const current = loadSessionRecords();
  const updated = [record, ...current];
  saveSessionRecords(updated);
  return updated;
}

export function loadFriends(): FriendProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FRIENDS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed loading friends', e);
  }
  return INITIAL_FRIENDS;
}

export function saveFriends(friends: FriendProfile[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.FRIENDS, JSON.stringify(friends));
  } catch (e) {
    console.warn('Failed saving friends', e);
  }
}

/**
 * Seed historical generator for past 7 days of realistic Ultradian data
 */
function generateSeedSessionHistory(): SessionRecord[] {
  const categories = ['Coding', 'Writing', 'Design', 'Research', 'Strategy', 'Study'] as const;
  const presets = ['Classic Ultradian (90/20)', 'High Intensity Flow (60/15)', 'Flow State Peak (110/25)'];
  const tasks = [
    'System Architecture Design',
    'Refactoring Engine Pipeline',
    'Writing Technical Specifications',
    'Deep Algorithm Optimization',
    'Product Roadmap Planning',
    'Researching Ultradian Neurobiology',
  ];

  const list: SessionRecord[] = [];
  const now = Date.now();
  const DAY_MS = 24 * 60 * 60 * 1000;

  for (let i = 6; i >= 0; i--) {
    const dayTimestamp = now - i * DAY_MS;
    const dateObj = new Date(dayTimestamp);
    const dateString = dateObj.toISOString().split('T')[0];

    // 2 to 3 sessions per day
    const sessionCount = i % 2 === 0 ? 3 : 2;
    for (let j = 0; j < sessionCount; j++) {
      const dur = [90, 60, 90, 110][(i + j) % 4];
      list.push({
        id: `seed_${i}_${j}`,
        timestamp: dayTimestamp + j * 3 * 60 * 60 * 1000,
        dateString,
        durationMinutes: dur,
        actualSecondsCompleted: dur * 60,
        type: 'work',
        presetName: presets[(i + j) % presets.length],
        category: categories[(i * 2 + j) % categories.length],
        taskName: tasks[(i + j * 2) % tasks.length],
        focusRating: Math.floor(Math.random() * 2) + 4, // 4 or 5
        energyLevelBefore: Math.floor(Math.random() * 2) + 3,
        energyLevelAfter: Math.floor(Math.random() * 2) + 4,
        distractionsCount: Math.floor(Math.random() * 2),
        notes: 'Sustained deep focus wave with high cognitive clarity.',
      });
    }
  }

  return list;
}
