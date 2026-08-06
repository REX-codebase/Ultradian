import React, { useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Sparkles,
  CloudRain,
  Radio,
  Wind,
  Waves,
  Disc,
  Feather,
  Orbit,
} from 'lucide-react';
import { AmbientSoundType } from '../types';

interface AmbientPlayerProps {
  activeAmbient: AmbientSoundType;
  ambientVolume: number;
  onSelectAmbient: (type: AmbientSoundType) => void;
  onVolumeChange: (vol: number) => void;
}

interface SoundscapeOption {
  id: AmbientSoundType;
  name: string;
  tag: string;
  desc: string;
  icon: React.ReactNode;
  freq: string;
}

const SOUNDSCAPES: SoundscapeOption[] = [
  {
    id: 'none',
    name: 'Silent Focus',
    tag: 'ORGANIC',
    desc: 'Unfiltered natural environmental silence',
    icon: <VolumeX className="w-4 h-4 text-stone-400" />,
    freq: '0 Hz',
  },
  {
    id: 'alpha_binaural',
    name: 'Alpha Waves',
    tag: 'COGNITIVE FLOW',
    desc: '10 Hz binaural beat for intense deep concentration',
    icon: <Radio className="w-4 h-4 text-amber-500" />,
    freq: '10 Hz',
  },
  {
    id: 'theta_binaural',
    name: 'Theta Flow',
    tag: 'CREATIVE INSIGHT',
    desc: '6 Hz binaural beat for creative problem solving',
    icon: <Disc className="w-4 h-4 text-indigo-500" />,
    freq: '6 Hz',
  },
  {
    id: 'brown_noise',
    name: 'Brown Noise Sanctum',
    tag: 'DEEP SHIELD',
    desc: 'Low-frequency rumble that cancels surrounding chatter',
    icon: <Wind className="w-4 h-4 text-amber-600" />,
    freq: '400 Hz Cut',
  },
  {
    id: 'rain_waves',
    name: 'Rain on Cedar',
    tag: 'ACOUSTIC CALM',
    desc: 'Calming auditory rhythm of rainfall and ocean swell',
    icon: <CloudRain className="w-4 h-4 text-sky-500" />,
    freq: 'Rhythmic',
  },
  {
    id: 'pink_noise',
    name: 'Pink Wave River',
    tag: 'BALANCED MASK',
    desc: 'Equal energy per octave for smooth study environments',
    icon: <Feather className="w-4 h-4 text-emerald-500" />,
    freq: '1/f Spectrum',
  },
  {
    id: 'white_noise',
    name: 'Clean White Noise',
    tag: 'WIDE SHIELD',
    desc: 'Full-spectrum acoustic mask for high-noise areas',
    icon: <Waves className="w-4 h-4 text-stone-500" />,
    freq: 'Wide Spectrum',
  },
  {
    id: 'deep_space',
    name: 'Cosmic Drift',
    tag: 'SUB-SYNTH AMBIENCE',
    desc: 'Enveloping warm sub-bass drone for prolonged flow',
    icon: <Orbit className="w-4 h-4 text-purple-500" />,
    freq: '55 Hz Sub',
  },
];

export const AmbientPlayer: React.FC<AmbientPlayerProps> = ({
  activeAmbient,
  ambientVolume,
  onSelectAmbient,
  onVolumeChange,
}) => {
  // Live Procedural Audio Visualizer Canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (activeAmbient === 'none') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let phase = 0;

    const render = () => {
      phase += 0.05;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barCount = 18;
      const barWidth = canvas.width / barCount - 2;

      for (let i = 0; i < barCount; i++) {
        const height =
          Math.sin(phase + i * 0.4) * 12 +
          Math.cos(phase * 0.8 + i * 0.2) * 8 +
          18;

        const x = i * (barWidth + 2);
        const y = canvas.height - height;

        ctx.fillStyle = activeAmbient === 'alpha_binaural' ? '#f59e0b' : '#a8a29e';
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, height, 3);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [activeAmbient]);

  return (
    <div className="w-full max-w-2xl mx-auto rounded-2xl bg-white/90 dark:bg-stone-900/90 border border-stone-200/90 dark:border-stone-800/90 p-5 sm:p-6 shadow-xs backdrop-blur-sm transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-stone-100 dark:border-stone-800">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-medium text-stone-900 dark:text-stone-100">
              Soundscape Presets & Procedural Audio
            </h3>
            <p className="text-[11px] text-stone-400 dark:text-stone-500">
              Acoustic shielding tuned for neuro-electrical focus
            </p>
          </div>
        </div>

        {/* Master Volume & Live Visualizer */}
        <div className="flex items-center space-x-4">
          {activeAmbient !== 'none' && (
            <canvas ref={canvasRef} width={90} height={28} className="shrink-0" />
          )}

          <div className="flex items-center space-x-2 bg-stone-100/80 dark:bg-stone-800/80 px-3 py-1.5 rounded-xl border border-stone-200/60 dark:border-stone-700/60">
            <button
              onClick={() => onSelectAmbient(activeAmbient === 'none' ? 'alpha_binaural' : 'none')}
              className="text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
            >
              {activeAmbient !== 'none' ? (
                <Volume2 className="w-4 h-4 text-amber-500" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>

            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={ambientVolume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              disabled={activeAmbient === 'none'}
              className="w-16 sm:w-20 h-1 bg-stone-300 dark:bg-stone-700 accent-stone-900 dark:accent-stone-100 rounded-lg cursor-pointer disabled:opacity-40"
            />
            <span className="text-[10px] font-mono font-bold text-stone-500 dark:text-stone-400 w-7">
              {Math.round(ambientVolume * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Soundscape Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SOUNDSCAPES.map((sc) => {
          const isSelected = activeAmbient === sc.id;
          return (
            <button
              key={sc.id}
              onClick={() => onSelectAmbient(sc.id)}
              className={`relative flex items-start p-3.5 rounded-xl border text-left transition-all duration-200 ${
                isSelected
                  ? 'bg-stone-100 dark:bg-stone-800/90 border-stone-900 dark:border-stone-100 ring-1 ring-stone-900 dark:ring-stone-100 shadow-xs'
                  : 'bg-stone-50/60 dark:bg-stone-900/40 border-stone-200/80 dark:border-stone-800 hover:bg-stone-100/80 dark:hover:bg-stone-800/60'
              }`}
            >
              <div className="p-2.5 rounded-lg bg-white dark:bg-stone-800 border border-stone-200/60 dark:border-stone-700 mr-3 shrink-0">
                {sc.icon}
              </div>

              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-serif text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
                    {sc.name}
                  </span>
                  <span className="text-[9px] font-mono font-bold text-stone-400 dark:text-stone-500 shrink-0">
                    {sc.freq}
                  </span>
                </div>

                <div className="flex items-center space-x-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-stone-200/60 dark:bg-stone-800 text-[8px] font-bold tracking-wider text-stone-600 dark:text-stone-400 uppercase">
                    {sc.tag}
                  </span>
                </div>

                <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-tight line-clamp-2 pt-0.5">
                  {sc.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
