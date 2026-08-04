import React from 'react';
import {
  Flame,
  Volume2,
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
  ShieldAlert,
} from 'lucide-react';
import { UserSettings } from '../types';

interface NavbarProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
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
  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-stone-50/90 dark:bg-stone-950/90 border-b border-stone-200/60 dark:border-stone-900/60 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <div className="flex items-center space-x-3.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 shadow-xs">
            <Clock className="w-4 h-4 stroke-[1.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-serif text-xl tracking-tight font-medium text-stone-900 dark:text-stone-100">
                Ultradian <span className="italic font-light text-stone-500 dark:text-stone-400">Pulse</span>
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-medium tracking-wider uppercase bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-400 rounded-sm border border-stone-200/60 dark:border-stone-800/60">
                BRAC 90m
              </span>
            </div>
          </div>
        </div>

        {/* Center Tabs Navigation */}
        <nav className="hidden md:flex items-center space-x-1 p-0.5 bg-stone-200/50 dark:bg-stone-900/50 rounded-lg">
          <button
            onClick={() => onChangeTab('timer')}
            className={`flex items-center space-x-2 px-4 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
              activeTab === 'timer'
                ? 'bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Ultradian Timer</span>
          </button>

          <button
            onClick={() => onChangeTab('analytics')}
            className={`flex items-center space-x-2 px-4 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
              activeTab === 'analytics'
                ? 'bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Weekly Trends</span>
          </button>

          <button
            onClick={() => onChangeTab('friends')}
            className={`flex items-center space-x-2 px-4 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
              activeTab === 'friends'
                ? 'bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Leaderboard</span>
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center space-x-1">
          {/* Daily Goal Badge */}
          <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800/60 text-stone-700 dark:text-stone-300 text-xs font-semibold">
            <Flame className="w-3.5 h-3.5 text-stone-600 dark:text-stone-400" />
            <span>
              {completedCyclesToday}/{settings.dailyGoalCycles} Cycles
            </span>
          </div>

          {/* Ambient Noise Generator Toggle */}
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

          {/* Browser Notifications Permission */}
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
                : 'text-stone-550 dark:text-stone-350 hover:bg-stone-200/50 dark:hover:bg-stone-900/50'
            }`}
          >
            {notificationPermission === 'granted' ? (
              <Bell className="w-4 h-4" />
            ) : (
              <BellOff className="w-4 h-4 text-stone-400 dark:text-stone-500" />
            )}
          </button>

          {/* Zen Distraction-Free Fullscreen */}
          <button
            onClick={onToggleZen}
            title="Enter Zen Shield"
            className="p-2 rounded-lg text-stone-500 dark:text-stone-400 hover:bg-stone-200/50 dark:hover:bg-stone-900/50 transition-all duration-200"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={() => onUpdateSettings({ darkMode: !settings.darkMode })}
            title="Toggle Theme"
            className="p-2 rounded-lg text-stone-500 dark:text-stone-400 hover:bg-stone-200/50 dark:hover:bg-stone-900/50 transition-all duration-200"
          >
            {settings.darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-700" />}
          </button>

          {/* Settings / Profile Button */}
          {fbUser ? (
            <button
              onClick={onOpenSettings}
              title="View Profile & Settings"
              className="flex items-center space-x-2 pl-1 pr-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:bg-stone-200/50 dark:hover:bg-stone-850/50 transition-all duration-200"
            >
              <img
                src={fbUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${fbUser.uid}`}
                alt={fbUser.displayName || 'User Profile'}
                referrerPolicy="no-referrer"
                className="w-6 h-6 rounded-full object-cover border border-stone-200/60 dark:border-stone-800"
              />
              <span className="hidden sm:inline text-[11px] font-bold text-stone-700 dark:text-stone-300 truncate max-w-[80px]">
                {fbUser.displayName?.split(' ')[0] || 'Profile'}
              </span>
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

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden flex items-center justify-around border-t border-stone-200 dark:border-stone-900 bg-stone-50/90 dark:bg-stone-950/90 py-2.5 px-3 text-xs font-semibold">
        <button
          onClick={() => onChangeTab('timer')}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded-md ${
            activeTab === 'timer' ? 'bg-stone-200 dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-semibold' : 'text-stone-500 dark:text-stone-400'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Timer</span>
        </button>
        <button
          onClick={() => onChangeTab('analytics')}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded-md ${
            activeTab === 'analytics' ? 'bg-stone-200 dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-semibold' : 'text-stone-500 dark:text-stone-400'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Analytics</span>
        </button>
        <button
          onClick={() => onChangeTab('friends')}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded-md ${
            activeTab === 'friends' ? 'bg-stone-200 dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-semibold' : 'text-stone-500 dark:text-stone-400'
          }`}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Social</span>
        </button>
      </div>
    </header>
  );
};
