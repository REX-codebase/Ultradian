import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Sparkles,
  Zap,
  Target,
  Clock,
  Coffee,
  CheckCircle2,
  Flame,
  TrendingUp,
  ShieldAlert,
  ArrowRight,
  Plus,
  Check,
  Edit3,
  Tag,
  Circle,
  X,
  Volume2,
  VolumeX,
  Award,
  Maximize2,
  SlidersHorizontal,
  ChevronRight,
  Battery,
  HeartPulse,
} from 'lucide-react';
import {
  SessionRecord,
  CategoryTag,
  SessionType,
  UserSettings,
  UltradianPreset,
  AmbientSoundType,
  SubTask,
} from '../types';
import { generateTransparentRecommendation, evaluateRecoveryPrompts } from '../utils/rhythmEngine';
import { DEFAULT_PRESETS } from '../utils/storage';
import { VipCodeGate } from './VipCodeGate';

interface HomeCommandCenterProps {
  currentTask: string;
  onTaskChange: (task: string) => void;
  category: CategoryTag;
  onCategoryChange: (cat: CategoryTag) => void;
  secondsLeft: number;
  totalSeconds: number;
  isRunning: boolean;
  sessionType: SessionType;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSkip: () => void;
  distractionsCount: number;
  onAddDistraction: () => void;
  completedCyclesToday: number;
  targetCycles: number;
  settings: UserSettings;
  onSelectPreset: (preset: UltradianPreset) => void;
  onApplyRecommendation: (workMins: number, breakMins: number, ambient?: AmbientSoundType) => void;
  sessionRecords: SessionRecord[];
  activeAmbient: AmbientSoundType;
  onToggleAmbient: () => void;
  onToggleZen: () => void;
  onOpenSettings: () => void;
  isAuthorizedForAi?: boolean;
  onOpenAuth?: () => void;
  onUnlockVip?: () => void;
}

const CATEGORIES: CategoryTag[] = ['Coding', 'Writing', 'Design', 'Research', 'Strategy', 'Study', 'General'];

const TASK_SUGGESTIONS = [
  { text: 'Refactoring Architecture & Core Wave', cat: 'Coding' as CategoryTag },
  { text: 'Drafting Technical Product Specification', cat: 'Writing' as CategoryTag },
  { text: 'Designing Responsive Component System', cat: 'Design' as CategoryTag },
  { text: 'Synthesizing User Research & Feedback', cat: 'Research' as CategoryTag },
  { text: 'Planning Q4 Strategic Roadmap', cat: 'Strategy' as CategoryTag },
];

interface TargetAnalysisResult {
  category: CategoryTag;
  cognitiveType: string;
  recommendedWorkMinutes: number;
  recommendedBreakMinutes: number;
  recommendedAmbient: AmbientSoundType;
  reasoning: string;
  tacticalTip: string;
  suggestedSubtasks: string[];
}

