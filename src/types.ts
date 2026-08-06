export type SessionType = 'work' | 'shortBreak' | 'longBreak';

export interface UltradianPreset {
  id: string;
  name: string;
  description: string;
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  cyclesBeforeLongBreak: number;
  isCustom?: boolean;
}

export type CategoryTag = 'Coding' | 'Writing' | 'Design' | 'Research' | 'Strategy' | 'Study' | 'General';

export interface SessionRecord {
  id: string;
  timestamp: number; // Date.now()
  dateString: string; // YYYY-MM-DD
  durationMinutes: number;
  actualSecondsCompleted: number;
  type: SessionType;
  presetName: string;
  category: CategoryTag;
  taskName: string;
  focusRating?: number; // 1-5
  energyLevelBefore?: number; // 1-5
  energyLevelAfter?: number; // 1-5
  distractionsCount: number;
  notes?: string;
}

export type SoundEffectType = 'tibetan_bowl' | 'digital_chime' | 'marimba' | 'synth_rise' | 'gentle_bell';

export type AmbientSoundType = 'none' | 'alpha_binaural' | 'brown_noise' | 'rain_waves' | 'white_noise';

export type LeagueTier = 'wood' | 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'ultradian_master';

export interface UserSettings {
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  cyclesBeforeLongBreak: number;
  activePresetId: string;
  soundEffect: SoundEffectType;
  soundVolume: number; // 0-1
  ambientType: AmbientSoundType;
  ambientVolume: number; // 0-1
  autoStartBreaks: boolean;
  autoStartWork: boolean;
  notificationsEnabled: boolean;
  dailyGoalCycles: number;
  darkMode: boolean;
  username?: string;
  enableCompetitiveLeagues: boolean;
  staminaLevel: 1 | 2 | 3;
  level1SessionsCompleted: number;
  level2SessionsCompleted: number;
  level3SessionsCompleted: number;
  tribeId: string;
}

export interface TribeLeaderboard {
  id: string;
  name: string;
  description: string;
  weeklyHours: number;
  memberCount: number;
  topCategory: CategoryTag;
  icon: string;
  isUserTribe?: boolean;
}

export interface FriendProfile {
  id: string;
  name: string;
  avatarUrl?: string;
  weeklyHours: number;
  completedCycles: number;
  focusScore: number;
  topCategory: CategoryTag;
  isUser?: boolean;
  leagueId?: LeagueTier;
  rank?: number;
}

export interface LeagueMember {
  id: string;
  name: string;
  weeklyHours: number;
  completedCycles: number;
  focusScore: number;
  topCategory: CategoryTag;
  leagueId: LeagueTier;
  rank: number;
  isUser?: boolean;
  avatarUrl?: string;
}

export interface RivalInfo {
  rivalName: string;
  rivalHours: number;
  minutesBehind: number;
  cyclesToPass: number;
  rankAbove: number;
  isLeading: boolean;
}

export interface DailySummary {
  date: string;
  totalFocusMinutes: number;
  completedCycles: number;
  avgFocusRating: number;
  distractions: number;
}
