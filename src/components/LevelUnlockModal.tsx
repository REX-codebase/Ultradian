import React, { useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { playMilestoneSound } from '../utils/audio';
import { Sheet } from './Sheet';

interface LevelUnlockModalProps {
  unlockedLevel: 2 | 3;
  onClaimLevel: () => void;
}

export const LevelUnlockModal: React.FC<LevelUnlockModalProps> = ({
  unlockedLevel,
  onClaimLevel,
}) => {
  useEffect(() => {
    playMilestoneSound();
  }, []);

  const minutes = unlockedLevel === 2 ? 60 : 90;
  const rest = unlockedLevel === 2 ? 15 : 20;
  const title = unlockedLevel === 2 ? 'Sixty minutes' : 'Ninety minutes';
  const desc =
    unlockedLevel === 2
      ? 'Five apprentice waves are complete. The next length is sixty minutes of focus, fifteen of rest.'
      : 'Level 2 is complete. The full ninety-minute wave is open.';

  return (
    <Sheet open onClose={onClaimLevel} size="sm" labelledBy="level-title">
      <div className="px-6 pb-8 pt-4 text-center">
        <p className="text-xs tracking-[0.2em] uppercase text-[color:var(--ink-mute)]">New length</p>
        <h2 id="level-title" className="mt-3 font-serif text-3xl text-[color:var(--ink)]">
          {title}
        </h2>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-[color:var(--ink-soft)]">{desc}</p>
        <p className="mt-6 text-sm text-[color:var(--ink-mute)]">
          {minutes} / {rest} min
        </p>
        <button
          type="button"
          onClick={onClaimLevel}
          className="pressable mt-8 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[color:var(--ink)] text-[color:var(--paper)]"
        >
          <span>Continue</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </Sheet>
  );
};
