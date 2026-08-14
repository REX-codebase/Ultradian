export interface TouchPoint {
  x: number;
  y: number;
  time: number;
}

export interface SwipeOptions {
  minDistance?: number;
  maxTime?: number;
  directionalRatio?: number;
}

const DEFAULT_OPTIONS: Required<SwipeOptions> = {
  minDistance: 45,
  maxTime: 800,
  directionalRatio: 1.25,
};

/**
 * Calculates whether a touch gesture qualifies as a horizontal swipe.
 * Returns 'left' (swiped toward left), 'right' (swiped toward right), or null.
 */
export function detectHorizontalSwipe(
  start: TouchPoint,
  end: TouchPoint,
  options?: SwipeOptions
): 'left' | 'right' | null {
  const config = { ...DEFAULT_OPTIONS, ...options };
  const deltaX = end.x - start.x;
  const deltaY = end.y - start.y;
  const deltaTime = end.time - start.time;

  if (deltaTime > config.maxTime) {
    return null;
  }

  const absX = Math.abs(deltaX);
  const absY = Math.abs(deltaY);

  if (absX < config.minDistance) {
    return null;
  }

  // Must be dominantly horizontal so vertical scrolling is not intercepted
  if (absX < absY * config.directionalRatio) {
    return null;
  }

  return deltaX < 0 ? 'left' : 'right';
}

/**
 * Determines the next or previous tab given current tab, available tabs, and swipe direction.
 * Sliding thumb left moves forward to the next tab.
 * Sliding thumb right moves backward to the previous tab.
 */
export function resolveTabFromSwipe<T extends string>(
  currentTab: T,
  tabOrder: readonly T[],
  swipeDirection: 'left' | 'right'
): T | null {
  const currentIndex = tabOrder.indexOf(currentTab);
  if (currentIndex === -1) return null;

  if (swipeDirection === 'left') {
    // Slide left -> next tab
    if (currentIndex < tabOrder.length - 1) {
      return tabOrder[currentIndex + 1];
    }
  } else if (swipeDirection === 'right') {
    // Slide right -> previous tab
    if (currentIndex > 0) {
      return tabOrder[currentIndex - 1];
    }
  }

  return null;
}
