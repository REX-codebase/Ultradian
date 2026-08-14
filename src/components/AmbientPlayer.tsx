import React from 'react';
import { IconVolume } from './icons';
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
      <div className="chip-rail justify-start sm:justify-center px-1">
        {SOUNDSCAPES.map((sc) => {
          const selected = activeAmbient === sc.id;
          return (
            <button
              key={sc.id}
              type="button"
              onClick={() => onSelectAmbient(sc.id)}
              className={`pressable min-h-10 rounded-full px-3.5 text-sm ${
                selected
                  ? 'bg-[color:var(--ink)] text-[color:var(--paper)] font-medium'
                  : 'text-[color:var(--ink-mute)] hover:text-[color:var(--ink)]'
              }`}
              aria-pressed={selected}
            >
              {sc.name}
            </button>
          );
        })}
      </div>
      {activeAmbient !== 'none' && (
        <label className="mt-4 flex items-center justify-center gap-3 text-sm text-[color:var(--ink-mute)]">
          <IconVolume size={14} />
          <span className="sr-only">Volume</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={ambientVolume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="h-1 w-36 accent-[color:var(--ink)]"
          />
          <span className="tabular-nums font-mono text-xs">{Math.round(ambientVolume * 100)}</span>
        </label>
      )}
    </section>
  );
};
