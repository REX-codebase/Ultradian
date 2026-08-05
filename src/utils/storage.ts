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

export const INITIAL_FRIENDS: FriendProfile[] = [];

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
      if (Array.isArray(records)) {
        // Filter out any legacy seed/fake records from localStorage
        const clean = records.filter((r) => r && r.id && !r.id.startsWith('seed_'));
        if (clean.length !== records.length) {
          saveSessionRecords(clean);
        }
        return clean;
      }
    }
  } catch (e) {
    console.warn('Failed loading session records', e);
  }

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
  return [];
}

export function saveFriends(friends: FriendProfile[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.FRIENDS, JSON.stringify(friends));
  } catch (e) {
    console.warn('Failed saving friends', e);
  }
}

