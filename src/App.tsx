import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { TimerRing } from './components/TimerRing';
import { PresetSelector } from './components/PresetSelector';
import { AmbientPlayer } from './components/AmbientPlayer';
import { ZenMode } from './components/ZenMode';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { PostSessionModal } from './components/PostSessionModal';
import { SocialShareModal } from './components/SocialShareModal';
import { SettingsModal } from './components/SettingsModal';

import {
  SessionType,
  CategoryTag,
  SessionRecord,
  UserSettings,
  FriendProfile,
  UltradianPreset,
  AmbientSoundType,
} from './types';

import {
  loadSettings,
  saveSettings,
  loadSessionRecords,
  saveSessionRecords,
  addSessionRecord,
  loadFriends,
  saveFriends,
} from './utils/storage';

import {
  initAuth,
  syncSessionToCloud,
  loadCloudSessions,
  updateLeaderboardStats,
  subscribeToLeaderboard,
  signOutUser,
  db,
} from './utils/firebase';
import { LoginScreen } from './components/LoginScreen';
import { User as FirebaseUser } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

import {
  checkNotificationPermission,
  requestNotificationPermission,
  sendDesktopNotification,
  updateTabTitle,
  resetTabTitle,
} from './utils/notifications';

import { playNotificationSound, startAmbientSound, stopAmbientSound, setAmbientVolume } from './utils/audio';

