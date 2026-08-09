import { FocusArchetype, AmbientSoundType, CategoryTag } from '../types';
import { PROFESSIONS_DATABASE } from './professions-data';

export { PROFESSIONS_DATABASE };

export interface ArchetypeMeta {
  id: FocusArchetype;
  title: string;
  subtitle: string;
  description: string;
  motto: string;
  iconName: string; // Lucide icon name representation
  accentColor: string; // Tailwind color class
  bgGlow: string;
  badgeBg: string;
  defaultAmbient: AmbientSoundType;
  defaultWorkMinutes: number;
  defaultBreakMinutes: number;
  defaultCategory: CategoryTag;
  voiceStyle: string;
  poeticNouns: string[];
  poeticAdjectives: string[];
}

export const ARCHETYPES: Record<FocusArchetype, ArchetypeMeta> = {
  Builder: {
    id: 'Builder',
    title: 'Builder',
    subtitle: 'Engineers, Developers, Craftsmen & Makers',
    description: 'You construct tangible solutions, code, infrastructure, and resilient physical or digital architecture.',
    motto: 'Build with precision, fortify with code, iterate endlessly.',
    iconName: 'Cpu',
    accentColor: 'text-amber-500 dark:text-amber-400 border-amber-500/50',
    bgGlow: 'from-amber-500/10 via-amber-500/5 to-transparent',
    badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/20',
    defaultAmbient: 'brown_noise',
    defaultWorkMinutes: 60,
    defaultBreakMinutes: 15,
    defaultCategory: 'Coding',
    voiceStyle: 'Tactical, pragmatic, momentum-focused.',
    poeticNouns: ['Forge', 'Sanctuary', 'Altar', 'Workshop', 'Engine', 'Monolith', 'Circuit', 'Foundry'],
    poeticAdjectives: ['Silicon', 'Cybernetic', 'Architectural', 'Tangible', 'Iron', 'Pragmatic', 'Structural'],
  },
  Creator: {
    id: 'Creator',
    title: 'Creator',
    subtitle: 'Writers, Designers, Artists, Musicians & Storytellers',
    description: 'You weave original ideas into visual, textual, auditory, and cinematic forms that move the world.',
    motto: 'Unleash imagination, shape raw emotion, evoke wonder.',
    iconName: 'Palette',
    accentColor: 'text-indigo-500 dark:text-indigo-400 border-indigo-500/50',
    bgGlow: 'from-indigo-500/10 via-purple-500/5 to-transparent',
    badgeBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20',
    defaultAmbient: 'rain_waves',
    defaultWorkMinutes: 45,
    defaultBreakMinutes: 10,
    defaultCategory: 'Design',
    voiceStyle: 'Evocative, poetic, expressive.',
    poeticNouns: ['Canvas', 'Scribe', 'Oasis', 'Prism', 'Studio', 'Easel', 'Echo', 'Harmony'],
    poeticAdjectives: ['Nocturnal', 'Luminous', 'Chromatic', 'Poetic', 'Aesthetic', 'Vivid', 'Harmonic'],
  },
  Scientist: {
    id: 'Scientist',
    title: 'Scientist',
    subtitle: 'Researchers, Data Scholars, Analysts & Experimenters',
    description: 'You investigate deep truths, analyze complex data, prove hypotheses, and expand human knowledge.',
    motto: 'Question all assumptions, observe rigor, uncover fundamental truth.',
    iconName: 'Atom',
    accentColor: 'text-cyan-500 dark:text-cyan-400 border-cyan-500/50',
    bgGlow: 'from-cyan-500/10 via-blue-500/5 to-transparent',
    badgeBg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 border-cyan-500/20',
    defaultAmbient: 'alpha_binaural',
    defaultWorkMinutes: 90,
    defaultBreakMinutes: 20,
    defaultCategory: 'Research',
    voiceStyle: 'Empirical, precise, systematic.',
    poeticNouns: ['Lab', 'Codex', 'Observatory', 'Chamber', 'Hypothesis', 'Nexus', 'Matrix', 'Spectrum'],
    poeticAdjectives: ['Empirical', 'Quantum', 'Analytic', 'Rigorous', 'Celestial', 'Synaptic', 'Axiomatic'],
  },
  Strategist: {
    id: 'Strategist',
    title: 'Strategist',
    subtitle: 'Founders, Executives, Planners, Investors & Leaders',
    description: 'You map future trajectories, allocate leverage, optimize complex systems, and lead bold visions.',
    motto: 'Chart the horizon, maximize leverage, execute flawlessly.',
    iconName: 'Compass',
    accentColor: 'text-emerald-500 dark:text-emerald-400 border-emerald-500/50',
    bgGlow: 'from-emerald-500/10 via-teal-500/5 to-transparent',
    badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20',
    defaultAmbient: 'deep_space',
    defaultWorkMinutes: 50,
    defaultBreakMinutes: 10,
    defaultCategory: 'Strategy',
    voiceStyle: 'Visionary, direct, high-leverage.',
    poeticNouns: ['Vault', 'Compass', 'Zenith', 'Command', 'Horizon', 'Citadel', 'Vanguard', 'Apex'],
    poeticAdjectives: ['Strategic', 'Meridian', 'Sovereign', 'Tactical', 'Decisive', 'Panoramic', 'Leveraged'],
  },
};

