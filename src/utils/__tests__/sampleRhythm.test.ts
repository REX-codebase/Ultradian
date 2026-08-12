import { describe, expect, it } from 'vitest';
import { isSampleSession, generate14DaySampleSessions } from '../sampleRhythm';
import { SessionRecord } from '../../types';

function session(id: string, isSample = false): SessionRecord {
  return {
    id,
    timestamp: Date.now(),
    dateString: '2026-08-08',
    durationMinutes: 45,
    actualSecondsCompleted: 2700,
    type: 'work',
    presetName: 'Deep Focus',
    category: 'Coding',
    taskName: 'Focus task',
    focusRating: 4,
    energyLevelBefore: 3,
    energyLevelAfter: 4,
    distractionsCount: 0,
    isSample,
  };
}

describe('legacy demo-data guard', () => {
  it.each(['sample_session_001', 'seed_session_002', 'demo_1', 'test-session', 'friend-42', 'local_peer_7', 'mock_user_9'])(
    'rejects fabricated record id %s',
    (id) => {
      expect(isSampleSession(session(id))).toBe(true);
    }
  );

  it('rejects a record explicitly marked as sample data', () => {
    expect(isSampleSession(session('session_123', true))).toBe(true);
  });

  it('accepts a genuine user session', () => {
    expect(isSampleSession(session('session_123'))).toBe(false);
  });

  it('generates no sample records', () => {
    expect(generate14DaySampleSessions()).toEqual([]);
  });
});
