import { initializeApp, getApps } from 'firebase-admin/app';

if (!getApps().length) {
  initializeApp();
}

export { onSessionCreate } from './sessions';
export { weeklyLeagueMatchmaking } from './leagues';
export { validateVipCode } from './vip';
export { generateAiInsights } from './ai';
export { getISOWeekString } from './shared/utils';
