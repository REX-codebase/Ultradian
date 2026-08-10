import { describe, it, expect } from 'vitest';
import { isSampleSession, generate14DaySampleSessions } from '../sampleRhythm';
import { SessionRecord } from '../../types';

describe('Sample Rhythm Utilities', () => {
  describe('isSampleSession', () => {
    it('should return true for records marked with isSample: true', () => {
      const record: SessionRecord = {
        id: 'real_id_123',
        timestamp: Date.now(),
        dateString: '2026-08-08',
        durationMinutes: 45,
        actualSecondsCompleted: 2700,
        type: 'work',
        presetName: 'Deep Focus',
        category: 'Coding',
        taskName: 'Test Task',
        focusRating: 4,
        energyLevelBefore: 3,
        energyLevelAfter: 4,
        distractionsCount: 0,
        isSample: true,
      };

      expect(isSampleSession(record)).toBe(true);
    });

    it('should return true for records with sample_ or seed_ id prefixes', () => {
      const sampleRecord: SessionRecord = {
        id: 'sample_session_001',
        timestamp: Date.now(),
        dateString: '2026-08-08',
        durationMinutes: 45,
        actualSecondsCompleted: 2700,
        type: 'work',
        presetName: 'Deep Focus',
        category: 'Coding',
        taskName: 'Demo Task',
        focusRating: 4,
        energyLevelBefore: 3,
        energyLevelAfter: 4,
        distractionsCount: 0,
      };

      const seedRecord: SessionRecord = {
        id: 'seed_session_002',
        timestamp: Date.now(),
        dateString: '2026-08-08',
        durationMinutes: 45,
        actualSecondsCompleted: 2700,
        type: 'work',
        presetName: 'Deep Focus',
        category: 'Research',
        taskName: 'Seed Task',
        focusRating: 4,
        energyLevelBefore: 3,
        energyLevelAfter: 4,
        distractionsCount: 0,
      };

      expect(isSampleSession(sampleRecord)).toBe(true);
      expect(isSampleSession(seedRecord)).toBe(true);
    });

    it('should return false for genuine user sessions', () => {
      const userRecord: SessionRecord = {
        id: 'usr_session_999',
        timestamp: Date.now(),
        dateString: '2026-08-08',
        durationMinutes: 60,
        actualSecondsCompleted: 3600,
        type: 'work',
        presetName: 'Deep Focus',
        category: 'Coding',
        taskName: 'Real User Task',
        focusRating: 5,
        energyLevelBefore: 4,
        energyLevelAfter: 4,
        distractionsCount: 0,
        isSample: false,
      };

      expect(isSampleSession(userRecord)).toBe(false);
    });
  });

  describe('generate14DaySampleSessions', () => {
    it('should generate a non-empty array of sample session records', () => {
      const sessions = generate14DaySampleSessions();

      expect(Array.isArray(sessions)).toBe(true);
      expect(sessions.length).toBeGreaterThan(10);
    });

    it('should mark all generated records as sample sessions', () => {
      const sessions = generate14DaySampleSessions();

      sessions.forEach((session) => {
        expect(isSampleSession(session)).toBe(true);
        expect(session.isSample).toBe(true);
      });
    });

    it('should sort sessions in descending order by timestamp', () => {
      const sessions = generate14DaySampleSessions();

      for (let i = 0; i < sessions.length - 1; i++) {
        expect(sessions[i].timestamp).toBeGreaterThanOrEqual(sessions[i + 1].timestamp);
      }
    });
  });
});
