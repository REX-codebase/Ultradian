import React from 'react';
import { AmbientSoundType } from '../types';

interface AmbientPlayerProps {
  activeAmbient: AmbientSoundType;
  ambientVolume: number;
  onSelectAmbient: (type: AmbientSoundType) => void;
  onVolumeChange: (vol: number) => void;
}

const SOUNDSCAPES: Array<{ id: AmbientSoundType; name: string }> = [
  { id: 'none', name: 'Quiet' },
  { id: 'alpha_binaural', name: 'Alpha' },
  { id: 'theta_binaural', name: 'Theta' },
  { id: 'brown_noise', name: 'Brown' },
  { id: 'rain_waves', name: 'Rain' },
  { id: 'pink_noise', name: 'Pink' },
  { id: 'white_noise', name: 'White' },
  { id: 'deep_space', name: 'Space' },
];

export const AmbientPlayer: React.FC<AmbientPlayerProps> = ({
  activeAmbient,
  ambientVolume,
  onSelectAmbient,
  onVolumeChange,
}) => {
  return (
    <section className="mx-auto w-full max-w-xl px-1" aria-label="Soundscape">
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {SOUNDSCAPES.map((sc) => {
          const selected = activeAmbient === sc.id;
          return (
            <button
              key={sc.id}
              type="button"
              onClick={() => onSelectAmbient(sc.id)}
              className={`min-h-10 rounded-full px-3.5 text-sm transition-colors ${
                selected
                  ? 'bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
              aria-pressed={selected}
            >
              {sc.name}
            </button>
          );
        })}
      </div>
      {activeAmbient !== 'none' && (
        <label className="mt-4 flex items-center justify-center gap-3 text-sm text-stone-500">
          <span className="sr-only">Volume</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={ambientVolume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="h-1 w-36 accent-stone-800 dark:accent-stone-200"
          />
          <span className="tabular-nums">{Math.round(ambientVolume * 100)}</span>
        </label>
      )}
    </section>
  );
};
