import { UserSettings } from '../types';

export const SETTINGS_TABS = ['profile', 'rhythm', 'audio', 'account'] as const;

export type SettingsTabId = (typeof SETTINGS_TABS)[number];

export interface SettingsWorkspace {
  tab: SettingsTabId;
  draft: UserSettings;
}

export function createSettingsWorkspace(
  settings: UserSettings,
  tab: SettingsTabId = 'profile'
): SettingsWorkspace {
  return {
    tab,
    draft: { ...settings },
  };
}

export function editSettingsDraft(
  workspace: SettingsWorkspace,
  patch: Partial<UserSettings>
): SettingsWorkspace {
  return {
    tab: workspace.tab,
    draft: { ...workspace.draft, ...patch },
  };
}

export function switchSettingsTab(
  workspace: SettingsWorkspace,
  tab: SettingsTabId
): SettingsWorkspace {
  return {
    tab,
    draft: workspace.draft,
  };
}

export function isSettingsTabId(value: string): value is SettingsTabId {
  return (SETTINGS_TABS as readonly string[]).includes(value);
}
