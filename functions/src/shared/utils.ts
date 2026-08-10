/**
 * Shared utility functions for Firebase Cloud Functions
 */

export const LEAGUE_TIERS = [
  'wood',
  'bronze',
  'silver',
  'gold',
  'platinum',
  'diamond',
  'ultradian_master',
] as const;

export type LeagueTier = (typeof LEAGUE_TIERS)[number];

/**
 * Computes deterministic ISO week string (e.g. "2026-W32") in UTC.
 */
export function getISOWeekString(dateInput: Date | number = new Date()): string {
  const date = typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
}
