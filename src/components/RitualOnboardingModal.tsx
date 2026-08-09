import React, { useState, useMemo, useEffect } from 'react';
import {
  Sparkles,
  Search,
  Check,
  RotateCw,
  Clock,
  ArrowRight,
  ArrowLeft,
  X,
  Zap,
  Volume2,
  Brain,
  Cpu,
  Palette,
  Atom,
  Compass,
  Briefcase,
  Flame,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { FocusArchetype, UserSettings, ProfessionItem } from '../types';
import {
  ARCHETYPES,
  PROFESSIONS_DATABASE,
  generatePoeticRitualName,
  getPeakTimeLabel,
} from '../data/professions';

interface RitualOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onCompleteOnboarding: (updatedSettings: Partial<UserSettings>) => void;
}

export const RitualOnboardingModal: React.FC<RitualOnboardingModalProps> = ({
  isOpen,
  onClose,
  settings,
  onCompleteOnboarding,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Selected state
  const [selectedArchetype, setSelectedArchetype] = useState<FocusArchetype>(
    settings.archetype || 'Builder'
  );
  const [selectedProfession, setSelectedProfession] = useState<string>(
    settings.profession || 'Frontend Developer'
  );
  const [peakHour, setPeakHour] = useState<number>(
    settings.peakHour !== undefined ? settings.peakHour : 8
  );
  const [ritualName, setRitualName] = useState<string>(
    settings.focusRitualName || ''
  );

  // Profession Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTagFilter, setActiveTagFilter] = useState<string>('All');
  const [isBrowseAllOpen, setIsBrowseAllOpen] = useState(false);

  // Initialize ritual name on load or archetype change if empty
  useEffect(() => {
    if (!ritualName || ritualName.trim() === '') {
      const generated = generatePoeticRitualName(selectedArchetype, selectedProfession, peakHour);
      setRitualName(generated);
    }
  }, [selectedArchetype, selectedProfession, peakHour]);

  // Filtered professions list
  const filteredProfessions = useMemo(() => {
    return PROFESSIONS_DATABASE.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.archetype.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag =
        activeTagFilter === 'All' ||
        (activeTagFilter === 'Engineering' && (item.tag === 'Engineering' || item.tag === 'Hardware' || item.tag === 'Security')) ||
        (activeTagFilter === 'Arts & Media' && (item.tag === 'Art' || item.tag === 'Writing' || item.tag === 'Music' || item.tag === 'Film' || item.tag === 'Media' || item.tag === 'Design')) ||
        (activeTagFilter === 'Research & Bio' && (item.tag === 'AI' || item.tag === 'Physics' || item.tag === 'Data' || item.tag === 'Medicine' || item.tag === 'Academia' || item.tag === 'Math')) ||
        (activeTagFilter === 'Leadership & Biz' && (item.tag === 'Startup' || item.tag === 'Venture' || item.tag === 'Finance' || item.tag === 'Strategy' || item.tag === 'Law'));
      return matchesSearch && matchesTag;
    });
  }, [searchQuery, activeTagFilter]);

  if (!isOpen) return null;

  const currentArchetypeMeta = ARCHETYPES[selectedArchetype];
  const peakInfo = getPeakTimeLabel(peakHour);

  // Handle archetype selection
  const handleSelectArchetype = (arch: FocusArchetype) => {
    setSelectedArchetype(arch);
    // Find first profession in this archetype
    const defaultForArch = PROFESSIONS_DATABASE.find((p) => p.archetype === arch);
    if (defaultForArch) {
      setSelectedProfession(defaultForArch.title);
    }
    const newName = generatePoeticRitualName(arch, defaultForArch?.title, peakHour);
    setRitualName(newName);
  };

  // Handle profession selection
  const handleSelectProfession = (prof: ProfessionItem) => {
    setSelectedProfession(prof.title);
    setSelectedArchetype(prof.archetype);
    const newName = generatePoeticRitualName(prof.archetype, prof.title, peakHour);
    setRitualName(newName);
  };

  // Regenerate ritual name
  const handleRegenerateRitualName = () => {
    const fresh = generatePoeticRitualName(selectedArchetype, selectedProfession, peakHour);
    setRitualName(fresh);
  };

  // Finish Onboarding
  const handleFinish = () => {
    const meta = ARCHETYPES[selectedArchetype];

    // Determine default preset or work minutes
    let defaultPresetId = 'level_1_apprentice';
    let workMins = meta.defaultWorkMinutes;
    let breakMins = meta.defaultBreakMinutes;

    if (meta.defaultWorkMinutes === 90) {
      defaultPresetId = 'level_3_master';
    } else if (meta.defaultWorkMinutes === 60) {
      defaultPresetId = 'level_2_adept';
    }

    onCompleteOnboarding({
      archetype: selectedArchetype,
      profession: selectedProfession,
      peakHour,
      focusRitualName: ritualName || `The ${selectedArchetype} Ritual`,
      hasCompletedOnboarding: true,
      ambientType: meta.defaultAmbient,
      workMinutes: workMins,
      shortBreakMinutes: breakMins,
      activePresetId: defaultPresetId,
      username: ritualName ? `${ritualName} (${selectedProfession})` : settings.username,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden my-auto text-stone-100 flex flex-col max-h-[92vh]">
        {/* Header / Progress Bar */}
        <div className="px-5 pt-5 pb-4 border-b border-stone-800 bg-stone-900/90 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-xs">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-medium tracking-tight text-stone-100 flex items-center gap-2">
                Ritual Onboarding
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-stone-800 text-stone-400 border border-stone-700">
                  Step {step} of 3
                </span>
              </h2>
              <p className="text-xs text-stone-400">Under 60 seconds • Zero forms • Personalized flow</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
            title="Skip Onboarding"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Step Visual Progress Indicator */}
        <div className="w-full bg-stone-950 h-1 flex">
          <div
            className={`h-full transition-all duration-500 ${
              step >= 1 ? 'bg-amber-500 w-1/3' : 'bg-stone-800 w-0'
            }`}
          />
          <div
            className={`h-full transition-all duration-500 ${
              step >= 2 ? 'bg-amber-500 w-1/3' : 'bg-stone-800 w-0'
            }`}
          />
          <div
            className={`h-full transition-all duration-500 ${
              step === 3 ? 'bg-amber-500 w-1/3' : 'bg-stone-800 w-0'
            }`}
          />
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
          {/* STEP 1: What do you do? (Archetypes & 100+ Professions) */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h3 className="text-xl font-serif font-medium text-stone-100">
                  Step 1: What do you do?
                </h3>
                <p className="text-xs sm:text-sm text-stone-400 mt-1">
                  Choose your core archetype, or search among <span className="text-amber-400 font-semibold font-mono">114+ professions</span> to seed your theme, presets & audio.
                </p>
              </div>

              {/* Archetype Cards Grid (4 Archetypes) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(Object.keys(ARCHETYPES) as FocusArchetype[]).map((archKey) => {
                  const meta = ARCHETYPES[archKey];
                  const isSelected = selectedArchetype === archKey;

                  return (
                    <div
                      key={archKey}
                      onClick={() => handleSelectArchetype(archKey)}
                      className={`group relative p-4 rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden ${
                        isSelected
                          ? `bg-stone-800/90 border-amber-500/80 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/30`
                          : 'bg-stone-950/60 border-stone-800/80 hover:bg-stone-800/50 hover:border-stone-700'
                      }`}
                    >
                      {/* Accent glow gradient on card */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${meta.bgGlow} opacity-60 pointer-events-none`} />

                      <div className="relative z-10 flex items-start justify-between gap-2">
                        <div className="flex items-center space-x-2.5">
                          <div
                            className={`flex items-center justify-center w-8 h-8 rounded-lg border text-sm font-bold ${meta.badgeBg}`}
                          >
                            {archKey === 'Builder' && <Cpu className="w-4 h-4" />}
                            {archKey === 'Creator' && <Palette className="w-4 h-4" />}
                            {archKey === 'Scientist' && <Atom className="w-4 h-4" />}
                            {archKey === 'Strategist' && <Compass className="w-4 h-4" />}
                          </div>
                          <div>
                            <h4 className="font-medium text-stone-100 text-sm flex items-center gap-1.5">
                              {meta.title}
                            </h4>
                            <span className="text-[10px] text-stone-400 line-clamp-1">
                              {meta.subtitle}
                            </span>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center shrink-0">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      <p className="relative z-10 text-xs text-stone-300/90 mt-2.5 line-clamp-2 leading-relaxed">
                        "{meta.motto}"
                      </p>

                      <div className="relative z-10 mt-3 flex items-center justify-between pt-2 border-t border-stone-800/60 text-[10px] font-mono text-stone-400">
                        <span>Preset: {meta.defaultWorkMinutes}m focus</span>
                        <span className="capitalize">Sound: {meta.defaultAmbient.replace('_', ' ')}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Search 100+ Professions Bar */}
              <div className="pt-2 border-t border-stone-800/80">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Briefcase className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-stone-300">
                      Search 114+ Professions Catalog
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    Selected: {selectedProfession}
                  </span>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search e.g. Frontend Developer, Astrophysicist, Novelist, VC Partner..."
                    className="w-full pl-9 pr-4 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-500 hover:text-stone-300"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
                  {['All', 'Engineering', 'Arts & Media', 'Research & Bio', 'Leadership & Biz'].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setActiveTagFilter(tag)}
                      className={`px-2.5 py-1 rounded-lg border whitespace-nowrap transition-colors ${
                        activeTagFilter === tag
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-semibold'
                          : 'bg-stone-950 text-stone-400 border-stone-800 hover:bg-stone-800 hover:text-stone-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                {/* Filtered Professions Results Grid */}
                <div className="mt-3 max-h-40 overflow-y-auto custom-scrollbar grid grid-cols-1 sm:grid-cols-2 gap-1.5 p-1 bg-stone-950/70 border border-stone-800/80 rounded-xl">
                  {filteredProfessions.slice(0, 16).map((item) => {
                    const isProfSelected = selectedProfession === item.title;
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelectProfession(item)}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all ${
                          isProfSelected
                            ? 'bg-amber-500/20 border border-amber-500/40 text-stone-100 font-medium'
                            : 'hover:bg-stone-800/70 text-stone-300 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center space-x-2 truncate pr-2">
                          <span className="text-xs truncate">{item.title}</span>
                        </div>
                        <div className="flex items-center space-x-1 shrink-0">
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                              ARCHETYPES[item.archetype].badgeBg
                            }`}
                          >
                            {item.archetype}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {filteredProfessions.length === 0 && (
                    <div className="col-span-2 py-4 text-center text-xs text-stone-500">
                      No matching profession found. Try another search term!
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: When are you sharpest? (24h Energy Slider) */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-xl font-serif font-medium text-stone-100">
                  Step 2: When are you sharpest?
                </h3>
                <p className="text-xs sm:text-sm text-stone-400 mt-1">
                  Drag the 24-hour energy slider to align your focus rituals with your natural circadian peak.
                </p>
              </div>

              {/* Peak Window Real-time Display Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 border border-stone-800 shadow-inner flex flex-col items-center text-center space-y-3">
                <div className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider flex items-center space-x-1.5">
                  <Zap className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{peakInfo.label}</span>
                </div>

                <div>
                  <div className="text-3xl sm:text-4xl font-serif font-light tracking-tight text-stone-100">
                    {peakInfo.period}
                  </div>
                  <p className="text-xs text-stone-400 mt-1">
                    Your cognitive capacity is modeled to peak around <span className="text-stone-200 font-semibold">{peakInfo.window}</span>.
                  </p>
                </div>

                {/* Circadian Wave Visual Canvas Representation */}
                <div className="w-full h-16 pt-2">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 240 40">
                    {/* Baseline */}
                    <line x1="0" y1="35" x2="240" y2="35" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
                    {/* Sine wave for energy */}
                    <path
                      d="M 0 30 Q 60 5, 120 25 T 240 30"
                      fill="none"
                      stroke="#52525b"
                      strokeWidth="2"
                    />
                    {/* Peak Energy Highlight Indicator Dot */}
                    <circle
                      cx={(peakHour / 24) * 240}
                      cy={15 - Math.sin((peakHour / 24) * Math.PI * 2) * 10}
                      r="6"
                      fill="#f59e0b"
                      className="animate-pulse"
                    />
                    <line
                      x1={(peakHour / 24) * 240}
                      y1="0"
                      x2={(peakHour / 24) * 240}
                      y2="38"
                      stroke="#f59e0b"
                      strokeWidth="1.5"
                      strokeDasharray="2 2"
                    />
                  </svg>
                </div>
              </div>

              {/* Interactive 24-Hour Energy Slider */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-mono text-stone-400">
                  <span>Midnight (00:00)</span>
                  <span className="text-amber-400 font-bold">Hour: {peakHour}:00</span>
                  <span>11 PM (23:00)</span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="23"
                  step="1"
                  value={peakHour}
                  onChange={(e) => {
                    const hour = parseInt(e.target.value);
                    setPeakHour(hour);
                    const newName = generatePoeticRitualName(selectedArchetype, selectedProfession, hour);
                    setRitualName(newName);
                  }}
                  className="w-full h-3 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500 focus:outline-none"
                />

                {/* Quick Hour Preset Buttons */}
                <div className="grid grid-cols-5 gap-1.5 pt-2">
                  {[
                    { h: 6, label: 'Dawn (6 AM)' },
                    { h: 9, label: 'Morning (9 AM)' },
                    { h: 14, label: 'Afternoon (2 PM)' },
                    { h: 20, label: 'Evening (8 PM)' },
                    { h: 23, label: 'Night Owl (11 PM)' },
                  ].map((preset) => (
                    <button
                      key={preset.h}
                      onClick={() => {
                        setPeakHour(preset.h);
                        const newName = generatePoeticRitualName(selectedArchetype, selectedProfession, preset.h);
                        setRitualName(newName);
                      }}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-mono border text-center transition-all ${
                        peakHour === preset.h
                          ? 'bg-amber-500 text-stone-950 font-bold border-amber-500'
                          : 'bg-stone-950 text-stone-400 border-stone-800 hover:bg-stone-800'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Name your focus ritual & Preview */}
          {step === 3 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h3 className="text-xl font-serif font-medium text-stone-100">
                  Step 3: Name your focus ritual
                </h3>
                <p className="text-xs sm:text-sm text-stone-400 mt-1">
                  We've synthesized a poetic suggestion based on your <span className="text-amber-400 font-medium">{selectedProfession}</span> identity and <span className="text-amber-400 font-medium">{peakInfo.label}</span>.
                </p>
              </div>

              {/* Generated Poetic Ritual Name Box */}
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-stone-400 flex items-center justify-between">
                  <span>Ritual Title</span>
                  <button
                    onClick={handleRegenerateRitualName}
                    className="flex items-center space-x-1 text-amber-400 hover:text-amber-300 text-[11px] font-mono transition-colors"
                  >
                    <RotateCw className="w-3 h-3" />
                    <span>Shuffle Suggestion</span>
                  </button>
                </label>

                <div className="relative">
                  <input
                    type="text"
                    value={ritualName}
                    onChange={(e) => setRitualName(e.target.value)}
                    placeholder="e.g. The Dawn Scribe"
                    className="w-full px-4 py-3 bg-stone-950 border border-stone-800 rounded-xl text-lg font-serif text-amber-300 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                  <Sparkles className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/60" />
                </div>
              </div>

              {/* Seeded Settings Summary Card */}
              <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-3">
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-stone-400 border-b border-stone-800 pb-2 flex items-center justify-between">
                  <span>Seeded Profile Summary</span>
                  <span className="text-amber-400">{selectedArchetype} Archetype</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <span className="text-stone-500 block text-[10px] font-mono">PROFESSION</span>
                    <span className="text-stone-200 font-medium">{selectedProfession}</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-stone-500 block text-[10px] font-mono">PEAK TIME</span>
                    <span className="text-stone-200 font-medium">{peakInfo.period}</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-stone-500 block text-[10px] font-mono">DEFAULT PRESET</span>
                    <span className="text-stone-200 font-medium">
                      {currentArchetypeMeta.defaultWorkMinutes}m focus / {currentArchetypeMeta.defaultBreakMinutes}m break
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-stone-500 block text-[10px] font-mono">FOCUS AMBIENT</span>
                    <span className="text-stone-200 font-medium capitalize">
                      {currentArchetypeMeta.defaultAmbient.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800/60 text-[11px] text-stone-400 italic">
                  Voice style: "{currentArchetypeMeta.voiceStyle}"
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer / Navigation Controls */}
        <div className="px-5 py-4 border-t border-stone-800 bg-stone-900/90 flex items-center justify-between shrink-0">
          {step > 1 ? (
            <button
              onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep((s) => (s + 1) as 1 | 2 | 3)}
              className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95"
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg hover:shadow-amber-500/20 active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Begin Focus Ritual</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