export default function App() {
  // Settings & Theme
  const [settings, setSettings] = useState<UserSettings>(() => loadSettings());
  const [sessionRecords, setSessionRecords] = useState<SessionRecord[]>(() => loadSessionRecords());
  const [friends, setFriends] = useState<FriendProfile[]>(() => loadFriends());

  // Active Timer States
  const [sessionType, setSessionType] = useState<SessionType>('work');
  const [secondsLeft, setSecondsLeft] = useState<number>(settings.workMinutes * 60);
  const [totalSeconds, setTotalSeconds] = useState<number>(settings.workMinutes * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Active Task & Category
  const [currentTask, setCurrentTask] = useState<string>('Refactoring Architecture & Flow Wave');
  const [category, setCategory] = useState<CategoryTag>('Coding');
  const [distractionsCount, setDistractionsCount] = useState<number>(0);
  const [completedCyclesToday, setCompletedCyclesToday] = useState<number>(0);

  // UI Navigation Tabs
  const [activeTab, setActiveTab] = useState<'timer' | 'analytics' | 'friends'>('timer');
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(() =>
    checkNotificationPermission()
  );

  // Modals & Overlays
  const [isZenActive, setIsZenActive] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isShareOpen, setIsShareOpen] = useState<boolean>(false);
  const [completedSessionData, setCompletedSessionData] = useState<{
    durationMinutes: number;
    actualSecondsCompleted: number;
    taskName: string;
    category: CategoryTag;
    distractionsCount: number;
  } | null>(null);

  // Firebase User & Sync State
  const [fbUser, setFbUser] = useState<FirebaseUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [isGuestBypassed, setIsGuestBypassed] = useState<boolean>(() => {
    // Check if the user previously selected bypass in session storage
    return sessionStorage.getItem('ultradian_guest_bypass') === 'true';
  });
  const [authError, setAuthError] = useState<string | null>(null);

  // Initialize Firebase Auth
  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => {
        setFbUser(user);
        setIsAuthLoading(false);
        setAuthError(null);
      },
      (err) => {
        setAuthError(err?.message || 'Authentication error');
        setIsAuthLoading(false);
      }
    );
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Firebase Cloud Session & Leaderboard Sync
  useEffect(() => {
    if (!fbUser) return;

    // Load cloud sessions and perform a high-fidelity merge with local sessions
    loadCloudSessions(fbUser.uid).then((cloudRecords) => {
      const cleanCloud = cloudRecords ? cloudRecords.filter((r) => !r.id.startsWith('seed_')) : [];
      
      setSessionRecords((prev) => {
        // Base the list on cloud sessions first (cloud is the source of truth)
        const merged = [...cleanCloud];
        let changed = false;

        // Add any local records that don't exist in the cloud yet
        prev.forEach((localRec) => {
          if (!merged.some((r) => r.id === localRec.id)) {
            merged.push(localRec);
            changed = true;
            // Sync local real sessions (non-seeds) to the cloud
            if (!localRec.id.startsWith('seed_')) {
              syncSessionToCloud(fbUser.uid, localRec);
            }
          }
        });

        const sorted = merged.sort((a, b) => b.timestamp - a.timestamp);
        saveSessionRecords(sorted);
        
        // Update leaderboard stats on the cloud with the merged dataset
        updateLeaderboardStats(fbUser.uid, settings.username || 'Ultradian Achiever', sorted);
        
        return sorted;
      });
    });

    // 2. Subscribe to real-time Leaderboard updates
    const unsubscribe = subscribeToLeaderboard(fbUser.uid, (liveLeaderboard) => {
      setFriends(liveLeaderboard);
    });

    return () => {
      unsubscribe();
    };
  }, [fbUser]);

  // Sync to Leaderboard when username changes
  useEffect(() => {
    if (fbUser) {
      updateLeaderboardStats(fbUser.uid, settings.username || 'Ultradian Achiever', sessionRecords);
    }
  }, [settings.username, fbUser]);

  // Exact target timestamp ref to eliminate background tab timing drift
  const endTimeRef = useRef<number | null>(null);

  // Apply dark mode class to root HTML element
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  // Request browser notification permission
  const handleRequestNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotificationPermission(granted ? 'granted' : 'denied');
  };

  // Update duration when preset or settings change (if timer is paused)
  const applySessionDuration = useCallback(
    (type: SessionType) => {
      let mins = settings.workMinutes;
      if (type === 'shortBreak') mins = settings.shortBreakMinutes;
      if (type === 'longBreak') mins = settings.longBreakMinutes;

      const sec = mins * 60;
      setTotalSeconds(sec);
      setSecondsLeft(sec);
    },
    [settings]
  );

  // Handle phase completion
  const handlePhaseComplete = useCallback(() => {
    setIsRunning(false);
    playNotificationSound(settings.soundEffect, settings.soundVolume);

    if (sessionType === 'work') {
      const durMins = Math.round(totalSeconds / 60);
      const newCycles = completedCyclesToday + 1;
      setCompletedCyclesToday(newCycles);

      // Trigger Desktop Notification
      sendDesktopNotification(
        '🧠 Ultradian Work Wave Complete!',
        `Awesome job! You completed a ${durMins}m deep focus cycle. Time for a recovery break.`
      );

      // Open reflection modal
      setCompletedSessionData({
        durationMinutes: durMins,
        actualSecondsCompleted: totalSeconds,
        taskName: currentTask,
        category,
        distractionsCount,
      });

      // Switch to next break type
      const isLong = newCycles % settings.cyclesBeforeLongBreak === 0;
      const nextType: SessionType = isLong ? 'longBreak' : 'shortBreak';
      setSessionType(nextType);
      applySessionDuration(nextType);

      if (settings.autoStartBreaks) {
        setTimeout(() => handleStart(), 1500);
      }
    } else {
      // Break complete
      sendDesktopNotification(
        '☕ Recovery Break Ended!',
        'Your brain is refreshed and ready for another high-performance Ultradian wave.'
      );

      setSessionType('work');
      applySessionDuration('work');
      setDistractionsCount(0);

      if (settings.autoStartWork) {
        setTimeout(() => handleStart(), 1500);
      }
    }
  }, [
    sessionType,
    totalSeconds,
    completedCyclesToday,
    currentTask,
    category,
    distractionsCount,
    settings,
    applySessionDuration,
  ]);

  // Precise Timer Loop handling visibility changes & backgrounding
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isRunning) {
      if (!endTimeRef.current) {
        endTimeRef.current = Date.now() + secondsLeft * 1000;
      }

      interval = setInterval(() => {
        if (!endTimeRef.current) return;
        const remaining = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000));
        setSecondsLeft(remaining);

        updateTabTitle(Math.floor(remaining / 60), remaining % 60, sessionType, true);

        if (remaining <= 0) {
          endTimeRef.current = null;
          handlePhaseComplete();
        }
      }, 500);
    } else {
      endTimeRef.current = null;
      if (secondsLeft > 0) {
        updateTabTitle(Math.floor(secondsLeft / 60), secondsLeft % 60, sessionType, false);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, secondsLeft, sessionType, handlePhaseComplete]);

  // Handle visibility change (when user switches tabs and returns)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) return;
      if (isRunning && endTimeRef.current) {
        const remaining = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000));
        setSecondsLeft(remaining);
        if (remaining <= 0) {
          endTimeRef.current = null;
          handlePhaseComplete();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [isRunning, handlePhaseComplete]);

  // Start Timer
  const handleStart = () => {
    endTimeRef.current = Date.now() + secondsLeft * 1000;
    setIsRunning(true);
  };

  // Pause Timer
  const handlePause = () => {
    setIsRunning(false);
    endTimeRef.current = null;
  };

  // Reset Timer
  const handleReset = () => {
    setIsRunning(false);
    endTimeRef.current = null;
    applySessionDuration(sessionType);
  };

  // Skip Phase
  const handleSkip = () => {
    setIsRunning(false);
    endTimeRef.current = null;
    if (sessionType === 'work') {
      setSessionType('shortBreak');
      applySessionDuration('shortBreak');
    } else {
      setSessionType('work');
      applySessionDuration('work');
    }
  };

  // Select Preset
  const handleSelectPreset = (preset: UltradianPreset) => {
    const newSettings = {
      ...settings,
      workMinutes: preset.workMinutes,
      shortBreakMinutes: preset.shortBreakMinutes,
      longBreakMinutes: preset.longBreakMinutes,
      cyclesBeforeLongBreak: preset.cyclesBeforeLongBreak,
      activePresetId: preset.id,
    };
    setSettings(newSettings);
    saveSettings(newSettings);

    setIsRunning(false);
    setSessionType('work');
    const sec = preset.workMinutes * 60;
    setTotalSeconds(sec);
    setSecondsLeft(sec);
  };

  // Ambient sound selection & volume
  const handleSelectAmbient = (type: AmbientSoundType) => {
    const updated = { ...settings, ambientType: type };
    setSettings(updated);
    saveSettings(updated);

    if (type === 'none') {
      stopAmbientSound();
    } else {
      startAmbientSound(type, settings.ambientVolume);
    }
  };

  const handleAmbientVolumeChange = (vol: number) => {
    const updated = { ...settings, ambientVolume: vol };
    setSettings(updated);
    saveSettings(updated);
    setAmbientVolume(vol);
  };

  // Save Post-Session Reflection Record
  const handleSaveSessionReflection = (reflection: Partial<SessionRecord>) => {
    if (!completedSessionData) return;

    const newRecord: SessionRecord = {
      id: `session_${Date.now()}`,
      timestamp: Date.now(),
      dateString: new Date().toISOString().split('T')[0],
      durationMinutes: completedSessionData.durationMinutes,
      actualSecondsCompleted: completedSessionData.actualSecondsCompleted,
      type: 'work',
      presetName: settings.activePresetId,
      category: completedSessionData.category,
      taskName: completedSessionData.taskName,
      focusRating: reflection.focusRating || 5,
      energyLevelAfter: reflection.energyLevelAfter || 4,
      distractionsCount: completedSessionData.distractionsCount,
      notes: reflection.notes || '',
    };

    const updated = addSessionRecord(newRecord);
    setSessionRecords(updated);
    setCompletedSessionData(null);

    // Sync to cloud Firestore and refresh public leaderboard presence
    if (fbUser) {
      syncSessionToCloud(fbUser.uid, newRecord);
      updateLeaderboardStats(fbUser.uid, settings.username || 'Ultradian Achiever', updated);
    }
  };

  // Update Settings
  const handleUpdateSettings = (partial: Partial<UserSettings>) => {
    const updated = { ...settings, ...partial };
    setSettings(updated);
    saveSettings(updated);
    applySessionDuration(sessionType);

    if (fbUser && partial.username !== undefined) {
      updateLeaderboardStats(fbUser.uid, partial.username || 'Ultradian Achiever', sessionRecords);
    }
  };

  // Disconnect / Log Out handler
  const handleLogout = async () => {
    try {
      await signOutUser();
      setFbUser(null);
      setIsGuestBypassed(false);
      sessionStorage.removeItem('ultradian_guest_bypass');
    } catch (err) {
      console.error('Failed to log out:', err);
    }
  };

  // Add friend/competitor to the live real-time leaderboard
  const handleAddFriend = async (name: string, weeklyHours: number) => {
    try {
      const mockFriendId = `friend_${Date.now()}`;
      const mockFriendRef = doc(db, 'leaderboard', mockFriendId);
      await setDoc(mockFriendRef, {
        id: mockFriendId,
        name,
        weeklyHours,
        completedCycles: Math.round(weeklyHours * 0.7),
        focusScore: Math.floor(Math.random() * 15) + 82,
        topCategory: 'Coding',
        lastUpdated: Date.now(),
      });
    } catch (err) {
      console.error('Failed adding comparison profile to live leaderboard:', err);
    }
  };

  // Compute stats for social badge dynamically based on work sessions
  const userStats = {
    weeklyHours: (() => {
      const now = Date.now();
      const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
      const past7Days = sessionRecords.filter((r) => now - r.timestamp <= SEVEN_DAYS_MS && r.type === 'work');
      const totFocusMins = past7Days.reduce((acc, r) => acc + Math.round(r.actualSecondsCompleted / 60), 0);
      return Math.round((totFocusMins / 60) * 10) / 10;
    })(),
    completedCycles: sessionRecords.filter((r) => r.type === 'work').length,
    focusScore: (() => {
      const rated = sessionRecords.filter((r) => r.type === 'work' && r.focusRating);
      if (rated.length === 0) return 0;
      const sum = rated.reduce((acc, r) => acc + (r.focusRating || 5), 0);
      return Math.round((sum / rated.length) * 20);
    })(),
    topCategory: (() => {
      const minsByCat: Record<string, number> = {};
      sessionRecords.forEach((r) => {
        if (r.type === 'work') {
          const m = Math.round(r.actualSecondsCompleted / 60);
          minsByCat[r.category] = (minsByCat[r.category] || 0) + m;
        }
      });
      let topCat: CategoryTag = 'General';
      let maxM = 0;
      Object.entries(minsByCat).forEach(([cat, m]) => {
        if (m > maxM) {
          maxM = m;
          topCat = cat as CategoryTag;
        }
      });
      return topCat;
    })(),
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col items-center justify-center text-stone-600 dark:text-stone-400 font-sans">
        <div className="w-8 h-8 border-2 border-stone-400 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs tracking-wider uppercase font-semibold">Tuning Brainwaves...</p>
      </div>
    );
  }

  const isUserAuthenticated = fbUser && !fbUser.isAnonymous;

  if (!isUserAuthenticated && !isGuestBypassed) {
    return (
      <LoginScreen
        onAuthSuccess={(user) => {
          setFbUser(user);
          if (user.displayName) {
            handleUpdateSettings({ username: user.displayName });
          }
        }}
        onBypassAuth={() => {
          setIsGuestBypassed(true);
          sessionStorage.setItem('ultradian_guest_bypass', 'true');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-stone-50/40 dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans selection:bg-stone-900 selection:text-stone-100 dark:selection:bg-stone-100 dark:selection:text-stone-900 transition-colors duration-300">
      {/* Top Header */}
      <Navbar
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenShare={() => setIsShareOpen(true)}
        onToggleZen={() => setIsZenActive(true)}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        notificationPermission={notificationPermission}
        onRequestNotifications={handleRequestNotifications}
        toggleAmbient={() =>
          handleSelectAmbient(settings.ambientType === 'none' ? 'alpha_binaural' : 'none')
        }
        isAmbientActive={settings.ambientType !== 'none'}
        completedCyclesToday={completedCyclesToday}
        fbUser={fbUser}
      />

      {/* Firebase Configuration Info Banner if Anonymous Auth is disabled */}
      {authError && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border-b border-amber-200/50 dark:border-amber-900/40 px-4 py-3 text-amber-800 dark:text-amber-200 text-xs transition-colors duration-300">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm">⚠️</span>
              <span>
                <strong>Firebase Anonymous Sign-In is disabled:</strong> Go to the Firebase Console &rarr; Authentication &rarr; Sign-in method, and enable <strong>Anonymous</strong>. Meanwhile, your Ultradian waves and stats are safely saved locally!
              </span>
            </div>
            <button 
              onClick={() => setAuthError(null)}
              className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/30 dark:hover:bg-amber-900/50 px-2 py-1 rounded transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Content Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'timer' && (
          <div className="space-y-8 animate-fade-in">
            {/* Primary Timer Component */}
            <TimerRing
              secondsLeft={secondsLeft}
              totalSeconds={totalSeconds}
              isRunning={isRunning}
              sessionType={sessionType}
              currentTask={currentTask}
              onTaskChange={setCurrentTask}
              category={category}
              onCategoryChange={setCategory}
              distractionsCount={distractionsCount}
              onAddDistraction={() => setDistractionsCount((prev) => prev + 1)}
              onStart={handleStart}
              onPause={handlePause}
              onReset={handleReset}
              onSkip={handleSkip}
              completedCyclesCount={completedCyclesToday}
              targetCycles={settings.dailyGoalCycles}
            />

            {/* Ultradian Presets Selection */}
            <PresetSelector
              activePresetId={settings.activePresetId}
              onSelectPreset={handleSelectPreset}
              onOpenCustomSettings={() => setIsSettingsOpen(true)}
            />

            {/* Procedural Ambient Sound Generator */}
            <AmbientPlayer
              activeAmbient={settings.ambientType}
              ambientVolume={settings.ambientVolume}
              onSelectAmbient={handleSelectAmbient}
              onVolumeChange={handleAmbientVolumeChange}
            />
          </div>
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboard
            records={sessionRecords}
            dailyGoalCycles={settings.dailyGoalCycles}
          />
        )}

        {activeTab === 'friends' && (
          <div className="max-w-2xl mx-auto animate-fade-in">
            <SocialShareModal
              userStats={userStats}
              friends={friends}
              onAddFriend={handleAddFriend}
              onClose={() => setActiveTab('timer')}
            />
          </div>
        )}
      </main>

      {/* Zen Distraction-Blocking Fullscreen Overlay */}
      {isZenActive && (
        <ZenMode
          secondsLeft={secondsLeft}
          totalSeconds={totalSeconds}
          isRunning={isRunning}
          sessionType={sessionType}
          currentTask={currentTask}
          distractionsCount={distractionsCount}
          onAddDistraction={() => setDistractionsCount((prev) => prev + 1)}
          onStart={handleStart}
          onPause={handlePause}
          onReset={handleReset}
          onSkip={handleSkip}
          onExit={() => setIsZenActive(false)}
          activeAmbient={settings.ambientType}
          onSelectAmbient={handleSelectAmbient}
        />
      )}

      {/* Post Session Reflection Modal */}
      {completedSessionData && (
        <PostSessionModal
          completedSession={completedSessionData}
          onSave={handleSaveSessionReflection}
          onClose={() => setCompletedSessionData(null)}
        />
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          settings={settings}
          onSaveSettings={handleUpdateSettings}
          onClose={() => setIsSettingsOpen(false)}
          onLogout={handleLogout}
          isAuthenticated={!!fbUser}
          fbUser={fbUser}
        />
      )}

      {/* Social Share Badge Modal */}
      {isShareOpen && activeTab !== 'friends' && (
        <SocialShareModal
          userStats={userStats}
          friends={friends}
          onAddFriend={handleAddFriend}
          onClose={() => setIsShareOpen(false)}
        />
      )}
    </div>
  );
}
