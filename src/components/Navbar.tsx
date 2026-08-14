import React, { useRef, useState, useCallback } from 'react';
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
  dragProgress?: number;
  isDragging?: boolean;
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
  dragProgress = 0,
  isDragging = false,
}) => {
  const tabs = TABS.filter((tab) => !tab.leagueOnly || settings.enableCompetitiveLeagues);
  const activeIdx = Math.max(0, tabs.findIndex((t) => t.id === activeTab));
  const numTabs = Math.max(1, tabs.length);

  const bottomNavRef = useRef<HTMLElement | null>(null);
  const desktopNavRef = useRef<HTMLElement | null>(null);

  // State for direct dragging on the navbar's liquid glass highlight
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

  const triggerHaptic = useCallback(() => {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(8);
      }
    } catch {}
  }, []);

  const handleNavPointerDown = (e: React.PointerEvent<HTMLElement>, navEl: HTMLElement | null) => {
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

  const handleNavPointerMove = (e: React.PointerEvent<HTMLElement>) => {
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

  const handleNavPointerUp = (e: React.PointerEvent<HTMLElement>) => {
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
      const targetTab = tabs[targetIdx];
      if (targetTab && targetTab.id !== activeTab) {
        triggerHaptic();
        onChangeTab(targetTab.id);
      }
    }

    setDirectDrag({
      isDragging: false,
      position: activeIdx,
      velocity: 0,
    });
  };

  const handleNavPointerCancel = (e: React.PointerEvent<HTMLElement>) => {
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

  // Real-time interpolated position during slide (either from stage gesture or direct navbar touch)
  const isAnyDragging = directDrag.isDragging || isDragging;
  const clampedPosition = directDrag.isDragging
    ? directDrag.position
    : isDragging
      ? Math.max(0, Math.min(numTabs - 1, activeIdx + dragProgress))
      : activeIdx;

  const currentVelocity = directDrag.isDragging ? directDrag.velocity : (dragProgress * 15);

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

          <nav
            ref={desktopNavRef}
            className="relative hidden items-center gap-1 md:flex rounded-full bg-[color:var(--line)]/40 p-1 backdrop-blur-md border border-[color:var(--line)]/60 cursor-grab active:cursor-grabbing touch-none select-none"
            aria-label="Primary"
            onPointerDown={(e) => handleNavPointerDown(e, desktopNavRef.current)}
            onPointerMove={handleNavPointerMove}
            onPointerUp={handleNavPointerUp}
            onPointerCancel={handleNavPointerCancel}
          >
            {/* Desktop Liquid Glass Pill */}
            <div className="absolute inset-1 pointer-events-none">
              <motion.div
                className="liquid-glass-pill"
                initial={false}
                animate={{
                  left: `${(clampedPosition / numTabs) * 100}%`,
                  width: `${100 / numTabs}%`,
                  scaleX: isAnyDragging
                    ? 1 + Math.min(Math.abs(currentVelocity) * 0.025 + (directDrag.isDragging ? 0.12 : 0), 0.38)
                    : [1, 1.15, 0.94, 1.04, 1],
                  scaleY: isAnyDragging
                    ? 1 - Math.min(Math.abs(currentVelocity) * 0.015 + (directDrag.isDragging ? 0.08 : 0), 0.22)
                    : [1, 0.88, 1.06, 0.98, 1],
                  skewX: isAnyDragging ? Math.max(-12, Math.min(12, currentVelocity * -0.35)) : 0,
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

            {tabs.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onChangeTab(tab.id)}
                  className={`relative z-10 min-h-9 min-w-20 rounded-full px-4 text-sm font-medium transition-colors duration-200 pointer-events-auto ${
                    active
                      ? 'text-[color:var(--ink)]'
                      : 'text-[color:var(--ink-mute)] hover:text-[color:var(--ink-soft)]'
                  }`}
                  aria-current={active ? 'page' : undefined}
                >
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

      {/* Floating Island Bottom Nav with Responsive Direct-Draggable Liquid Glass Pill */}
      <nav
        ref={bottomNavRef}
        className="bottom-nav md:hidden relative cursor-grab active:cursor-grabbing touch-none select-none"
        aria-label="Primary"
        onPointerDown={(e) => handleNavPointerDown(e, bottomNavRef.current)}
        onPointerMove={handleNavPointerMove}
        onPointerUp={handleNavPointerUp}
        onPointerCancel={handleNavPointerCancel}
      >
        {/* Animated Liquid Glass Highlighter Track */}
        <div className="absolute inset-x-1.5 inset-y-1.5 pointer-events-none">
          <motion.div
            className="liquid-glass-pill"
            initial={false}
            animate={{
              left: `${(clampedPosition / numTabs) * 100}%`,
              width: `${100 / numTabs}%`,
              scaleX: isAnyDragging
                ? 1 + Math.min(Math.abs(currentVelocity) * 0.035 + (directDrag.isDragging ? 0.16 : 0), 0.45)
                : [1, 1.2, 0.93, 1.05, 1],
              scaleY: isAnyDragging
                ? 1 - Math.min(Math.abs(currentVelocity) * 0.02 + (directDrag.isDragging ? 0.1 : 0), 0.26)
                : [1, 0.86, 1.07, 0.97, 1],
              skewX: isAnyDragging ? Math.max(-15, Math.min(15, currentVelocity * -0.45)) : 0,
            }}
            transition={
              isAnyDragging
                ? { type: 'tween', ease: 'linear', duration: 0.04 }
                : {
                    type: 'spring',
                    stiffness: 350,
                    damping: 20,
                    mass: 0.75,
                    scaleX: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
                    scaleY: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
                    skewX: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
                  }
            }
          >
            <div className="liquid-sheen" />
            <div className="liquid-droplet-glow" />
          </motion.div>
        </div>

        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChangeTab(tab.id)}
              className={`pressable relative z-10 flex min-h-12 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] tracking-wide transition-colors duration-200 pointer-events-auto ${
                active
                  ? 'text-[color:var(--ink)] font-medium'
                  : 'text-[color:var(--ink-mute)] hover:text-[color:var(--ink-soft)]'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              <Icon
                className="h-5 w-5 transition-transform duration-200"
                strokeWidth={active ? 2.15 : 1.6}
              />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
