import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS } from '../storage';
import {
  applyCloudRitualHydration,
  buildRitualOnboardingSettings,
  extractRitualCloudFields,
  hydrateSettingsFromProfile,
  persistRitualOnboarding,
  RitualCloudFields,
  withOwnerUid,
} from '../ritualOnboarding';

describe('ritual onboarding persist and hydrate', () => {
  it('builds the payload from the given inputs and persists those fields when a uid is present', async () => {
    const archetype = 'Scientist' as const;
    const profession = 'Astrophysicist';
    const peakHour = 14;
    const ritualName = 'Meridian Codex';

    const payload = buildRitualOnboardingSettings({
      archetype,
      profession,
      peakHour,
      ritualName,
      currentUsername: 'guest',
    });

    expect(payload.archetype).toBe(archetype);
    expect(payload.profession).toBe(profession);
    expect(payload.peakHour).toBe(peakHour);
    expect(payload.focusRitualName).toBe(ritualName);
    expect(payload.hasCompletedOnboarding).toBe(true);

    const ownerUid = `uid-${profession}-${peakHour}`;
    const writes: Array<{ uid: string; data: RitualCloudFields }> = [];
    const result = await persistRitualOnboarding(ownerUid, payload, async (uid, data) => {
      writes.push({ uid, data });
    });

    expect(result.wroteToCloud).toBe(true);
    expect(writes).toHaveLength(1);
    expect(writes[0].uid).toBe(ownerUid);
    expect(writes[0].data.uid).toBe(ownerUid);
    expect(writes[0].data.archetype).toBe(archetype);
    expect(writes[0].data.profession).toBe(profession);
    expect(writes[0].data.peakHour).toBe(peakHour);
    expect(writes[0].data.focusRitualName).toBe(ritualName);
    expect(writes[0].data.hasCompletedOnboarding).toBe(true);
  });

  it('hydrates the same ritual fields from a cloud profile back into settings', () => {
    const profession = 'Novelist';
    const peakHour = 6;
    const ritualName = 'Aurora Scribe';
    const payload = buildRitualOnboardingSettings({
      archetype: 'Creator',
      profession,
      peakHour,
      ritualName,
    });
    const profile = extractRitualCloudFields(payload);
    const hydrated = hydrateSettingsFromProfile(DEFAULT_SETTINGS, profile);

    expect(hydrated.profession).toBe(profession);
    expect(hydrated.peakHour).toBe(peakHour);
    expect(hydrated.focusRitualName).toBe(ritualName);
    expect(hydrated.archetype).toBe('Creator');
    expect(hydrated.hasCompletedOnboarding).toBe(true);
  });

  it('guest finish does not write to the cloud and still marks onboarding complete', async () => {
    const profession = 'Frontend Developer';
    const peakHour = 9;
    const ritualName = 'Morning Foundry';
    const payload = buildRitualOnboardingSettings({
      archetype: 'Builder',
      profession,
      peakHour,
      ritualName,
    });

    const writes: RitualCloudFields[] = [];
    const result = await persistRitualOnboarding(null, payload, async (_uid, data) => {
      writes.push(data);
    });

    expect(result.wroteToCloud).toBe(false);
    expect(writes).toHaveLength(0);
    expect(payload.hasCompletedOnboarding).toBe(true);
    expect(payload.profession).toBe(profession);
    expect(payload.peakHour).toBe(peakHour);
    expect(payload.focusRitualName).toBe(ritualName);
  });

  it('restores cloud ritual fields on later load and pushes local completion when the profile is empty', async () => {
    const profession = 'VC Partner';
    const peakHour = 20;
    const ritualName = 'Twilight Vault';
    const local = {
      ...DEFAULT_SETTINGS,
      ...buildRitualOnboardingSettings({
        archetype: 'Strategist',
        profession,
        peakHour,
        ritualName,
      }),
    };

    const restored = await applyCloudRitualHydration(
      'uid-later',
      DEFAULT_SETTINGS,
      extractRitualCloudFields(local),
      async () => {
        throw new Error('should not write when the profile already has ritual fields');
      }
    );
    expect(restored.profession).toBe(profession);
    expect(restored.peakHour).toBe(peakHour);
    expect(restored.focusRitualName).toBe(ritualName);

    const ownerUid = `uid-${profession}-${peakHour}`;
    const pushed: RitualCloudFields[] = [];
    await applyCloudRitualHydration(ownerUid, local, null, async (_uid, data) => {
      pushed.push(data);
    });
    expect(pushed).toHaveLength(1);
    expect(pushed[0].uid).toBe(ownerUid);
    expect(pushed[0].profession).toBe(profession);
    expect(pushed[0].peakHour).toBe(peakHour);
    expect(pushed[0].focusRitualName).toBe(ritualName);
    expect(pushed[0].hasCompletedOnboarding).toBe(true);

    // Firestore owner updates require the existing doc uid to match the next write.
    const created = withOwnerUid(ownerUid, extractRitualCloudFields(local));
    const nextSync = { ...created, lastLoginAt: Date.now() };
    expect(created.uid).toBe(ownerUid);
    expect(nextSync.uid).toBe(created.uid);
  });
});
