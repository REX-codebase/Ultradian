import React, { useRef, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  UltradianLogo,
  IconFocus,
  IconRhythm,
  IconLeague,
  IconSun,
  IconMoon,
  IconSettings,
  IconClose,
} from './icons';
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
  isOrb?: boolean;
  onCloseSheet?: () => void;
}

const TABS: Array<{ id: 'timer' | 'analytics' | 'friends'; label: string; icon: React.FC<any>; leagueOnly?: boolean }> = [
  { id: 'timer', label: 'Focus', icon: IconFocus },
  { id: 'analytics', label: 'Rhythm', icon: IconRhythm },
  { id: 'friends', label: 'League', icon: IconLeague, leagueOnly: true },
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
  isOrb = false,
  onCloseSheet,
}) => {
  const reduceMotion = useReducedMotion();
  const tabs = TABS.filter((tab) => !tab.leagueOnly || settings.enableCompetitiveLeagues);
  const activeIdx = Math.max(0, tabs.findIndex((t) => t.id === activeTab));
  const numTabs = Math.max(1, tabs.length);

  const [mounted, setMounted] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(() => (typeof window !== 'undefined' ? window.innerHeight : 800));

  useEffect(() => {
    setMounted(true);
    const handleResize = () => {
      setViewportHeight(window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    if (isOrb) return;
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
    if (isOrb) return;
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
    if (isOrb) return;
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
    if (isOrb) return;
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

  const mobileNavElement = (
    <motion.nav
      ref={bottomNavRef}
      role="tablist"
      aria-label={isOrb ? 'Close modal and restore navigation' : 'Main navigation'}
      title={isOrb ? 'Tap to return to navigation' : undefined}
      className={`bottom-nav md:hidden select-none ${
        isOrb ? 'cursor-pointer pointer-events-auto' : 'cursor-grab active:cursor-grabbing'
      }`}
      onClick={
        isOrb
          ? () => {
              triggerHaptic();
              onCloseSheet?.();
            }
          : undefined
      }
      onKeyDown={
        isOrb
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                triggerHaptic();
                onCloseSheet?.();
              }
            }
          : undefined
      }
      onPointerDown={(e) => handleNavPointerDown(e, bottomNavRef.current)}
      onPointerMove={handleNavPointerMove}
      onPointerUp={handleNavPointerUp}
      onPointerCancel={handleNavPointerCancel}
      initial={false}
      animate={{
        x: '-50%',
        y: isOrb ? -(viewportHeight - 74) : 0,
        width: isOrb ? 48 : 'min(calc(100vw - 2rem), 26rem)',
        height: isOrb ? 48 : 66,
        borderRadius: 999,
        padding: isOrb ? '0px' : '0.35rem',
      }}
      transition={
        reduceMotion
          ? { duration: 0.01 }
          : {
              type: 'spring',
              stiffness: 380,
              damping: 28,
              mass: 0.72,
            }
      }
      whileHover={isOrb ? { scale: 1.08 } : undefined}
      whileTap={isOrb ? { scale: 0.90 } : undefined}
    >
      {/* Animated Liquid Glass Highlighter Track (Capsule mode) */}
      <motion.div
        className="absolute inset-x-1.5 inset-y-1.5 pointer-events-none overflow-hidden rounded-full"
        animate={{
          opacity: isOrb ? 0 : 1,
          scale: isOrb ? 0.35 : 1,
        }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          className="liquid-glass-pill"
          initial={false}
          style={{
            width: `${100 / numTabs}%`,
          }}
          animate={{
            x: `${clampedPosition * 100}%`,
            scaleX: reduceMotion
              ? 1
              : isAnyDragging
                ? 1 + Math.min(Math.abs(currentVelocity) * 0.035 + (directDrag.isDragging ? 0.16 : 0), 0.45)
                : [1, 1.18, 0.94, 1.04, 1],
            scaleY: reduceMotion
              ? 1
              : isAnyDragging
                ? 1 - Math.min(Math.abs(currentVelocity) * 0.02 + (directDrag.isDragging ? 0.1 : 0), 0.26)
                : [1, 0.88, 1.06, 0.98, 1],
            skewX: reduceMotion ? 0 : isAnyDragging ? Math.max(-14, Math.min(14, currentVelocity * -0.4)) : 0,
          }}
          transition={
            reduceMotion
              ? { duration: 0.01 }
              : isAnyDragging
                ? { type: 'tween', ease: 'linear', duration: 0.04 }
                : {
                    type: 'spring',
                    stiffness: 420,
                    damping: 26,
                    mass: 0.65,
                    scaleX: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                    scaleY: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                    skewX: { duration: 0.38, ease: [0.16, 1, 0.3, 1] },
                  }
          }
        >
          <div className="liquid-sheen" />
          <div className="liquid-droplet-glow" />
        </motion.div>
      </motion.div>

      {/* Tab Buttons (Capsule mode) */}
      <motion.div
        className="relative z-10 flex w-full h-full items-center justify-between pointer-events-auto"
        animate={{
          opacity: isOrb ? 0 : 1,
          scale: isOrb ? 0.65 : 1,
          pointerEvents: isOrb ? 'none' : 'auto',
        }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              tabIndex={isOrb ? -1 : 0}
              onClick={() => {
                if (!isOrb) {
                  triggerHaptic();
                  onChangeTab(tab.id);
                }
              }}
              className={`group relative z-10 flex min-h-12 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium tracking-wide transition-colors duration-200 ${
                active
                  ? 'text-[color:var(--ink)]'
                  : 'text-[color:var(--ink-mute)] hover:text-[color:var(--ink-soft)]'
              }`}
              aria-selected={active}
              aria-current={active ? 'page' : undefined}
            >
              <motion.div
                animate={
                  reduceMotion
                    ? {}
                    : active
                      ? {
                          scale: [1, 1.18, 0.96, 1.04, 1],
                          y: [0, -2.5, 0],
                        }
                      : {
                          scale: 1,
                          y: 0,
                        }
                }
                transition={{
                  duration: 0.45,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="relative flex items-center justify-center"
              >
                <Icon
                  className={`h-5 w-5 transition-all duration-200 ${
                    active ? 'stroke-[2.25px] drop-shadow-[0_1px_4px_rgba(0,0,0,0.1)]' : 'stroke-[1.6px]'
                  }`}
                />
              </motion.div>
              <span className="transition-all duration-200">
                {tab.label}
              </span>
              {active && (
                <motion.span
                  layoutId="active-mobile-dot"
                  className="absolute bottom-1 h-0.5 w-2 rounded-full bg-[color:var(--ink)] opacity-75"
                  transition={
                    reduceMotion
                      ? { duration: 0.01 }
                      : {
                          type: 'spring',
                          stiffness: 450,
                          damping: 30,
                        }
                  }
                />
              )}
            </button>
          );
        })}
      </motion.div>

      {/* Liquid Glass Sphere Orb / Close Beacon (Modal / Condensed mode) */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        animate={{
          opacity: isOrb ? 1 : 0,
          scale: isOrb ? 1 : 0.3,
        }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Curvature Specular Sheen for the Sphere */}
        <div className="liquid-sheen !left-1 !right-1 !top-0.5 !h-4" />
        <div className="liquid-droplet-glow" />

        {/* Concentric glowing liquid core & tactile close glyph */}
        <div className="relative flex items-center justify-center w-8 h-8">
          <div className="absolute inset-0 rounded-full bg-[color:var(--glow)] opacity-90 blur-[3px] animate-pulse" />
          
          <motion.div
            className="relative flex items-center justify-center w-6 h-6 rounded-full bg-[color:var(--paper-raised)] border border-[color:var(--line)] shadow-[0_2px_8px_rgba(0,0,0,0.15)] dark:shadow-[0_0_12px_rgba(255,255,255,0.2)]"
            animate={
              isOrb && !reduceMotion
                ? {
                    scale: [1, 1.08, 0.96, 1.02, 1],
                  }
                : { scale: 1 }
            }
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <IconClose className="h-3.5 w-3.5 text-[color:var(--ink)] transition-transform duration-200 group-hover:rotate-90" strokeWidth={2.5} />
          </motion.div>
          
          <div className="absolute top-1 left-1.5 w-1.5 h-1.5 rounded-full bg-white/80 blur-[0.5px]" />
        </div>
      </motion.div>
    </motion.nav>
  );

  return (
    <>
      <header className="sticky top-0 z-30 w-full bg-[color:var(--paper)]/80 pt-[env(safe-area-inset-top)] backdrop-blur-xl border-b border-[color:var(--line)]/40 transition-colors duration-300">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4 sm:h-16 sm:px-6">
          <motion.button
            type="button"
            whileHover={reduceMotion ? undefined : { scale: 1.02 }}
            whileTap={reduceMotion ? undefined : { scale: 0.97 }}
            onClick={() => {
              triggerHaptic();
              onChangeTab('timer');
            }}
            className="pressable min-h-11 font-serif text-lg tracking-tight text-[color:var(--ink)] sm:text-xl transition-all duration-200 flex items-center gap-2"
          >
            <UltradianLogo size={22} className="text-[color:var(--ink)]" />
            <span>Ultradian</span>
          </motion.button>

          {/* Desktop Segmented Nav Control */}
          <nav
            ref={desktopNavRef}
            role="tablist"
            className="relative hidden items-center gap-1 md:flex rounded-full bg-[color:var(--line)]/35 p-1 backdrop-blur-lg border border-[color:var(--line)]/50 cursor-grab active:cursor-grabbing touch-none select-none shadow-sm"
            aria-label="Desktop primary navigation"
            onPointerDown={(e) => handleNavPointerDown(e, desktopNavRef.current)}
            onPointerMove={handleNavPointerMove}
            onPointerUp={handleNavPointerUp}
            onPointerCancel={handleNavPointerCancel}
          >
            {/* Desktop Liquid Glass Pill */}
            <div className="absolute inset-1 pointer-events-none overflow-hidden rounded-full">
              <motion.div
                className="liquid-glass-pill"
                initial={false}
                style={{
                  width: `${100 / numTabs}%`,
                }}
                animate={{
                  x: `${clampedPosition * 100}%`,
                  scaleX: reduceMotion
                    ? 1
                    : isAnyDragging
                      ? 1 + Math.min(Math.abs(currentVelocity) * 0.025 + (directDrag.isDragging ? 0.12 : 0), 0.38)
                      : [1, 1.12, 0.95, 1.03, 1],
                  scaleY: reduceMotion
                    ? 1
                    : isAnyDragging
                      ? 1 - Math.min(Math.abs(currentVelocity) * 0.015 + (directDrag.isDragging ? 0.08 : 0), 0.22)
                      : [1, 0.90, 1.05, 0.98, 1],
                  skewX: reduceMotion ? 0 : isAnyDragging ? Math.max(-10, Math.min(10, currentVelocity * -0.3)) : 0,
                }}
                transition={
                  reduceMotion
                    ? { duration: 0.01 }
                    : isAnyDragging
                      ? { type: 'tween', ease: 'linear', duration: 0.04 }
                      : {
                          type: 'spring',
                          stiffness: 420,
                          damping: 26,
                          mass: 0.65,
                          scaleX: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
                          scaleY: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
                          skewX: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
                        }
                }
              >
                <div className="liquid-sheen" />
                <div className="liquid-droplet-glow" />
              </motion.div>
            </div>

            {tabs.map((tab) => {
              const active = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <motion.button
                  key={tab.id}
                  type="button"
                  role="tab"
                  whileHover={reduceMotion ? undefined : { scale: 1.02 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.96 }}
                  onClick={() => {
                    triggerHaptic();
                    onChangeTab(tab.id);
                  }}
                  className={`relative z-10 flex items-center justify-center gap-1.5 min-h-9 min-w-20 rounded-full px-4 text-xs tracking-wide font-medium transition-colors duration-200 pointer-events-auto ${
                    active
                      ? 'text-[color:var(--ink)] font-semibold'
                      : 'text-[color:var(--ink-mute)] hover:text-[color:var(--ink)]'
                  }`}
                  aria-selected={active}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon className={`h-3.5 w-3.5 transition-transform duration-200 ${active ? 'scale-110' : ''}`} />
                  <span>{tab.label}</span>
                </motion.button>
              );
            })}
          </nav>

          <div className="flex items-center gap-1">
            <motion.button
              type="button"
              whileHover={reduceMotion ? undefined : { scale: 1.08 }}
              whileTap={reduceMotion ? undefined : { scale: 0.9 }}
              onClick={(e) => {
                triggerHaptic();
                if (onToggleTheme) onToggleTheme(e);
                else onUpdateSettings({ darkMode: !settings.darkMode });
              }}
              title={settings.darkMode ? 'Switch to light' : 'Switch to dark'}
              className="pressable inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-[color:var(--ink-mute)] hover:text-[color:var(--ink)] hover:bg-[color:var(--line)]/40 transition-colors"
            >
              <AnimatePresence mode="wait" initial={false}>
                {settings.darkMode ? (
                  <motion.div
                    key="sun"
                    initial={reduceMotion ? { opacity: 0 } : { rotate: -90, scale: 0.5, opacity: 0 }}
                    animate={reduceMotion ? { opacity: 1 } : { rotate: 0, scale: 1, opacity: 1 }}
                    exit={reduceMotion ? { opacity: 0 } : { rotate: 90, scale: 0.5, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <IconSun className="h-4 w-4" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={reduceMotion ? { opacity: 0 } : { rotate: 90, scale: 0.5, opacity: 0 }}
                    animate={reduceMotion ? { opacity: 1 } : { rotate: 0, scale: 1, opacity: 1 }}
                    exit={reduceMotion ? { opacity: 0 } : { rotate: -90, scale: 0.5, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <IconMoon className="h-4 w-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            <motion.button
              type="button"
              whileHover={reduceMotion ? undefined : { scale: 1.08 }}
              whileTap={reduceMotion ? undefined : { scale: 0.9 }}
              onClick={() => {
                triggerHaptic();
                onOpenSettings();
              }}
              title="Settings"
              id="open-settings"
              className="pressable inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-[color:var(--ink-mute)] hover:text-[color:var(--ink)] hover:bg-[color:var(--line)]/40 transition-colors"
            >
              {fbUser?.photoURL ? (
                <motion.img
                  src={fbUser.photoURL}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="h-6 w-6 rounded-full object-cover ring-1 ring-[color:var(--line)]"
                  whileHover={reduceMotion ? undefined : { scale: 1.08 }}
                />
              ) : (
                <motion.div
                  whileHover={reduceMotion ? undefined : { rotate: 45 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  <IconSettings className="h-4 w-4" />
                </motion.div>
              )}
            </motion.button>
          </div>
        </div>
      </header>

      {/* Floating Island Bottom Nav Portaled to Root Body for Uncompromised Z-Indexing */}
      {mounted && typeof document !== 'undefined'
        ? createPortal(mobileNavElement, document.body)
        : mobileNavElement}
    </>
  );
};
