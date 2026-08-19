import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Search,
  Check,
  RotateCw,
  ArrowRight,
  ArrowLeft,
  X,
  Volume2,
  VolumeX,
  Sparkles,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  Zap,
  Clock,
  ShieldCheck,
  Feather,
  Compass,
  Atom,
  Palette,
  Layers,
} from 'lucide-react';
import { FocusArchetype, UserSettings, ProfessionItem } from '../types';
import {
  ARCHETYPES,
  PROFESSIONS_DATABASE,
  generatePoeticRitualName,
  getPeakTimeLabel,
} from '../data/professions';
import { buildRitualOnboardingSettings } from '../utils/ritualOnboarding';
import { Sheet } from './Sheet';
import { startAmbientSound, stopAmbientSound } from '../utils/audio';

interface RitualOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onCompleteOnboarding: (updatedSettings: Partial<UserSettings>) => void;
}

const ARCHETYPE_ICONS: Record<FocusArchetype, React.ReactNode> = {
  Builder: <Layers className="w-4 h-4" />,
  Creator: <Palette className="w-4 h-4" />,
  Scientist: <Atom className="w-4 h-4" />,
  Strategist: <Compass className="w-4 h-4" />,
};

const ARCHETYPE_POETRY: Record<FocusArchetype, { rhythm: string; descriptor: string }> = {
  Builder: {
    rhythm: '90m Wave · 20m Rest',
    descriptor: 'Deep systemic craft & architecture',
  },
  Creator: {
    rhythm: '60m Flow · 15m Rest',
    descriptor: 'Unbound creative expression & narrative',
  },
  Scientist: {
    rhythm: '90m Rigor · 20m Rest',
    descriptor: 'Empirical inquiry & analytical synthesis',
  },
  Strategist: {
    rhythm: '45m Pulse · 10m Rest',
    descriptor: 'High-leverage vision & decisive clarity',
  },
};

const CHRONO_PRESETS = [
  { h: 6, label: 'Dawn Patrol', icon: <Sunrise className="w-3.5 h-3.5" />, time: '06:00' },
  { h: 9, label: 'Morning Prime', icon: <Sun className="w-3.5 h-3.5" />, time: '09:00' },
  { h: 14, label: 'Midday Surge', icon: <Zap className="w-3.5 h-3.5" />, time: '14:00' },
  { h: 18, label: 'Twilight Flow', icon: <Sunset className="w-3.5 h-3.5" />, time: '18:00' },
  { h: 22, label: 'Nocturne Owl', icon: <Moon className="w-3.5 h-3.5" />, time: '22:00' },
];

