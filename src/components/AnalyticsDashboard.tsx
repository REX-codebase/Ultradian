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
} from 'lucide-react';
import { SessionRecord } from '../types';

interface AnalyticsDashboardProps {
  records: SessionRecord[];
  dailyGoalCycles: number;
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

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ records }) => {
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');

  const {
    weeklyData,
    categoryData,
    hourlyData,
    totalFocusHours,
    totalCompletedCycles,
    avgFocusScore,
    totalDistractions,
    ultradianEfficiencyScore,
  } = useMemo(() => {
    const now = Date.now();
    const DAY_MS = 24 * 60 * 60 * 1000;
    const past7Days: Record<string, { date: string; label: string; minutes: number; cycles: number }> = {};

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now - i * DAY_MS);
      const dateStr = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-US', { weekday: 'short' });
      past7Days[dateStr] = { date: dateStr, label, minutes: 0, cycles: 0 };
    }

    let totMins = 0;
    let totCycles = 0;
    let totRatings = 0;
    let ratingCount = 0;
    let totDistractions = 0;

    const catTotals: Record<string, number> = {};
    const hourBuckets: Record<number, number> = {};
    for (let h = 0; h < 24; h += 2) hourBuckets[h] = 0;

    records.forEach((rec) => {
      const recDate = rec.dateString;
      const mins = Math.round(rec.actualSecondsCompleted / 60);

      totMins += mins;
      if (rec.type === 'work') totCycles += 1;
      if (rec.focusRating) {
        totRatings += rec.focusRating;
        ratingCount += 1;
      }
      totDistractions += rec.distractionsCount || 0;

      if (past7Days[recDate]) {
        past7Days[recDate].minutes += mins;
        if (rec.type === 'work') past7Days[recDate].cycles += 1;
      }

      const cat = rec.category || 'General';
      catTotals[cat] = (catTotals[cat] || 0) + mins;

      const hr = new Date(rec.timestamp).getHours();
      const bucket = Math.floor(hr / 2) * 2;
      hourBuckets[bucket] = (hourBuckets[bucket] || 0) + mins;
    });

    const weeklyChart = Object.values(past7Days);
    const categoryChart = Object.entries(catTotals).map(([name, value]) => ({
      name,
      value: Math.round((value / 60) * 10) / 10,
      color: CATEGORY_COLORS[name] || '#78716c',
    }));

    const hourlyChart = Object.entries(hourBuckets).map(([hour, mins]) => {
      const hNum = parseInt(hour, 10);
      const ampm = hNum >= 12 ? (hNum === 12 ? '12pm' : `${hNum - 12}pm`) : (hNum === 0 ? '12am' : `${hNum}am`);
      return {
        hourLabel: ampm,
        focusMinutes: mins,
      };
    });

    const avgScore = ratingCount > 0 ? (totRatings / ratingCount).toFixed(1) : '5.0';
    const hoursTotal = (totMins / 60).toFixed(1);
    const efficiency = Math.min(100, Math.round((totCycles * 15) + (parseFloat(avgScore) * 10) - (totDistractions * 2)));

    return {
      weeklyData: weeklyChart,
      categoryData: categoryChart,
      hourlyData: hourlyChart,
      totalFocusHours: hoursTotal,
      totalCompletedCycles: totCycles,
      avgFocusScore: avgScore,
      totalDistractions: totDistractions,
      ultradianEfficiencyScore: Math.max(40, efficiency),
    };
  }, [records]);

  const filteredRecords = useMemo(() => {
    if (selectedCategoryFilter === 'All') return records;
    return records.filter((r) => r.category === selectedCategoryFilter);
  }, [records, selectedCategoryFilter]);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-12 animate-fade-in">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Focus Hours */}
        <div className="p-4 sm:p-6 rounded-xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
              Focus Hours
            </span>
            <Clock className="w-4 h-4 text-stone-400" />
          </div>
          <p className="text-3xl sm:text-4xl font-serif font-light text-stone-900 dark:text-stone-100">
            {totalFocusHours} <span className="text-[10px] sm:text-xs font-sans font-semibold text-stone-450 uppercase tracking-wider">hrs</span>
          </p>
          <span className="text-[9px] sm:text-[10px] text-stone-500 dark:text-stone-400 flex items-center mt-2.5 font-semibold">
            <TrendingUp className="w-3.5 h-3.5 mr-1" />
            Biological wave depth
          </span>
        </div>

        {/* Completed Cycles */}
        <div className="p-4 sm:p-6 rounded-xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
              Completed Waves
            </span>
            <Sparkles className="w-4 h-4 text-stone-400" />
          </div>
          <p className="text-3xl sm:text-4xl font-serif font-light text-stone-900 dark:text-stone-100">
            {totalCompletedCycles} <span className="text-[10px] sm:text-xs font-sans font-semibold text-stone-450 uppercase tracking-wider">cycles</span>
          </p>
          <span className="text-[9px] sm:text-[10px] text-stone-400 dark:text-stone-500 mt-2.5 block font-semibold uppercase tracking-wider">
            BRAC sessions completed
          </span>
        </div>

        {/* Focus Score */}
        <div className="p-4 sm:p-6 rounded-xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
              Subjective Clarity
            </span>
            <Award className="w-4 h-4 text-stone-400" />
          </div>
          <p className="text-3xl sm:text-4xl font-serif font-light text-stone-900 dark:text-stone-100">
            {avgFocusScore} <span className="text-[10px] sm:text-xs font-sans font-semibold text-stone-450 uppercase tracking-wider">/ 5.0</span>
          </p>
          <span className="text-[9px] sm:text-[10px] text-stone-400 dark:text-stone-500 mt-2.5 block font-semibold uppercase tracking-wider">
            Avg self-reported rating
          </span>
        </div>

        {/* Efficiency Index */}
        <div className="p-4 sm:p-6 rounded-xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
              Efficiency Index
            </span>
            <BarChart3 className="w-4 h-4 text-stone-400" />
          </div>
          <p className="text-3xl sm:text-4xl font-serif font-light text-stone-900 dark:text-stone-100">
            {ultradianEfficiencyScore} <span className="text-[10px] sm:text-xs font-sans font-semibold text-stone-450 uppercase tracking-wider">uei</span>
          </p>
          <span className="text-[9px] sm:text-[10px] text-stone-400 dark:text-stone-500 mt-2.5 block font-semibold uppercase tracking-wider">
            Calculated focus rating
          </span>
        </div>
      </div>

      {/* Main Weekly Line / Area Chart */}
      <div className="p-4 sm:p-8 rounded-xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800/80 shadow-xs">
        <div className="mb-6">
          <h3 className="font-serif text-xl font-medium text-stone-900 dark:text-stone-100 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-stone-500" />
            Weekly Focus Volume
          </h3>
          <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">
            Accumulated focus minutes distributed across recent cognitive waves
          </p>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMins" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#78716c" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#78716c" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" className="dark:stroke-stone-800" opacity={0.5} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fontFamily: 'var(--font-sans)', fontWeight: 500 }} stroke="#a8a29e" />
              <YAxis tick={{ fontSize: 11, fontFamily: 'var(--font-sans)', fontWeight: 500 }} stroke="#a8a29e" />
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
              <Area
                type="monotone"
                dataKey="minutes"
                name="Focus Minutes"
                stroke="#44403c"
                className="dark:stroke-stone-300"
                strokeWidth={1.5}
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
                    <div className="font-semibold text-stone-900 dark:text-stone-100">
                      {rec.taskName || 'Ultradian Wave'}
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
