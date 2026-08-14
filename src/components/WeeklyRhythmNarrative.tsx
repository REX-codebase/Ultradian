import React, { useState, useEffect } from 'react';
import { SessionRecord, UserSettings } from '../types';
import { generateWeeklyRhythmReportFallback, NON_BIOLOGICAL_DISCLAIMER } from '../utils/rhythmEngine';
import { SignInGate } from './SignInGate';

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
        featureName="Weekly notes"
        featureDescription="Sign in to read a weekly rhythm note drawn from your own sessions."
        onOpenAuth={onOpenAuth}
      />
    );
  }

  if (loading) {
    return (
      <div className="space-y-3" aria-busy="true" aria-label="Writing this week’s note">
        <div className="skeleton-line h-6 w-40" />
        <div className="skeleton-line w-full" />
        <div className="skeleton-line w-5/6" />
        <div className="skeleton-line w-2/3" />
      </div>
    );
  }

  const r = report || generateWeeklyRhythmReportFallback(records);

  const handleAccept = () => {
    if (!r?.experiment) return;
    onAcceptExperiment(
      r.experiment.targetWorkMinutes,
      r.experiment.targetBreakMinutes,
      r.experiment.targetAmbient
    );
    setAccepted(true);
    setTimeout(() => setAccepted(false), 3000);
  };

  return (
    <article className="space-y-5">
      <header>
        <p className="text-sm text-[color:var(--ink-mute)]">
          {r?.avgDailyFocusHours || '1.8'} hrs average
        </p>
        <h3 className="mt-1 font-serif text-xl text-[color:var(--ink)]">This week’s note</h3>
      </header>

      <div className="max-w-prose space-y-3 text-base leading-relaxed text-[color:var(--ink-soft)]">
        <p>{r?.summaryParagraph}</p>
        <p>{r?.energyPatternText}</p>
      </div>

      {r?.experiment && (
        <div className="space-y-3 border-t border-[color:var(--line)] pt-5">
          <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--ink-mute)]">Try next</p>
          <h4 className="font-serif text-lg text-[color:var(--ink)]">{r.experiment.title}</h4>
          <p className="max-w-prose text-sm leading-relaxed text-[color:var(--ink-soft)]">
            {r.experiment.hypothesis}
          </p>
          <p className="text-sm text-[color:var(--ink-mute)]">
            {r.experiment.targetWorkMinutes} / {r.experiment.targetBreakMinutes} min · {r.experiment.expectedOutcome}
          </p>
          <button
            type="button"
            onClick={handleAccept}
            className="pressable min-h-11 text-sm text-[color:var(--ink)] underline-offset-4 hover:underline"
          >
            {accepted ? 'Applied' : 'Use these lengths'}
          </button>
        </div>
      )}

      <p className="text-xs leading-relaxed text-[color:var(--ink-mute)]">{NON_BIOLOGICAL_DISCLAIMER}</p>
    </article>
  );
};
