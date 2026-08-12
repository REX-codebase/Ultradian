import { SessionRecord } from '../types';

const NON_USER_SESSION_ID = /^(sample|seed|demo|test|friend|local_peer|mock)[_-]/i;

/**
 * Identifies legacy demo data so it can never be presented, aggregated, synced,
 * or used to influence recommendations.
 */
export function isSampleSession(record: Pick<SessionRecord, 'id' | 'isSample'> | null | undefined): boolean {
  if (!record?.id) return true;
  return Boolean(record.isSample) || NON_USER_SESSION_ID.test(record.id);
}

/**
 * Intentionally returns no records. Sample-session generation was retired so
 * first-run analytics and social data always reflect genuine user activity.
 */
export function generate14DaySampleSessions(): SessionRecord[] {
  return [];
}