export const HomeCommandCenter: React.FC<HomeCommandCenterProps> = ({
  currentTask,
  onTaskChange,
  category,
  onCategoryChange,
  secondsLeft,
  totalSeconds,
  isRunning,
  sessionType,
  onStart,
  onPause,
  onReset,
  onSkip,
  distractionsCount,
  onAddDistraction,
  completedCyclesToday,
  targetCycles,
  settings,
  onSelectPreset,
  onApplyRecommendation,
  sessionRecords,
  activeAmbient,
  onToggleAmbient,
  onToggleZen,
  onOpenSettings,
  isAuthorizedForAi = true,
  onOpenAuth,
  onUnlockVip,
}) => {
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [tempTask, setTempTask] = useState(currentTask);
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [showSubtasks, setShowSubtasks] = useState(true);

  // AI Target Analysis State
  const [targetAnalysis, setTargetAnalysis] = useState<TargetAnalysisResult | null>(null);
  const [isAnalyzingTarget, setIsAnalyzingTarget] = useState(false);
  const [appliedAnalysisForTask, setAppliedAnalysisForTask] = useState<string>('');

  // Auto-analyze target when currentTask changes
  React.useEffect(() => {
    if (!currentTask || currentTask.trim().length < 3) return;

    let isMounted = true;
    const fetchTargetAnalysis = async () => {
      setIsAnalyzingTarget(true);
      try {
        const res = await fetch('/api/gemini/analyze-target', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ task: currentTask }),
        });
        if (res.ok) {
          const data: TargetAnalysisResult = await res.json();
          if (isMounted) {
            setTargetAnalysis(data);
            // Automatically sync category if valid
            if (data.category && CATEGORIES.includes(data.category as CategoryTag)) {
              onCategoryChange(data.category as CategoryTag);
            }
          }
        }
      } catch (err) {
        console.warn('Target analysis fetch failed:', err);
      } finally {
        if (isMounted) setIsAnalyzingTarget(false);
      }
    };

    fetchTargetAnalysis();

    return () => {
      isMounted = false;
    };
  }, [currentTask]);

  // Apply AI Target Setup (wave duration, break duration, ambient sound, subtasks)
  const handleApplyAiTargetSetup = () => {
    if (!targetAnalysis) return;
    onApplyRecommendation(
      targetAnalysis.recommendedWorkMinutes,
      targetAnalysis.recommendedBreakMinutes,
      targetAnalysis.recommendedAmbient
    );
    if (targetAnalysis.suggestedSubtasks && targetAnalysis.suggestedSubtasks.length > 0) {
      setSubtasks(
        targetAnalysis.suggestedSubtasks.map((st, idx) => ({
          id: `ai_sub_${Date.now()}_${idx}`,
          text: st,
          completed: false,
        }))
      );
    }
    setAppliedAnalysisForTask(currentTask);
  };

  // 1. Today's Statistics Calculation
  const todayDateStr = new Date().toISOString().split('T')[0];
  const todayRecords = useMemo(() => {
    return sessionRecords.filter(
      (r) => r.dateString === todayDateStr && r.type === 'work'
    );
  }, [sessionRecords, todayDateStr]);

  const todayFocusMinutes = useMemo(() => {
    const mins = todayRecords.reduce(
      (acc, r) => acc + Math.round((r.actualSecondsCompleted || 0) / 60),
      0
    );
    // Add current running seconds if in work session
    if (isRunning && sessionType === 'work') {
      const elapsedMins = Math.floor((totalSeconds - secondsLeft) / 60);
      return mins + elapsedMins;
    }
    return mins;
  }, [todayRecords, isRunning, sessionType, totalSeconds, secondsLeft]);

  // 2. Calculate Streak (consecutive days with completed focus sessions)
  const currentStreakDays = useMemo(() => {
    const uniqueDates = Array.from(
      new Set(
        sessionRecords
          .filter((r) => r.type === 'work')
          .map((r) => r.dateString)
      )
    ).sort().reverse();

    if (uniqueDates.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let checkDate = new Date(today);

    // If today has no records, check if yesterday had records to keep streak alive
    const todayFormatted = checkDate.toISOString().split('T')[0];
    if (!uniqueDates.includes(todayFormatted)) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const formatted = checkDate.toISOString().split('T')[0];
      if (uniqueDates.includes(formatted)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return Math.max(1, streak);
  }, [sessionRecords]);

  // 3. Energy / Focus Trend Calculation
  const focusTrend = useMemo(() => {
    const rated = sessionRecords.filter((r) => r.type === 'work' && r.focusRating);
    if (rated.length === 0) {
      return {
        rating: 4.8,
        label: 'Peak Flow State',
        trendText: 'High Cognitive Readiness',
        color: 'text-emerald-600 dark:text-emerald-400',
        badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60',
      };
    }

    const recent5 = rated.slice(0, 5);
    const avg = recent5.reduce((sum, r) => sum + (r.focusRating || 4), 0) / recent5.length;

    if (avg >= 4.2) {
      return {
        rating: Math.round(avg * 10) / 10,
        label: 'Peak Flow State',
        trendText: '⚡ Optimal Clarity',
        color: 'text-emerald-600 dark:text-emerald-400',
        badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60',
      };
    } else if (avg >= 3.2) {
      return {
        rating: Math.round(avg * 10) / 10,
        label: 'Steady Focus',
        trendText: '📈 Sustainable Momentum',
        color: 'text-sky-600 dark:text-sky-400',
        badgeBg: 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800/60',
      };
    } else {
      return {
        rating: Math.round(avg * 10) / 10,
        label: 'Cognitive Dip',
        trendText: '📉 Recovery Recommended',
        color: 'text-amber-600 dark:text-amber-400',
        badgeBg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60',
      };
    }
  }, [sessionRecords]);

  // 4. Recovery Status
  const recoveryStatus = useMemo(() => {
    const prompts = evaluateRecoveryPrompts(sessionRecords, sessionRecords[0]);
    const topPrompt = prompts[0];

    if (topPrompt?.type === 'high_depletion') {
      return {
        status: 'Needs Restorative Break',
        score: 62,
        badgeText: '⚠️ High Depletion',
        color: 'bg-amber-500',
        message: topPrompt.message,
      };
    }
    if (topPrompt?.type === 'consecutive_waves') {
      return {
        status: 'Cycle Limit Approaching',
        score: 78,
        badgeText: '☕ Break Advised',
        color: 'bg-sky-500',
        message: topPrompt.message,
      };
    }

    return {
      status: 'Optimal Cognitive Readiness',
      score: 95,
      badgeText: '⚡ 95% Refreshed',
      color: 'bg-emerald-500',
      message: 'Glucose reserves & prefrontal focus clarity are at peak level.',
    };
  }, [sessionRecords]);

  // 5. Ultradian Recommendation Engine
  const recommendation = useMemo(() => {
    return generateTransparentRecommendation(sessionRecords, category);
  }, [sessionRecords, category]);

  // 6. Break Schedule Calculation
  const breakScheduleTime = useMemo(() => {
    const now = new Date();
    const targetMs = isRunning ? secondsLeft * 1000 : settings.workMinutes * 60 * 1000;
    const breakTime = new Date(now.getTime() + targetMs);
    return breakTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, [isRunning, secondsLeft, settings.workMinutes]);

  // Handlers for task save & subtasks
  const handleSaveTask = () => {
    if (tempTask.trim()) {
      onTaskChange(tempTask.trim());
    } else {
      setTempTask(currentTask);
    }
    setIsEditingTask(false);
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskText.trim()) return;
    setSubtasks([
      ...subtasks,
      { id: `sub_${Date.now()}`, text: newSubtaskText.trim(), completed: false },
    ]);
    setNewSubtaskText('');
  };

  const toggleSubtask = (id: string) => {
    setSubtasks(
      subtasks.map((st) => (st.id === id ? { ...st, completed: !st.completed } : st))
    );
  };

  const removeSubtask = (id: string) => {
    setSubtasks(subtasks.filter((st) => st.id !== id));
  };

  // Quick Action: Accept Recommendation and Start Wave immediately
  const handleAcceptAndStartRecommendedWave = () => {
    onApplyRecommendation(
      recommendation.suggestedWorkMinutes,
      recommendation.suggestedBreakMinutes,
      recommendation.suggestedAmbient
    );
    setTimeout(() => {
      onStart();
    }, 150);
  };

  // Format time display (MM:SS)
  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = Math.min(100, Math.round(((totalSeconds - secondsLeft) / totalSeconds) * 100));

  return (
    <div className="w-full space-y-6 sm:space-y-8 animate-fade-in overflow-x-clip">
      {/* ========================================== */}
      {/* HERO COMMAND SECTION: THE 6 CORE ANSWERS   */}
      {/* ========================================== */}
      <div className="rounded-3xl bg-white/90 dark:bg-stone-900/90 border border-stone-200/90 dark:border-stone-800/90 p-4 sm:p-8 shadow-xs backdrop-blur-md relative overflow-hidden transition-all duration-300">
        {/* Ambient Top Glow Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-stone-400 via-stone-800 to-stone-400 dark:from-stone-700 dark:via-stone-200 dark:to-stone-700 opacity-60" />

        <div className="flex flex-col lg:flex-row items-stretch justify-between gap-5 sm:gap-8">
          {/* Left Side: Current Task, Wave Status, Core Answers */}
          <div className="flex-1 space-y-5 sm:space-y-6 order-2 lg:order-1">
            {/* Header Tagline & Streak Badge */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <span className="relative flex h-2.5 w-2.5">
                  {isRunning ? (
                    <>
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </>
                  ) : (
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                  )}
                </span>
                <span className="font-mono text-xs font-bold tracking-widest uppercase text-stone-500 dark:text-stone-400">
                  {isRunning ? 'WAVE IN PROGRESS' : 'ULTRADIAN COMMAND CENTER'}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 text-xs font-bold">
                  <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{currentStreakDays}-Day Focus Streak</span>
                </span>
                <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full border text-xs font-bold ${focusTrend.badgeBg}`}>
                  <span>{focusTrend.trendText}</span>
                </span>
              </div>
            </div>

            {/* Answer 1: WHAT SHOULD I WORK ON RIGHT NOW? */}
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-1 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" />
                <span>1. What Should I Work On Right Now?</span>
              </div>

              {isEditingTask ? (
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="text"
                    value={tempTask}
                    onChange={(e) => setTempTask(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveTask()}
                    placeholder="Enter singular focal objective..."
                    className="flex-1 px-4 py-2.5 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-base font-medium text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-400"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveTask}
                    className="px-4 py-2.5 rounded-2xl bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 font-bold text-xs"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => setIsEditingTask(true)}
                  className="group flex items-start justify-between gap-3 p-3 rounded-2xl hover:bg-stone-100/60 dark:hover:bg-stone-800/60 transition-colors cursor-pointer border border-transparent hover:border-stone-200 dark:hover:border-stone-700"
                >
                  <div className="space-y-1">
                    <h2 className="font-serif text-xl sm:text-3xl font-medium text-stone-900 dark:text-stone-100 leading-tight">
                      {currentTask || 'Set focal objective...'}
                    </h2>
                    <p className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-2">
                      <span>Domain: <strong className="text-stone-800 dark:text-stone-200 font-semibold">{category}</strong></span>
                      <span>•</span>
                      <span>Click to edit or choose quick task below</span>
                    </p>
                  </div>
                  <button className="p-2 rounded-xl text-stone-400 opacity-60 group-hover:opacity-100 hover:bg-stone-200/60 dark:hover:bg-stone-700 transition-all shrink-0">
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Quick Task Preset Pills */}
              <div className="flex items-center gap-1.5 mt-3 -mx-1 px-1 pb-1 overflow-x-auto scrollbar-none">
                <span className="text-[10px] text-stone-400 uppercase font-semibold mr-1">Quick Select:</span>
                {TASK_SUGGESTIONS.map((sugg, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      onTaskChange(sugg.text);
                      onCategoryChange(sugg.cat);
                    }}
                    className={`shrink-0 px-2.5 py-1.5 rounded-xl text-[11px] font-medium transition-all cursor-pointer ${
                      currentTask === sugg.text
                        ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 font-bold shadow-xs'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                    }`}
                  >
                    {sugg.text.split(' ')[0]} {sugg.text.split(' ')[1]}
                  </button>
                ))}
              </div>

              {/* AI TARGET ANALYSIS & TAILORED RECOMMENDATIONS CARD */}
              {!isAuthorizedForAi ? (
                <div className="mt-4">
                  <VipCodeGate
                    featureName="Special AI Target Analysis"
                    featureDescription="Real-time cognitive wave profiling and automated task sub-step breakdown is reserved for signed-in users or Creator VIP Code."
                    onOpenAuth={onOpenAuth}
                    onUnlocked={onUnlockVip}
                  />
                </div>
              ) : (
                <>
                  {isAnalyzingTarget && (
                    <div className="mt-4 p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 flex items-center space-x-2 text-xs text-amber-800 dark:text-amber-300 animate-pulse">
                      <Sparkles className="w-4 h-4 animate-spin text-amber-500" />
                      <span>AI Analyzing target objective & determining optimal ultradian wave parameters...</span>
                    </div>
                  )}

                  {targetAnalysis && !isAnalyzingTarget && (
                <div className="mt-4 p-4.5 rounded-2xl bg-linear-to-br from-emerald-50/80 via-white to-stone-50/90 dark:from-stone-800/90 dark:via-stone-850 dark:to-stone-900 border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs space-y-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200/60 dark:border-stone-700/60 pb-2.5">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-xs font-bold font-mono tracking-wider uppercase text-emerald-900 dark:text-emerald-300">
                        AI TARGET RECOMMENDATION
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-[11px] font-bold">
                        {targetAnalysis.category} • {targetAnalysis.cognitiveType}
                      </span>
                    </div>
                  </div>

                  {/* Recommendation Overview Grid */}
                  <div className="grid grid-cols-3 gap-2 text-center py-1">
                    <div className="p-2 rounded-xl bg-white/80 dark:bg-stone-800 border border-stone-200/60 dark:border-stone-700/60">
                      <div className="text-[10px] text-stone-400 font-semibold uppercase">Focus Wave</div>
                      <div className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100 mt-0.5">
                        {targetAnalysis.recommendedWorkMinutes} Mins
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-white/80 dark:bg-stone-800 border border-stone-200/60 dark:border-stone-700/60">
                      <div className="text-[10px] text-stone-400 font-semibold uppercase">Rest Break</div>
                      <div className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100 mt-0.5">
                        {targetAnalysis.recommendedBreakMinutes} Mins
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-white/80 dark:bg-stone-800 border border-stone-200/60 dark:border-stone-700/60">
                      <div className="text-[10px] text-stone-400 font-semibold uppercase">Soundscape</div>
                      <div className="font-serif font-bold text-xs text-stone-900 dark:text-stone-100 mt-1 truncate">
                        {targetAnalysis.recommendedAmbient.replace('_', ' ')}
                      </div>
                    </div>
                  </div>

                  {/* Reasoning & Flow Tip */}
                  <div className="space-y-1.5 text-xs">
                    <p className="text-stone-700 dark:text-stone-300 leading-relaxed">
                      💡 <strong>Why this wave:</strong> {targetAnalysis.reasoning}
                    </p>
                    <p className="text-stone-600 dark:text-stone-400 text-[11px]">
                      🎯 <strong>Tactical Flow Tip:</strong> {targetAnalysis.tacticalTip}
                    </p>
                  </div>

                  {/* 1-Click Apply AI Wave Setup Button */}
                  <div className="pt-1 flex items-center justify-between gap-2">
                    <button
                      onClick={handleApplyAiTargetSetup}
                      className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer ${
                        appliedAnalysisForTask === currentTask
                          ? 'bg-emerald-600 text-white'
                          : 'bg-stone-900 text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>
                        {appliedAnalysisForTask === currentTask
                          ? 'AI Wave Setup Applied!'
                          : `Apply AI Setup (${targetAnalysis.recommendedWorkMinutes}m Wave)`}
                      </span>
                    </button>
                  </div>

                  {/* AI Generated Actionable Subtasks / Checklist */}
                  {targetAnalysis.suggestedSubtasks && targetAnalysis.suggestedSubtasks.length > 0 && (
                    <div className="border-t border-stone-200/60 dark:border-stone-700/60 pt-3 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                        <span>AI Actionable Steps Breakdown</span>
                        <button
                          onClick={() => setShowSubtasks(!showSubtasks)}
                          className="text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                        >
                          {showSubtasks ? 'Hide Steps' : `Show Steps (${subtasks.length})`}
                        </button>
                      </div>

                      {showSubtasks && (
                        <div className="space-y-1.5 pt-1">
                          {subtasks.length === 0 ? (
                            <div className="text-xs text-stone-400 italic">
                              Click "Apply AI Setup" above to populate these steps automatically!
                            </div>
                          ) : (
                            subtasks.map((st) => (
                              <div
                                key={st.id}
                                className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white/90 dark:bg-stone-800/80 border border-stone-200/50 dark:border-stone-700/50 text-xs"
                              >
                                <button
                                  onClick={() => toggleSubtask(st.id)}
                                  className="flex items-center space-x-2 text-left flex-1 cursor-pointer"
                                >
                                  <span className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                                    st.completed
                                      ? 'bg-emerald-500 border-emerald-500 text-white'
                                      : 'border-stone-300 dark:border-stone-600'
                                  }`}>
                                    {st.completed && <Check className="w-3 h-3 stroke-[3]" />}
                                  </span>
                                  <span className={st.completed ? 'line-through text-stone-400 dark:text-stone-500' : 'text-stone-800 dark:text-stone-200 font-medium'}>
                                    {st.text}
                                  </span>
                                </button>
                                <button
                                  onClick={() => removeSubtask(st.id)}
                                  className="text-stone-400 hover:text-rose-500 transition-colors p-1"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))
                          )}

                          {/* Add Custom Subtask Input */}
                          <form onSubmit={handleAddSubtask} className="flex items-center gap-1.5 mt-2">
                            <input
                              type="text"
                              value={newSubtaskText}
                              onChange={(e) => setNewSubtaskText(e.target.value)}
                              placeholder="+ Add step to target..."
                              className="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                            <button
                              type="submit"
                              className="px-3 py-1.5 rounded-xl bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-bold cursor-pointer"
                            >
                              Add
                            </button>
                          </form>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

            {/* Answer 2 & Answer 3: NEXT WAVE DURATION & BREAK SCHEDULE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Answer 2 */}
              <div className="p-4 rounded-2xl bg-stone-50/80 dark:bg-stone-800/50 border border-stone-200/70 dark:border-stone-700/60">
                <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-1 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-500" />
                  <span>2. How Long Should My Next Focus Wave Be?</span>
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
                    {sessionType === 'work' ? Math.round(totalSeconds / 60) : settings.workMinutes} Minutes
                  </span>
                  <span className="text-xs text-stone-500 dark:text-stone-400">
                    ({settings.activePresetId.replace('_', ' ')})
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                  Optimal ultradian BRAC window based on your clarity history.
                </p>
              </div>

              {/* Answer 3 */}
              <div className="p-4 rounded-2xl bg-stone-50/80 dark:bg-stone-800/50 border border-stone-200/70 dark:border-stone-700/60">
                <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-1 flex items-center gap-1">
                  <Coffee className="w-3 h-3 text-sky-500" />
                  <span>3. When Should I Take My Break?</span>
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
                    At {breakScheduleTime}
                  </span>
                  <span className="text-xs text-stone-500 dark:text-stone-400">
                    ({settings.shortBreakMinutes}m Short Break)
                  </span>
                </div>
                <div className="flex items-center space-x-2 mt-1 text-[11px] text-stone-500 dark:text-stone-400">
                  <span className={`w-2 h-2 rounded-full ${recoveryStatus.color}`} />
                  <span>{recoveryStatus.status}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Interactive Timer Instrument & Direct One-Click CTA */}
          <div className="order-1 lg:order-2 w-full lg:w-80 shrink-0 flex flex-col justify-between p-4 sm:p-6 rounded-2xl bg-stone-900 text-stone-100 dark:bg-stone-950 dark:border dark:border-stone-800 relative overflow-hidden shadow-lg">
            {/* Background subtle radial gradient */}
            <div className="absolute inset-0 bg-radial from-stone-800/40 via-transparent to-transparent opacity-50 pointer-events-none" />

            <div className="relative z-10 space-y-4 text-center">
              <div className="flex items-center justify-between text-xs text-stone-400">
                <span className="font-mono uppercase text-[10px] tracking-wider font-semibold">
                  {sessionType === 'work' ? 'FOCUS WAVE ENGINE' : 'RECOVERY BREAK ENGINE'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 text-[10px]">
                  {progressPercent}% Complete
                </span>
              </div>

              {/* Large Timer Digits */}
              <div className="my-2">
                <span className="font-mono text-4xl min-[360px]:text-5xl sm:text-6xl font-bold tracking-tight text-white drop-shadow-xs">
                  {formatTime(secondsLeft)}
                </span>
                <div className="w-full bg-stone-800 rounded-full h-1.5 mt-3 overflow-hidden">
                  <div
                    className="bg-emerald-400 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Primary One-Click Start / Pause Actions */}
              <div className="pt-2 space-y-2">
                {!isRunning ? (
                  <button
                    onClick={onStart}
                    className="w-full py-3.5 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-sm tracking-wide uppercase transition-all transform active:scale-98 shadow-md flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Start Wave Now ({Math.round(totalSeconds / 60)}m)</span>
                  </button>
                ) : (
                  <button
                    onClick={onPause}
                    className="w-full py-3.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm tracking-wide uppercase transition-all transform active:scale-98 shadow-md flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <Pause className="w-4 h-4 fill-current" />
                    <span>Pause Focus Wave</span>
                  </button>
                )}

                <div className="flex items-center justify-between gap-2 text-xs">
                  <button
                    onClick={onReset}
                    className="flex-1 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>

                  <button
                    onClick={onSkip}
                    className="flex-1 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <SkipForward className="w-3.5 h-3.5" />
                    <span>Skip</span>
                  </button>

                  <button
                    onClick={onToggleZen}
                    className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors cursor-pointer"
                    title="Fullscreen Zen Mode"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Ambient Soundscape Quick Toggle */}
            <div className="relative z-10 border-t border-stone-800 pt-3 mt-4 flex items-center justify-between text-xs text-stone-400">
              <button
                onClick={onToggleAmbient}
                className="flex items-center space-x-1.5 hover:text-stone-200 transition-colors cursor-pointer"
              >
                {activeAmbient !== 'none' ? (
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5 text-stone-500" />
                )}
                <span>Soundscape: <strong>{activeAmbient === 'none' ? 'Off' : activeAmbient.replace('_', ' ')}</strong></span>
              </button>
              <button
                onClick={onAddDistraction}
                className="hover:text-amber-400 transition-colors cursor-pointer text-[11px]"
              >
                + Distraction ({distractionsCount})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================= */}
      {/* ANSWERS 4 & 5: GOALS, TODAY'S ACCOMPLISHMENTS & METRICS */}
      {/* ======================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        {/* Answer 4: WHAT IS MY CURRENT GOAL? */}
        <div className="rounded-2xl bg-white/90 dark:bg-stone-900/90 border border-stone-200/90 dark:border-stone-800/90 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-emerald-500" />
              <span>4. What Is My Current Goal?</span>
            </div>
            <span className="text-xs font-bold text-stone-800 dark:text-stone-200 font-mono">
              {completedCyclesToday} / {targetCycles} Waves
            </span>
          </div>

          <div className="space-y-3">
            <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round((completedCyclesToday / (targetCycles || 1)) * 100))}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
              <span>Goal: <strong>{targetCycles} Ultradian Waves</strong></span>
              <span>{Math.round((completedCyclesToday / (targetCycles || 1)) * 100)}% Reached</span>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-400 bg-stone-50 dark:bg-stone-800/50 p-2.5 rounded-xl border border-stone-100 dark:border-stone-800">
              🎯 <strong>Daily Target:</strong> Maintain 90m BRAC rhythmic consistency across primary work blocks.
            </p>
          </div>
        </div>

        {/* Answer 5: WHAT DID I ACCOMPLISH TODAY? */}
        <div className="rounded-2xl bg-white/90 dark:bg-stone-900/90 border border-stone-200/90 dark:border-stone-800/90 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-sky-500" />
              <span>5. What Did I Accomplish Today?</span>
            </div>
            <span className="text-xs font-bold text-stone-500 font-mono">
              {todayRecords.length} Session Logs
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800">
              <div className="text-[10px] text-stone-400 font-semibold uppercase">Focus Time</div>
              <div className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100 mt-0.5">
                {Math.floor(todayFocusMinutes / 60)}h {todayFocusMinutes % 60}m
              </div>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800">
              <div className="text-[10px] text-stone-400 font-semibold uppercase">Completed Waves</div>
              <div className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100 mt-0.5">
                {completedCyclesToday} Waves
              </div>
            </div>
          </div>

          <p className="text-xs text-stone-500 dark:text-stone-400 mt-3 truncate">
            {todayRecords.length > 0
              ? `Last wave: "${todayRecords[0].taskName}" (${todayRecords[0].durationMinutes}m)`
              : 'Ready to log your first wave of the day!'}
          </p>
        </div>

        {/* RECOVERY & ENERGY STATUS CARD */}
        <div className="rounded-2xl bg-white/90 dark:bg-stone-900/90 border border-stone-200/90 dark:border-stone-800/90 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 flex items-center gap-1.5">
              <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
              <span>Recovery & Readiness Status</span>
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              {recoveryStatus.score}%
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${recoveryStatus.color} animate-pulse`} />
              <span className="font-serif text-base font-bold text-stone-900 dark:text-stone-100">
                {recoveryStatus.status}
              </span>
            </div>

            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
              {recoveryStatus.message}
            </p>

            <div className="pt-1 text-[11px] text-stone-400 dark:text-stone-500 flex items-center justify-between">
              <span>Distractions Logged: <strong>{distractionsCount}</strong></span>
              <span>Energy: <strong>{focusTrend.label}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================= */}
      {/* ANSWER 6: WHAT DOES ULTRADIAN RECOMMEND I DO NEXT?       */}
      {/* ======================================================= */}
      <div className="rounded-3xl bg-linear-to-br from-stone-900 via-stone-850 to-stone-900 text-stone-100 dark:border dark:border-stone-800 p-4 sm:p-8 shadow-md relative overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="font-mono text-xs font-bold tracking-widest uppercase text-emerald-400">
                6. What Does Ultradian Recommend I Do Next?
              </span>
            </div>
            <span className="text-xs text-stone-400">
              Derived from {recommendation.sampleSize} self-reported logs
            </span>
          </div>

          {!isAuthorizedForAi ? (
            <VipCodeGate
              featureName="Special AI Next Wave Recommendation"
              featureDescription="Personalized ultradian next wave recommendation derived from historical logs and circadian rhythms is available exclusively to signed-in users or Creator VIP Code."
              onOpenAuth={onOpenAuth}
              onUnlocked={onUnlockVip}
            />
          ) : (
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-stone-800/60 p-5 rounded-2xl border border-stone-700/60">
              <div className="space-y-1.5 flex-1">
                <h3 className="font-serif text-xl sm:text-2xl font-medium text-white">
                  {recommendation.title}
                </h3>
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                  {recommendation.summary}
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-stone-400 font-mono">
                  <span>⏱️ {recommendation.suggestedWorkMinutes}m Focus</span>
                  <span>•</span>
                  <span>☕ {recommendation.suggestedBreakMinutes}m Recovery</span>
                  <span>•</span>
                  <span>🎧 {recommendation.suggestedAmbient.replace('_', ' ')}</span>
                </div>
              </div>

              <button
                onClick={handleAcceptAndStartRecommendedWave}
                className="w-full md:w-auto py-3.5 px-6 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-stone-950 font-bold text-sm tracking-wide transition-all transform active:scale-98 shadow-md flex items-center justify-center space-x-2 shrink-0 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Accept & Start Recommended Wave ({recommendation.suggestedWorkMinutes}m)</span>
              </button>
            </div>
          )}

          {/* Quick Start Presets Section */}
          <div className="space-y-3 pt-2">
            <div className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-stone-400" />
              <span>Instant Quick-Start Presets (1-Click Wave Launch)</span>
            </div>

            <div className="grid grid-cols-1 min-[360px]:grid-cols-2 sm:grid-cols-4 gap-3">
              {DEFAULT_PRESETS.map((preset) => {
                const isActive = settings.activePresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => {
                      onSelectPreset(preset);
                      setTimeout(() => onStart(), 150);
                    }}
                    className={`p-3.5 rounded-2xl text-left transition-all border cursor-pointer ${
                      isActive
                        ? 'bg-stone-800 border-emerald-400/80 shadow-md ring-1 ring-emerald-400/50'
                        : 'bg-stone-800/40 border-stone-700/60 hover:bg-stone-800/80 hover:border-stone-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-serif font-bold text-sm text-white">{preset.name}</span>
                      {isActive && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
                    </div>
                    <div className="font-mono text-xs text-emerald-400 font-semibold">
                      {preset.workMinutes}m / {preset.shortBreakMinutes}m
                    </div>
                    <div className="text-[10px] text-stone-400 truncate mt-1">
                      {preset.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
