import { SessionRecord } from '../types';

/**
 * Checks whether a session record is a sample/demo session.
 */
export function isSampleSession(record: SessionRecord): boolean {
  if (!record) return false;
  return !!record.isSample || record.id.startsWith('sample_') || record.id.startsWith('seed_');
}

/**
 * Empty stub for sample sessions.
 */
export function generate14DaySampleSessions(): SessionRecord[] {
  return [];
}
