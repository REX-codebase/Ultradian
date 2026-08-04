import React from 'react';
import { Flame, Clock, Check, Info } from 'lucide-react';
import { UltradianPreset } from '../types';
import { DEFAULT_PRESETS } from '../utils/storage';

interface PresetSelectorProps {
  activePresetId: string;
  onSelectPreset: (preset: UltradianPreset) => void;
  onOpenCustomSettings: () => void;
}

export const PresetSelector: React.FC<PresetSelectorProps> = ({
  activePresetId,
  onSelectPreset,
  onOpenCustomSettings,
}) => {
  return (
    <div className="w-full max-w-lg mx-auto mt-6 p-4 sm:p-6 rounded-xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800/80 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Flame className="w-4 h-4 text-stone-500" />
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
            Biological Rhythm Presets
          </h3>
        </div>
        <button
          onClick={onOpenCustomSettings}
          className="text-xs font-semibold text-stone-600 dark:text-stone-300 hover:underline flex items-center space-x-1"
        >
          <span>Configure cycles</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {DEFAULT_PRESETS.map((preset) => {
          const isSelected = activePresetId === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              className={`relative flex flex-col p-4 rounded-md border text-left transition-all duration-200 ${
                isSelected
                  ? 'bg-stone-100 dark:bg-stone-800 border-stone-900 dark:border-stone-100 ring-1 ring-stone-900 dark:ring-stone-100 shadow-xs'
                  : 'bg-stone-50/50 dark:bg-stone-900/45 border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-850'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-serif text-sm font-medium text-stone-900 dark:text-stone-100">
                  {preset.name}
                </span>
                {isSelected && (
                  <span className="p-0.5 rounded-full bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900">
                    <Check className="w-3 h-3" />
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2 text-[10px] font-bold tracking-wider uppercase text-stone-500 dark:text-stone-400 mb-1.5">
                <span className="flex items-center">
                  <Clock className="w-3 h-3 mr-1 text-stone-400" />
                  {preset.workMinutes}m Active
                </span>
                <span>•</span>
                <span>{preset.shortBreakMinutes}m Rest</span>
              </div>

              <p className="text-[11px] text-stone-400 dark:text-stone-500 leading-normal line-clamp-2">
                {preset.description}
              </p>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-start space-x-3 p-3 rounded-md bg-stone-50 dark:bg-stone-800/40 border border-stone-200/50 dark:border-stone-800/60 text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed">
        <Info className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
        <p>
          <strong className="text-stone-800 dark:text-stone-300 font-semibold">Ultradian Dynamics:</strong> The human nervous system operates in alternating peaks and troughs of bio-electrical efficiency. Honoring this 90m rhythm protects neuro-chemical pools from exhaustion.
        </p>
      </div>
    </div>
  );
};
