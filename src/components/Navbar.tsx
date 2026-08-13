import React from 'react';
import { motion } from 'motion/react';
import { Moon, Sun, Settings, Clock, BarChart3, Share2 } from 'lucide-react';
import { UserSettings } from '../types';

interface NavbarProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onToggleTheme?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onOpenSettings: () => void;
  onOpenShare: () => void;
  onToggleZen: () => void;
  onOpenAuth?: () => void;
  onOpenRitualOnboarding?: () => void;
  activeTab: 'timer' | 'analytics' | 'friends';
  onChangeTab: (tab: 'timer' | 'analytics' | 'friends') => void;
  notificationPermission: NotificationPermission;
  onRequestNotifications: () => void;
  toggleAmbient: () => void;
  isAmbientActive: boolean;
  completedCyclesToday: number;
  fbUser?: any | null;
}

const TABS: Array<{ id: 'timer' | 'analytics' | 'friends'; label: string; icon: typeof Clock; leagueOnly?: boolean }> = [
  { id: 'timer', label: 'Focus', icon: Clock },
  { id: 'analytics', label: 'Rhythm', icon: BarChart3 },
  { id: 'friends', label: 'League', icon: Share2, leagueOnly: true },
];

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  onUpdateSettings,
  onToggleTheme,
  onOpenSettings,
  activeTab,
  onChangeTab,
  fbUser,
}) => {
  const tabs = TABS.filter((tab) => !tab.leagueOnly || settings.enableCompetitiveLeagues);

  return (
    <>
      <header className="sticky top-0 z-30 w-full bg-[color:var(--paper)]/72 pt-[env(safe-area-inset-top)] backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4 sm:h-16 sm:px-6">
          <button
            type="button"
            onClick={() => onChangeTab('timer')}
            className="pressable min-h-11 font-serif text-lg tracking-tight text-[color:var(--ink)] sm:text-xl"
          >
            Ultradian
          </button>

          <nav className="relative hidden items-center gap-0.5 md:flex" aria-label="Primary">
            {tabs.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onChangeTab(tab.id)}
                  className={`relative min-h-11 rounded-full px-4 text-sm transition-colors duration-200 ${
                    active
                      ? 'text-[color:var(--ink)]'
                      : 'text-[color:var(--ink-mute)] hover:text-[color:var(--ink-soft)]'
                  }`}
                  aria-current={active ? 'page' : undefined}
                >
                  {active && (
                    <motion.span
                      layoutId="desktop-nav-ink"
                      className="absolute inset-x-3 -bottom-0.5 h-px bg-[color:var(--ink)]"
                      transition={{ duration: 0.36, ease: [0.25, 0.1, 0.25, 1] }}
                    />
                  )}
                  {tab.label}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={(e) => {
                if (onToggleTheme) onToggleTheme(e);
                else onUpdateSettings({ darkMode: !settings.darkMode });
              }}
              title={settings.darkMode ? 'Switch to light' : 'Switch to dark'}
              className="pressable inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-[color:var(--ink-mute)] hover:text-[color:var(--ink)]"
            >
              {settings.darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={onOpenSettings}
              title="Settings"
              id="open-settings"
              className="pressable inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-[color:var(--ink-mute)] hover:text-[color:var(--ink)]"
            >
              {fbUser?.photoURL ? (
                <img
                  src={fbUser.photoURL}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="h-6 w-6 rounded-full object-cover"
                />
              ) : (
                <Settings className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </header>

      <nav className="bottom-nav md:hidden" aria-label="Primary">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChangeTab(tab.id)}
              className={`pressable flex min-h-12 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] tracking-wide ${
                active ? 'text-[color:var(--ink)]' : 'text-[color:var(--ink-mute)]'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              {active && (
                <motion.span
                  layoutId="mobile-nav-pill"
                  className="nav-pill"
                  transition={{ duration: 0.38, ease: [0.05, 0.7, 0.1, 1] }}
                />
              )}
              <Icon className="h-5 w-5" strokeWidth={active ? 2.05 : 1.6} />
              {tab.label}
            </button>
          );
        })}
      </nav>
    </>
  );
};
