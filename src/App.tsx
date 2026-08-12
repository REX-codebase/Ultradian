import React, { useState, useEffect, useRef, useCallback, useMemo, lazy, Suspense } from 'react';
import { Navbar } from './components/Navbar';
import { HomeCommandCenter } from './components/HomeCommandCenter';
import { TimerRing } from './components/TimerRing';
import { PersistentTaskDisplay } from './components/PersistentTaskDisplay';
import { CompactTimerBar } from './components/CompactTimerBar';
import { SoftSessionTransition } from './components/SoftSessionTransition';
import { PresetSelector } from './components/PresetSelector';
import { AmbientPlayer } from './components/AmbientPlayer';
import { ZenMode } from './components/ZenMode';
import { ThemeTransitionSpectacle } from './components/ThemeTransitionSpectacle';
import { ProgressiveOverloadBanner, LEVEL_INFO } from './components/ProgressiveOverloadBanner';
import { TribalLeaderboardCard } from './components/TribalLeaderboardCard';
import { PwaInstallPrompt } from './components/PwaInstallPrompt';
import { RecoveryPromptBanner } from './components/RecoveryPromptBanner';
import { LoginScreen } from './components/LoginScreen';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoadingFallback } from './components/LoadingStates';
import { evaluateRecoveryPrompts } from './utils/rhythmEngine';

// Lazy load heavy components for performance optimization
const AnalyticsDashboard = lazy(() => import('./components/AnalyticsDashboard').then(m => ({ default: m.AnalyticsDashboard })));
const PostSessionModal = lazy(() => import('./components/PostSessionModal').then(m => ({ default: m.PostSessionModal })));
const SocialShareModal = lazy(() => import('./components/SocialShareModal').then(m => ({ default: m.SocialShareModal })));
const SettingsModal = lazy(() => import('./components/SettingsModal').then(m => ({ default: m.SettingsModal })));
const LevelUnlockModal = lazy(() => import('./components/LevelUnlockModal').then(m => ({ default: m.LevelUnlockModal })));
const FlexCardModal = lazy(() => import('./components/FlexCardModal').then(m => ({ default: m.FlexCardModal })));
const RitualOnboardingModal = lazy(() => import('./components/RitualOnboardingModal').then(m => ({ default: m.RitualOnboardingModal })));
const VipCodeGate = lazy(() => import('./components/VipCodeGate').then(m => ({ default: m.VipCodeGate })));

import {
  SessionType,
  CategoryTag,
  SessionRecord,
  UserSettings,
  FriendProfile,
  UltradianPreset,
  AmbientSoundType,
  LeagueTier,
  LeagueMember,
  RivalInfo,
} from './types';

import {
  loadSettings,
  saveSettings,
  loadSessionRecords,
  saveSessionRecords,
  addSessionRecord,
  loadFriends,
  saveFriends,
  DEFAULT_PRESETS,
} from './utils/storage';

import {
  initAuthObserver as initAuth,
  syncUserProfileToCloud,
  signOutUser,
} from './services/authService';
import {
  syncSessionToCloud,
  loadCloudSessions,
} from './services/sessionService';
import {
  subscribeToLeaderboard,
  subscribeToLeagueMembers,
  fetchGlobalRank,
  calculateGhostRival,
} from './services/leaderboardService';
import { db } from './lib/firebase';
import { isSampleSession } from './utils/sampleRhythm';
import { getVipState } from './utils/vipAccess';
import { User as FirebaseUser } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

import {
  checkNotificationPermission,
  requestNotificationPermission,
  sendDesktopNotification,
  updateTabTitle,
  resetTabTitle,
} from './utils/notifications';

import { playNotificationSound, startAmbientSound, stopAmbientSound, setAmbientVolume, playRankUpSound, playPhaseTransitionSound } from './utils/audio';
import { Share2, Sparkles, Trophy } from 'lucide-react';

