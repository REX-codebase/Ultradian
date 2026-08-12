import React, { useState, useEffect } from 'react';
import { Calendar, Sparkles, Zap, CheckCircle2, Loader2, ArrowRight, Info, ShieldCheck } from 'lucide-react';
import { SessionRecord, UserSettings } from '../types';
import { generateWeeklyRhythmReportFallback, NON_BIOLOGICAL_DISCLAIMER } from '../utils/rhythmEngine';
import { VipCodeGate } from './VipCodeGate';

interface WeeklyRhythmNarrativeProps {
  records: SessionRecord[];
  settings: UserSettings;
  onAcceptExperiment: (workMins: number, breakMins: number, ambient: any) => void;
  isAuthorizedForAi?: boolean;
  onOpenAuth?: () => void;
  onUnlockVip?: () => void;
}

export const WeeklyRhythmNarrative: React.FC<WeeklyRhythmNarrativeProps> = ({
  records,
  settings,
  onAcceptExperiment,
  isAuthorizedForAi = true,
  onOpenAuth,
  onUnlockVip,
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
      <VipCodeGate
        featureName="Weekly notes"
        featureDescription="Weekly rhythm notes are available after you sign in or enter a creator code."
        onOpenAuth={onOpenAuth}
        onUnlocked={onUnlockVip}
      />
    );
  }

  if (loading) {
    return (
      <div className="p-8 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-center space-y-3">
        <Loader2 className="w-6 h-6 animate-spin text-amber-500 mx-auto" />
        <p className="text-xs font-mono uppercase tracking-wider text-stone-500">
          Synthesizing "Your rhythm this week" Narrative...
        </p>
      </div>
    );
  }

  const r = report || generateWeeklyRhythmReportFallback(records);

  const handleAccept = () => {
    onAcceptExperiment(
      r.experiment.targetWorkMinutes,
      r.experiment.targetBreakMinutes,
      r.experiment.targetAmbient
    );
    setAccepted(true);
    setTimeout(() => setAccepted(false), 3000);
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white/80 dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800/80 shadow-2xl backdrop-blur-xl space-y-6 animate-fade-in relative overflow-hidden transition-all duration-300">
      {/* Top Banner Accent */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-200/60 dark:border-stone-800/60 pb-5">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-stone-900 to-amber-900 dark:from-stone-100 dark:to-amber-200 text-stone-100 dark:text-stone-900 shadow-md">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
              Weekly Cognitive Synthesis
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-medium text-stone-900 dark:text-stone-100 mt-1">
              Your Rhythm This Week
            </h3>
          </div>
        </div>

        <span className="px-3.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider bg-stone-100 dark:bg-stone-800/80 text-stone-700 dark:text-stone-300 rounded-full border border-stone-200/60 dark:border-stone-700/60">
          {r.avgDailyFocusHours || '1.8'} hrs avg daily
        </span>
      </div>

      {/* Narrative Text */}
      <div className="prose dark:prose-invert text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed font-sans space-y-3">
        <p>{r.summaryParagraph}</p>
        <p className="text-xs text-amber-600 dark:text-amber-400 font-medium italic bg-amber-500/5 p-3 rounded-xl border border-amber-500/15">
          💡 {r.energyPatternText}
        </p>
      </div>

      {/* Proposed Experiment Card */}
      <div className="p-6 rounded-2xl bg-amber-500/10 dark:bg-amber-500/10 border border-amber-500/30 text-stone-900 dark:text-stone-100 space-y-4">
        <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400">
          <Zap className="w-4 h-4 fill-current animate-pulse" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest">
            PROPOSED WEEKLY EXPERIMENT
          </span>
        </div>

        <h4 className="font-serif text-xl font-medium text-stone-950 dark:text-stone-50">
          {r.experiment.title}
        </h4>

        <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-sans">
          <strong className="text-amber-700 dark:text-amber-300">Hypothesis:</strong> {r.experiment.hypothesis}
        </p>

        <div className="p-4 rounded-xl bg-white/80 dark:bg-stone-950/80 border border-stone-200/80 dark:border-stone-800 text-xs font-mono space-y-1.5 shadow-xs">
          <div>• <strong>Proposed Focus Wave:</strong> {r.experiment.targetWorkMinutes} minutes</div>
          <div>• <strong>Proposed Recovery Rest:</strong> {r.experiment.targetBreakMinutes} minutes</div>
          <div>• <strong>Expected Outcome:</strong> {r.experiment.expectedOutcome}</div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          <span className="text-[10px] text-stone-500 dark:text-stone-400 italic font-sans">
            Accepting configures timer parameters for your next wave.
          </span>

          <button
            onClick={handleAccept}
            className={`px-6 py-3 rounded-2xl text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200 active:scale-95 flex items-center justify-center space-x-2 cursor-pointer ${
              accepted
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                : 'bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-stone-200 text-stone-100 dark:text-stone-900 shadow-md'
            }`}
          >
            {accepted ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Experiment Activated!</span>
              </>
            ) : (
              <>
                <span>Accept & Launch Experiment</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Non-biological Disclaimer Footer */}
      <div className="flex items-center space-x-2 text-[10px] text-stone-400 dark:text-stone-500 pt-3 border-t border-stone-100 dark:border-stone-800/80 font-sans">
        <ShieldCheck className="w-4 h-4 text-stone-400 shrink-0" />
        <span>{NON_BIOLOGICAL_DISCLAIMER}</span>
      </div>
    </div>
  );
};
