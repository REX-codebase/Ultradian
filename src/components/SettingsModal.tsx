import React, { useState } from 'react';
import { Settings, Volume2, Play, X, Clock, LogOut, Cloud, UserRound } from 'lucide-react';
import { UserSettings, SoundEffectType } from '../types';
import { playNotificationSound } from '../utils/audio';
import {
  SETTINGS_TABS,
  SettingsTabId,
  createSettingsWorkspace,
  editSettingsDraft,
  switchSettingsTab,
} from '../utils/settingsTabs';

interface SettingsModalProps {
  settings: UserSettings;
  onSaveSettings: (newSettings: UserSettings) => void;
  onClose: () => void;
  onLogout?: () => void;
  onOpenAuth?: () => void;
  onOpenRitualOnboarding?: () => void;
  isAuthenticated: boolean;
  fbUser?: any;
}

const SOUND_OPTIONS: { id: SoundEffectType; label: string; desc: string }[] = [
  { id: 'tibetan_bowl', label: 'Tibetan Singing Bowl', desc: 'Resonant organic chime for mindful transitions' },
  { id: 'digital_chime', label: 'Digital Chime Cascade', desc: 'Crisp synthetic upward 4-note cadence' },
  { id: 'marimba', label: 'Warm Marimba', desc: 'Acoustic percussive triad' },
  { id: 'synth_rise', label: 'Synth Horizon Rise', desc: 'Swell frequency pad' },
  { id: 'gentle_bell', label: 'Gentle Bell', desc: 'Subtle sine-wave bell chime' },
];

