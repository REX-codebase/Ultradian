import React from 'react';
import { Volume2, VolumeX, Sparkles, CloudRain, Radio, Wind, Waves } from 'lucide-react';
import { AmbientSoundType } from '../types';

interface AmbientPlayerProps {
  activeAmbient: AmbientSoundType;
  ambientVolume: number;
  onSelectAmbient: (type: AmbientSoundType) => void;
  onVolumeChange: (vol: number) => void;
}

const AMBIENT_OPTIONS: { id: AmbientSoundType; name: string; desc: string; icon: React.ReactNode }[] = [
  {
    id: 'none',
    name: 'Silent Focus',
    desc: 'Unfiltered organic environmental silence',
    icon: <VolumeX className="w-3.5 h-3.5 text-stone-450" />,
  },
  {
    id: 'alpha_binaural',
    name: 'Alpha Waves (10 Hz)',
    desc: 'Binaural stimulation to assist cognitive depth',
    icon: <Radio className="w-3.5 h-3.5 text-stone-600 dark:text-stone-300" />,
  },
  {
    id: 'brown_noise',
    name: 'Deep Brown Noise',
    desc: 'Low-frequency masking to shield mental focus',
    icon: <Wind className="w-3.5 h-3.5 text-stone-600 dark:text-stone-300" />,
  },
  {
    id: 'rain_waves',
    name: 'Gentle Rain & Waves',
    desc: 'Calming auditory rhythm of natural rainfall',
    icon: <CloudRain className="w-3.5 h-3.5 text-stone-600 dark:text-stone-300" />,
  },
  {
    id: 'white_noise',
    name: 'Clean White Noise',
    desc: 'Stable wide-spectrum mask for high-noise areas',
    icon: <Waves className="w-3.5 h-3.5 text-stone-600 dark:text-stone-300" />,
  },
];

export const AmbientPlayer: React.FC<AmbientPlayerProps> = ({
  activeAmbient,
  ambientVolume,
  onSelectAmbient,
  onVolumeChange,
}) => {
  return (
    <div className="w-full max-w-lg mx-auto mt-6 p-6 rounded-xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800/80 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-stone-500" />
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
            Procedural Audio Shield
          </h3>
        </div>

        {/* Master Volume Control */}
        {activeAmbient !== 'none' && (
          <div className="flex items-center space-x-2.5">
            <Volume2 className="w-3.5 h-3.5 text-stone-400" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={ambientVolume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-20 sm:w-24 h-1 bg-stone-100 dark:bg-stone-800 accent-stone-900 dark:accent-stone-100 rounded-lg cursor-pointer"
            />
            <span className="text-[10px] font-mono font-bold text-stone-400 dark:text-stone-500 w-8">
              {Math.round(ambientVolume * 100)}%
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {AMBIENT_OPTIONS.map((opt) => {
          const isSelected = activeAmbient === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => onSelectAmbient(opt.id)}
              className={`flex items-start p-4 rounded-md border text-left transition-all duration-200 ${
                isSelected
                  ? 'bg-stone-100 dark:bg-stone-800 border-stone-900 dark:border-stone-100 ring-1 ring-stone-900 dark:ring-stone-100 shadow-xs'
                  : 'bg-stone-50/50 dark:bg-stone-900/45 border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-850'
              }`}
            >
              <div className="p-2 rounded-sm bg-stone-200/50 dark:bg-stone-850 mr-3.5 shrink-0">
                {opt.icon}
              </div>

              <div className="space-y-0.5">
                <span className="font-serif text-sm font-medium text-stone-900 dark:text-stone-100">
                  {opt.name}
                </span>
                <span className="text-[11px] text-stone-400 dark:text-stone-500 leading-normal block">
                  {opt.desc}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
