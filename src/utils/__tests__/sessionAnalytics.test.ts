import { describe, expect, it } from 'vitest';
import { calculatePersonalFocusAnalytics, getGenuineWorkSessions, totalHoursLabel } from '../sessionAnalytics';
import { SessionRecord } from '../../types';

function record(overrides: Partial<SessionRecord>): SessionRecord {
  return {
    id: 'session_default',
    timestamp: new Date('2026-08-12T09:00:00').getTime(),
    dateString: '2026-08-12',
    durationMinutes: 60,
    actualSecondsCompleted: 3600,
    type: 'work',
    presetName: 'level_2_adept',
    category: 'Coding',
    taskName: 'Real work',
    focusRating: 4,
    energyLevelAfter: 4,
    distractionsCount: 0,
    ...overrides,
  };
}

describe('personal focus analytics', () => {
  it('counts the complete genuine work history and excludes every non-user record', () => {
    const records = [
      record({ id: 'session_1', actualSecondsCompleted: 7200, durationMinutes: 120, focusRating: 5 }),
      record({ id: 'session_2', actualSecondsCompleted: 1800, durationMinutes: 30, focusRating: 3, category: 'Study', distractionsCount: 2 }),
      record({ id: 'demo_1', actualSecondsCompleted: 9999, durationMinutes: 166 }),
      record({ id: 'seed_session_1', actualSecondsCompleted: 9999, durationMinutes: 166 }),
      record({ id: 'session_break', type: 'shortBreak', actualSecondsCompleted: 900, durationMinutes: 15 }),
    ];

    const analytics = calculatePersonalFocusAnalytics(records, new Date('2026-08-12T12:00:00'));

    expect(getGenuineWorkSessions(records)).toHaveLength(2);
    expect(analytics.totalFocusMinutes).toBe(150);
    expect(totalHoursLabel(analytics.totalFocusMinutes)).toBe('2.5');
    expect(analytics.totalCompletedCycles).toBe(2);
    expect(analytics.averageFocusScore).toBe(4);
    expect(analytics.totalDistractions).toBe(2);
    expect(analytics.categoryData).toEqual([
      expect.objectContaining({ name: 'Coding', value: 2 }),
      expect.objectContaining({ name: 'Study', value: 0.5 }),
    ]);
  });

  it('uses recorded seconds rather than a guessed preset duration', () => {
    const analytics = calculatePersonalFocusAnalytics([
      record({ id: 'session_partial', durationMinutes: 90, actualSecondsCompleted: 2700 }),
    ]);

    expect(analytics.totalFocusMinutes).toBe(45);
    expect(totalHoursLabel(analytics.totalFocusMinutes)).toBe('0.8');
  });
});
