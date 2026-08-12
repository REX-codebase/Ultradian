import { CategoryTag, SessionRecord } from '../types';
import { isSampleSession } from './sampleRhythm';

export interface WeeklyFocusPoint {
  date: string;
  label: string;
  minutes: number;
  cycles: number;
}

export interface CategoryFocusPoint {
  name: string;
  value: number;
}

export interface HourlyFocusPoint {
  hourLabel: string;
  focusMinutes: number;
}

export interface PersonalFocusAnalytics {
  records: SessionRecord[];
  weeklyData: WeeklyFocusPoint[];
  categoryData: CategoryFocusPoint[];
  hourlyData: HourlyFocusPoint[];
  totalFocusMinutes: number;
  totalCompletedCycles: number;
  averageFocusScore: number;
  totalDistractions: number;
  ultradianEfficiencyScore: number;
}

function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getSessionSeconds(record: Pick<SessionRecord, 'actualSecondsCompleted' | 'durationMinutes'>): number {
  const actualSeconds = Number(record.actualSecondsCompleted);
  if (Number.isFinite(actualSeconds) && actualSeconds >= 0) return actualSeconds;

  const durationMinutes = Number(record.durationMinutes);
  return Number.isFinite(durationMinutes) && durationMinutes >= 0 ? durationMinutes * 60 : 0;
}

/**
 * Returns the complete, genuine work-session history eligible for private
 * analytics. Breaks and legacy demo records are deliberately excluded.
 */
export function getGenuineWorkSessions(records: SessionRecord[]): SessionRecord[] {
  return records.filter((record) => {
    return (
      record?.type === 'work' &&
      !isSampleSession(record) &&
      Number.isFinite(getSessionSeconds(record)) &&
      getSessionSeconds(record) > 0
    );
  });
}

/** Computes all dashboard aggregates from exactly the same genuine work-session set. */
export function calculatePersonalFocusAnalytics(
  records: SessionRecord[],
  now = new Date()
): PersonalFocusAnalytics {
  const genuineRecords = getGenuineWorkSessions(records);
  const days: Record<string, WeeklyFocusPoint> = {};

  for (let offset = 6; offset >= 0; offset -= 1) {
    const day = new Date(now);
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - offset);
    const key = localDateKey(day);
    days[key] = {
      date: key,
      label: day.toLocaleDateString('en-US', { weekday: 'short' }),
      minutes: 0,
      cycles: 0,
    };
  }

  const categoryMinutes: Record<string, number> = {};
  const hourlyMinutes: Record<number, number> = {};
  for (let hour = 0; hour < 24; hour += 2) hourlyMinutes[hour] = 0;

  let totalFocusSeconds = 0;
  let totalFocusRating = 0;
  let ratingCount = 0;
  let totalDistractions = 0;

  genuineRecords.forEach((record) => {
    const seconds = getSessionSeconds(record);
    const minutes = seconds / 60;
    totalFocusSeconds += seconds;
    totalDistractions += Math.max(0, Number(record.distractionsCount) || 0);

    if (typeof record.focusRating === 'number' && record.focusRating >= 1 && record.focusRating <= 5) {
      totalFocusRating += record.focusRating;
      ratingCount += 1;
    }

    const category = record.category || 'General';
    categoryMinutes[category] = (categoryMinutes[category] || 0) + minutes;

    const sessionDate = new Date(record.timestamp);
    const day = days[localDateKey(sessionDate)];
    if (day) {
      day.minutes += minutes;
      day.cycles += 1;
    }

    const bucket = Math.floor(sessionDate.getHours() / 2) * 2;
    hourlyMinutes[bucket] = (hourlyMinutes[bucket] || 0) + minutes;
  });

  const averageFocusScore = ratingCount > 0 ? totalFocusRating / ratingCount : 0;
  const totalFocusMinutes = Math.round(totalFocusSeconds / 60);
  const rawEfficiency = genuineRecords.length > 0
    ? (genuineRecords.length * 15) + (averageFocusScore * 10) - (totalDistractions * 2)
    : 0;

  return {
    records: genuineRecords,
    weeklyData: Object.values(days).map((day) => ({
      ...day,
      minutes: Math.round(day.minutes),
    })),
    categoryData: Object.entries(categoryMinutes)
      .map(([name, minutes]) => ({ name, value: Math.round((minutes / 60) * 10) / 10 }))
      .sort((a, b) => b.value - a.value),
    hourlyData: Object.entries(hourlyMinutes).map(([hour, minutes]) => {
      const value = Number(hour);
      const hourLabel = value === 0 ? '12am' : value === 12 ? '12pm' : value > 12 ? `${value - 12}pm` : `${value}am`;
      return { hourLabel, focusMinutes: Math.round(minutes) };
    }),
    totalFocusMinutes,
    totalCompletedCycles: genuineRecords.length,
    averageFocusScore,
    totalDistractions,
    ultradianEfficiencyScore: genuineRecords.length > 0
      ? Math.min(100, Math.max(0, Math.round(rawEfficiency)))
      : 0,
  };
}

export function totalHoursLabel(totalFocusMinutes: number): string {
  return (totalFocusMinutes / 60).toFixed(1);
}

export function categoryFromRecords(records: SessionRecord[]): CategoryTag {
  const analytics = calculatePersonalFocusAnalytics(records);
  return (analytics.categoryData[0]?.name as CategoryTag) || 'General';
}
