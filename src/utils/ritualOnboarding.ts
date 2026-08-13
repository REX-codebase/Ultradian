import { FocusArchetype, UserSettings } from '../types';
import { ARCHETYPES } from '../data/professions';

export interface RitualOnboardingInput {
  archetype: FocusArchetype;
  profession: string;
  peakHour: number;
  ritualName: string;
  currentUsername?: string;
}

export interface RitualCloudFields {
  uid?: string;
  archetype?: FocusArchetype;
  profession?: string;
  peakHour?: number;
  focusRitualName?: string;
  hasCompletedOnboarding?: boolean;
}

export function withOwnerUid(uid: string, fields: RitualCloudFields): RitualCloudFields & { uid: string } {
  return { ...fields, uid };
}

export type RitualProfileWriter = (uid: string, data: RitualCloudFields) => Promise<void>;

const RITUAL_KEYS = [
  'archetype',
  'profession',
  'peakHour',
  'focusRitualName',
  'hasCompletedOnboarding',
] as const;

export function buildRitualOnboardingSettings(input: RitualOnboardingInput): Partial<UserSettings> {
  const meta = ARCHETYPES[input.archetype];
  let defaultPresetId = 'level_1_apprentice';
  if (meta.defaultWorkMinutes === 90) {
    defaultPresetId = 'level_3_master';
  } else if (meta.defaultWorkMinutes === 60) {
    defaultPresetId = 'level_2_adept';
  }

  const ritualName = input.ritualName.trim() || `The ${input.archetype} Ritual`;

  return {
    archetype: input.archetype,
    profession: input.profession,
    peakHour: input.peakHour,
    focusRitualName: ritualName,
    hasCompletedOnboarding: true,
    ambientType: meta.defaultAmbient,
    workMinutes: meta.defaultWorkMinutes,
    shortBreakMinutes: meta.defaultBreakMinutes,
    activePresetId: defaultPresetId,
    username: ritualName ? `${ritualName} (${input.profession})` : input.currentUsername,
  };
}

export function extractRitualCloudFields(settings: Partial<UserSettings>): RitualCloudFields {
  const fields: RitualCloudFields = {};
  if (settings.archetype !== undefined) fields.archetype = settings.archetype;
  if (settings.profession !== undefined) fields.profession = settings.profession;
  if (settings.peakHour !== undefined) fields.peakHour = settings.peakHour;
  if (settings.focusRitualName !== undefined) fields.focusRitualName = settings.focusRitualName;
  if (settings.hasCompletedOnboarding !== undefined) {
    fields.hasCompletedOnboarding = settings.hasCompletedOnboarding;
  }
  return fields;
}

export function extractRitualFromProfile(
  profile: RitualCloudFields | Record<string, unknown> | null | undefined
): RitualCloudFields {
  if (!profile) return {};
  const fields: RitualCloudFields = {};
  const archetype = (profile as RitualCloudFields).archetype;
  if (archetype === 'Builder' || archetype === 'Creator' || archetype === 'Scientist' || archetype === 'Strategist') {
    fields.archetype = archetype;
  }
  if (typeof profile.profession === 'string') fields.profession = profile.profession;
  if (typeof profile.peakHour === 'number' && Number.isFinite(profile.peakHour)) {
    fields.peakHour = profile.peakHour;
  }
  if (typeof profile.focusRitualName === 'string') fields.focusRitualName = profile.focusRitualName;
  if (typeof profile.hasCompletedOnboarding === 'boolean') {
    fields.hasCompletedOnboarding = profile.hasCompletedOnboarding;
  }
  return fields;
}

export function hasRitualSignal(fields: RitualCloudFields): boolean {
  return (
    fields.hasCompletedOnboarding === true ||
    fields.archetype !== undefined ||
    fields.profession !== undefined ||
    fields.focusRitualName !== undefined ||
    fields.peakHour !== undefined
  );
}

export function hydrateSettingsFromProfile(
  settings: UserSettings,
  profile: RitualCloudFields | Record<string, unknown> | null | undefined
): UserSettings {
  const cloudRitual = extractRitualFromProfile(profile);
  if (!hasRitualSignal(cloudRitual)) return settings;
  return { ...settings, ...cloudRitual };
}

export async function persistRitualOnboarding(
  uid: string | null | undefined,
  payload: Partial<UserSettings>,
  writeUserProfile: RitualProfileWriter
): Promise<{ wroteToCloud: boolean; fields: RitualCloudFields }> {
  const fields = extractRitualCloudFields(payload);
  if (!uid) {
    return { wroteToCloud: false, fields };
  }
  const document = withOwnerUid(uid, fields);
  await writeUserProfile(uid, document);
  return { wroteToCloud: true, fields: document };
}

export async function applyCloudRitualHydration(
  uid: string,
  local: UserSettings,
  profile: RitualCloudFields | Record<string, unknown> | null | undefined,
  writeUserProfile: RitualProfileWriter
): Promise<UserSettings> {
  const cloudRitual = extractRitualFromProfile(profile);
  if (hasRitualSignal(cloudRitual)) {
    return { ...local, ...cloudRitual };
  }
  const localRitual = extractRitualCloudFields(local);
  if (localRitual.hasCompletedOnboarding) {
    await writeUserProfile(uid, withOwnerUid(uid, localRitual));
  }
  return local;
}

export { RITUAL_KEYS };
