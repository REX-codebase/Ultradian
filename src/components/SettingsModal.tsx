import React, { useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, Play, X, Clock, LogOut, Cloud, UserRound } from 'lucide-react';
import { Sheet } from './Sheet';
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
  const [slideDirection, setSlideDirection] = useState<number>(0);
  const form = workspace.draft;

  const numTabs = SETTINGS_TABS.length;
  const activeIdx = Math.max(0, SETTINGS_TABS.indexOf(workspace.tab));

  const tabsNavRef = useRef<HTMLDivElement | null>(null);

  // Direct dragging state on the settings tab bar
  const [directDrag, setDirectDrag] = useState<{
    isDragging: boolean;
    position: number;
    velocity: number;
  }>({
    isDragging: false,
    position: activeIdx,
    velocity: 0,
  });

  const dragSessionRef = useRef<{
    active: boolean;
    pointerId: number;
    startX: number;
    lastX: number;
    lastTime: number;
    navElement: HTMLElement;
    hasMoved: boolean;
    initialIndex: number;
  } | null>(null);

  // Content body swipe state
  const [bodyDragOffset, setBodyDragOffset] = useState<number>(0);
  const [isBodyDragging, setIsBodyDragging] = useState<boolean>(false);
  const touchStartRef = useRef<{ x: number; y: number; time: number; locked: 'h' | 'v' | null } | null>(null);

  const triggerHaptic = useCallback(() => {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(8);
      }
    } catch {}
  }, []);

  const patchForm = (patch: Partial<UserSettings>) => {
    setWorkspace((current) => editSettingsDraft(current, patch));
  };

  const handleTabChange = useCallback((tab: SettingsTabId) => {
    const fromIdx = SETTINGS_TABS.indexOf(workspace.tab);
    const toIdx = SETTINGS_TABS.indexOf(tab);
    setSlideDirection(toIdx >= fromIdx ? 1 : -1);
    setWorkspace((current) => switchSettingsTab(current, tab));
  }, [workspace.tab]);

  // Pointer drag events on the liquid glass tab bar
  const handleTabsPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const navEl = tabsNavRef.current;
    if (!navEl) return;
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    const rect = navEl.getBoundingClientRect();
    const width = rect.width;
    if (width <= 0) return;

    const slotW = width / numTabs;
    const clickX = Math.max(0, Math.min(width, e.clientX - rect.left));
    const initialIndex = Math.max(0, Math.min(numTabs - 1, clickX / slotW - 0.5));

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}

    dragSessionRef.current = {
      active: true,
      pointerId: e.pointerId,
      startX: e.clientX,
      lastX: e.clientX,
      lastTime: performance.now(),
      navElement: navEl,
      hasMoved: false,
      initialIndex: activeIdx,
    };

    setDirectDrag({
      isDragging: true,
      position: initialIndex,
      velocity: 0,
    });
  };

  const handleTabsPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const session = dragSessionRef.current;
    if (!session || !session.active || session.pointerId !== e.pointerId) return;

    const now = performance.now();
    const dt = Math.max(1, now - session.lastTime);
    const dx = e.clientX - session.lastX;
    const totalDist = Math.abs(e.clientX - session.startX);

    if (totalDist > 4) {
      session.hasMoved = true;
    }

    const velocity = (dx / dt) * 16;
    session.lastX = e.clientX;
    session.lastTime = now;

    const rect = session.navElement.getBoundingClientRect();
    const width = rect.width;
    if (width <= 0) return;

    const slotW = width / numTabs;
    const currentX = Math.max(0, Math.min(width, e.clientX - rect.left));
    const fractionalIndex = Math.max(0, Math.min(numTabs - 1, currentX / slotW - 0.5));

    setDirectDrag({
      isDragging: true,
      position: fractionalIndex,
      velocity,
    });
  };

  const handleTabsPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const session = dragSessionRef.current;
    if (!session || session.pointerId !== e.pointerId) return;

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}

    const wasDragging = session.hasMoved;
    const endPosition = directDrag.position;
    dragSessionRef.current = null;

    if (wasDragging) {
      const targetIdx = Math.max(0, Math.min(numTabs - 1, Math.round(endPosition)));
      const targetTab = SETTINGS_TABS[targetIdx];
      if (targetTab && targetTab !== workspace.tab) {
        triggerHaptic();
        handleTabChange(targetTab);
      }
    }

    setDirectDrag({
      isDragging: false,
      position: activeIdx,
      velocity: 0,
    });
  };

  const handleTabsPointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    const session = dragSessionRef.current;
    if (!session || session.pointerId !== e.pointerId) return;

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}

    dragSessionRef.current = null;
    setDirectDrag({
      isDragging: false,
      position: activeIdx,
      velocity: 0,
    });
  };

  // Content body swipe gesture handlers
  const handleBodyTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    if (!touch) return;
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: performance.now(),
      locked: null,
    };
    setIsBodyDragging(false);
    setBodyDragOffset(0);
  };

  const handleBodyTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const start = touchStartRef.current;
    if (!start) return;
    const touch = e.touches[0];
    if (!touch) return;

    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;

    if (start.locked === null) {
      if (Math.abs(deltaX) > 8 || Math.abs(deltaY) > 8) {
        if (Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
          start.locked = 'h';
        } else {
          start.locked = 'v';
        }
      }
    }

    if (start.locked === 'h') {
      // Prevent page bouncing while horizontally swiping between tabs
      if (e.cancelable) e.preventDefault();
      setIsBodyDragging(true);

      // Rubber-banding at boundaries
      let effectiveOffset = deltaX;
      if ((activeIdx === 0 && deltaX > 0) || (activeIdx === numTabs - 1 && deltaX < 0)) {
        effectiveOffset = deltaX * 0.25;
      }
      setBodyDragOffset(effectiveOffset);
    }
  };

  const handleBodyTouchEnd = () => {
    const start = touchStartRef.current;
    const offset = bodyDragOffset;
    touchStartRef.current = null;
    setIsBodyDragging(false);
    setBodyDragOffset(0);

    if (start && start.locked === 'h' && Math.abs(offset) > 40) {
      if (offset < -40 && activeIdx < numTabs - 1) {
        triggerHaptic();
        handleTabChange(SETTINGS_TABS[activeIdx + 1]);
      } else if (offset > 40 && activeIdx > 0) {
        triggerHaptic();
        handleTabChange(SETTINGS_TABS[activeIdx - 1]);
      }
    }
  };

  // Compute live progress & highlight position
  const bodyProgress = isBodyDragging ? -bodyDragOffset / 300 : 0;
  const isAnyDragging = directDrag.isDragging || isBodyDragging;
  const clampedPosition = directDrag.isDragging
    ? directDrag.position
    : isBodyDragging
      ? Math.max(0, Math.min(numTabs - 1, activeIdx + bodyProgress))
      : activeIdx;

  const currentVelocity = directDrag.isDragging ? directDrag.velocity : bodyProgress * 15;

  const handleTestSound = (soundId: SoundEffectType) => {
    playNotificationSound(soundId, form.soundVolume);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(form);
    onClose();
  };

  return (
    <Sheet open onClose={onClose} labelledBy="settings-title">
      <div className="flex flex-col px-5 pb-6 pt-2 sm:px-8 sm:pb-8 text-[color:var(--ink)]">
        {/* Header with Stable Height */}
        <div className="mb-4 flex items-center justify-between pb-2 border-b border-[color:var(--line)]/40">
          <div>
            <h2 id="settings-title" className="font-serif text-xl text-[color:var(--ink)]">
              Settings
            </h2>
            <p className="mt-0.5 text-xs text-[color:var(--ink-mute)] h-4 leading-4 truncate">
              {TAB_META[workspace.tab].caption}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="pressable inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-[color:var(--ink-mute)] hover:text-[color:var(--ink)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Direct Draggable Liquid Glass Tab Bar */}
        <div
          ref={tabsNavRef}
          role="tablist"
          aria-label="Settings sections"
          className="relative mb-5 flex gap-1 rounded-full bg-[color:var(--line)]/45 p-1 cursor-grab active:cursor-grabbing touch-none select-none border border-[color:var(--line)]/60"
          onPointerDown={handleTabsPointerDown}
          onPointerMove={handleTabsPointerMove}
          onPointerUp={handleTabsPointerUp}
          onPointerCancel={handleTabsPointerCancel}
        >
          {/* Animated Liquid Glass Highlighter Pill */}
          <div className="absolute inset-1 pointer-events-none">
            <motion.div
              className="liquid-glass-pill"
              initial={false}
              animate={{
                left: `${(clampedPosition / numTabs) * 100}%`,
                width: `${100 / numTabs}%`,
                scaleX: isAnyDragging
                  ? 1 + Math.min(Math.abs(currentVelocity) * 0.03 + (directDrag.isDragging ? 0.14 : 0), 0.4)
                  : [1, 1.16, 0.94, 1.04, 1],
                scaleY: isAnyDragging
                  ? 1 - Math.min(Math.abs(currentVelocity) * 0.018 + (directDrag.isDragging ? 0.09 : 0), 0.24)
                  : [1, 0.88, 1.06, 0.98, 1],
                skewX: isAnyDragging ? Math.max(-14, Math.min(14, currentVelocity * -0.4)) : 0,
              }}
              transition={
                isAnyDragging
                  ? { type: 'tween', ease: 'linear', duration: 0.04 }
                  : {
                      type: 'spring',
                      stiffness: 380,
                      damping: 22,
                      mass: 0.7,
                      scaleX: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                      scaleY: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                      skewX: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
                    }
              }
            >
              <div className="liquid-sheen" />
              <div className="liquid-droplet-glow" />
            </motion.div>
          </div>

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
                className={`pressable relative z-10 min-h-10 flex-1 rounded-full px-2 text-xs sm:text-sm font-medium transition-colors duration-200 pointer-events-auto ${
                  selected
                    ? 'text-[color:var(--ink)]'
                    : 'text-[color:var(--ink-mute)] hover:text-[color:var(--ink-soft)]'
                }`}
              >
                <span className="relative z-10">{TAB_META[tab].label}</span>
              </button>
            );
          })}
        </div>

        {/* Stable-Height Content Viewport with Smooth Horizontal Swipe */}
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div
            className="h-[385px] sm:h-[415px] overflow-y-auto overscroll-contain pr-1 space-y-4 touch-pan-y"
            onTouchStart={handleBodyTouchStart}
            onTouchMove={handleBodyTouchMove}
            onTouchEnd={handleBodyTouchEnd}
          >
            <AnimatePresence mode="wait" initial={false} custom={slideDirection}>
              <motion.div
                key={workspace.tab}
                custom={slideDirection}
                initial={{ opacity: 0, x: slideDirection * 20 }}
                animate={{ opacity: 1, x: isBodyDragging ? bodyDragOffset * 0.4 : 0 }}
                exit={{ opacity: 0, x: slideDirection * -20 }}
                transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
                className="space-y-4"
              >
                {/* PROFILE TAB */}
                {workspace.tab === 'profile' && (
                  <div className="space-y-4" data-settings-panel="profile">
                    {fbUser && (
                      <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200/60 dark:border-stone-800/60 flex items-center gap-3.5">
                        <img
                          src={fbUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${fbUser.uid}`}
                          alt={fbUser.displayName || 'User Profile'}
                          referrerPolicy="no-referrer"
                          className="w-11 h-11 rounded-full object-cover border border-stone-200 dark:border-stone-800"
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

                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                        Leaderboard Display Name
                      </label>
                      <input
                        type="text"
                        value={form.username || ''}
                        onChange={(e) => patchForm({ username: e.target.value })}
                        placeholder="e.g. Ultradian Master"
                        className="w-full px-3.5 py-2.5 rounded-lg bg-stone-50 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 text-xs font-semibold text-stone-800 dark:text-stone-200 focus:outline-none focus:border-stone-400"
                      />
                      <p className="text-[10px] text-stone-400 dark:text-stone-500 leading-normal">
                        Published with your verified weekly hours.
                      </p>
                    </div>

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
                        className="pressable flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-[color:var(--line)] text-sm text-[color:var(--ink-soft)] hover:text-[color:var(--ink)]"
                      >
                        <UserRound className="w-3.5 h-3.5" />
                        <span>Revisit ritual</span>
                      </button>
                    )}
                  </div>
                )}

                {/* RHYTHM TAB */}
                {workspace.tab === 'rhythm' && (
                  <div className="space-y-4" data-settings-panel="rhythm">
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1.5 text-stone-400" />
                      Rhythm Interval Widths (Minutes)
                    </h3>

                    <div className="grid grid-cols-3 gap-2.5">
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
                          className="w-full px-3 py-2 rounded-lg bg-stone-50 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 text-xs font-semibold text-stone-800 dark:text-stone-200 focus:outline-none focus:border-stone-400"
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
                          className="w-full px-3 py-2 rounded-lg bg-stone-50 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 text-xs font-semibold text-stone-800 dark:text-stone-200 focus:outline-none focus:border-stone-400"
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
                          className="w-full px-3 py-2 rounded-lg bg-stone-50 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 text-xs font-semibold text-stone-800 dark:text-stone-200 focus:outline-none focus:border-stone-400"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
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
                          className="w-full px-3 py-2 rounded-lg bg-stone-50 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 text-xs font-semibold text-stone-800 dark:text-stone-200 focus:outline-none focus:border-stone-400"
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
                          className="w-full px-3 py-2 rounded-lg bg-stone-50 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 text-xs font-semibold text-stone-800 dark:text-stone-200 focus:outline-none focus:border-stone-400"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* AUDIO TAB */}
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
                            className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
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
                              <span className="text-[10px] text-stone-400 dark:text-stone-500 block mt-0.5">
                                {snd.desc}
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleTestSound(snd.id)}
                              className="p-1.5 rounded-md bg-stone-200/50 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 transition-colors ml-2"
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

                {/* ACCOUNT TAB */}
                {workspace.tab === 'account' && (
                  <div className="space-y-4" data-settings-panel="account">
                    <div className="space-y-2.5 text-xs">
                      <label className="flex items-center justify-between cursor-pointer min-h-10 p-1">
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
                      <label className="flex items-center justify-between cursor-pointer min-h-10 p-1">
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
                      <label className="flex items-center justify-between cursor-pointer min-h-10 p-1">
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

                    <div className="pt-3 border-t border-stone-100 dark:border-stone-800 space-y-2.5">
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
              </motion.div>
            </AnimatePresence>
          </div>

          <button
            type="submit"
            className="pressable mt-3 min-h-11 w-full rounded-full bg-[color:var(--ink)] text-[color:var(--paper)] text-sm font-medium shadow-sm hover:opacity-95"
          >
            Save Changes
          </button>
        </form>
      </div>
    </Sheet>
  );
};
