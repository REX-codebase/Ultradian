import React, { useState } from 'react';
import { X, SlidersHorizontal, Info, ShieldCheck, Award, Zap, CheckCircle2 } from 'lucide-react';
import { calculateSQI, NON_BIOLOGICAL_DISCLAIMER } from '../utils/rhythmEngine';

interface SqiModelInspectorModalProps {
  onClose: () => void;
}

export const SqiModelInspectorModal: React.FC<SqiModelInspectorModalProps> = ({ onClose }) => {
  const [testFocus, setTestFocus] = useState(4);
  const [testDuration, setTestDuration] = useState(60);
  const [testCompletedSec, setTestCompletedSec] = useState(3600);
  const [testDistractions, setTestDistractions] = useState(1);
  const [testEnergyBefore, setTestEnergyBefore] = useState(4);
  const [testEnergyAfter, setTestEnergyAfter] = useState(4);

  const sqi = calculateSQI({
    durationMinutes: testDuration,
    actualSecondsCompleted: testCompletedSec,
    focusRating: testFocus,
    energyLevelBefore: testEnergyBefore,
    energyLevelAfter: testEnergyAfter,
    distractionsCount: testDistractions,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl text-stone-900 dark:text-stone-100 relative overflow-hidden space-y-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
              MODEL TRANSPARENCY INSPECTOR
            </span>
            <h3 className="font-serif text-xl font-medium text-stone-900 dark:text-stone-100">
              Session Quality Index (SQI)
            </h3>
          </div>
        </div>

        {/* Live Simulator Score Header */}
        <div className="p-4 rounded-2xl bg-stone-900 text-stone-100 border border-stone-800 text-center space-y-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400">
            SQI SIMULATION RESULT
          </span>
          <div className="text-4xl font-serif font-light text-white">
            {sqi.score} <span className="text-sm font-sans font-normal text-stone-400">/ 100</span>
          </div>
          <span className="inline-block px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-serif italic">
            Tier: {sqi.tier}
          </span>
        </div>

        {/* Breakdown Factors List */}
        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-800">
            <span className="font-semibold text-stone-700 dark:text-stone-300">1. Focus Rating Weight (40%):</span>
            <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{sqi.breakdown.focusComponent} / 40 pts</span>
          </div>

          <div className="flex justify-between items-center p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-800">
            <span className="font-semibold text-stone-700 dark:text-stone-300">2. Completion Ratio (25%):</span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{sqi.breakdown.completionComponent} / 25 pts</span>
          </div>

          <div className="flex justify-between items-center p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-800">
            <span className="font-semibold text-stone-700 dark:text-stone-300">3. Interruption Shield (20%):</span>
            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{sqi.breakdown.distractionComponent} / 20 pts</span>
          </div>

          <div className="flex justify-between items-center p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-800">
            <span className="font-semibold text-stone-700 dark:text-stone-300">4. Energy Retention (15%):</span>
            <span className="font-mono font-bold text-amber-500">{sqi.breakdown.energyRetentionComponent} / 15 pts</span>
          </div>
        </div>

        {/* Interactive Controls to Test Formula */}
        <div className="space-y-3 pt-2 border-t border-stone-200 dark:border-stone-800 text-xs">
          <h4 className="font-serif font-medium text-stone-900 dark:text-stone-100">Test Simulator Controls</h4>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono text-stone-500 mb-1">Focus Rating (1-5): {testFocus}</label>
              <input
                type="range"
                min="1"
                max="5"
                value={testFocus}
                onChange={(e) => setTestFocus(parseInt(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-stone-500 mb-1">Distractions: {testDistractions}</label>
              <input
                type="range"
                min="0"
                max="5"
                value={testDistractions}
                onChange={(e) => setTestDistractions(parseInt(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Non-biological Disclaimer */}
        <div className="p-3 rounded-xl bg-stone-100 dark:bg-stone-800/50 text-[10px] text-stone-500 dark:text-stone-400 leading-normal flex items-start space-x-2">
          <ShieldCheck className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
          <span>{NON_BIOLOGICAL_DISCLAIMER}</span>
        </div>
      </div>
    </div>
  );
};
