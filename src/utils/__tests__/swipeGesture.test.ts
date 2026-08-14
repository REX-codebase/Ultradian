import { describe, it, expect } from 'vitest';
import { detectHorizontalSwipe, resolveTabFromSwipe } from '../swipeGesture';

describe('detectHorizontalSwipe', () => {
  it('detects a clean swipe left (thumb sliding left)', () => {
    const start = { x: 250, y: 300, time: 1000 };
    const end = { x: 150, y: 310, time: 1200 };
    const result = detectHorizontalSwipe(start, end);
    expect(result).toBe('left');
  });

  it('detects a clean swipe right (thumb sliding right)', () => {
    const start = { x: 100, y: 300, time: 1000 };
    const end = { x: 220, y: 295, time: 1250 };
    const result = detectHorizontalSwipe(start, end);
    expect(result).toBe('right');
  });

  it('ignores vertical scrolling movement', () => {
    const start = { x: 150, y: 200, time: 1000 };
    const end = { x: 170, y: 380, time: 1200 };
    const result = detectHorizontalSwipe(start, end);
    expect(result).toBeNull();
  });

  it('ignores tiny jitter / taps under threshold', () => {
    const start = { x: 150, y: 200, time: 1000 };
    const end = { x: 165, y: 205, time: 1100 };
    const result = detectHorizontalSwipe(start, end, { minDistance: 45 });
    expect(result).toBeNull();
  });

  it('ignores very slow drag gestures exceeding maxTime', () => {
    const start = { x: 300, y: 200, time: 1000 };
    const end = { x: 100, y: 200, time: 2500 };
    const result = detectHorizontalSwipe(start, end, { maxTime: 800 });
    expect(result).toBeNull();
  });
});

describe('resolveTabFromSwipe', () => {
  const tabs = ['timer', 'analytics', 'friends'] as const;

  it('navigates to next tab on left swipe', () => {
    expect(resolveTabFromSwipe('timer', tabs, 'left')).toBe('analytics');
    expect(resolveTabFromSwipe('analytics', tabs, 'left')).toBe('friends');
    expect(resolveTabFromSwipe('friends', tabs, 'left')).toBeNull();
  });

  it('navigates to previous tab on right swipe', () => {
    expect(resolveTabFromSwipe('friends', tabs, 'right')).toBe('analytics');
    expect(resolveTabFromSwipe('analytics', tabs, 'right')).toBe('timer');
    expect(resolveTabFromSwipe('timer', tabs, 'right')).toBeNull();
  });

  it('respects dynamic tab arrays (e.g. 2 tabs when leagues disabled)', () => {
    const twoTabs = ['timer', 'analytics'] as const;
    expect(resolveTabFromSwipe('analytics', twoTabs, 'left')).toBeNull();
    expect(resolveTabFromSwipe('analytics', twoTabs, 'right')).toBe('timer');
  });
});
