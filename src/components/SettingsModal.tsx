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
      if (!session.hasMoved) {
        session.hasMoved = true;
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {}
      }
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

        {/* Liquid Glass Tab Bar */}
        <div
          ref={tabsNavRef}
          role="tablist"
          aria-label="Settings sections"
          className="relative mb-5 flex gap-1 rounded-full bg-[color:var(--line)]/45 p-1 select-none border border-[color:var(--line)]/60 shadow-xs"
        >
          {/* Animated Liquid Glass Highlighter Pill */}
          <div className="absolute inset-1 pointer-events-none">
            <motion.div
              className="liquid-glass-pill"
              initial={false}
              animate={{
                left: `${(activeIdx / numTabs) * 100}%`,
                width: `${100 / numTabs}%`,
              }}
              transition={{
                type: 'spring',
                stiffness: 420,
                damping: 28,
                mass: 0.65,
              }}
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
                onClick={() => {
                  triggerHaptic();
                  handleTabChange(tab);
                }}
                className={`pressable relative z-10 min-h-10 flex-1 rounded-full px-2 text-xs sm:text-sm font-medium transition-colors duration-200 pointer-events-auto cursor-pointer ${
                  selected
                    ? 'text-[color:var(--ink)] font-semibold'
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
                      <div className="p-3.5 rounded-2xl swift-grouped-list flex items-center gap-3.5 shadow-xs">
                        <img
                          src={fbUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${fbUser.uid}`}
                          alt={fbUser.displayName || 'User Profile'}
                          referrerPolicy="no-referrer"
                          className="w-11 h-11 rounded-full object-cover border border-[color:var(--line)]"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-[9px] font-bold text-[color:var(--ink-mute)] uppercase tracking-wider block">
                            Signed in
                          </span>
                          <h4 className="text-sm font-bold text-[color:var(--ink)] truncate">
                            {fbUser.displayName || 'Anonymous'}
                          </h4>
                          <p className="text-[10px] text-[color:var(--ink-soft)] truncate">
                            {fbUser.email || 'guest-session@ultradian.app'}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label htmlFor="settings-username" className="block text-[10px] font-bold uppercase tracking-wider text-[color:var(--ink-mute)]">
                        Leaderboard Display Name
                      </label>
                      <input
                        id="settings-username"
                        name="username"
                        aria-label="Leaderboard Display Name"
                        type="text"
                        value={form.username || ''}
                        onChange={(e) => patchForm({ username: e.target.value })}
                        placeholder="e.g. Ultradian Master"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[color:var(--paper)] border border-[color:var(--line)] text-xs font-semibold text-[color:var(--ink)] focus:outline-none focus:border-[color:var(--ink)] shadow-xs"
                      />
                      <p className="text-[10px] text-[color:var(--ink-mute)] leading-normal">
                        Published with your verified weekly hours.
                      </p>
                    </div>

                    {(form.focusRitualName || form.profession) && (
                      <div className="rounded-2xl swift-grouped-list p-4 text-xs text-[color:var(--ink-soft)]">
                        <p className="font-serif text-sm text-[color:var(--ink)] font-medium">
                          {form.focusRitualName || 'Unnamed ritual'}
                        </p>
                        <p className="mt-1 text-[11px] text-[color:var(--ink-mute)]">
                          {[form.profession, form.archetype].filter(Boolean).join(' · ')}
                        </p>
                      </div>
                    )}

                    {onOpenRitualOnboarding && (
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.96 }}
                        transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                        onClick={() => {
                          onClose();
                          onOpenRitualOnboarding();
                        }}
                        className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-[color:var(--line)] text-sm text-[color:var(--ink-soft)] hover:text-[color:var(--ink)] hover:bg-[color:var(--line)]/30 transition-colors cursor-pointer"
                      >
                        <UserRound className="w-3.5 h-3.5" />
                        <span>Revisit ritual</span>
                      </motion.button>
                    )}
                  </div>
                )}

                {/* RHYTHM TAB */}
                {workspace.tab === 'rhythm' && (
                  <div className="space-y-4" data-settings-panel="rhythm">
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-[color:var(--ink-mute)] flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1.5 text-[color:var(--ink-mute)]" />
                      Rhythm Interval Widths (Minutes)
                    </h3>

                    <div className="grid grid-cols-3 gap-2.5">
                      <div>
                        <label htmlFor="settings-work-minutes" className="block text-[10px] font-bold text-[color:var(--ink-mute)] mb-1 tracking-wider uppercase">
                          Work Wave
                        </label>
                        <input
                          id="settings-work-minutes"
                          name="workMinutes"
                          aria-label="Work Wave duration in minutes"
                          type="number"
                          min="1"
                          max="180"
                          value={form.workMinutes}
                          onChange={(e) => patchForm({ workMinutes: parseInt(e.target.value) || 90 })}
                          className="w-full px-3 py-2 rounded-xl bg-[color:var(--paper)] border border-[color:var(--line)] text-xs font-semibold text-[color:var(--ink)] focus:outline-none focus:border-[color:var(--ink)] shadow-xs"
                        />
                      </div>
                      <div>
                        <label htmlFor="settings-short-break-minutes" className="block text-[10px] font-bold text-[color:var(--ink-mute)] mb-1 tracking-wider uppercase">
                          Short Rest
                        </label>
                        <input
                          id="settings-short-break-minutes"
                          name="shortBreakMinutes"
                          aria-label="Short Rest duration in minutes"
                          type="number"
                          min="1"
                          max="60"
                          value={form.shortBreakMinutes}
                          onChange={(e) => patchForm({ shortBreakMinutes: parseInt(e.target.value) || 20 })}
                          className="w-full px-3 py-2 rounded-xl bg-[color:var(--paper)] border border-[color:var(--line)] text-xs font-semibold text-[color:var(--ink)] focus:outline-none focus:border-[color:var(--ink)] shadow-xs"
                        />
                      </div>
                      <div>
                        <label htmlFor="settings-long-break-minutes" className="block text-[10px] font-bold text-[color:var(--ink-mute)] mb-1 tracking-wider uppercase">
                          Long Rest
                        </label>
                        <input
                          id="settings-long-break-minutes"
                          name="longBreakMinutes"
                          aria-label="Long Rest duration in minutes"
                          type="number"
                          min="1"
                          max="90"
                          value={form.longBreakMinutes}
                          onChange={(e) => patchForm({ longBreakMinutes: parseInt(e.target.value) || 30 })}
                          className="w-full px-3 py-2 rounded-xl bg-[color:var(--paper)] border border-[color:var(--line)] text-xs font-semibold text-[color:var(--ink)] focus:outline-none focus:border-[color:var(--ink)] shadow-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <label htmlFor="settings-daily-goal-cycles" className="block text-[10px] font-bold text-[color:var(--ink-mute)] mb-1.5 tracking-wider uppercase">
                          Daily Wave Goal (Cycles)
                        </label>
                        <input
                          id="settings-daily-goal-cycles"
                          name="dailyGoalCycles"
                          aria-label="Daily Wave Goal in cycles"
                          type="number"
                          min="1"
                          max="10"
                          value={form.dailyGoalCycles}
                          onChange={(e) => patchForm({ dailyGoalCycles: parseInt(e.target.value) || 3 })}
                          className="w-full px-3 py-2 rounded-xl bg-[color:var(--paper)] border border-[color:var(--line)] text-xs font-semibold text-[color:var(--ink)] focus:outline-none focus:border-[color:var(--ink)] shadow-xs"
                        />
                      </div>
                      <div>
                        <label htmlFor="settings-cycles-before-long-break" className="block text-[10px] font-bold text-[color:var(--ink-mute)] mb-1.5 tracking-wider uppercase">
                          Waves Before Long Rest
                        </label>
                        <input
                          id="settings-cycles-before-long-break"
                          name="cyclesBeforeLongBreak"
                          aria-label="Waves Before Long Rest"
                          type="number"
                          min="1"
                          max="6"
                          value={form.cyclesBeforeLongBreak}
                          onChange={(e) => patchForm({ cyclesBeforeLongBreak: parseInt(e.target.value) || 2 })}
                          className="w-full px-3 py-2 rounded-xl bg-[color:var(--paper)] border border-[color:var(--line)] text-xs font-semibold text-[color:var(--ink)] focus:outline-none focus:border-[color:var(--ink)] shadow-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* AUDIO TAB */}
                {workspace.tab === 'audio' && (
                  <div className="space-y-4" data-settings-panel="audio">
                    <div className="flex items-center justify-between p-3 rounded-2xl swift-grouped-list shadow-xs">
                      <label htmlFor="settings-sound-volume" className="text-xs font-semibold text-[color:var(--ink)] flex items-center cursor-pointer">
                        <Volume2 className="w-3.5 h-3.5 mr-2 text-[color:var(--ink-mute)]" />
                        Alert Volume
                      </label>
                      <input
                        id="settings-sound-volume"
                        name="soundVolume"
                        aria-label="Audio alert volume"
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={form.soundVolume}
                        onChange={(e) => patchForm({ soundVolume: parseFloat(e.target.value) })}
                        className="liquid-slider w-28"
                      />
                    </div>

                    <div className="swift-grouped-list divide-y divide-[color:var(--line)]/50 shadow-xs">
                      {SOUND_OPTIONS.map((snd) => {
                        const isSelected = form.soundEffect === snd.id;
                        return (
                          <div
                            key={snd.id}
                            className={`flex items-center justify-between p-3.5 transition-colors duration-150 ${
                              isSelected ? 'bg-[color:var(--line)]/30' : 'hover:bg-[color:var(--line)]/15'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                triggerHaptic();
                                patchForm({ soundEffect: snd.id });
                              }}
                              className="flex-1 text-left cursor-pointer"
                            >
                              <span className="font-serif text-sm font-medium text-[color:var(--ink)] block">
                                {snd.label}
                              </span>
                              <span className="text-[10px] text-[color:var(--ink-mute)] block mt-0.5">
                                {snd.desc}
                              </span>
                            </button>
                            <motion.button
                              type="button"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleTestSound(snd.id)}
                              className="p-2 rounded-full bg-[color:var(--line)]/60 hover:bg-[color:var(--line)] text-[color:var(--ink)] transition-colors ml-2 cursor-pointer shadow-xs"
                              title="Preview sound"
                            >
                              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                            </motion.button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ACCOUNT TAB */}
                {workspace.tab === 'account' && (
                  <div className="space-y-4" data-settings-panel="account">
                    {/* iOS Inset Grouped Toggle List */}
                    <div className="swift-grouped-list shadow-xs">
                      <div className="swift-list-row">
                        <span className="font-medium text-xs text-[color:var(--ink)]">
                          Competitive leagues
                        </span>
                        <div
                          role="switch"
                          aria-checked={form.enableCompetitiveLeagues ?? true}
                          tabIndex={0}
                          onClick={() => {
                            triggerHaptic();
                            patchForm({ enableCompetitiveLeagues: !(form.enableCompetitiveLeagues ?? true) });
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              triggerHaptic();
                              patchForm({ enableCompetitiveLeagues: !(form.enableCompetitiveLeagues ?? true) });
                            }
                          }}
                          className={`swift-toggle ${(form.enableCompetitiveLeagues ?? true) ? 'is-active' : ''}`}
                        >
                          <span className="swift-toggle-thumb" />
                        </div>
                      </div>

                      <div className="swift-list-row">
                        <span className="font-medium text-xs text-[color:var(--ink)]">
                          Start break when work ends
                        </span>
                        <div
                          role="switch"
                          aria-checked={form.autoStartBreaks}
                          tabIndex={0}
                          onClick={() => {
                            triggerHaptic();
                            patchForm({ autoStartBreaks: !form.autoStartBreaks });
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              triggerHaptic();
                              patchForm({ autoStartBreaks: !form.autoStartBreaks });
                            }
                          }}
                          className={`swift-toggle ${form.autoStartBreaks ? 'is-active' : ''}`}
                        >
                          <span className="swift-toggle-thumb" />
                        </div>
                      </div>

                      <div className="swift-list-row">
                        <span className="font-medium text-xs text-[color:var(--ink)]">
                          Start work when break ends
                        </span>
                        <div
                          role="switch"
                          aria-checked={form.autoStartWork}
                          tabIndex={0}
                          onClick={() => {
                            triggerHaptic();
                            patchForm({ autoStartWork: !form.autoStartWork });
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              triggerHaptic();
                              patchForm({ autoStartWork: !form.autoStartWork });
                            }
                          }}
                          className={`swift-toggle ${form.autoStartWork ? 'is-active' : ''}`}
                        >
                          <span className="swift-toggle-thumb" />
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 space-y-2.5">
                      <div className="flex items-center justify-between text-xs px-1">
                        <span className="font-semibold text-[color:var(--ink-mute)]">Cloud Sync Status</span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                            isAuthenticated
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                              : 'bg-[color:var(--line)]/50 text-[color:var(--ink-mute)] border border-[color:var(--line)]'
                          }`}
                        >
                          {isAuthenticated ? 'Active Profile' : 'Local Guest Sandbox'}
                        </span>
                      </div>

                      {isAuthenticated ? (
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.96 }}
                          transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                          onClick={() => {
                            triggerHaptic();
                            if (onLogout) {
                              onLogout();
                              onClose();
                            }
                          }}
                          className="w-full min-h-11 py-2.5 px-4 rounded-full border border-red-300/60 hover:bg-red-500/10 text-red-600 dark:text-red-400 font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Disconnect Cloud Session</span>
                        </motion.button>
                      ) : (
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.96 }}
                          transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                          onClick={() => {
                            triggerHaptic();
                            onClose();
                            if (onOpenAuth) {
                              onOpenAuth();
                            } else if (onLogout) {
                              onLogout();
                            }
                          }}
                          className="w-full min-h-11 py-2.5 px-4 rounded-full border border-[color:var(--line)] hover:bg-[color:var(--line)]/40 text-[color:var(--ink)] font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                        >
                          <Cloud className="w-3.5 h-3.5" />
                          <span>Sign In / Create Account</span>
                        </motion.button>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 450, damping: 25 }}
            className="swift-pill-cta mt-4 min-h-12 w-full flex items-center justify-center text-sm font-medium cursor-pointer shadow-md"
          >
            Save Changes
          </motion.button>
        </form>
      </div>
    </Sheet>
  );
};
