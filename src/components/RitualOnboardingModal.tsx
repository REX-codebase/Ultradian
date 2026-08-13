import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Check,
  RotateCw,
  ArrowRight,
  ArrowLeft,
  X,
  Cpu,
  Palette,
  Atom,
  Compass,
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

interface RitualOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onCompleteOnboarding: (updatedSettings: Partial<UserSettings>) => void;
}

const TAG_FILTERS = ['All', 'Engineering', 'Arts & Media', 'Research & Bio', 'Leadership & Biz'] as const;

const ARCHETYPE_ICONS: Record<FocusArchetype, React.ReactNode> = {
  Builder: <Cpu className="w-4 h-4" />,
  Creator: <Palette className="w-4 h-4" />,
  Scientist: <Atom className="w-4 h-4" />,
  Strategist: <Compass className="w-4 h-4" />,
};

export const RitualOnboardingModal: React.FC<RitualOnboardingModalProps> = ({
  isOpen,
  onClose,
  settings,
  onCompleteOnboarding,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
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
  const [activeTagFilter, setActiveTagFilter] = useState<string>('All');

  useEffect(() => {
    if (!ritualName || ritualName.trim() === '') {
      setRitualName(generatePoeticRitualName(selectedArchetype, selectedProfession, peakHour));
    }
  }, [selectedArchetype, selectedProfession, peakHour]);

  const filteredProfessions = useMemo(() => {
    return PROFESSIONS_DATABASE.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.archetype.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag =
        activeTagFilter === 'All' ||
        (activeTagFilter === 'Engineering' &&
          (item.tag === 'Engineering' || item.tag === 'Hardware' || item.tag === 'Security')) ||
        (activeTagFilter === 'Arts & Media' &&
          (item.tag === 'Art' ||
            item.tag === 'Writing' ||
            item.tag === 'Music' ||
            item.tag === 'Film' ||
            item.tag === 'Media' ||
            item.tag === 'Design')) ||
        (activeTagFilter === 'Research & Bio' &&
          (item.tag === 'AI' ||
            item.tag === 'Physics' ||
            item.tag === 'Data' ||
            item.tag === 'Medicine' ||
            item.tag === 'Academia' ||
            item.tag === 'Math')) ||
        (activeTagFilter === 'Leadership & Biz' &&
          (item.tag === 'Startup' ||
            item.tag === 'Venture' ||
            item.tag === 'Finance' ||
            item.tag === 'Strategy' ||
            item.tag === 'Law'));
      return matchesSearch && matchesTag;
    });
  }, [searchQuery, activeTagFilter]);

  const currentArchetypeMeta = ARCHETYPES[selectedArchetype];
  const peakInfo = getPeakTimeLabel(peakHour);

  const handleSelectArchetype = (arch: FocusArchetype) => {
    setSelectedArchetype(arch);
    const defaultForArch = PROFESSIONS_DATABASE.find((p) => p.archetype === arch);
    if (defaultForArch) {
      setSelectedProfession(defaultForArch.title);
    }
    setRitualName(generatePoeticRitualName(arch, defaultForArch?.title, peakHour));
  };

  const handleSelectProfession = (prof: ProfessionItem) => {
    setSelectedProfession(prof.title);
    setSelectedArchetype(prof.archetype);
    setRitualName(generatePoeticRitualName(prof.archetype, prof.title, peakHour));
  };

  const handleRegenerateRitualName = () => {
    setRitualName(generatePoeticRitualName(selectedArchetype, selectedProfession, peakHour));
  };

  const handleFinish = () => {
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

  const stepLabel = step === 1 ? 'Work' : step === 2 ? 'Peak' : 'Name';

  return (
    <Sheet open={isOpen} onClose={onClose} size="lg" labelledBy="ritual-title">
      <div className="flex max-h-[88dvh] flex-col text-[color:var(--ink)]">
        <div className="flex items-center justify-between gap-3 px-5 pb-4 pt-2 sm:px-6 shrink-0">
          <div>
            <h2 id="ritual-title" className="font-serif text-xl tracking-tight">
              Ritual
            </h2>
            <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-0.5">
              Step {step} of 3 · {stepLabel}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 min-h-11 min-w-11 rounded-md text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
            title="Skip"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        <div className="h-px w-full bg-stone-100 dark:bg-stone-800 flex">
          <div
            className="h-px bg-stone-900 dark:bg-stone-100 transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto overscroll-contain flex-1">
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h3 className="font-serif text-lg text-stone-900 dark:text-stone-100">What do you do?</h3>
                <p className="text-sm text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                  Choose an archetype, or search the profession catalog.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(Object.keys(ARCHETYPES) as FocusArchetype[]).map((archKey) => {
                  const meta = ARCHETYPES[archKey];
                  const isSelected = selectedArchetype === archKey;
                  return (
                    <button
                      key={archKey}
                      type="button"
                      onClick={() => handleSelectArchetype(archKey)}
                      className={`text-left p-4 rounded-xl border transition-colors ${
                        isSelected
                          ? 'bg-stone-100 dark:bg-stone-800 border-stone-900 dark:border-stone-100'
                          : 'bg-stone-50/60 dark:bg-stone-950/40 border-stone-200/80 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="flex items-center justify-center w-8 h-8 rounded-md border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 shrink-0">
                            {ARCHETYPE_ICONS[archKey]}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-medium text-stone-900 dark:text-stone-100">
                              {meta.title}
                            </h4>
                            <p className="text-[11px] text-stone-400 truncate">{meta.subtitle}</p>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-2.5 leading-relaxed line-clamp-2">
                        {meta.motto}
                      </p>
                      <div className="mt-3 flex items-center justify-between pt-2 border-t border-stone-200/70 dark:border-stone-800 text-[10px] text-stone-400">
                        <span>{meta.defaultWorkMinutes}m focus</span>
                        <span className="capitalize">{meta.defaultAmbient.replace('_', ' ')}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                    Profession
                  </span>
                  <span className="text-[11px] text-stone-500">{selectedProfession}</span>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search professions"
                    className="w-full pl-9 pr-16 py-2.5 bg-stone-50 dark:bg-stone-950 border border-stone-200/80 dark:border-stone-800 rounded-xl text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:border-stone-400"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto pb-1 text-[11px]">
                  {TAG_FILTERS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setActiveTagFilter(tag)}
                      className={`px-2.5 py-1 rounded-lg border whitespace-nowrap transition-colors ${
                        activeTagFilter === tag
                          ? 'bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 border-stone-900 dark:border-stone-100'
                          : 'bg-transparent text-stone-500 border-stone-200 dark:border-stone-800 hover:text-stone-800 dark:hover:text-stone-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                <div className="mt-3 max-h-40 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-1 p-1 bg-stone-50/70 dark:bg-stone-950/50 border border-stone-200/80 dark:border-stone-800 rounded-xl">
                  {filteredProfessions.slice(0, 16).map((item) => {
                    const isProfSelected = selectedProfession === item.title;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectProfession(item)}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                          isProfSelected
                            ? 'bg-stone-200/80 dark:bg-stone-800 text-stone-900 dark:text-stone-100'
                            : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/70'
                        }`}
                      >
                        <span className="text-xs truncate pr-2">{item.title}</span>
                        <span className="text-[9px] uppercase tracking-wider text-stone-400 shrink-0">
                          {item.archetype}
                        </span>
                      </button>
                    );
                  })}
                  {filteredProfessions.length === 0 && (
                    <div className="col-span-2 py-4 text-center text-xs text-stone-400">
                      No matching profession.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="font-serif text-lg text-stone-900 dark:text-stone-100">When are you sharpest?</h3>
                <p className="text-sm text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                  Set the hour that usually holds your best work.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200/80 dark:border-stone-800 text-center space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                  {peakInfo.label}
                </p>
                <p className="font-serif text-3xl font-light text-stone-900 dark:text-stone-100">
                  {peakInfo.period}
                </p>
                <p className="text-xs text-stone-500">
                  Peak window around {peakInfo.window}.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs text-stone-400">
                  <span>00:00</span>
                  <span className="text-stone-700 dark:text-stone-300">{peakHour}:00</span>
                  <span>23:00</span>
                </div>
                <input
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
                  className="w-full h-2 bg-stone-200 dark:bg-stone-800 rounded-lg appearance-none cursor-pointer accent-stone-900 dark:accent-stone-100"
                />
                <div className="grid grid-cols-5 gap-1.5">
                  {[
                    { h: 6, label: 'Dawn' },
                    { h: 9, label: 'Morning' },
                    { h: 14, label: 'Afternoon' },
                    { h: 20, label: 'Evening' },
                    { h: 23, label: 'Night' },
                  ].map((preset) => (
                    <button
                      key={preset.h}
                      type="button"
                      onClick={() => {
                        setPeakHour(preset.h);
                        setRitualName(
                          generatePoeticRitualName(selectedArchetype, selectedProfession, preset.h)
                        );
                      }}
                      className={`py-2 px-1 rounded-lg text-[10px] border text-center transition-colors ${
                        peakHour === preset.h
                          ? 'bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 border-stone-900 dark:border-stone-100'
                          : 'bg-transparent text-stone-500 border-stone-200 dark:border-stone-800'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h3 className="font-serif text-lg text-stone-900 dark:text-stone-100">Name your ritual</h3>
                <p className="text-sm text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                  A quiet label for {selectedProfession}, around {peakInfo.label.toLowerCase()}.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                    Ritual title
                  </label>
                  <button
                    type="button"
                    onClick={handleRegenerateRitualName}
                    className="flex items-center gap-1 text-[11px] text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
                  >
                    <RotateCw className="w-3 h-3" />
                    <span>Shuffle</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={ritualName}
                  onChange={(e) => setRitualName(e.target.value)}
                  placeholder="e.g. The Dawn Scribe"
                  className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-950 border border-stone-200/80 dark:border-stone-800 rounded-xl text-lg font-serif text-stone-900 dark:text-stone-100 focus:outline-none focus:border-stone-400"
                />
              </div>

              <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200/80 dark:border-stone-800 space-y-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 border-b border-stone-200/70 dark:border-stone-800 pb-2">
                  Summary
                </p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider text-stone-400">Profession</span>
                    <span className="text-stone-800 dark:text-stone-200">{selectedProfession}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider text-stone-400">Peak</span>
                    <span className="text-stone-800 dark:text-stone-200">{peakInfo.period}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider text-stone-400">Preset</span>
                    <span className="text-stone-800 dark:text-stone-200">
                      {currentArchetypeMeta.defaultWorkMinutes}m / {currentArchetypeMeta.defaultBreakMinutes}m
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider text-stone-400">Sound</span>
                    <span className="text-stone-800 dark:text-stone-200 capitalize">
                      {currentArchetypeMeta.defaultAmbient.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-4 sm:px-6 py-3 sm:py-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-3 shrink-0">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
              className="flex min-h-11 items-center gap-1.5 px-4 rounded-xl text-xs font-semibold text-stone-500 hover:text-stone-900 dark:hover:text-stone-100"
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
              onClick={() => setStep((s) => (s + 1) as 1 | 2 | 3)}
              className="flex min-h-11 items-center gap-1.5 px-5 rounded-full bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 font-semibold text-xs uppercase tracking-wider"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="flex min-h-11 items-center px-6 rounded-full bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 font-semibold text-xs uppercase tracking-wider"
            >
              Begin
            </button>
          )}
        </div>
      </div>
    </Sheet>
  );
};
