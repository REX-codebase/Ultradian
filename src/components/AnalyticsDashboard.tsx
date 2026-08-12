import React, { useMemo, useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  BarChart3,
  Clock,
  Sparkles,
  TrendingUp,
  Award,
  AlertTriangle,
  Calendar,
  Filter,
  SlidersHorizontal,
  Info,
  ShieldCheck,
  Target,
} from 'lucide-react';
import { SessionRecord, UserSettings, CategoryTag } from '../types';
import {
  generateTransparentRecommendation,
  generateInsightCards,
  calculateSQI,
  NON_BIOLOGICAL_DISCLAIMER,
} from '../utils/rhythmEngine';
import { calculatePersonalFocusAnalytics, totalHoursLabel } from '../utils/sessionAnalytics';
import { TransparentRecommendationCard } from './TransparentRecommendationCard';
import { WeeklyRhythmNarrative } from './WeeklyRhythmNarrative';
import { InsightCardsGrid } from './InsightCardsGrid';
import { SqiModelInspectorModal } from './SqiModelInspectorModal';

interface AnalyticsDashboardProps {
  records: SessionRecord[];
  dailyGoalCycles: number;
  settings: UserSettings;
  onApplyRecommendation: (workMins: number, breakMins: number, ambient: any) => void;
  isAuthorizedForAi?: boolean;
  onOpenAuth?: () => void;
  onUnlockVip?: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  Coding: '#1c1917', // stone-900
  Writing: '#44403c', // stone-700
  Design: '#57534e', // stone-600
  Research: '#78716c', // stone-500
  Strategy: '#a8a29e', // stone-400
  Study: '#d6d3d1', // stone-300
  General: '#e7e5e4', // stone-200
};

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  records,
  settings,
  onApplyRecommendation,
  isAuthorizedForAi = true,
  onOpenAuth,
  onUnlockVip,
}) => {
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [recommendationCategory, setRecommendationCategory] = useState<CategoryTag>('Coding');
  const [showSqiInspector, setShowSqiInspector] = useState(false);

  const personalAnalytics = useMemo(() => calculatePersonalFocusAnalytics(records), [records]);
  const activeRecords = personalAnalytics.records;
  const realRecords = activeRecords;
  const weeklyData = personalAnalytics.weeklyData;
  const categoryData = personalAnalytics.categoryData.map((item) => ({
    ...item,
    color: CATEGORY_COLORS[item.name] || '#78716c',
  }));
  const hourlyData = personalAnalytics.hourlyData;
  const totalFocusHours = totalHoursLabel(personalAnalytics.totalFocusMinutes);
  const totalCompletedCycles = personalAnalytics.totalCompletedCycles;
  const avgFocusScore = personalAnalytics.averageFocusScore.toFixed(1);
  const totalDistractions = personalAnalytics.totalDistractions;
  const ultradianEfficiencyScore = personalAnalytics.ultradianEfficiencyScore;

  const recommendation = useMemo(() => {
    return generateTransparentRecommendation(activeRecords, recommendationCategory);
  }, [activeRecords, recommendationCategory]);

  const insightCards = useMemo(() => {
    return generateInsightCards(activeRecords);
  }, [activeRecords]);

  const filteredRecords = useMemo(() => {
    if (selectedCategoryFilter === 'All') return activeRecords;
    return activeRecords.filter((r) => r.category === selectedCategoryFilter);
  }, [activeRecords, selectedCategoryFilter]);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-12 animate-fade-in">
      {/* Empty State Prompt if no real sessions exist */}
      {realRecords.length === 0 && (
        <div className="p-8 text-center rounded-xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800/80 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-full bg-stone-500/10 text-stone-600 dark:text-stone-400 flex items-center justify-center mx-auto">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-medium text-stone-900 dark:text-stone-100">
              No Sessions Logged Yet
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-md mx-auto">
              Start your first Ultradian focus wave to see your cognitive patterns, SQI metrics, and recovery narratives here.
            </p>
          </div>
        </div>
      )}
      {/* 1. Transparent Recommendation Engine */}
      <TransparentRecommendationCard
        recommendation={recommendation}
        onApply={onApplyRecommendation}
        selectedCategory={recommendationCategory}
        onCategoryChange={setRecommendationCategory}
        isAuthorizedForAi={isAuthorizedForAi}
        onOpenAuth={onOpenAuth}
        onUnlockVip={onUnlockVip}
      />

      {/* 2. Weekly "Your rhythm this week" Narrative & Proposed Experiment */}
      <WeeklyRhythmNarrative
        records={activeRecords}
        settings={settings}
        onAcceptExperiment={onApplyRecommendation}
        isAuthorizedForAi={isAuthorizedForAi}
        onOpenAuth={onOpenAuth}
        onUnlockVip={onUnlockVip}
      />

      {/* 3. Interactive Self-Reported Insight Cards */}
      <InsightCardsGrid
        cards={insightCards}
        onApplyAction={(payload) => {
          if (payload) {
            onApplyRecommendation(
              payload.workMinutes || settings.workMinutes,
              payload.shortBreakMinutes || settings.shortBreakMinutes,
              payload.ambientType || settings.ambientType
            );
          }
        }}
        isAuthorizedForAi={isAuthorizedForAi}
        onOpenAuth={onOpenAuth}
        onUnlockVip={onUnlockVip}
      />

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Focus Hours */}
        <div className="p-4 sm:p-6 rounded-2xl glass-card glass-card-hover shadow-xs">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">
              FOCUS HOURS
            </span>
            <Clock className="w-4 h-4 text-stone-400 shrink-0" />
          </div>
          <p className="text-2xl sm:text-3xl md:text-4xl font-serif font-normal text-stone-900 dark:text-stone-100">
            {totalFocusHours} <span className="text-[9px] sm:text-xs font-sans font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">HRS</span>
          </p>
          <span className="text-[9px] sm:text-[10px] text-stone-500 dark:text-stone-400 flex items-center mt-2 font-semibold tracking-wider uppercase">
            <TrendingUp className="w-3 h-3 mr-1 text-emerald-500 shrink-0" />
            Biological wave depth
          </span>
        </div>

        {/* Completed Cycles */}
        <div className="p-4 sm:p-6 rounded-2xl glass-card glass-card-hover shadow-xs">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">
              COMPLETED WAVES
            </span>
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0 animate-pulse" />
          </div>
          <p className="text-2xl sm:text-3xl md:text-4xl font-serif font-normal text-stone-900 dark:text-stone-100">
            {totalCompletedCycles} <span className="text-[9px] sm:text-xs font-sans font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">CYCLES</span>
          </p>
          <span className="text-[9px] sm:text-[10px] text-stone-400 dark:text-stone-500 mt-2 block font-semibold uppercase tracking-wider">
            BRAC sessions completed
          </span>
        </div>

        {/* Focus Score */}
        <div className="p-4 sm:p-6 rounded-2xl glass-card glass-card-hover shadow-xs">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">
              SUBJECTIVE CLARITY
            </span>
            <Award className="w-4 h-4 text-emerald-500 shrink-0" />
          </div>
          <p className="text-2xl sm:text-3xl md:text-4xl font-serif font-normal text-stone-900 dark:text-stone-100">
            {avgFocusScore} <span className="text-[9px] sm:text-xs font-sans font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">/ 5.0</span>
          </p>
          <span className="text-[9px] sm:text-[10px] text-stone-400 dark:text-stone-500 mt-2 block font-semibold uppercase tracking-wider">
            Avg self-reported rating
          </span>
        </div>

        {/* Session Quality Index (SQI) Card & Model Inspector Button */}
        <div className="p-4 sm:p-6 rounded-2xl glass-card glass-card-hover shadow-xs relative glow-stone">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">
              SQI MODEL INDEX
            </span>
            <button
              onClick={() => setShowSqiInspector(true)}
              title="Inspect SQI Formula & Model Parameters"
              className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-2xl sm:text-3xl md:text-4xl font-serif font-normal text-amber-600 dark:text-amber-400">
            {ultradianEfficiencyScore} <span className="text-[9px] sm:text-xs font-sans font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">SQI</span>
          </p>
          <button
            onClick={() => setShowSqiInspector(true)}
            className="text-[9px] sm:text-[10px] text-amber-600 dark:text-amber-400 hover:underline mt-2 block font-semibold uppercase tracking-wider text-left"
          >
            Inspect 0-100 formula &rarr;
          </button>
        </div>
      </div>

      {/* SQI Model Transparency Inspector Modal */}
      {showSqiInspector && (
        <SqiModelInspectorModal onClose={() => setShowSqiInspector(false)} />
      )}

      {/* Main Weekly Line / Area Chart */}
      <div className="p-5 sm:p-8 rounded-3xl glass-card shadow-lg">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="font-serif text-xl font-medium text-stone-900 dark:text-stone-100 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-amber-500" />
              Weekly Focus Volume
            </h3>
            <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">
              Accumulated focus minutes distributed across recent cognitive waves
            </p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMins" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" className="dark:stroke-stone-800" opacity={0.5} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fontFamily: 'var(--font-sans)', fontWeight: 600 }} stroke="#a8a29e" />
              <YAxis tick={{ fontSize: 11, fontFamily: 'var(--font-sans)', fontWeight: 600 }} stroke="#a8a29e" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1c1917',
                  borderColor: '#44403c',
                  borderRadius: '12px',
                  color: '#f5f5f4',
                  fontSize: '11px',
                  fontFamily: 'var(--font-sans)',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                }}
              />
              <Area
                type="monotone"
                dataKey="minutes"
                name="Focus Minutes"
                stroke="#d97706"
                className="dark:stroke-amber-400"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorMins)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>


      {/* Two Column Section for Breakdown & Hours */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="p-4 sm:p-8 rounded-xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800/80 shadow-xs">
          <h3 className="font-serif text-lg font-medium text-stone-900 dark:text-stone-100 mb-1">
            Focus Domain Allotment
          </h3>
          <p className="text-xs text-stone-400 dark:text-stone-500 mb-6">
            Proportional hour distribution of work sessions
          </p>

          <div className="h-60 w-full flex items-center justify-center">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1c1917',
                      borderColor: '#2e2b2a',
                      borderRadius: '4px',
                      color: '#f5f5f4',
                      fontSize: '11px',
                      fontFamily: 'var(--font-sans)',
                    }}
                  />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: '11px', color: '#78716c' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-stone-400 font-serif italic">No session domains cataloged yet.</p>
            )}
          </div>
        </div>

        {/* Focus Hourly Heatmap */}
        <div className="p-4 sm:p-8 rounded-xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800/80 shadow-xs">
          <h3 className="font-serif text-lg font-medium text-stone-900 dark:text-stone-100 mb-1">
            Bio-Rhythm Peak Intervals
          </h3>
          <p className="text-xs text-stone-400 dark:text-stone-500 mb-6">
            Distribution of focused hours across different times of the day
          </p>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" className="dark:stroke-stone-800" opacity={0.5} />
                <XAxis dataKey="hourLabel" tick={{ fontSize: 10, fontFamily: 'var(--font-sans)', fontWeight: 500 }} stroke="#a8a29e" />
                <YAxis tick={{ fontSize: 10, fontFamily: 'var(--font-sans)', fontWeight: 500 }} stroke="#a8a29e" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1c1917',
                    borderColor: '#2e2b2a',
                    borderRadius: '4px',
                    color: '#f5f5f4',
                    fontSize: '11px',
                    fontFamily: 'var(--font-sans)',
                  }}
                />
                <Bar dataKey="focusMinutes" name="Minutes" fill="#57534e" className="dark:fill-stone-400" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Historical logs table */}
      <div className="p-4 sm:p-8 rounded-xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800/80 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h3 className="font-serif text-lg font-medium text-stone-900 dark:text-stone-100">
              Chronology Logs
            </h3>
            <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">
              Comprehensive ledger of individual focus waves and recovery rest periods
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-stone-400" />
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="px-3 py-1.5 rounded-sm bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-300 focus:outline-none"
            >
              <option value="All">All domains</option>
              <option value="Coding">Coding</option>
              <option value="Writing">Writing</option>
              <option value="Design">Design</option>
              <option value="Research">Research</option>
              <option value="Strategy">Strategy</option>
              <option value="Study">Study</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-400 dark:text-stone-500 font-bold uppercase tracking-wider">
                <th className="py-3 px-2">Date & Hour</th>
                <th className="py-3 px-2">Phase</th>
                <th className="py-3 px-2">Focus Objective</th>
                <th className="py-3 px-2">Duration</th>
                <th className="py-3 px-2">Clarity Rating</th>
                <th className="py-3 px-2 text-right">Interruptions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800/50 text-stone-750 dark:text-stone-300 font-medium">
              {filteredRecords.slice(0, 15).map((rec) => (
                <tr key={rec.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-850/40 transition-colors">
                  <td className="py-3 px-2 whitespace-nowrap text-stone-400 dark:text-stone-500">
                    {new Date(rec.timestamp).toLocaleDateString()} {new Date(rec.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3 px-2">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        rec.type === 'work'
                          ? 'bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900'
                          : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300'
                      }`}
                    >
                      {rec.type === 'work' ? 'Focus Wave' : 'Recovery'}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-stone-900 dark:text-stone-100">
                        {rec.taskName || 'Ultradian Wave'}
                      </span>
                    </div>
                    <div className="text-[10px] text-stone-400 mt-0.5">{rec.category || 'General'}</div>
                  </td>
                  <td className="py-3 px-2 font-mono font-bold text-stone-700 dark:text-stone-200">
                    {Math.round(rec.actualSecondsCompleted / 60)}m
                  </td>
                  <td className="py-3 px-2 text-stone-500">
                    {'★'.repeat(rec.focusRating || 5)}
                  </td>
                  <td className="py-3 px-2 text-right font-semibold">
                    {rec.distractionsCount > 0 ? (
                      <span className="inline-flex items-center text-stone-500">
                        <AlertTriangle className="w-3.5 h-3.5 mr-1 text-stone-400" />
                        {rec.distractionsCount}
                      </span>
                    ) : (
                      <span className="text-stone-400">0</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-stone-400 font-serif italic">
                    No logs recorded in this domain category yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