/**
 * Generate a poetic focus ritual name given archetype, profession title, and peak hour
 */
export function generatePoeticRitualName(
  archetype: FocusArchetype,
  professionTitle?: string,
  peakHour: number = 8
): string {
  const meta = ARCHETYPES[archetype];
  
  let timePrefix = 'Dawn';
  if (peakHour >= 0 && peakHour < 5) timePrefix = 'Nocturnal';
  else if (peakHour >= 5 && peakHour < 8) timePrefix = 'Aurora';
  else if (peakHour >= 8 && peakHour < 12) timePrefix = 'Morning';
  else if (peakHour >= 12 && peakHour < 16) timePrefix = 'Meridian';
  else if (peakHour >= 16 && peakHour < 20) timePrefix = 'Twilight';
  else timePrefix = 'Midnight';

  const randomAdj = meta.poeticAdjectives[Math.floor(Math.random() * meta.poeticAdjectives.length)];
  const randomNoun = meta.poeticNouns[Math.floor(Math.random() * meta.poeticNouns.length)];

  let cleanProf = professionTitle ? professionTitle.split(' ')[0] : archetype;
  if (cleanProf.length < 3) cleanProf = archetype;

  const templates = [
    `The ${timePrefix} ${randomNoun}`,
    `The ${randomAdj} ${randomNoun}`,
    `The ${cleanProf} ${randomNoun}`,
    `${timePrefix} ${randomAdj} ${randomNoun}`,
    `The ${timePrefix} ${cleanProf} Sanctuary`,
    `The ${randomAdj} ${meta.title} Altar`,
  ];

  return templates[Math.floor(Math.random() * templates.length)];
}

/**
 * Get time window string from peak hour
 */
export function getPeakTimeLabel(hour: number): { label: string; period: string; window: string } {
  const format12 = (h: number) => {
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12}:00 ${ampm}`;
  };

  const endHour = (hour + 3) % 24;
  const startStr = format12(hour);
  const endStr = format12(endHour);

  let period = 'Morning Peak';
  if (hour >= 0 && hour < 5) period = 'Deep Night Owl';
  else if (hour >= 5 && hour < 8) period = 'Early Dawn';
  else if (hour >= 8 && hour < 12) period = 'Morning Sharpness';
  else if (hour >= 12 && hour < 16) period = 'Midday Flow';
  else if (hour >= 16 && hour < 20) period = 'Twilight Surge';
  else period = 'Late Night Focus';

  return {
    label: period,
    period: `${startStr} – ${endStr}`,
    window: `${startStr} to ${endStr}`,
  };
}