const TAB_META: Record<SettingsTabId, { label: string; caption: string }> = {
  profile: { label: 'Profile', caption: 'Name, ritual, onboarding' },
  rhythm: { label: 'Rhythm', caption: 'Intervals and cycle goals' },
  audio: { label: 'Audio', caption: 'Alerts and volume' },
  account: { label: 'Account', caption: 'Cloud sync and leagues' },
};

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onSaveSettings,
  onClose,
  onLogout,
  onOpenAuth,
  onOpenRitualOnboarding,
  isAuthenticated,
  fbUser,
}) => {
  const [workspace, setWorkspace] = useState(() => createSettingsWorkspace(settings));
  const form = workspace.draft;

  const patchForm = (patch: Partial<UserSettings>) => {
    setWorkspace((current) => editSettingsDraft(current, patch));
  };

  const handleTabChange = (tab: SettingsTabId) => {
    setWorkspace((current) => switchSettingsTab(current, tab));
  };

  const handleTestSound = (soundId: SoundEffectType) => {
    playNotificationSound(soundId, form.soundVolume);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-8 rounded-xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800/80 shadow-xs text-stone-900 dark:text-stone-100">
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-5 mb-5">
          <div className="flex items-center space-x-3.5">
            <div className="p-2 rounded-sm bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900">
              <Settings className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-medium text-stone-950 dark:text-stone-50">Settings</h2>
              <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-0.5">
                {TAB_META[workspace.tab].caption}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 min-h-11 min-w-11 rounded-md text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        <div
          role="tablist"
          aria-label="Settings sections"
          className="mb-6 flex gap-1 overflow-x-auto rounded-xl bg-stone-100/80 p-1 dark:bg-stone-950"
        >
          {SETTINGS_TABS.map((tab) => {
            const selected = workspace.tab === tab;
            return (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={selected}
                data-settings-tab={tab}
                onClick={() => handleTabChange(tab)}
                className={`min-h-11 flex-1 rounded-lg px-3 text-xs font-semibold tracking-wide transition-colors ${
                  selected
                    ? 'bg-white text-stone-900 shadow-xs dark:bg-stone-800 dark:text-stone-50'
                    : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                {TAB_META[tab].label}
              </button>
            );
          })}
        </div>

        {fbUser && workspace.tab === 'profile' && (
          <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200/60 dark:border-stone-800/60 flex items-center gap-3.5 mb-6">
            <img
              src={fbUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${fbUser.uid}`}
              alt={fbUser.displayName || 'User Profile'}
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-full object-cover border border-stone-200 dark:border-stone-800"
            />
            <div className="flex-1 min-w-0">
              <span className="text-[9px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider block">
                Signed in
              </span>
              <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 truncate">
                {fbUser.displayName || 'Anonymous'}
              </h4>
              <p className="text-[10px] text-stone-500 dark:text-stone-400 truncate">
                {fbUser.email || 'guest-session@ultradian.app'}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {workspace.tab === 'profile' && (
            <div className="space-y-3" data-settings-panel="profile">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                Leaderboard Display Name
              </label>
              <input
                type="text"
                value={form.username || ''}
                onChange={(e) => patchForm({ username: e.target.value })}
                placeholder="e.g. Ultradian Master"
                className="w-full px-3.5 py-2.5 rounded-sm bg-stone-50 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 text-xs font-semibold text-stone-800 dark:text-stone-200 focus:outline-none focus:border-stone-400"
              />
              <p className="text-[10px] text-stone-400 dark:text-stone-500 leading-normal">
                Published with your verified weekly hours.
              </p>

              {(form.focusRitualName || form.profession) && (
                <div className="rounded-xl border border-stone-200/70 dark:border-stone-800 px-3.5 py-3 text-xs text-stone-600 dark:text-stone-400">
                  <p className="font-serif text-sm text-stone-900 dark:text-stone-100">
                    {form.focusRitualName || 'Unnamed ritual'}
                  </p>
                  <p className="mt-1">
                    {[form.profession, form.archetype].filter(Boolean).join(' · ')}
                  </p>
                </div>
              )}

              {onOpenRitualOnboarding && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenRitualOnboarding();
                  }}
                  className="w-full min-h-11 py-2 px-3 rounded-lg bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <UserRound className="w-3.5 h-3.5" />
                  <span>Revisit ritual</span>
                </button>
              )}
            </div>
          )}

          {workspace.tab === 'rhythm' && (
            <div className="space-y-4" data-settings-panel="rhythm">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1.5 text-stone-400" />
                Rhythm Interval Widths (Minutes)
              </h3>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-stone-400 dark:text-stone-500 mb-1 tracking-wider uppercase">
                    Work Wave
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={form.workMinutes}
                    onChange={(e) => patchForm({ workMinutes: parseInt(e.target.value) || 90 })}
                    className="w-full px-3.5 py-2.5 rounded-sm bg-stone-50 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 text-xs font-semibold text-stone-800 dark:text-stone-200 focus:outline-none focus:border-stone-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-stone-400 dark:text-stone-500 mb-1 tracking-wider uppercase">
                    Short Rest
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={form.shortBreakMinutes}
                    onChange={(e) => patchForm({ shortBreakMinutes: parseInt(e.target.value) || 20 })}
                    className="w-full px-3.5 py-2.5 rounded-sm bg-stone-50 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 text-xs font-semibold text-stone-800 dark:text-stone-200 focus:outline-none focus:border-stone-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-stone-400 dark:text-stone-500 mb-1 tracking-wider uppercase">
                    Long Rest
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={form.longBreakMinutes}
                    onChange={(e) => patchForm({ longBreakMinutes: parseInt(e.target.value) || 30 })}
                    className="w-full px-3.5 py-2.5 rounded-sm bg-stone-50 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 text-xs font-semibold text-stone-800 dark:text-stone-200 focus:outline-none focus:border-stone-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-[10px] font-bold text-stone-400 dark:text-stone-500 mb-1.5 tracking-wider uppercase">
                    Daily Wave Goal (Cycles)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={form.dailyGoalCycles}
                    onChange={(e) => patchForm({ dailyGoalCycles: parseInt(e.target.value) || 3 })}
                    className="w-full px-3.5 py-2.5 rounded-sm bg-stone-50 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 text-xs font-semibold text-stone-800 dark:text-stone-200 focus:outline-none focus:border-stone-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-stone-400 dark:text-stone-500 mb-1.5 tracking-wider uppercase">
                    Waves Before Long Rest
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={form.cyclesBeforeLongBreak}
                    onChange={(e) => patchForm({ cyclesBeforeLongBreak: parseInt(e.target.value) || 2 })}
                    className="w-full px-3.5 py-2.5 rounded-sm bg-stone-50 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 text-xs font-semibold text-stone-800 dark:text-stone-200 focus:outline-none focus:border-stone-400"
                  />
                </div>
              </div>
            </div>
          )}

          {workspace.tab === 'audio' && (
            <div className="space-y-4" data-settings-panel="audio">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 flex items-center">
                  <Volume2 className="w-3.5 h-3.5 mr-1.5 text-stone-400" />
                  Audio Alert Notification
                </h3>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={form.soundVolume}
                  onChange={(e) => patchForm({ soundVolume: parseFloat(e.target.value) })}
                  className="w-20 accent-stone-900 dark:accent-stone-100 h-1 bg-stone-100 dark:bg-stone-800 rounded-lg cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                {SOUND_OPTIONS.map((snd) => {
                  const isSelected = form.soundEffect === snd.id;
                  return (
                    <div
                      key={snd.id}
                      className={`flex items-center justify-between p-3 rounded-md border transition-all duration-200 ${
                        isSelected
                          ? 'bg-stone-100 dark:bg-stone-800 border-stone-900 dark:border-stone-100 ring-1 ring-stone-900 dark:ring-stone-100 shadow-xs'
                          : 'bg-stone-50/50 dark:bg-stone-900/45 border-stone-200/60 dark:border-stone-800/60'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => patchForm({ soundEffect: snd.id })}
                        className="flex-1 text-left"
                      >
                        <span className="font-serif text-sm font-medium text-stone-900 dark:text-stone-100 block">
                          {snd.label}
                        </span>
                        <span className="text-[10px] text-stone-400 dark:text-stone-500 block mt-0.5">{snd.desc}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTestSound(snd.id)}
                        className="p-1.5 rounded-sm bg-stone-200/50 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 transition-colors ml-2"
                        title="Preview alarm"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {workspace.tab === 'account' && (
            <div className="space-y-4" data-settings-panel="account">
              <div className="space-y-3 text-xs">
                <label className="flex items-center justify-between cursor-pointer min-h-11">
                  <span className="font-semibold text-stone-600 dark:text-stone-400">
                    Competitive leagues
                  </span>
                  <input
                    type="checkbox"
                    checked={form.enableCompetitiveLeagues ?? true}
                    onChange={(e) => patchForm({ enableCompetitiveLeagues: e.target.checked })}
                    className="w-4 h-4 accent-stone-900 dark:accent-stone-100 rounded cursor-pointer"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer min-h-11">
                  <span className="font-semibold text-stone-600 dark:text-stone-400">
                    Start break when work ends
                  </span>
                  <input
                    type="checkbox"
                    checked={form.autoStartBreaks}
                    onChange={(e) => patchForm({ autoStartBreaks: e.target.checked })}
                    className="w-4 h-4 accent-stone-900 dark:accent-stone-100 rounded cursor-pointer"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer min-h-11">
                  <span className="font-semibold text-stone-600 dark:text-stone-400">
                    Start work when break ends
                  </span>
                  <input
                    type="checkbox"
                    checked={form.autoStartWork}
                    onChange={(e) => patchForm({ autoStartWork: e.target.checked })}
                    className="w-4 h-4 accent-stone-900 dark:accent-stone-100 rounded cursor-pointer"
                  />
                </label>
              </div>

              <div className="pt-4 border-t border-stone-100 dark:border-stone-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-500 dark:text-stone-400">Cloud Sync Status</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      isAuthenticated
                        ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300 border border-green-200/50 dark:border-green-900/30'
                        : 'bg-stone-100 dark:bg-stone-900 text-stone-500 dark:text-stone-400 border border-stone-200/60 dark:border-stone-800/60'
                    }`}
                  >
                    {isAuthenticated ? 'Active Profile' : 'Local Guest Sandbox'}
                  </span>
                </div>

                {isAuthenticated ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (onLogout) {
                        onLogout();
                        onClose();
                      }
                    }}
                    className="w-full min-h-11 py-2.5 px-4 rounded-xl border border-red-200 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-950/15 text-red-600 dark:text-red-400 font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Disconnect Cloud Session</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onOpenAuth) {
                        onOpenAuth();
                      } else if (onLogout) {
                        onLogout();
                      }
                    }}
                    className="w-full min-h-11 py-2.5 px-4 rounded-xl border border-stone-300 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-900 text-stone-700 dark:text-stone-300 font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2"
                  >
                    <Cloud className="w-3.5 h-3.5" />
                    <span>Sign In / Create Account</span>
                  </button>
                )}
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full min-h-11 py-4 mt-2 rounded-full bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-stone-200 text-stone-100 dark:text-stone-900 font-semibold text-xs tracking-wider uppercase shadow-xs"
          >
            Apply Configurations
          </button>
        </form>
      </div>
    </div>
  );
};
