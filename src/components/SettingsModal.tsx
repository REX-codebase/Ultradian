import React, { useState } from 'react';
import { Settings, Volume2, Play, X, Clock, LogOut, Cloud } from 'lucide-react';
import { UserSettings, SoundEffectType } from '../types';
import { playNotificationSound } from '../utils/audio';

interface SettingsModalProps {
  settings: UserSettings;
  onSaveSettings: (newSettings: UserSettings) => void;
  onClose: () => void;
  onLogout?: () => void;
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

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onSaveSettings,
  onClose,
  onLogout,
  isAuthenticated,
  fbUser,
}) => {
  const [form, setForm] = useState<UserSettings>({ ...settings });

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
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-5 mb-6">
          <div className="flex items-center space-x-3.5">
            <div className="p-2 rounded-sm bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900">
              <Settings className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-medium text-stone-950 dark:text-stone-50">
                Timer Configurations
              </h2>
              <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-0.5">
                Cycle definitions, acoustic alerts & bio-metric targets
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {fbUser && (
          <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200/60 dark:border-stone-800/60 flex items-center gap-3.5 animate-fade-in mb-6">
            <img
              src={fbUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${fbUser.uid}`}
              alt={fbUser.displayName || 'User Profile'}
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-full object-cover border border-stone-200 dark:border-stone-850"
            />
            <div className="flex-1 min-w-0">
              <span className="text-[9px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider block">
                Logged In Profile
              </span>
              <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 truncate">
                {fbUser.displayName || 'Anonymous Wave Rider'}
              </h4>
              <p className="text-[10px] text-stone-500 dark:text-stone-400 truncate">
                {fbUser.email || 'guest-session@ultradian.app'}
              </p>
            </div>
            <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-900/30 rounded">
              Synced
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section: Profile */}
          <div className="space-y-3 pb-4 border-b border-stone-100 dark:border-stone-800">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
              Leaderboard Display Name
            </label>
            <input
              type="text"
              value={form.username || ''}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="e.g. Ultradian Master"
              className="w-full px-3.5 py-2.5 rounded-sm bg-stone-50 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 text-xs font-semibold text-stone-800 dark:text-stone-200 focus:outline-none focus:border-stone-400"
            />
            <p className="text-[10px] text-stone-400 dark:text-stone-500 leading-normal">
              Your focus metrics and wave history are published to the real-time global leaderboard under this identifier.
            </p>
          </div>

          {/* Section: Durations */}
          <div className="space-y-4">
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
                  onChange={(e) => setForm({ ...form, workMinutes: parseInt(e.target.value) || 90 })}
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
                  onChange={(e) => setForm({ ...form, shortBreakMinutes: parseInt(e.target.value) || 20 })}
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
                  onChange={(e) => setForm({ ...form, longBreakMinutes: parseInt(e.target.value) || 30 })}
                  className="w-full px-3.5 py-2.5 rounded-sm bg-stone-50 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 text-xs font-semibold text-stone-800 dark:text-stone-200 focus:outline-none focus:border-stone-400"
                />
              </div>
            </div>
          </div>

          {/* Section: Cycle Parameters */}
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
                onChange={(e) => setForm({ ...form, dailyGoalCycles: parseInt(e.target.value) || 3 })}
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
                onChange={(e) => setForm({ ...form, cyclesBeforeLongBreak: parseInt(e.target.value) || 2 })}
                className="w-full px-3.5 py-2.5 rounded-sm bg-stone-50 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 text-xs font-semibold text-stone-800 dark:text-stone-200 focus:outline-none focus:border-stone-400"
              />
            </div>
          </div>

          {/* Section: Notifications & Alerts */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 flex items-center">
                <Volume2 className="w-3.5 h-3.5 mr-1.5 text-stone-400" />
                Audio Alert Notification
              </h3>

              {/* Master volume slider */}
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={form.soundVolume}
                  onChange={(e) => setForm({ ...form, soundVolume: parseFloat(e.target.value) })}
                  className="w-20 accent-stone-900 dark:accent-stone-100 h-1 bg-stone-100 dark:bg-stone-800 rounded-lg cursor-pointer"
                />
              </div>
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
                      onClick={() => setForm({ ...form, soundEffect: snd.id })}
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
                      className="p-1.5 rounded-sm bg-stone-200/50 dark:bg-stone-850 hover:bg-stone-200 text-stone-700 dark:text-stone-300 transition-colors ml-2"
                      title="Preview alarm"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-3 pt-3 border-t border-stone-100 dark:border-stone-800 text-xs">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="font-semibold text-stone-600 dark:text-stone-400">
                Automatically start Break Wave when Work terminates
              </span>
              <input
                type="checkbox"
                checked={form.autoStartBreaks}
                onChange={(e) => setForm({ ...form, autoStartBreaks: e.target.checked })}
                className="w-4 h-4 accent-stone-900 dark:accent-stone-100 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="font-semibold text-stone-600 dark:text-stone-400">
                Automatically start Work Wave when Break terminates
              </span>
              <input
                type="checkbox"
                checked={form.autoStartWork}
                onChange={(e) => setForm({ ...form, autoStartWork: e.target.checked })}
                className="w-4 h-4 accent-stone-900 dark:accent-stone-100 rounded cursor-pointer"
              />
            </label>
          </div>

          {/* Cloud Account Sync / Sign Out section */}
          <div className="pt-4 border-t border-stone-100 dark:border-stone-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-stone-500 dark:text-stone-400">
                Cloud Sync Status
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                isAuthenticated 
                  ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300 border border-green-200/50 dark:border-green-900/30' 
                  : 'bg-stone-100 dark:bg-stone-900 text-stone-500 dark:text-stone-400 border border-stone-200/60 dark:border-stone-850/60'
              }`}>
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
                className="w-full py-2.5 px-4 rounded-xl border border-red-200 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-950/15 text-red-600 dark:text-red-400 font-semibold text-xs tracking-wider uppercase transition-all duration-250 flex items-center justify-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Disconnect Cloud Session</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (onLogout) {
                    onLogout();
                    onClose();
                  }
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-stone-300 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-900 text-stone-700 dark:text-stone-300 font-semibold text-xs tracking-wider uppercase transition-all duration-250 flex items-center justify-center gap-2"
              >
                <Cloud className="w-3.5 h-3.5" />
                <span>Sign In / Create Account</span>
              </button>
            )}
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            className="w-full py-4 mt-2 rounded-full bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-stone-200 text-stone-100 dark:text-stone-900 font-semibold text-xs tracking-wider uppercase shadow-xs transition-all duration-200"
          >
            Apply Configurations
          </button>
        </form>
      </div>
    </div>
  );
};
