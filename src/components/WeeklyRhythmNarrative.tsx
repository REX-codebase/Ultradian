import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { SessionRecord, UserSettings } from '../types';
import { generateWeeklyRhythmReportFallback, NON_BIOLOGICAL_DISCLAIMER } from '../utils/rhythmEngine';
import { SignInGate } from './SignInGate';
import { IconSparkle, IconCheck } from './icons';

interface WeeklyRhythmNarrativeProps {
  records: SessionRecord[];
  settings: UserSettings;
  onAcceptExperiment: (workMins: number, breakMins: number, ambient: any) => void;
  isAuthorizedForAi?: boolean;
  onOpenAuth?: () => void;
}

export const WeeklyRhythmNarrative: React.FC<WeeklyRhythmNarrativeProps> = ({
  records,
  onAcceptExperiment,
  isAuthorizedForAi = true,
  onOpenAuth,
}) => {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [accepted, setAccepted] = useState(false);

  const triggerHaptic = useCallback(() => {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(8);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!isAuthorizedForAi) return;
    let isMounted = true;
    const loadNarrative = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/gemini/weekly-rhythm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ records }),
        });

        if (!response.ok) throw new Error(`Status ${response.status}`);
        const data = await response.json();
        if (isMounted) setReport(data);
      } catch (e) {
        console.warn('Using client-side fallback for weekly rhythm:', e);
        if (isMounted) setReport(generateWeeklyRhythmReportFallback(records));
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadNarrative();
    return () => {
      isMounted = false;
    };
  }, [records, isAuthorizedForAi]);

  if (!isAuthorizedForAi) {
    return (
      <SignInGate
        featureName="Weekly Rhythm Intelligence"
        featureDescription="Sign in to read a tailored weekly narrative synthesis drawn from your completed focus waves."
        onOpenAuth={onOpenAuth}
      />
    );
  }

  if (loading) {
    return (
      <div className="space-y-3" aria-busy="true" aria-label="Synthesizing weekly rhythm report">
        <div className="skeleton-line h-6 w-48 rounded-lg" />
        <div className="skeleton-line w-full rounded-lg" />
        <div className="skeleton-line w-5/6 rounded-lg" />
        <div className="skeleton-line w-2/3 rounded-lg" />
      </div>
    );
  }

  const r = report || generateWeeklyRhythmReportFallback(records);

  const handleAccept = () => {
    if (!r?.experiment) return;
    triggerHaptic();
    onAcceptExperiment(
      r.experiment.targetWorkMinutes,
      r.experiment.targetBreakMinutes,
      r.experiment.targetAmbient
    );
    setAccepted(true);
    setTimeout(() => setAccepted(false), 3000);
  };

  return (
    <article className="space-y-6">
      <header className="flex items-start justify-between gap-4 border-b border-[color:var(--line)]/60 pb-4">
        <div>
          <span className="liquid-glass-badge inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-widest text-[color:var(--ink-soft)]">
            <IconSparkle size={10} className="text-[color:var(--ink)]" />
            <span>Rhythm Synthesis</span>
          </span>
          <h3 className="mt-2 font-serif text-2xl text-[color:var(--ink)] font-normal">This Week's Narrative</h3>
        </div>
        <div className="text-right">
          <span className="clock-face font-serif text-2xl font-medium text-[color:var(--ink)]">
            {r?.avgDailyFocusHours || '1.8'}h
          </span>
          <span className="block text-[10px] font-mono uppercase text-[color:var(--ink-mute)]">Daily Avg</span>
        </div>
      </header>

      <div className="space-y-3 text-sm leading-relaxed text-[color:var(--ink-soft)] font-sans">
        <p className="first-letter:font-serif first-letter:text-2xl first-letter:font-semibold first-letter:mr-1">
          {r?.summaryParagraph}
        </p>
        <p>{r?.energyPatternText}</p>
      </div>

      {r?.experiment && (
        <div className="liquid-glass-card p-5 space-y-3 bg-[color:var(--paper)]/80">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[color:var(--ink-mute)]">
              Next Hypothesis Experiment
            </span>
            <span className="liquid-glass-badge rounded-full px-2.5 py-0.5 text-[10px] font-mono text-[color:var(--ink-soft)]">
              {r.experiment.targetWorkMinutes}m focus / {r.experiment.targetBreakMinutes}m rest
            </span>
          </div>

          <h4 className="font-serif text-lg text-[color:var(--ink)] font-normal">{r.experiment.title}</h4>
          
          <p className="text-xs leading-relaxed text-[color:var(--ink-soft)]">
            {r.experiment.hypothesis}
          </p>
          
          <p className="text-xs text-[color:var(--ink-mute)]">
            <strong className="text-[color:var(--ink-soft)]">Expected outcome:</strong> {r.experiment.expectedOutcome}
          </p>

          <div className="pt-2">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleAccept}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold tracking-wide transition-all ${
                accepted
                  ? 'bg-[color:var(--ink)] text-[color:var(--paper)] shadow-sm'
                  : 'bg-[color:var(--ink)] text-[color:var(--paper)] hover:opacity-90 shadow-sm'
              }`}
            >
              {accepted ? (
                <>
                  <IconCheck size={14} />
                  <span>Experiment Applied</span>
                </>
              ) : (
                <span>Apply Experiment Durations</span>
              )}
            </motion.button>
          </div>
        </div>
      )}

      <p className="text-[11px] leading-normal text-[color:var(--ink-mute)] italic pt-1">
        {NON_BIOLOGICAL_DISCLAIMER}
      </p>
    </article>
  );
};
