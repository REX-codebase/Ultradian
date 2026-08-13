import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS } from '../storage';
import {
  createSettingsWorkspace,
  editSettingsDraft,
  switchSettingsTab,
} from '../settingsTabs';

describe('settings tab workspace', () => {
  it('keeps edited field values when switching tabs', () => {
    const username = 'WaveRider';
    const workMinutes = 77;

    let workspace = createSettingsWorkspace(DEFAULT_SETTINGS, 'profile');
    workspace = editSettingsDraft(workspace, { username, workMinutes });
    expect(workspace.draft.username).toBe(username);
    expect(workspace.draft.workMinutes).toBe(workMinutes);

    workspace = switchSettingsTab(workspace, 'rhythm');
    expect(workspace.tab).toBe('rhythm');
    expect(workspace.draft.username).toBe(username);
    expect(workspace.draft.workMinutes).toBe(workMinutes);

    workspace = switchSettingsTab(workspace, 'audio');
    workspace = switchSettingsTab(workspace, 'account');
    workspace = switchSettingsTab(workspace, 'profile');

    expect(workspace.tab).toBe('profile');
    expect(workspace.draft.username).toBe(username);
    expect(workspace.draft.workMinutes).toBe(workMinutes);
  });
});
