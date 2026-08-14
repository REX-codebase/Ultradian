import React, { useState } from 'react';
import { Sheet } from './Sheet';
import { calculateSQI, NON_BIOLOGICAL_DISCLAIMER } from '../utils/rhythmEngine';
import { IconSettings, IconCheck } from './icons';

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
    <Sheet open onClose={onClose} size="md" title="SQI Transparency Inspector">
      <div className="space-y-6 px-5 pb-7 pt-2 sm:px-7 text-[color:var(--ink)]">
        <div className="flex items-center gap-3">
          <div className="liquid-glass-badge p-2 rounded-xl">
            <IconSettings size={18} className="text-[color:var(--ink)]" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[color:var(--ink-mute)]">
              MODEL TRANSPARENCY INSPECTOR
            </span>
            <h3 className="font-serif text-xl font-normal text-[color:var(--ink)]">
              Session Quality Index (SQI)
            </h3>
          </div>
        </div>

        {/* Live Simulator Score Header */}
        <div className="liquid-glass-card p-5 text-center space-y-1.5">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[color:var(--ink-mute)]">
            SQI SIMULATION RESULT
          </span>
          <div className="clock-face text-5xl font-serif text-[color:var(--ink)]">
            {sqi.score} <span className="text-sm font-sans text-[color:var(--ink-mute)]">/ 100</span>
          </div>
          <span className="liquid-glass-badge inline-block px-3 py-0.5 rounded-full text-xs font-serif italic text-[color:var(--ink-soft)]">
            Tier: {sqi.tier}
          </span>
        </div>

        {/* Breakdown Factors List */}
        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center p-3 rounded-xl bg-[color:var(--paper)] border border-[color:var(--line)]">
            <span className="font-medium text-[color:var(--ink-soft)]">1. Focus Rating Weight (40%):</span>
            <span className="font-mono font-semibold text-[color:var(--ink)]">{sqi.breakdown.focusComponent} / 40 pts</span>
          </div>

          <div className="flex justify-between items-center p-3 rounded-xl bg-[color:var(--paper)] border border-[color:var(--line)]">
            <span className="font-medium text-[color:var(--ink-soft)]">2. Completion Ratio (25%):</span>
            <span className="font-mono font-semibold text-[color:var(--ink)]">{sqi.breakdown.completionComponent} / 25 pts</span>
          </div>

          <div className="flex justify-between items-center p-3 rounded-xl bg-[color:var(--paper)] border border-[color:var(--line)]">
            <span className="font-medium text-[color:var(--ink-soft)]">3. Interruption Shield (20%):</span>
            <span className="font-mono font-semibold text-[color:var(--ink)]">{sqi.breakdown.distractionComponent} / 20 pts</span>
          </div>

          <div className="flex justify-between items-center p-3 rounded-xl bg-[color:var(--paper)] border border-[color:var(--line)]">
            <span className="font-medium text-[color:var(--ink-soft)]">4. Energy Retention (15%):</span>
            <span className="font-mono font-semibold text-[color:var(--ink)]">{sqi.breakdown.energyRetentionComponent} / 15 pts</span>
          </div>
        </div>

        {/* Interactive Simulator Controls */}
        <div className="space-y-3 pt-2 border-t border-[color:var(--line)] text-xs">
          <h4 className="font-serif text-sm font-medium text-[color:var(--ink)]">Test Simulator Controls</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="sim-focus-rating" className="block text-[10px] font-mono text-[color:var(--ink-mute)] mb-1.5">
                Focus Rating (1-5): {testFocus}★
              </label>
              <input
                id="sim-focus-rating"
                type="range"
                min="1"
                max="5"
                value={testFocus}
                onChange={(e) => setTestFocus(parseInt(e.target.value))}
                className="liquid-slider"
              />
            </div>

            <div>
              <label htmlFor="sim-distractions-count" className="block text-[10px] font-mono text-[color:var(--ink-mute)] mb-1.5">
                Distractions: {testDistractions}
              </label>
              <input
                id="sim-distractions-count"
                type="range"
                min="0"
                max="5"
                value={testDistractions}
                onChange={(e) => setTestDistractions(parseInt(e.target.value))}
                className="liquid-slider"
              />
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-[10px] text-[color:var(--ink-mute)] leading-relaxed italic border-t border-[color:var(--line)] pt-3">
          {NON_BIOLOGICAL_DISCLAIMER}
        </p>
      </div>
    </Sheet>
  );
};
