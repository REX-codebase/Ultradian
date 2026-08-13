import { LeagueTier } from '../types';

export const DIRTY_LEAGUE_GLYPHS = ['🪵', '🥉', '🥈', '🥇', '💎', '💠', '⚡', '👑'] as const;

const DIRTY_GLYPH_PATTERN = /[🪵🥉🥈🥇💎💠⚡👑]/gu;

export const LEAGUE_MARKS: Record<LeagueTier, string> = {
  wood: 'I',
  bronze: 'II',
  silver: 'III',
  gold: 'IV',
  platinum: 'V',
  diamond: 'VI',
  ultradian_master: 'VII',
};

export function leagueMark(tier: LeagueTier): string {
  return LEAGUE_MARKS[tier] || 'I';
}

export function cleanDisplayMark(raw: string | undefined | null, fallback = '·'): string {
  if (!raw) return fallback;
  const stripped = raw.replace(DIRTY_GLYPH_PATTERN, '').trim();
  if (!stripped) return fallback;
  return stripped;
}

export function tribeDisplayMark(icon: string | undefined | null, name: string): string {
  const cleaned = cleanDisplayMark(icon, '');
  if (cleaned) return cleaned.slice(0, 2).toUpperCase();
  const initial = (name || '').trim().slice(0, 1).toUpperCase();
  return initial || '·';
}

export function markContainsDirtyGlyph(value: string): boolean {
  DIRTY_GLYPH_PATTERN.lastIndex = 0;
  return DIRTY_GLYPH_PATTERN.test(value);
}