export const RitualOnboardingModal: React.FC<RitualOnboardingModalProps> = ({
  isOpen,
  onClose,
  settings,
  onCompleteOnboarding,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [slideDir, setSlideDir] = useState<number>(1);
  const [selectedArchetype, setSelectedArchetype] = useState<FocusArchetype>(
    settings.archetype || 'Builder'
  );
  const [selectedProfession, setSelectedProfession] = useState<string>(
    settings.profession || 'Frontend Developer'
  );
  const [peakHour, setPeakHour] = useState<number>(
    settings.peakHour !== undefined ? settings.peakHour : 8
  );
  const [ritualName, setRitualName] = useState<string>(settings.focusRitualName || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuditioningAudio, setIsAuditioningAudio] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);

  const prevStepRef = useRef(step);

  // Stop ambient audio audition when modal unmounts or closes
  useEffect(() => {
    return () => {
      stopAmbientSound();
    };
  }, []);

  const triggerHaptic = () => {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(8);
      }
    } catch {}
  };

  useEffect(() => {
    if (!ritualName || ritualName.trim() === '') {
      setRitualName(generatePoeticRitualName(selectedArchetype, selectedProfession, peakHour));
    }
  }, [selectedArchetype, selectedProfession, peakHour]);

  const filteredProfessions = useMemo(() => {
    if (!searchQuery.trim()) {
      return PROFESSIONS_DATABASE.filter((p) => p.archetype === selectedArchetype);
    }
    const q = searchQuery.toLowerCase();
    return PROFESSIONS_DATABASE.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.tag.toLowerCase().includes(q) ||
        item.archetype.toLowerCase().includes(q)
    );
  }, [searchQuery, selectedArchetype]);

  const currentArchetypeMeta = ARCHETYPES[selectedArchetype];
  const peakInfo = getPeakTimeLabel(peakHour);

  const handleStepChange = (newStep: 1 | 2 | 3) => {
    setSlideDir(newStep > step ? 1 : -1);
    prevStepRef.current = step;
    setStep(newStep);
    triggerHaptic();
  };

  const handleSelectArchetype = (arch: FocusArchetype) => {
    setSelectedArchetype(arch);
    const defaultForArch = PROFESSIONS_DATABASE.find((p) => p.archetype === arch);
    if (defaultForArch) {
      setSelectedProfession(defaultForArch.title);
    }
    setRitualName(generatePoeticRitualName(arch, defaultForArch?.title, peakHour));
    triggerHaptic();

    if (isAuditioningAudio) {
      startAmbientSound(ARCHETYPES[arch].defaultAmbient, 0.35);
    }
  };

  const handleSelectProfession = (prof: ProfessionItem) => {
    setSelectedProfession(prof.title);
    setSelectedArchetype(prof.archetype);
    setRitualName(generatePoeticRitualName(prof.archetype, prof.title, peakHour));
    triggerHaptic();
  };

  const handleRegenerateRitualName = () => {
    setIsShuffling(true);
    triggerHaptic();
    setTimeout(() => {
      setRitualName(generatePoeticRitualName(selectedArchetype, selectedProfession, peakHour));
      setIsShuffling(false);
    }, 180);
  };

  const toggleAudioAudition = () => {
    if (isAuditioningAudio) {
      stopAmbientSound();
      setIsAuditioningAudio(false);
    } else {
      startAmbientSound(currentArchetypeMeta.defaultAmbient, 0.35);
      setIsAuditioningAudio(true);
    }
    triggerHaptic();
  };

  const handleFinish = () => {
    stopAmbientSound();
    triggerHaptic();

    try {
      if (typeof document !== 'undefined') {
        const testCanvas = document.createElement('canvas');
        if (testCanvas.getContext && testCanvas.getContext('2d')) {
          confetti({
            particleCount: 40,
            spread: 50,
            origin: { y: 0.65 },
            colors: ['#212121', '#9e9e9e', '#e0e0e0', '#d4af37'],
          });
        }
      }
    } catch {}

    onCompleteOnboarding(
      buildRitualOnboardingSettings({
        archetype: selectedArchetype,
        profession: selectedProfession,
        peakHour,
        ritualName,
        currentUsername: settings.username,
      })
    );
    onClose();
  };

  // Subtle, peaceful sky atmosphere with low saturation
  const getSkyAtmosphere = (hour: number) => {
    if (hour >= 5 && hour < 8) {
      return {
        bg: 'from-[color:var(--paper-raised)] via-[color:var(--glow)] to-[color:var(--paper)]',
        themeName: 'Dawn Awakening',
        desc: 'Natural rise in neural clarity and pristine mental space.',
        icon: <Sunrise className="w-4 h-4 text-[color:var(--ink)]" />,
      };
    }
    if (hour >= 8 && hour < 12) {
      return {
        bg: 'from-[color:var(--glow)] via-[color:var(--paper-raised)] to-[color:var(--paper)]',
        themeName: 'Morning Clarity',
        desc: 'Optimal cognitive bandwidth and sustained analytical flow.',
        icon: <Sun className="w-4 h-4 text-[color:var(--ink)]" />,
      };
    }
    if (hour >= 12 && hour < 16) {
      return {
        bg: 'from-[color:var(--paper-raised)] via-[color:var(--glow-2)] to-[color:var(--paper)]',
        themeName: 'Solar Zenith',
        desc: 'Steady execution rhythm and deep immersion wave.',
        icon: <Zap className="w-4 h-4 text-[color:var(--ink)]" />,
      };
    }
    if (hour >= 16 && hour < 20) {
      return {
        bg: 'from-[color:var(--glow-2)] via-[color:var(--paper-raised)] to-[color:var(--paper)]',
        themeName: 'Twilight Flow',
        desc: 'Reflective focus, creative synthesis, and quiet depth.',
        icon: <Sunset className="w-4 h-4 text-[color:var(--ink)]" />,
      };
    }
    return {
      bg: 'from-[color:var(--paper-raised)] via-[color:var(--line)]/20 to-[color:var(--paper)]',
      themeName: 'Nocturne Silence',
      desc: 'Stillness, uninterrupted flow, and peaceful contemplation.',
      icon: <Moon className="w-4 h-4 text-[color:var(--ink)]" />,
    };
  };

  const sky = getSkyAtmosphere(peakHour);

  return (
    <Sheet open={isOpen} onClose={onClose} size="lg" labelledBy="ritual-title">
      <div className="flex max-h-[90dvh] flex-col text-[color:var(--ink)] bg-[color:var(--paper-raised)]/95 backdrop-blur-2xl">
        {/* Minimalist Liquid Glass Header */}
        <div className="px-6 pt-5 pb-4 sm:px-8 shrink-0 border-b border-[color:var(--line)]/60 relative">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--ink)] opacity-60 animate-pulse" />
                <p className="text-[11px] font-sans tracking-wider uppercase text-[color:var(--ink-mute)]">
                  Step {step} of 3
                </p>
              </div>
              <h2 id="ritual-title" className="font-serif text-2xl sm:text-3xl font-light tracking-tight text-[color:var(--ink)]">
                Focus Ritual Setup
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="pressable p-2 min-h-10 min-w-10 rounded-full text-[color:var(--ink-mute)] hover:text-[color:var(--ink)] hover:bg-[color:var(--line)]/40 transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Liquid Glass Stepper Dots */}
          <div className="mt-4 flex items-center gap-2">
            {[1, 2, 3].map((s) => {
              const isCurrent = step === s;
              const isPassed = step > s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleStepChange(s as 1 | 2 | 3)}
                  className="flex-1 h-1.5 rounded-full transition-all duration-300 relative overflow-hidden bg-[color:var(--line)]/50"
                >
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isCurrent
                        ? 'w-full bg-[color:var(--ink)] shadow-xs'
                        : isPassed
                          ? 'w-full bg-[color:var(--ink-soft)]'
                          : 'w-0'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Serene Content Viewport */}
        <div className="p-5 sm:p-8 overflow-y-auto overscroll-contain flex-1">
          <AnimatePresence mode="wait" initial={false} custom={slideDir}>
            {/* STEP 1: ARCHETYPE & CRAFT */}
            {step === 1 && (
              <motion.div
                key="step-1"
                custom={slideDir}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
                className="space-y-6"
              >
                <div className="flex items-end justify-between gap-2">
                  <div>
                    <h3 className="font-serif text-xl sm:text-2xl font-light text-[color:var(--ink)]">
                      Discover your Natural Rhythm
                    </h3>
                    <p className="text-xs text-[color:var(--ink-mute)] mt-1 font-light">
                      Select the focus cadence that mirrors your deepest work
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={toggleAudioAudition}
                    className={`pressable flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all ${
                      isAuditioningAudio
                        ? 'bg-[color:var(--ink)] text-[color:var(--paper)] border-[color:var(--ink)] shadow-xs'
                        : 'border-[color:var(--line)] bg-[color:var(--paper)] text-[color:var(--ink-soft)] hover:text-[color:var(--ink)]'
                    }`}
                  >
                    {isAuditioningAudio ? (
                      <>
                        <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                        <span className="text-[11px] font-medium">Listening</span>
                      </>
                    ) : (
                      <>
                        <VolumeX className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-medium">Audition Sound</span>
                      </>
                    )}
                  </button>
                </div>

                {/* 4 Serene Liquid Glass Archetype Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(Object.keys(ARCHETYPES) as FocusArchetype[]).map((archKey) => {
                    const meta = ARCHETYPES[archKey];
                    const isSelected = selectedArchetype === archKey;
                    const poetry = ARCHETYPE_POETRY[archKey];

                    return (
                      <div
                        key={archKey}
                        onClick={() => handleSelectArchetype(archKey)}
                        className={`group relative text-left p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all duration-300 overflow-hidden ${
                          isSelected
                            ? 'border-[color:var(--ink)] bg-[color:var(--paper)] shadow-md ring-1 ring-[color:var(--ink)]/10'
                            : 'border-[color:var(--line)]/70 bg-[color:var(--paper)]/40 hover:border-[color:var(--ink-mute)]/60 hover:bg-[color:var(--paper)]/70'
                        }`}
                      >
                        {/* Subtle liquid sheen layer */}
                        {isSelected && <div className="liquid-sheen" />}

                        <div className="relative z-10 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                                  isSelected
                                    ? 'bg-[color:var(--ink)] text-[color:var(--paper)]'
                                    : 'bg-[color:var(--line)]/40 text-[color:var(--ink-soft)] group-hover:text-[color:var(--ink)]'
                                }`}
                              >
                                {ARCHETYPE_ICONS[archKey]}
                              </div>
                              <h4 className="font-serif text-lg font-medium text-[color:var(--ink)]">
                                {meta.title}
                              </h4>
                            </div>

                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                                isSelected
                                  ? 'bg-[color:var(--ink)] text-[color:var(--paper)]'
                                  : 'border border-[color:var(--line)] text-transparent'
                              }`}
                            >
                              <Check className="w-3 h-3 stroke-[2.5]" />
                            </div>
                          </div>

                          <p className="text-xs text-[color:var(--ink-soft)] leading-relaxed font-light">
                            {poetry.descriptor}
                          </p>

                          <div className="pt-2 border-t border-[color:var(--line)]/40 flex items-center justify-between text-[11px] text-[color:var(--ink-mute)]">
                            <span className="font-medium text-[color:var(--ink-soft)]">
                              {poetry.rhythm}
                            </span>
                            <span className="capitalize font-light">
                              {meta.defaultAmbient.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Minimalist Craft & Role Selection */}
                <div className="pt-2 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-sans text-[11px] uppercase tracking-wider text-[color:var(--ink-mute)]">
                      Signature Craft
                    </span>
                    <span className="font-medium text-[color:var(--ink)]">
                      {selectedProfession}
                    </span>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[color:var(--ink-mute)]" />
                    <input
                      id="onboarding-craft-search"
                      name="craftSearch"
                      aria-label="Search your field or role"
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search your field or role (e.g. Architect, Writer, Scientist...)"
                      className="w-full pl-10 pr-12 py-2.5 bg-[color:var(--paper)] border border-[color:var(--line)] rounded-xl text-xs text-[color:var(--ink)] placeholder-[color:var(--ink-mute)] focus:outline-none focus:border-[color:var(--ink)] transition-colors"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[color:var(--ink-mute)] hover:text-[color:var(--ink)]"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  <div className="max-h-36 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-1.5 p-1.5 bg-[color:var(--paper)]/50 border border-[color:var(--line)]/60 rounded-xl">
                    {filteredProfessions.slice(0, 16).map((item) => {
                      const isProfSelected = selectedProfession === item.title;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSelectProfession(item)}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all ${
                            isProfSelected
                              ? 'bg-[color:var(--ink)] text-[color:var(--paper)] font-medium shadow-xs'
                              : 'text-[color:var(--ink-soft)] hover:bg-[color:var(--line)]/40 hover:text-[color:var(--ink)]'
                          }`}
                        >
                          <span className="text-xs truncate pr-2">{item.title}</span>
                          <span
                            className={`text-[10px] shrink-0 font-light ${
                              isProfSelected ? 'text-[color:var(--paper)]/80' : 'text-[color:var(--ink-mute)]'
                            }`}
                          >
                            {item.archetype}
                          </span>
                        </button>
                      );
                    })}
                    {filteredProfessions.length === 0 && (
                      <div className="col-span-2 py-4 text-center text-xs text-[color:var(--ink-mute)]">
                        No matching craft found.
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: CIRCADIAN PEAK */}
            {step === 2 && (
              <motion.div
                key="step-2"
                custom={slideDir}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
                className="space-y-6"
              >
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl font-light text-[color:var(--ink)]">
                    Circadian Resonance
                  </h3>
                  <p className="text-xs text-[color:var(--ink-mute)] mt-1 font-light">
                    When does your mind enter its deepest state of effortless attention?
                  </p>
                </div>

                {/* Minimalist Liquid Glass Sky Canvas */}
                <div
                  className={`relative p-6 sm:p-8 rounded-2xl border border-[color:var(--line)] bg-gradient-to-b ${sky.bg} overflow-hidden text-center transition-all duration-500 shadow-sm`}
                >
                  <div className="liquid-sheen" />
                  <div className="relative z-10 space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs border border-[color:var(--line)] bg-[color:var(--paper)]/60 backdrop-blur-md text-[color:var(--ink)]">
                      {sky.icon}
                      <span className="font-medium">{sky.themeName}</span>
                    </div>

                    <p className="font-serif text-3xl sm:text-5xl font-light text-[color:var(--ink)] tracking-tight">
                      {peakInfo.period}
                    </p>

                    <p className="text-xs text-[color:var(--ink-soft)] max-w-xs mx-auto leading-relaxed font-light">
                      {sky.desc}
                    </p>
                  </div>
                </div>

                {/* Hour Scrubber & Quick Presets */}
                <div className="space-y-4 pt-1">
                  <div className="flex justify-between items-center text-xs text-[color:var(--ink-mute)]">
                    <span>Midnight (00:00)</span>
                    <span className="font-serif text-sm font-medium text-[color:var(--ink)] px-3 py-0.5 rounded-full border border-[color:var(--line)] bg-[color:var(--paper)]">
                      {peakHour.toString().padStart(2, '0')}:00 Peak
                    </span>
                    <span>Late Night (23:00)</span>
                  </div>

                  <label htmlFor="onboarding-peak-hour-range" className="sr-only">
                    Circadian Peak Hour Range
                  </label>
                  <input
                    id="onboarding-peak-hour-range"
                    name="peakHourRange"
                    aria-label="Circadian Peak Hour"
                    type="range"
                    min="0"
                    max="23"
                    step="1"
                    value={peakHour}
                    onChange={(e) => {
                      const hour = parseInt(e.target.value, 10);
                      setPeakHour(hour);
                      setRitualName(generatePoeticRitualName(selectedArchetype, selectedProfession, hour));
                    }}
                    className="w-full h-2 bg-[color:var(--line)] rounded-lg appearance-none cursor-pointer accent-[color:var(--ink)]"
                  />

                  {/* 5 Minimalist Chronotype Presets */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                    {CHRONO_PRESETS.map((preset) => {
                      const isPresetSelected = peakHour === preset.h;
                      return (
                        <button
                          key={preset.h}
                          type="button"
                          onClick={() => {
                            setPeakHour(preset.h);
                            setRitualName(
                              generatePoeticRitualName(selectedArchetype, selectedProfession, preset.h)
                            );
                            triggerHaptic();
                          }}
                          className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                            isPresetSelected
                              ? 'bg-[color:var(--ink)] text-[color:var(--paper)] border-[color:var(--ink)] shadow-xs'
                              : 'bg-[color:var(--paper)] text-[color:var(--ink-soft)] border-[color:var(--line)] hover:border-[color:var(--ink-mute)]'
                          }`}
                        >
                          <div className="mb-1">{preset.icon}</div>
                          <span className="text-[11px] font-medium leading-tight">{preset.label}</span>
                          <span className="text-[10px] opacity-70 mt-0.5 font-light">{preset.time}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: RITUAL SEAL & PASSPORT */}
            {step === 3 && (
              <motion.div
                key="step-3"
                custom={slideDir}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
                className="space-y-6"
              >
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl font-light text-[color:var(--ink)]">
                    Seal your Focus Passport
                  </h3>
                  <p className="text-xs text-[color:var(--ink-mute)] mt-1 font-light">
                    Your signature Ultradian rhythm is now calibrated
                  </p>
                </div>

                {/* Pure Liquid Glass Focus Passport */}
                <div className="relative p-6 sm:p-7 rounded-2xl border border-[color:var(--line)] bg-[color:var(--paper)] shadow-lg overflow-hidden space-y-5">
                  <div className="liquid-sheen" />

                  <div className="relative z-10 space-y-5">
                    {/* Header with Monogram Badge */}
                    <div className="flex items-center justify-between border-b border-[color:var(--line)]/60 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[color:var(--ink)] text-[color:var(--paper)] flex items-center justify-center">
                          {ARCHETYPE_ICONS[selectedArchetype]}
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider font-sans text-[color:var(--ink-mute)]">
                            Ultradian Archetype Pass
                          </p>
                          <p className="font-serif text-base sm:text-lg font-medium text-[color:var(--ink)]">
                            {selectedArchetype} · {selectedProfession}
                          </p>
                        </div>
                      </div>

                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[color:var(--line)] text-[10px] text-[color:var(--ink-soft)] bg-[color:var(--paper-raised)]">
                        <ShieldCheck className="w-3.5 h-3.5 text-[color:var(--ink)]" />
                        <span>Calibrated</span>
                      </div>
                    </div>

                    {/* Ritual Title Generator */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label htmlFor="onboarding-ritual-passport-name" className="text-[11px] uppercase tracking-wider text-[color:var(--ink-mute)]">
                          Signature Ritual Title
                        </label>
                        <button
                          type="button"
                          onClick={handleRegenerateRitualName}
                          className="pressable flex items-center gap-1 text-xs text-[color:var(--ink-soft)] hover:text-[color:var(--ink)] px-2 py-0.5 rounded-md hover:bg-[color:var(--line)]/30 transition-colors"
                        >
                          <RotateCw className={`w-3 h-3 ${isShuffling ? 'animate-spin' : ''}`} />
                          <span>Shuffle Name</span>
                        </button>
                      </div>

                      <input
                        id="onboarding-ritual-passport-name"
                        name="ritualPassportName"
                        aria-label="Signature Ritual Title"
                        type="text"
                        value={ritualName}
                        onChange={(e) => setRitualName(e.target.value)}
                        placeholder="e.g. The Dawn Architect"
                        className="w-full px-4 py-3 bg-[color:var(--paper-raised)] border border-[color:var(--line)] rounded-xl font-serif text-lg text-[color:var(--ink)] focus:outline-none focus:border-[color:var(--ink)] transition-colors"
                      />
                    </div>

                    {/* 4 Quiet Rhythm Specs */}
                    <div className="grid grid-cols-2 gap-2.5 text-xs pt-1">
                      <div className="p-3 rounded-xl bg-[color:var(--paper-raised)] border border-[color:var(--line)]/60">
                        <span className="block text-[10px] uppercase tracking-wider text-[color:var(--ink-mute)]">
                          Focus Wave
                        </span>
                        <span className="font-serif text-base text-[color:var(--ink)] mt-0.5 block">
                          {currentArchetypeMeta.defaultWorkMinutes} Minutes
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-[color:var(--paper-raised)] border border-[color:var(--line)]/60">
                        <span className="block text-[10px] uppercase tracking-wider text-[color:var(--ink-mute)]">
                          Recovery Pulse
                        </span>
                        <span className="font-serif text-base text-[color:var(--ink)] mt-0.5 block">
                          {currentArchetypeMeta.defaultBreakMinutes} Minutes
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-[color:var(--paper-raised)] border border-[color:var(--line)]/60">
                        <span className="block text-[10px] uppercase tracking-wider text-[color:var(--ink-mute)]">
                          Circadian Zenith
                        </span>
                        <span className="font-serif text-base text-[color:var(--ink)] mt-0.5 block truncate">
                          {peakInfo.period}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-[color:var(--paper-raised)] border border-[color:var(--line)]/60">
                        <span className="block text-[10px] uppercase tracking-wider text-[color:var(--ink-mute)]">
                          Harmonic Audio
                        </span>
                        <span className="font-serif text-base text-[color:var(--ink)] mt-0.5 block capitalize truncate">
                          {currentArchetypeMeta.defaultAmbient.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Footer */}
        <div className="px-6 py-4 sm:px-8 sm:py-5 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-[color:var(--line)]/60 flex items-center justify-between gap-4 shrink-0 bg-[color:var(--paper)]/50">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => handleStepChange((step - 1) as 1 | 2)}
              className="pressable flex min-h-11 items-center gap-1.5 px-4 rounded-full text-xs font-medium text-[color:var(--ink-soft)] hover:text-[color:var(--ink)] hover:bg-[color:var(--line)]/30 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => handleStepChange((step + 1) as 2 | 3)}
              className="pressable flex min-h-11 items-center gap-2 px-6 rounded-full bg-[color:var(--ink)] text-[color:var(--paper)] font-medium text-xs uppercase tracking-wider shadow-sm hover:opacity-90 transition-opacity"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="pressable flex min-h-11 items-center gap-2 px-7 rounded-full bg-[color:var(--ink)] text-[color:var(--paper)] font-medium text-xs uppercase tracking-wider shadow-md hover:opacity-90 transition-opacity"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Seal Ritual & Begin</span>
            </button>
          )}
        </div>
      </div>
    </Sheet>
  );
};
