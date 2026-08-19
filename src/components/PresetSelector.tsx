import React from 'react';
import { motion } from 'motion/react';
import { UltradianPreset } from '../types';
import { DEFAULT_PRESETS } from '../utils/storage';
import { IconCheck, IconSettings } from './icons';

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
    <div className="swift-glass-card w-full max-w-lg mx-auto mt-6 p-5 sm:p-6 text-[color:var(--ink)]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[color:var(--ink-mute)]">
            BIOLOGICAL RHYTHM PRESETS
          </span>
          <h3 className="font-serif text-lg font-normal text-[color:var(--ink)]">
            Preset Cadences
          </h3>
        </div>
        <motion.button
          type="button"
          whileHover={{ scale: 1.05, y: -1 }}
          whileTap={{ scale: 0.94 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          onClick={onOpenCustomSettings}
          className="liquid-glass-badge rounded-full px-3 py-1 text-xs font-medium text-[color:var(--ink-soft)] hover:text-[color:var(--ink)] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <IconSettings size={13} />
          <span>Customise</span>
        </motion.button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {DEFAULT_PRESETS.map((preset) => {
          const isSelected = activePresetId === preset.id;
          return (
            <motion.button
              key={preset.id}
              whileHover={{ scale: 1.025, y: -1.5 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 450, damping: 25 }}
              onClick={() => onSelectPreset(preset)}
              className={`relative flex flex-col p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[color:var(--ink)] text-[color:var(--paper)] border-[color:var(--ink)] shadow-md'
                  : 'bg-[color:var(--paper)]/80 text-[color:var(--ink-soft)] border-[color:var(--line)] hover:border-[color:var(--ink-mute)]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-serif text-base font-medium">
                  {preset.name}
                </span>
                {isSelected && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    className="rounded-full bg-[color:var(--paper)] text-[color:var(--ink)] p-0.5"
                  >
                    <IconCheck size={12} strokeWidth={3} />
                  </motion.span>
                )}
              </div>

              <div className="flex items-center gap-2 text-[10px] font-mono font-medium tracking-wider uppercase opacity-80 mb-1.5">
                <span>{preset.workMinutes}m Focus</span>
                <span>·</span>
                <span>{preset.shortBreakMinutes}m Rest</span>
              </div>

              <p className="text-[11px] opacity-70 leading-normal line-clamp-2">
                {preset.description}
              </p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
