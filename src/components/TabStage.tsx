import React, { useRef, useState, useCallback } from 'react';
import { detectHorizontalSwipe, TouchPoint } from '../utils/swipeGesture';

interface TabStageProps {
  active: string;
  direction: number;
  children: React.ReactNode;
  tabOrder?: readonly string[];
  onSwipe?: (direction: 'left' | 'right') => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onDragProgress?: (progress: number, isDragging: boolean) => void;
}

interface TouchSession {
  startX: number;
  startY: number;
  time: number;
  ignore: boolean;
  lockedHorizontal: boolean;
  lockedVertical: boolean;
}

export const TabStage: React.FC<TabStageProps> = ({
  active,
  direction,
  children,
  tabOrder = ['timer', 'analytics', 'friends'],
  onSwipe,
  onSwipeLeft,
  onSwipeRight,
  onDragProgress,
}) => {
  const touchSessionRef = useRef<TouchSession | null>(null);
  const [dragOffset, setDragOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const activeIndex = tabOrder.indexOf(active);
  const isFirstTab = activeIndex <= 0;
  const isLastTab = activeIndex >= tabOrder.length - 1;

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];

    const target = e.target as HTMLElement | null;
    let shouldIgnore = false;
    try {
      if (target && typeof target.closest === 'function') {
        shouldIgnore = Boolean(
          target.closest('input[type="range"], [data-no-swipe="true"], [role="slider"], button, a, select, textarea')
        );
      }
    } catch {
      shouldIgnore = false;
    }

    touchSessionRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      time: Date.now(),
      ignore: shouldIgnore,
      lockedHorizontal: false,
      lockedVertical: false,
    };
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const session = touchSessionRef.current;
    if (!session || session.ignore || session.lockedVertical) return;

    const touch = e.touches[0];
    if (!touch) return;

    const deltaX = touch.clientX - session.startX;
    const deltaY = touch.clientY - session.startY;

    // Check gesture direction lock
    if (!session.lockedHorizontal && !session.lockedVertical) {
      if (Math.abs(deltaY) > 8 && Math.abs(deltaY) >= Math.abs(deltaX)) {
        session.lockedVertical = true;
        return;
      }
      if (Math.abs(deltaX) > 7 && Math.abs(deltaX) > Math.abs(deltaY) * 1.05) {
        session.lockedHorizontal = true;
        setIsDragging(true);
      }
    }

    if (session.lockedHorizontal) {
      // Calculate rubber band resistance at boundaries
      let effectiveDelta = deltaX;
      if ((isFirstTab && deltaX > 0) || (isLastTab && deltaX < 0)) {
        effectiveDelta = deltaX * 0.28;
      }

      setDragOffset(effectiveDelta);

      // Normalized progress: positive when moving toward next tab (deltaX < 0)
      const stageWidth = typeof window !== 'undefined' ? Math.min(window.innerWidth, 540) : 400;
      const normalizedProgress = -effectiveDelta / stageWidth;
      onDragProgress?.(normalizedProgress, true);
    }
  };

  const finishGesture = useCallback(
    (e?: React.TouchEvent<HTMLDivElement>) => {
      const session = touchSessionRef.current;
      touchSessionRef.current = null;

      if (!session || session.ignore || session.lockedVertical) {
        setIsDragging(false);
        setDragOffset(0);
        onDragProgress?.(0, false);
        return;
      }

      if (session.lockedHorizontal && e) {
        const touch = e.changedTouches[0];
        const endPoint: TouchPoint = touch
          ? { x: touch.clientX, y: touch.clientY, time: Date.now() }
          : { x: session.startX + dragOffset, y: session.startY, time: Date.now() };

        const startPoint: TouchPoint = {
          x: session.startX,
          y: session.startY,
          time: session.time,
        };

        const swipeDirection = detectHorizontalSwipe(startPoint, endPoint, {
          minDistance: 38,
          maxTime: 750,
          directionalRatio: 1.15,
        });

        if (swipeDirection) {
          onSwipe?.(swipeDirection);
          if (swipeDirection === 'left') {
            onSwipeLeft?.();
          } else if (swipeDirection === 'right') {
            onSwipeRight?.();
          }
        }
      }

      setIsDragging(false);
      setDragOffset(0);
      onDragProgress?.(0, false);
    },
    [dragOffset, onDragProgress, onSwipe, onSwipeLeft, onSwipeRight]
  );

  return (
    <div
      className="tab-stage touch-pan-y transition-transform"
      data-direction={direction < 0 ? 'back' : 'forward'}
      data-dragging={isDragging ? 'true' : undefined}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={finishGesture}
      onTouchCancel={finishGesture}
      style={{
        transform: isDragging ? `translate3d(${dragOffset}px, 0, 0)` : undefined,
        transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {children}
    </div>
  );
};

