import { describe, expect, it } from 'vitest';
import { LeagueTier } from '../../types';
import {
  DIRTY_LEAGUE_GLYPHS,
  cleanDisplayMark,
  leagueMark,
  markContainsDirtyGlyph,
  tribeDisplayMark,
} from '../leagueMarks';

const TIERS: LeagueTier[] = [
  'wood',
  'bronze',
  'silver',
  'gold',
  'platinum',
  'diamond',
  'ultradian_master',
];

describe('league and leaderboard marks', () => {
  it('maps every league tier to a clean non-emoji mark', () => {
    for (const tier of TIERS) {
      const mark = leagueMark(tier);
      expect(mark.length).toBeGreaterThan(0);
      for (const glyph of DIRTY_LEAGUE_GLYPHS) {
        expect(mark).not.toContain(glyph);
      }
      expect(markContainsDirtyGlyph(mark)).toBe(false);
    }
  });

  it('strips a dirty tribe icon and never returns the banned glyphs', () => {
    const dirtyTribeIcon = '🪵';
    const cleaned = cleanDisplayMark(dirtyTribeIcon, '·');
    const tribe = tribeDisplayMark(dirtyTribeIcon, 'Oak Circle');

    expect(cleaned).not.toContain(dirtyTribeIcon);
    expect(tribe).not.toContain(dirtyTribeIcon);
    for (const glyph of DIRTY_LEAGUE_GLYPHS) {
      expect(cleaned).not.toContain(glyph);
      expect(tribe).not.toContain(glyph);
    }
    expect(markContainsDirtyGlyph(cleaned)).toBe(false);
    expect(markContainsDirtyGlyph(tribe)).toBe(false);
  });
});
