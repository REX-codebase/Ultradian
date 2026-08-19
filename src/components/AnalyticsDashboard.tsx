import React, { useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { SessionRecord, UserSettings, CategoryTag } from '../types';
import { generateTransparentRecommendation, generateInsightCards } from '../utils/rhythmEngine';
import { calculatePersonalFocusAnalytics, totalHoursLabel } from '../utils/sessionAnalytics';
import { WeeklyRhythmNarrative } from './WeeklyRhythmNarrative';
import { IconSparkle } from './icons';

interface AnalyticsDashboardProps {
  records: SessionRecord[];
  dailyGoalCycles: number;
  settings: UserSettings;
  onApplyRecommendation: (workMins: number, breakMins: number, ambient: any) => void;
  isAuthorizedForAi?: boolean;
  onOpenAuth?: () => void;
}

const CustomChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="liquid-glass-badge rounded-xl px-3 py-2 text-xs shadow-lg backdrop-blur-xl">
        <p className="font-mono text-[10px] uppercase tracking-wider text-[color:var(--ink-mute)]">{label}</p>
        <p className="font-serif text-base font-semibold text-[color:var(--ink)]">
          {payload[0].value} <span className="font-sans text-xs font-normal text-[color:var(--ink-soft)]">mins focused</span>
        </p>
      </div>
    );
  }
  return null;
};

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  records,
  settings,
  onApplyRecommendation,
  isAuthorizedForAi = true,
  onOpenAuth,
}) => {
  const [showMore, setShowMore] = useState(false);

  const triggerHaptic = useCallback(() => {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(8);
      }
    } catch {}
  }, []);

  const personalAnalytics = useMemo(() => calculatePersonalFocusAnalytics(records), [records]);
  const recommendation = useMemo(
    () => generateTransparentRecommendation(personalAnalytics.records, (settings.profession as CategoryTag) || 'General'),
    [personalAnalytics.records, settings.profession]
  );
  const insightCards = useMemo(
    () => generateInsightCards(personalAnalytics.records),
    [personalAnalytics.records]
  );

  if (personalAnalytics.records.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-2 py-16 text-center">
        <div className="liquid-glass-card p-10">
          <IconSparkle size={28} className="mx-auto text-[color:var(--ink-mute)] opacity-50 mb-3" />
          <h2 className="font-serif text-2xl text-[color:var(--ink)] font-normal">No rhythm waves yet</h2>
          <p className="mt-2.5 text-sm leading-relaxed text-[color:var(--ink-soft)] max-w-md mx-auto">
            Complete your first Ultradian focus wave and your personalized biological rhythm, peak windows, and session metrics will live here.
          </p>
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Total Focus', value: totalHoursLabel(personalAnalytics.totalFocusMinutes), sub: 'Hours logged' },
    { label: 'Completed Waves', value: String(personalAnalytics.totalCompletedCycles), sub: 'Full cycles' },
    { label: 'Clarity Index', value: `${personalAnalytics.averageFocusScore.toFixed(1)}/5`, sub: 'Self-rating' },
    { label: 'Rhythm SQI', value: `${personalAnalytics.ultradianEfficiencyScore}%`, sub: 'Ultradian score' },
  ];

  return (
    <div className="mx-auto w-full max-w-2xl space-y-10 pb-8">
      {/* 1. Sculpted Metric Cards Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            whileHover={{ scale: 1.03, y: -2 }}
            transition={{ type: 'spring', stiffness: 380, damping: 25, delay: idx * 0.05 }}
            className="editorial-stat-card flex flex-col justify-between cursor-default"
          >
            <p className="text-[11px] font-mono font-medium uppercase tracking-wider text-[color:var(--ink-mute)]">
              {stat.label}
            </p>
            <p className="clock-face my-1 font-serif text-3xl sm:text-4xl text-[color:var(--ink)] tracking-tight">
              {stat.value}
            </p>
            <p className="text-[10px] text-[color:var(--ink-mute)]">{stat.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* 2. Weekly Rhythmic Frequency Chart */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 28, delay: 0.15 }}
        className="swift-glass-card p-5 sm:p-7 shadow-sm"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-serif text-xl text-[color:var(--ink)] font-normal">Weekly Rhythm Cadence</h2>
            <p className="text-xs text-[color:var(--ink-mute)] mt-0.5">Focus minutes distribution across the last 7 days</p>
          </div>
          <span className="liquid-glass-badge rounded-full px-3 py-0.5 text-[10px] font-mono uppercase tracking-wider text-[color:var(--ink-soft)]">
            LIVE CADENCE
          </span>
        </div>

        <div className="h-56 w-full sm:h-64 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={personalAnalytics.weeklyData} margin={{ top: 12, right: 8, left: -24, bottom: 0 }}>
              <defs>
                <linearGradient id="rhythmAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--ink)" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="var(--ink)" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="var(--line)" strokeDasharray="3 4" strokeOpacity={0.7} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: 'var(--ink-mute)', fontFamily: 'var(--font-mono)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'var(--ink-mute)', fontFamily: 'var(--font-mono)' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomChartTooltip />} />
              <Area
                type="monotone"
                dataKey="minutes"
                name="Minutes"
                stroke="var(--ink)"
                strokeWidth={2.2}
                fill="url(#rhythmAreaGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* 3. Recent Waves Ledger */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 28, delay: 0.25 }}
        className="swift-glass-card p-5 sm:p-7 shadow-sm"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl text-[color:var(--ink)] font-normal">Recent Waves Ledger</h2>
          <span className="text-xs text-[color:var(--ink-mute)] font-mono">
            {personalAnalytics.records.length} {personalAnalytics.records.length === 1 ? 'record' : 'records'}
          </span>
        </div>

        <ul className="divide-y divide-[color:var(--line)]/60">
          {personalAnalytics.records.slice(0, 8).map((rec) => (
            <li
              key={rec.id}
              className="flex min-h-14 items-center justify-between gap-4 py-3.5 transition-colors hover:bg-[color:var(--line)]/20 -mx-2 px-2 rounded-xl"
            >
              <div className="min-w-0 text-left">
                <p className="truncate text-sm font-medium text-[color:var(--ink)]">
                  {rec.taskName || `${rec.category} Focus Wave`}
                </p>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-[color:var(--ink-mute)]">
                  <span>{new Date(rec.timestamp).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                  <span>·</span>
                  <span className="liquid-glass-badge rounded-full px-2 py-0.2 text-[10px] font-mono">
                    {rec.category}
                  </span>
                  {rec.focusRating && (
                    <>
                      <span>·</span>
                      <span className="text-[11px] font-mono text-[color:var(--ink-soft)]">
                        {rec.focusRating}★
                      </span>
                    </>
                  )}
                </div>
              </div>
              <span className="clock-face shrink-0 font-serif text-lg font-medium text-[color:var(--ink)]">
                {Math.round(rec.actualSecondsCompleted / 60)}m
              </span>
            </li>
          ))}
        </ul>
      </motion.div>

      {/* 4. Notes & Evolutionary Experiments Section Toggle */}
      <div className="text-center pt-2">
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            triggerHaptic();
            setShowMore((open) => !open);
          }}
          className="liquid-glass-badge min-h-10 rounded-full px-5 py-2 text-xs font-medium text-[color:var(--ink-soft)] hover:text-[color:var(--ink)] transition-colors cursor-pointer"
        >
          {showMore ? 'Hide Rhythm Notes & Insights ↑' : 'View Rhythm Notes & Experiments ↓'}
        </motion.button>
      </div>

      <AnimatePresence>
        {showMore && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6 overflow-hidden"
          >
            {/* Pattern Insights Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {insightCards.slice(0, 2).map((card) => (
                <article key={card.id} className="liquid-glass-card p-5 flex flex-col justify-between">
                  <div>
                    <span className="liquid-glass-badge mb-2 inline-block rounded-full px-2.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider text-[color:var(--ink-mute)]">
                      {card.metricBadge || 'PATTERN'}
                    </span>
                    <h3 className="font-serif text-base text-[color:var(--ink)] font-normal">{card.title}</h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-[color:var(--ink-soft)]">{card.description}</p>
                  </div>
                  {card.actionPayload && (
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => {
                        triggerHaptic();
                        onApplyRecommendation(
                          card.actionPayload?.workMinutes || settings.workMinutes,
                          card.actionPayload?.shortBreakMinutes || settings.shortBreakMinutes,
                          card.actionPayload?.ambientType || settings.ambientType
                        );
                      }}
                      className="mt-4 liquid-glass-badge w-fit rounded-full px-3.5 py-1.5 text-xs font-medium text-[color:var(--ink)] hover:bg-[color:var(--ink)] hover:text-[color:var(--paper)] transition-colors"
                    >
                      {card.actionLabel || 'Apply to Focus'}
                    </motion.button>
                  )}
                </article>
              ))}
            </div>

            {/* Weekly Rhythm Narrative Card */}
            <div className="liquid-glass-card p-6">
              <WeeklyRhythmNarrative
                records={personalAnalytics.records}
                settings={settings}
                onAcceptExperiment={onApplyRecommendation}
                isAuthorizedForAi={isAuthorizedForAi}
                onOpenAuth={onOpenAuth}
              />
            </div>

            {/* Recommendation Algorithm Rationale */}
            {recommendation?.rationale && (
              <div className="liquid-glass-card p-5 text-xs leading-relaxed text-[color:var(--ink-soft)]">
                <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--ink-mute)] mb-1">
                  Algorithmic Rationale
                </p>
                <p>{recommendation.rationale}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
