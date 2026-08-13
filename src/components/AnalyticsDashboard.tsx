import React, { useMemo, useState } from 'react';
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

interface AnalyticsDashboardProps {
  records: SessionRecord[];
  dailyGoalCycles: number;
  settings: UserSettings;
  onApplyRecommendation: (workMins: number, breakMins: number, ambient: any) => void;
  isAuthorizedForAi?: boolean;
  onOpenAuth?: () => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  records,
  settings,
  onApplyRecommendation,
  isAuthorizedForAi = true,
  onOpenAuth,
}) => {
  const [showMore, setShowMore] = useState(false);

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
        <h2 className="font-serif text-2xl text-stone-900 dark:text-stone-100">No waves yet</h2>
        <p className="mt-3 text-base leading-relaxed text-stone-500">
          Finish a focus session and it will live here. Nothing is invented to fill the page.
        </p>
      </div>
    );
  }

  const stats = [
    { label: 'Hours', value: totalHoursLabel(personalAnalytics.totalFocusMinutes) },
    { label: 'Waves', value: String(personalAnalytics.totalCompletedCycles) },
    { label: 'Clarity', value: personalAnalytics.averageFocusScore.toFixed(1) },
    { label: 'SQI', value: String(personalAnalytics.ultradianEfficiencyScore) },
  ];

  return (
    <div className="mx-auto w-full max-w-2xl space-y-10 pb-8">
      <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label}>
            <p className="text-sm text-stone-500">{stat.label}</p>
            <p className="mt-1 font-serif text-3xl text-stone-900 dark:text-stone-50">{stat.value}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="font-serif text-xl text-stone-900 dark:text-stone-100">This week</h2>
        <div className="mt-4 h-52 w-full sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={personalAnalytics.weeklyData} margin={{ top: 8, right: 0, left: -28, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="currentColor" className="text-stone-200 dark:text-stone-800" strokeDasharray="3 6" />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#78716c' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#78716c' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: '#1c1917',
                  border: 'none',
                  borderRadius: 12,
                  color: '#f5f5f4',
                  fontSize: 13,
                }}
              />
              <Area
                type="monotone"
                dataKey="minutes"
                name="Minutes"
                stroke="#57534e"
                strokeWidth={1.75}
                fill="#a8a29e"
                fillOpacity={0.18}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h2 className="font-serif text-xl text-stone-900 dark:text-stone-100">Recent</h2>
        <ul className="mt-4 divide-y divide-stone-200/80 dark:divide-stone-800">
          {personalAnalytics.records.slice(0, 8).map((rec) => (
            <li key={rec.id} className="flex min-h-14 items-baseline justify-between gap-4 py-3">
              <div className="min-w-0 text-left">
                <p className="truncate text-base text-stone-800 dark:text-stone-200">
                  {rec.taskName || rec.category}
                </p>
                <p className="mt-0.5 text-sm text-stone-400">
                  {new Date(rec.timestamp).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                  {' · '}
                  {rec.category}
                </p>
              </div>
              <span className="shrink-0 font-serif text-lg text-stone-700 dark:text-stone-300">
                {Math.round(rec.actualSecondsCompleted / 60)}m
              </span>
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        onClick={() => setShowMore((open) => !open)}
        className="min-h-11 text-sm text-stone-400 underline-offset-4 hover:text-stone-700 hover:underline dark:hover:text-stone-300"
      >
        {showMore ? 'Hide notes' : 'Notes & experiment'}
      </button>

      {showMore && (
        <div className="space-y-8">
          {insightCards.slice(0, 2).map((card) => (
            <article key={card.id}>
              <h3 className="font-serif text-lg text-stone-900 dark:text-stone-100">{card.title}</h3>
              <p className="mt-2 max-w-prose text-base leading-relaxed text-stone-500">{card.description}</p>
              {card.actionPayload && (
                <button
                  type="button"
                  onClick={() =>
                    onApplyRecommendation(
                      card.actionPayload?.workMinutes || settings.workMinutes,
                      card.actionPayload?.shortBreakMinutes || settings.shortBreakMinutes,
                      card.actionPayload?.ambientType || settings.ambientType
                    )
                  }
                  className="mt-3 min-h-11 text-sm text-stone-700 underline-offset-4 hover:underline dark:text-stone-300"
                >
                  {card.actionLabel || 'Use this'}
                </button>
              )}
            </article>
          ))}

          <WeeklyRhythmNarrative
            records={personalAnalytics.records}
            settings={settings}
            onAcceptExperiment={onApplyRecommendation}
            isAuthorizedForAi={isAuthorizedForAi}
            onOpenAuth={onOpenAuth}
          />

          <p className="max-w-prose text-sm leading-relaxed text-stone-400">
            {recommendation.rationale}
          </p>
        </div>
      )}
    </div>
  );
};
