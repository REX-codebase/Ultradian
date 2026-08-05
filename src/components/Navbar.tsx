import React, { useState } from 'react';
import {
  Flame,
  Volume2,
  VolumeX,
  Moon,
  Sun,
  Bell,
  BellOff,
  Maximize2,
  Share2,
  Settings,
  Sparkles,
  BarChart3,
  Clock,
  SlidersHorizontal,
} from 'lucide-react';
import { UserSettings } from '../types';

interface NavbarProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onToggleTheme?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onOpenSettings: () => void;
  onOpenShare: () => void;
  onToggleZen: () => void;
  activeTab: 'timer' | 'analytics' | 'friends';
  onChangeTab: (tab: 'timer' | 'analytics' | 'friends') => void;
  notificationPermission: NotificationPermission;
  onRequestNotifications: () => void;
  toggleAmbient: () => void;
  isAmbientActive: boolean;
  completedCyclesToday: number;
  fbUser?: any | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  onUpdateSettings,
  onToggleTheme,
  onOpenSettings,
  onOpenShare,
  onToggleZen,
  activeTab,
  onChangeTab,
  notificationPermission,
  onRequestNotifications,
  toggleAmbient,
  isAmbientActive,
  completedCyclesToday,
  fbUser,
}) => {
  const [showMobileTools, setShowMobileTools] = useState(false);

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-stone-50/95 dark:bg-stone-950/95 border-b border-stone-200/80 dark:border-stone-900/80 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2">
        {/* Brand Logo & Title */}
        <div className="flex items-center space-x-2.5 sm:space-x-3.5 shrink-0">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 shadow-xs">
            <Clock className="w-4 h-4 stroke-[1.8]" />
          </div>
          <div className="flex items-center space-x-2">
            <h1 className="font-serif text-lg sm:text-xl tracking-tight font-medium text-stone-900 dark:text-stone-100 whitespace-nowrap">
              Ultradian <span className="italic font-light text-stone-500 dark:text-stone-400">Pulse</span>
            </h1>
            <span className="hidden xs:inline-flex px-2 py-0.5 text-[10px] font-mono font-bold tracking-widest uppercase bg-stone-100 dark:bg-stone-900 text-stone-700 dark:text-stone-300 rounded-full border border-stone-200/80 dark:border-stone-800">
              BRAC 90M
            </span>
          </div>
        </div>

        {/* Center Tabs Navigation (Desktop) */}
        <nav className="hidden md:flex items-center space-x-1 p-1 bg-stone-200/60 dark:bg-stone-900/60 rounded-xl border border-stone-200/40 dark:border-stone-800/40">
          <button
            onClick={() => onChangeTab('timer')}
            className={`flex items-center space-x-2 px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
              activeTab === 'timer'
                ? 'bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>TIMER</span>
          </button>

          <button
            onClick={() => onChangeTab('analytics')}
            className={`flex items-center space-x-2 px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
              activeTab === 'analytics'
                ? 'bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>ANALYTICS</span>
          </button>

          {settings.enableCompetitiveLeagues && (
            <button
              onClick={() => onChangeTab('friends')}
              className={`flex items-center space-x-2 px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                activeTab === 'friends'
                  ? 'bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>LEADERBOARD</span>
            </button>
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0">
          {/* Daily Goal Badge (Desktop & Tablet) */}
          <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 text-stone-700 dark:text-stone-300 text-[11px] font-mono font-bold uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5 text-stone-600 dark:text-stone-400" />
            <span>
              {completedCyclesToday}/{settings.dailyGoalCycles} CYCLES
            </span>
          </div>

          {/* Desktop Tools (Sound, Notification, Zen) */}
          <div className="hidden sm:flex items-center space-x-1">
            <button
              onClick={toggleAmbient}
              title={isAmbientActive ? 'Ambient Sound Active' : 'Enable Focus Noise'}
              className={`p-2 rounded-lg transition-all duration-200 ${
                isAmbientActive
                  ? 'bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900'
                  : 'text-stone-500 dark:text-stone-400 hover:bg-stone-200/50 dark:hover:bg-stone-900/50'
              }`}
            >
              <Volume2 className="w-4 h-4" />
            </button>

            <button
              onClick={onRequestNotifications}
              title={
                notificationPermission === 'granted'
                  ? 'Notifications Enabled'
                  : 'Enable Browser Notifications'
              }
              className={`p-2 rounded-lg transition-all duration-200 ${
                notificationPermission === 'granted'
                  ? 'text-stone-500 dark:text-stone-400 hover:bg-stone-200/50 dark:hover:bg-stone-900/50'
                  : 'text-stone-400 dark:text-stone-500 hover:bg-stone-200/50 dark:hover:bg-stone-900/50'
              }`}
            >
              {notificationPermission === 'granted' ? (
                <Bell className="w-4 h-4" />
              ) : (
                <BellOff className="w-4 h-4 text-stone-400 dark:text-stone-500" />
              )}
            </button>

            <button
              onClick={onToggleZen}
              title="Enter Zen Shield"
              className="p-2 rounded-lg text-stone-500 dark:text-stone-400 hover:bg-stone-200/50 dark:hover:bg-stone-900/50 transition-all duration-200"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Quick Tools Toggle Button */}
          <button
            onClick={() => setShowMobileTools(!showMobileTools)}
            title="Toggle Quick Tools"
            className={`sm:hidden p-2 rounded-lg transition-all duration-200 relative ${
              showMobileTools || isAmbientActive
                ? 'bg-stone-200 dark:bg-stone-800 text-stone-900 dark:text-stone-100'
                : 'text-stone-500 dark:text-stone-400 hover:bg-stone-200/60 dark:hover:bg-stone-900/60'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            {isAmbientActive && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>

          {/* Dark Mode Spectacle Toggle */}
          <button
            onClick={(e) => {
              if (onToggleTheme) {
                onToggleTheme(e);
              } else {
                onUpdateSettings({ darkMode: !settings.darkMode });
              }
            }}
            title={settings.darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 rounded-lg text-stone-500 dark:text-stone-400 hover:bg-stone-200/60 dark:hover:bg-stone-900/60 transition-all duration-300 relative group overflow-hidden active:scale-95"
          >
            <div className="relative z-10 flex items-center justify-center transition-transform duration-500 group-hover:rotate-45">
              {settings.darkMode ? (
                <Sun className="w-4 h-4 text-amber-400 group-hover:text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)] animate-celestial-pulse" />
              ) : (
                <Moon className="w-4 h-4 text-stone-700 group-hover:text-stone-900 group-hover:-rotate-12 animate-celestial-pulse" />
              )}
            </div>
          </button>

          {/* Profile / Settings Button */}
          {fbUser ? (
            <button
              onClick={onOpenSettings}
              title="View Profile & Settings"
              className="flex items-center space-x-1.5 p-1 rounded-full bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:bg-stone-200/50 dark:hover:bg-stone-800/50 transition-all duration-200"
            >
              <img
                src={fbUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${fbUser.uid}`}
                alt={fbUser.displayName || 'User Profile'}
                referrerPolicy="no-referrer"
                className="w-6 h-6 rounded-full object-cover border border-stone-200/60 dark:border-stone-800"
              />
            </button>
          ) : (
            <button
              onClick={onOpenSettings}
              title="Timer Settings"
              className="p-2 rounded-lg text-stone-500 dark:text-stone-400 hover:bg-stone-200/50 dark:hover:bg-stone-900/50 transition-all duration-200"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Expandable Quick Tools Bar */}
      {showMobileTools && (
        <div className="sm:hidden px-3 py-2 bg-stone-100/90 dark:bg-stone-900/90 border-t border-stone-200/60 dark:border-stone-800/60 flex items-center justify-around text-xs font-semibold animate-fade-in">
          <button
            onClick={toggleAmbient}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border transition-all ${
              isAmbientActive
                ? 'bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 border-transparent shadow-xs'
                : 'bg-white dark:bg-stone-950 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800'
            }`}
          >
            {isAmbientActive ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {isAmbientActive ? 'SOUND: ON' : 'SOUND: OFF'}
            </span>
          </button>

          <button
            onClick={onRequestNotifications}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border transition-all ${
              notificationPermission === 'granted'
                ? 'bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 border-transparent shadow-xs'
                : 'bg-white dark:bg-stone-950 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800'
            }`}
          >
            {notificationPermission === 'granted' ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {notificationPermission === 'granted' ? 'ALERTS: ON' : 'ALERTS: OFF'}
            </span>
          </button>

          <button
            onClick={() => {
              setShowMobileTools(false);
              onToggleZen();
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border bg-white dark:bg-stone-950 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-900 transition-all"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">ZEN SHIELD</span>
          </button>
        </div>
      )}

      {/* Mobile Upper Sub-Navigation Bar (Segmented Control) */}
      <div className="md:hidden border-t border-stone-200/80 dark:border-stone-900/80 bg-stone-50/95 dark:bg-stone-950/95 py-1.5 px-3">
        <div className={`grid ${settings.enableCompetitiveLeagues ? 'grid-cols-3' : 'grid-cols-2'} gap-1.5 p-1 bg-stone-200/60 dark:bg-stone-900/60 rounded-xl border border-stone-200/40 dark:border-stone-800/40`}>
          <button
            onClick={() => onChangeTab('timer')}
            className={`flex items-center justify-center space-x-1.5 min-h-[40px] px-2 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all duration-200 ${
              activeTab === 'timer'
                ? 'bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span>TIMER</span>
          </button>

          <button
            onClick={() => onChangeTab('analytics')}
            className={`flex items-center justify-center space-x-1.5 min-h-[40px] px-2 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all duration-200 ${
              activeTab === 'analytics'
                ? 'bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 shrink-0" />
            <span>ANALYTICS</span>
          </button>

          {settings.enableCompetitiveLeagues && (
            <button
              onClick={() => onChangeTab('friends')}
              className={`flex items-center justify-center space-x-1.5 min-h-[40px] px-2 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all duration-200 ${
                activeTab === 'friends'
                  ? 'bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              <Share2 className="w-3.5 h-3.5 shrink-0" />
              <span>SOCIAL</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

