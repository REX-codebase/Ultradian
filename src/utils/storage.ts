import { SessionRecord, UserSettings, UltradianPreset } from '../types';

const STORAGE_KEYS = {
  SESSIONS: 'ultradian_focus_sessions_v1',
  SETTINGS: 'ultradian_focus_settings_v1',
  FRIENDS: 'ultradian_focus_friends_v1',
};

export const DEFAULT_PRESETS: UltradianPreset[] = [
  {
    id: 'level_1_apprentice',
    name: 'Level 1: Apprentice (45/10)',
    description: 'Build your mental stamina gently. 45 min focus + 10 min break.',
    workMinutes: 45,
    shortBreakMinutes: 10,
    longBreakMinutes: 20,
    cyclesBeforeLongBreak: 2,
  },
  {
    id: 'level_2_adept',
    name: 'Level 2: Adept (60/15)',
    description: 'Elevate cognitive endurance. 60 min focus + 15 min break.',
    workMinutes: 60,
    shortBreakMinutes: 15,
    longBreakMinutes: 25,
    cyclesBeforeLongBreak: 2,
  },
  {
    id: 'level_3_master',
    name: 'Level 3: Ultradian Master (90/20)',
    description: 'Peak Kleitman BRAC science. 90 min deep flow + 20 min recovery.',
    workMinutes: 90,
    shortBreakMinutes: 20,
    longBreakMinutes: 30,
    cyclesBeforeLongBreak: 2,
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
];

export const DEFAULT_SETTINGS: UserSettings = {
  workMinutes: 45,
  shortBreakMinutes: 10,
  longBreakMinutes: 20,
  cyclesBeforeLongBreak: 2,
  activePresetId: 'level_1_apprentice',
  soundEffect: 'tibetan_bowl',
  soundVolume: 0.8,
  ambientType: 'none',
  ambientVolume: 0.4,
  autoStartBreaks: false,
  autoStartWork: false,
  notificationsEnabled: true,
  dailyGoalCycles: 3,
  darkMode: true,
  username: '',
  enableCompetitiveLeagues: true,
  staminaLevel: 1,
  level1SessionsCompleted: 0,
  level2SessionsCompleted: 0,
  level3SessionsCompleted: 0,
  tribeId: '',
};

export function loadSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) {
      const settings = { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } as UserSettings;
      // Drop the hardcoded tribe assigned by legacy demo builds. A real tribe
      // can only come from a verified Firebase-backed community workflow.
      if (['react_devs', 'yc_founders', 'indie_hackers', 'ai_builders', 'designers'].includes(settings.tribeId)) {
        settings.tribeId = '';
        saveSettings(settings);
      }
      return settings;
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
        // Keep only genuine session records; legacy demo, sample, seed, and peer data
        // must never influence a user's analytics or cloud synchronization.
        const clean = records.filter((r) => {
          if (!r || !r.id) return false;
          const id = r.id.toLowerCase();
          return !r.isSample && !/^(sample|seed|demo|test|friend|local_peer|mock)[_-]/.test(id);
        });
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

/**
 * Removes the retired local-peer cache created by earlier demo builds.
 * League standings are now Firebase-only and cannot be synthesized locally.
 */
export function clearLegacyFriends(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.FRIENDS);
  } catch (e) {
    console.warn('Failed clearing legacy peer data', e);
  }
}

