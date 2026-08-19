import React, { useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { IconVolume, IconVolumeMute } from './icons';
import { AmbientSoundType } from '../types';

interface AmbientPlayerProps {
  activeAmbient: AmbientSoundType;
  ambientVolume: number;
  onSelectAmbient: (type: AmbientSoundType) => void;
  onVolumeChange: (vol: number) => void;
}

const SOUNDSCAPES: Array<{ id: AmbientSoundType; name: string; tag: string }> = [
  { id: 'none', name: 'Quiet', tag: 'Silence' },
  { id: 'alpha_binaural', name: 'Alpha Wave', tag: '10Hz Focus' },
  { id: 'theta_binaural', name: 'Theta Wave', tag: '6Hz Flow' },
  { id: 'brown_noise', name: 'Brown Noise', tag: 'Deep Warmth' },
  { id: 'rain_waves', name: 'Rain Waves', tag: 'Bio-Acoustic' },
  { id: 'pink_noise', name: 'Pink Noise', tag: 'Balanced' },
  { id: 'white_noise', name: 'White Noise', tag: 'Broadband' },
  { id: 'deep_space', name: 'Deep Space', tag: 'Ambient Drone' },
];

export const AmbientPlayer: React.FC<AmbientPlayerProps> = ({
  activeAmbient,
  ambientVolume,
  onSelectAmbient,
  onVolumeChange,
}) => {
  const triggerHaptic = useCallback(() => {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(8);
      }
    } catch {}
  }, []);

  const isPlaying = activeAmbient !== 'none';

  return (
    <section className="mx-auto w-full max-w-xl px-1" aria-label="Soundscape Console">
      <div className="flex flex-col items-center">
        {/* Soundscape Chip Rail */}
        <div className="chip-rail justify-start sm:justify-center px-1 py-1 max-w-full">
          {SOUNDSCAPES.map((sc) => {
            const selected = activeAmbient === sc.id;
            return (
              <motion.button
                key={sc.id}
                type="button"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  triggerHaptic();
                  onSelectAmbient(sc.id);
                }}
                className={`group relative flex min-h-9 items-center gap-1.5 rounded-full px-3.5 text-xs font-medium tracking-wide transition-all duration-200 ${
                  selected
                    ? 'bg-[color:var(--ink)] text-[color:var(--paper)] shadow-xs'
                    : 'text-[color:var(--ink-mute)] hover:text-[color:var(--ink)] hover:bg-[color:var(--line)]/40'
                }`}
                aria-pressed={selected}
              >
                {selected && sc.id !== 'none' && (
                  <span className="flex items-center gap-0.5 mr-0.5">
                    <span className="h-2 w-0.5 rounded-full bg-[color:var(--paper)] animate-pulse" />
                    <span className="h-3 w-0.5 rounded-full bg-[color:var(--paper)] animate-pulse delay-75" />
                    <span className="h-1.5 w-0.5 rounded-full bg-[color:var(--paper)] animate-pulse delay-150" />
                  </span>
                )}
                <span>{sc.name}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Volume & Acoustic Control Panel */}
        <AnimatePresence>
          {isPlaying && (
            <motion.div
              initial={{ opacity: 0, y: -6, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -6, height: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="mt-3.5 flex items-center justify-center gap-3.5 text-xs text-[color:var(--ink-mute)] liquid-glass-dock px-4 py-2"
            >
              <IconVolume size={15} className="text-[color:var(--ink)] shrink-0" />
              <label htmlFor="ambient-volume-slider" className="sr-only">
                Soundscape volume
              </label>
              <input
                id="ambient-volume-slider"
                name="ambientVolume"
                aria-label="Soundscape volume"
                type="range"
                min="0"
                max="1"
                step="0.02"
                value={ambientVolume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className="liquid-slider w-28 sm:w-36"
              />
              <span className="tabular-nums font-mono text-[11px] font-semibold text-[color:var(--ink)] w-7 text-right">
                {Math.round(ambientVolume * 100)}%
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
