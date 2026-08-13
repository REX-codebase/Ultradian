import React, { useEffect } from 'react';
import { SessionType } from '../types';
import { Sheet } from './Sheet';

interface SoftSessionTransitionProps {
  isVisible: boolean;
  toType: SessionType;
  durationMins: number;
  onContinue: () => void;
}

export const SoftSessionTransition: React.FC<SoftSessionTransitionProps> = ({
  isVisible,
  toType,
  durationMins,
  onContinue,
}) => {
  useEffect(() => {
    if (!isVisible) return;
    const timer = setTimeout(onContinue, 4200);
    return () => clearTimeout(timer);
  }, [isVisible, onContinue]);

  const isWork = toType === 'work';

  return (
    <Sheet open={isVisible} onClose={onContinue} size="sm">
      <div className="px-6 pb-8 pt-4 text-center">
        <p className="text-xs tracking-[0.2em] uppercase text-[color:var(--ink-mute)]">
          {isWork ? 'Focus' : 'Rest'}
        </p>
        <h2 className="mt-4 font-serif text-3xl tracking-tight text-[color:var(--ink)]">
          {isWork ? `${durationMins} minutes of focus` : `${durationMins} minutes to recover`}
        </h2>
        <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-[color:var(--ink-soft)]">
          {isWork ? 'Clear the desk. One task. Begin when you are ready.' : 'Step away. Let the last wave settle.'}
        </p>
        <div className="ink-bar mx-auto mt-8 w-36" />
        <button
          type="button"
          onClick={onContinue}
          className="pressable mt-8 min-h-12 w-full rounded-full bg-[color:var(--ink)] text-[color:var(--paper)]"
        >
          {isWork ? 'Begin' : 'Rest'}
        </button>
      </div>
    </Sheet>
  );
};