export default function App() {
  // Settings & Theme
  const [settings, setSettings] = useState<UserSettings>(() => loadSettings());
  const [sessionRecords, setSessionRecords] = useState<SessionRecord[]>(() => loadSessionRecords());
  const [friends, setFriends] = useState<FriendProfile[]>(() => loadFriends());

  // Active Timer States
  const [sessionType, setSessionType] = useState<SessionType>('work');
  const [secondsLeft, setSecondsLeft] = useState<number>(settings.workMinutes * 60);
  const [totalSeconds, setTotalSeconds] = useState<number>(settings.workMinutes * 60);
  const [isRunning, setIsRunning] = useState<boolean>(true);

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
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(
    () => !settings.hasCompletedOnboarding
  );
  const [isZenActive, setIsZenActive] = useState<boolean>(false);
  const [isCompactTimer, setIsCompactTimer] = useState<boolean>(false);
  const [softTransition, setSoftTransition] = useState<{ isVisible: boolean; toType: SessionType; durationMins: number } | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isShareOpen, setIsShareOpen] = useState<boolean>(false);
  const [showFlexModal, setShowFlexModal] = useState<boolean>(false);
  const [unlockedLevelModal, setUnlockedLevelModal] = useState<2 | 3 | null>(null);

  const [completedSessionData, setCompletedSessionData] = useState<{
    durationMinutes: number;
    actualSecondsCompleted: number;
    taskName: string;
    category: CategoryTag;
    distractionsCount: number;
  } | null>(null);

  // Matchmaking Leagues & Rival Tracking State
  const [globalRank, setGlobalRank] = useState<number>(1);
  const [currentLeague, setCurrentLeague] = useState<LeagueTier>('wood');
  const [selectedLeague, setSelectedLeague] = useState<LeagueTier>('wood');
  const [leagueMembers, setLeagueMembers] = useState<LeagueMember[]>([]);
  const [rivalInfo, setRivalInfo] = useState<RivalInfo | null>(null);

  // Firebase User & Sync State
  const [fbUser, setFbUser] = useState<FirebaseUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Creator VIP Access Code State
  const [isVipUnlocked, setIsVipUnlocked] = useState<boolean>(() => getVipState().isUnlocked);
  const [isVipModalOpen, setIsVipModalOpen] = useState<boolean>(false);

  // Authorization flag for Special AI Features (Signed in OR VIP Unlocked)
  const isAuthorizedForAi = !!fbUser || isVipUnlocked;

  const handleUnlockVip = () => {
    setIsVipUnlocked(true);
  };

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

    // 1. Sync user profile document to Firestore
    syncUserProfileToCloud(fbUser, {
      current_level: settings.staminaLevel,
      session_count: sessionRecords.filter((r) => !isSampleSession(r)).length,
      tribe_id: settings.tribeId,
    });

    const realDisplayName = fbUser.displayName || (fbUser.email ? fbUser.email.split('@')[0] : '');
    let currentUsername = settings.username;

    if ((!currentUsername || currentUsername === 'Ultradian Achiever') && realDisplayName) {
      currentUsername = realDisplayName;
      const updatedSettings = { ...settings, username: realDisplayName };
      setSettings(updatedSettings);
      saveSettings(updatedSettings);
    }

    // 2. Load cloud sessions and sync missing local sessions
    loadCloudSessions(fbUser.uid).then((cloudRecords) => {
      const cleanCloud = cloudRecords ? cloudRecords.filter((r) => !isSampleSession(r)) : [];

      setSessionRecords((prev) => {
        const cleanPrev = prev.filter((r) => r && r.id && !isSampleSession(r));
        const merged = [...cleanCloud];

        cleanPrev.forEach((localRec) => {
          if (!isSampleSession(localRec) && !merged.some((r) => r.id === localRec.id)) {
            merged.push(localRec);
            syncSessionToCloud(fbUser.uid, localRec);
          }
        });

        const sorted = merged.sort((a, b) => b.timestamp - a.timestamp);
        saveSessionRecords(sorted);
        return sorted;
      });
    });

    // 3. Subscribe to real-time Leaderboard updates
    const unsubscribeLeaderboard = subscribeToLeaderboard(fbUser.uid, (liveLeaderboard) => {
      setFriends(liveLeaderboard);
    });

    return () => {
      unsubscribeLeaderboard();
    };
  }, [fbUser]);

  // Subscribe to real-time Matchmaking League members
  useEffect(() => {
    if (!fbUser) return;

    const unsubscribeLeague = subscribeToLeagueMembers(selectedLeague, fbUser.uid, (members) => {
      setLeagueMembers(members);
      const rival = calculateGhostRival(fbUser.uid, members);
      setRivalInfo(rival);
    });

    return () => {
      unsubscribeLeague();
    };
  }, [fbUser, selectedLeague]);

  // Fetch true Global Rank
  useEffect(() => {
    if (fbUser) {
      const totalHours = sessionRecords
        .filter((r) => !isSampleSession(r) && r.type === 'work')
        .reduce((sum, r) => sum + r.actualSecondsCompleted / 3600, 0);

      fetchGlobalRank(fbUser.uid, totalHours).then((rank) => {
        setGlobalRank(rank);
      });
    }
  }, [fbUser, sessionRecords]);

  // Real rank-up audio effect
  const prevRankRef = useRef<number | null>(null);
  useEffect(() => {
    if (globalRank == null) return;
    if (prevRankRef.current != null && globalRank < prevRankRef.current) {
      playRankUpSound();
    }
    prevRankRef.current = globalRank;
  }, [globalRank]);

  // Exact target timestamp ref to eliminate background tab timing drift
  const endTimeRef = useRef<number | null>(null);

  // Theme Transition Spectacle State
  const [spectacleState, setSpectacleState] = useState<{
    isTransitioning: boolean;
    targetDarkMode: boolean;
    originX: number;
    originY: number;
  }>({
    isTransitioning: false,
    targetDarkMode: settings.darkMode,
    originX: 0,
    originY: 0,
  });

  // Apply dark mode class to root HTML element
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  // Trigger smooth spectacle transition when toggling theme
  const handleToggleTheme = (e?: React.MouseEvent) => {
    const nextDarkMode = !settings.darkMode;
    const clickX = e ? e.clientX : window.innerWidth - 120;
    const clickY = e ? e.clientY : 32;

    const root = document.documentElement;
    root.style.setProperty('--theme-x', `${clickX}px`);
    root.style.setProperty('--theme-y', `${clickY}px`);
    root.classList.add('theme-transition-active');

    setSpectacleState({
      isTransitioning: true,
      targetDarkMode: nextDarkMode,
      originX: clickX,
      originY: clickY,
    });

    const applyChange = () => {
      const updated = { ...settings, darkMode: nextDarkMode };
      setSettings(updated);
      saveSettings(updated);
    };

    applyChange();

    setTimeout(() => {
      root.classList.remove('theme-transition-active');
    }, 850);
  };

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
      playPhaseTransitionSound(nextType);
      setSessionType(nextType);
      applySessionDuration(nextType);

      setSoftTransition({
        isVisible: true,
        toType: nextType,
        durationMins: isLong ? settings.longBreakMinutes : settings.shortBreakMinutes,
      });

      if (settings.autoStartBreaks) {
        setTimeout(() => handleStart(), 1500);
      }
    } else {
      // Break complete
      sendDesktopNotification(
        '☕ Recovery Break Ended!',
        'Your brain is refreshed and ready for another high-performance Ultradian wave.'
      );

      playPhaseTransitionSound('work');
      setSessionType('work');
      applySessionDuration('work');
      setDistractionsCount(0);

      setSoftTransition({
        isVisible: true,
        toType: 'work',
        durationMins: settings.workMinutes,
      });

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

  // Select Level Preset for Progressive Overload
  const handleSelectLevelPreset = (level: 1 | 2 | 3) => {
    const lvlData = LEVEL_INFO[level];
    const newSettings: UserSettings = {
      ...settings,
      workMinutes: lvlData.workMins,
      shortBreakMinutes: lvlData.breakMins,
      staminaLevel: level,
      activePresetId: level === 1 ? 'level_1_apprentice' : level === 2 ? 'level_2_adept' : 'level_3_master',
    };
    setSettings(newSettings);
    saveSettings(newSettings);

    setIsRunning(false);
    setSessionType('work');
    const sec = lvlData.workMins * 60;
    setTotalSeconds(sec);
    setSecondsLeft(sec);
  };

  // Apply Transparent Recommendation or Experiment Config
  const handleApplyRecommendation = (workMins: number, breakMins: number, ambient?: AmbientSoundType) => {
    const newSettings: UserSettings = {
      ...settings,
      workMinutes: workMins,
      shortBreakMinutes: breakMins,
      ambientType: ambient || settings.ambientType,
    };
    setSettings(newSettings);
    saveSettings(newSettings);

    setIsRunning(false);
    setSessionType('work');
    const sec = workMins * 60;
    setTotalSeconds(sec);
    setSecondsLeft(sec);

    if (ambient && ambient !== 'none') {
      handleSelectAmbient(ambient);
    }
  };

  // Dynamic Recovery Prompts derived from session history
  const activeRecoveryPrompts = useMemo(() => {
    const lastSession = sessionRecords[0];
    return evaluateRecoveryPrompts(sessionRecords, lastSession ? {
      durationMinutes: lastSession.durationMinutes,
      focusRating: lastSession.focusRating,
      energyLevelBefore: lastSession.energyLevelBefore,
      energyLevelAfter: lastSession.energyLevelAfter,
      distractionsCount: lastSession.distractionsCount,
    } : undefined);
  }, [sessionRecords]);

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

  // Save Post-Session Reflection Record & Handle Progressive Overload Level Unlocks
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

    // Progressive Overload Level Advancement Check
    let nextStaminaLevel = settings.staminaLevel;
    let lvl1Count = settings.level1SessionsCompleted;
    let lvl2Count = settings.level2SessionsCompleted;
    let lvl3Count = settings.level3SessionsCompleted;

    if (settings.staminaLevel === 1) {
      lvl1Count += 1;
      if (lvl1Count >= 5) {
        setUnlockedLevelModal(2);
      }
    } else if (settings.staminaLevel === 2) {
      lvl2Count += 1;
      if (lvl2Count >= 5) {
        setUnlockedLevelModal(3);
      }
    } else {
      lvl3Count += 1;
    }

    const updatedSettings: UserSettings = {
      ...settings,
      level1SessionsCompleted: lvl1Count,
      level2SessionsCompleted: lvl2Count,
      level3SessionsCompleted: lvl3Count,
    };

    setSettings(updatedSettings);
    saveSettings(updatedSettings);

    // Sync to cloud Firestore
    if (fbUser) {
      syncSessionToCloud(fbUser.uid, newRecord);
      syncUserProfileToCloud(fbUser, {
        current_level: updatedSettings.staminaLevel,
        session_count: updated.length,
        tribe_id: settings.tribeId,
      });
    }
  };

  // Claim Level Up Modal Action
  const handleClaimLevelUp = () => {
    if (!unlockedLevelModal) return;
    const targetLvl = unlockedLevelModal;
    setUnlockedLevelModal(null);
    handleSelectLevelPreset(targetLvl);
  };

  // Update Settings
  const handleUpdateSettings = (partial: Partial<UserSettings>) => {
    const updated = { ...settings, ...partial };
    setSettings(updated);
    saveSettings(updated);
    applySessionDuration(sessionType);

    if (fbUser) {
      syncUserProfileToCloud(fbUser, {
        current_level: updated.staminaLevel,
        session_count: sessionRecords.length,
        tribe_id: updated.tribeId,
      });
    }
  };

  // Select Tribe
  const handleSelectTribe = (tribeId: string) => {
    handleUpdateSettings({ tribeId });
  };

  // Disconnect / Log Out handler
  const handleLogout = async () => {
    try {
      await signOutUser();
      setFbUser(null);
    } catch (err) {
      console.error('Failed to log out:', err);
    }
  };



  // Compute stats for social badge dynamically based on real work sessions
  const userStats = (() => {
    const realSessions = sessionRecords.filter((r) => !isSampleSession(r));
    const now = Date.now();
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    const past7Days = realSessions.filter((r) => now - r.timestamp <= SEVEN_DAYS_MS && r.type === 'work');
    const totFocusMins = past7Days.reduce((acc, r) => acc + Math.round(r.actualSecondsCompleted / 60), 0);
    const weeklyHours = Math.round((totFocusMins / 60) * 10) / 10;
    const completedCycles = realSessions.filter((r) => r.type === 'work').length;

    const rated = realSessions.filter((r) => r.type === 'work' && r.focusRating);
    const focusScore = rated.length === 0 ? 0 : Math.round((rated.reduce((acc, r) => acc + (r.focusRating || 5), 0) / rated.length) * 20);

    const minsByCat: Record<string, number> = {};
    realSessions.forEach((r) => {
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

    return { weeklyHours, completedCycles, focusScore, topCategory: topCat };
  })();

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col items-center justify-center text-stone-600 dark:text-stone-400 font-sans">
        <div className="w-8 h-8 border-2 border-stone-400 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs tracking-wider uppercase font-semibold">Tuning Brainwaves...</p>
      </div>
    );
  }

  // Latest session for flex card
  const latestSession = sessionRecords[0] || null;

  return (
    <div className="min-h-screen bg-stone-50/40 dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans selection:bg-stone-900 selection:text-stone-100 dark:selection:bg-stone-100 dark:selection:text-stone-900 transition-colors duration-300">
      {/* Top Header */}
      <Navbar
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onToggleTheme={handleToggleTheme}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenShare={() => setIsShareOpen(true)}
        onToggleZen={() => setIsZenActive(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenRitualOnboarding={() => setIsOnboardingOpen(true)}
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
        isVipUnlocked={isVipUnlocked}
        onOpenVipGate={() => setIsVipModalOpen(true)}
      />

      {/* Visual Theme Transition Spectacle Canvas & Waves */}
      <ThemeTransitionSpectacle
        isTransitioning={spectacleState.isTransitioning}
        targetDarkMode={spectacleState.targetDarkMode}
        originX={spectacleState.originX}
        originY={spectacleState.originY}
        onComplete={() =>
          setSpectacleState((prev) => ({ ...prev, isTransitioning: false }))
        }
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
        {/* Task 1.2 PWA Native App Prompt Banner */}
        <PwaInstallPrompt />

        {activeTab === 'timer' && (
          <div className="space-y-8 animate-fade-in">
            {/* Primary Single Home Experience: Command Center Dashboard */}
            <HomeCommandCenter
              currentTask={currentTask}
              onTaskChange={setCurrentTask}
              category={category}
              onCategoryChange={setCategory}
              secondsLeft={secondsLeft}
              totalSeconds={totalSeconds}
              isRunning={isRunning}
              sessionType={sessionType}
              onStart={handleStart}
              onPause={handlePause}
              onReset={handleReset}
              onSkip={handleSkip}
              distractionsCount={distractionsCount}
              onAddDistraction={() => setDistractionsCount((prev) => prev + 1)}
              completedCyclesToday={completedCyclesToday}
              targetCycles={settings.dailyGoalCycles}
              settings={settings}
              onSelectPreset={handleSelectPreset}
              onApplyRecommendation={handleApplyRecommendation}
              sessionRecords={sessionRecords}
              activeAmbient={settings.ambientType}
              onToggleAmbient={() =>
                handleSelectAmbient(settings.ambientType === 'none' ? 'alpha_binaural' : 'none')
              }
              onToggleZen={() => setIsZenActive(true)}
              onOpenSettings={() => setIsSettingsOpen(true)}
              isAuthorizedForAi={isAuthorizedForAi}
              onOpenAuth={() => setIsAuthModalOpen(true)}
              onUnlockVip={handleUnlockVip}
            />

            {/* Contextual Recovery & Micro-Habit Prompts */}
            <RecoveryPromptBanner
              prompts={activeRecoveryPrompts}
              onStartMicroHabit={(habit) => {
                if (habit === 'theta_soundscape') handleSelectAmbient('theta_binaural');
              }}
            />

            {/* Task 1.1 Progressive Overload Stamina Banner */}
            <ProgressiveOverloadBanner
              staminaLevel={settings.staminaLevel}
              level1SessionsCompleted={settings.level1SessionsCompleted}
              level2SessionsCompleted={settings.level2SessionsCompleted}
              level3SessionsCompleted={settings.level3SessionsCompleted}
              onSelectLevelPreset={handleSelectLevelPreset}
            />

            {/* Procedural Ambient Sound Generator & Soundscape Presets */}
            <AmbientPlayer
              activeAmbient={settings.ambientType}
              ambientVolume={settings.ambientVolume}
              onSelectAmbient={handleSelectAmbient}
              onVolumeChange={handleAmbientVolumeChange}
            />
          </div>
        )}

        {activeTab === 'analytics' && (
          <ErrorBoundary>
            <Suspense fallback={<LoadingFallback label="Loading Analytics Dashboard..." />}>
              <AnalyticsDashboard
                records={sessionRecords}
                dailyGoalCycles={settings.dailyGoalCycles}
                settings={settings}
                onApplyRecommendation={handleApplyRecommendation}
                isAuthorizedForAi={isAuthorizedForAi}
                onOpenAuth={() => setIsAuthModalOpen(true)}
                onUnlockVip={handleUnlockVip}
              />
            </Suspense>
          </ErrorBoundary>
        )}

        {activeTab === 'friends' && settings.enableCompetitiveLeagues && (
          <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            {/* Task 3.2 Tribal Leaderboard Card */}
            <TribalLeaderboardCard
              userTribeId={settings.tribeId}
              onSelectTribe={handleSelectTribe}
              userWeeklyHours={userStats.weeklyHours}
            />

            <ErrorBoundary>
              <Suspense fallback={<LoadingFallback label="Loading Social Leaderboard..." />}>
                <SocialShareModal
                  userStats={userStats}
                  friends={friends}
                  globalRank={globalRank}
                  rivalInfo={rivalInfo}
                  currentLeague={currentLeague}
                  leagueMembers={leagueMembers}
                  onSelectLeague={setSelectedLeague}
                  onAddFriend={handleAddFriend}
                  isInline={true}
                />
              </Suspense>
            </ErrorBoundary>
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

      {/* Post Session Reflection Modal (Phase 2 AI Journal) */}
      {completedSessionData && (
        <ErrorBoundary>
          <Suspense fallback={<LoadingFallback label="Loading Journal Modal..." />}>
            <PostSessionModal
              completedSession={completedSessionData}
              onSave={handleSaveSessionReflection}
              onClose={() => setCompletedSessionData(null)}
            />
          </Suspense>
        </ErrorBoundary>
      )}

      {/* Soft Session Phase Transition Overlay */}
      {softTransition && (
        <SoftSessionTransition
          isVisible={softTransition.isVisible}
          toType={softTransition.toType}
          durationMins={softTransition.durationMins}
          onContinue={() => setSoftTransition(null)}
        />
      )}

      {/* Task 1.1 Progressive Overload Level Unlock Modal */}
      {unlockedLevelModal && (
        <ErrorBoundary>
          <Suspense fallback={<LoadingFallback label="Loading Level Unlock..." />}>
            <LevelUnlockModal
              unlockedLevel={unlockedLevelModal}
              onClaimLevel={handleClaimLevelUp}
            />
          </Suspense>
        </ErrorBoundary>
      )}

      {/* Task 3.1 Flex Card PNG Export Modal */}
      {showFlexModal && (
        <ErrorBoundary>
          <Suspense fallback={<LoadingFallback label="Loading Flex Card..." />}>
            <FlexCardModal
              session={latestSession}
              settings={settings}
              onClose={() => setShowFlexModal(false)}
            />
          </Suspense>
        </ErrorBoundary>
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <ErrorBoundary>
          <Suspense fallback={<LoadingFallback label="Loading Settings..." />}>
            <SettingsModal
              settings={settings}
              onSaveSettings={handleUpdateSettings}
              onClose={() => setIsSettingsOpen(false)}
              onLogout={handleLogout}
              onOpenAuth={() => setIsAuthModalOpen(true)}
              onOpenRitualOnboarding={() => setIsOnboardingOpen(true)}
              isAuthenticated={!!fbUser}
              fbUser={fbUser}
            />
          </Suspense>
        </ErrorBoundary>
      )}

      {/* Ritual Onboarding Modal (3 steps, < 60s, Archetype & 114+ Professions) */}
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback label="Loading Onboarding..." />}>
          <RitualOnboardingModal
            isOpen={isOnboardingOpen}
            onClose={() => setIsOnboardingOpen(false)}
            settings={settings}
            onCompleteOnboarding={(updatedSettings) => {
              handleUpdateSettings(updatedSettings);
              if (updatedSettings.ambientType && updatedSettings.ambientType !== 'none') {
                handleSelectAmbient(updatedSettings.ambientType);
              }
            }}
          />
        </Suspense>
      </ErrorBoundary>

      {/* Cloud Sync / Sign In Modal */}
      {isAuthModalOpen && (
        <LoginScreen
          isModal
          onClose={() => setIsAuthModalOpen(false)}
          onAuthSuccess={(user) => {
            setFbUser(user);
            setIsAuthModalOpen(false);
            if (user.displayName) {
              handleUpdateSettings({ username: user.displayName });
            }
          }}
        />
      )}

      {/* Creator VIP Access Code Modal */}
      {isVipModalOpen && (
        <ErrorBoundary>
          <Suspense fallback={<LoadingFallback label="Loading VIP Gate..." />}>
            <VipCodeGate
              isInline={false}
              featureName="Creator VIP Code Verification"
              featureDescription="Enter your secret Creator VIP Code to unlock all current and future features across Ultradian Pulse without signing in. Maximum 2 attempts allowed."
              onCloseModal={() => setIsVipModalOpen(false)}
              onUnlocked={() => {
                handleUnlockVip();
                setIsVipModalOpen(false);
              }}
              onOpenAuth={() => {
                setIsVipModalOpen(false);
                setIsAuthModalOpen(true);
              }}
            />
          </Suspense>
        </ErrorBoundary>
      )}

      {/* Social Share Badge Modal */}
      {isShareOpen && activeTab !== 'friends' && (
        <ErrorBoundary>
          <Suspense fallback={<LoadingFallback label="Loading Share Modal..." />}>
            <SocialShareModal
              userStats={userStats}
              friends={friends}
              globalRank={globalRank}
              rivalInfo={rivalInfo}
              currentLeague={currentLeague}
              leagueMembers={leagueMembers}
              onSelectLeague={setSelectedLeague}
              onAddFriend={handleAddFriend}
              onClose={() => setIsShareOpen(false)}
            />
          </Suspense>
        </ErrorBoundary>
      )}
    </div>
  );
}
