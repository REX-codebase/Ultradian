import React, { useState } from 'react';
import { Sparkles, Info, CheckCircle2, ChevronDown, ChevronUp, Cpu, ArrowRight, Zap, Target } from 'lucide-react';
import { Recommendation, NON_BIOLOGICAL_DISCLAIMER } from '../utils/rhythmEngine';
import { UserSettings, CategoryTag } from '../types';
import { VipCodeGate } from './VipCodeGate';

interface TransparentRecommendationCardProps {
  recommendation: Recommendation;
  onApply: (workMins: number, breakMins: number, ambient: any) => void;
  selectedCategory: CategoryTag;
  onCategoryChange: (cat: CategoryTag) => void;
  isAuthorizedForAi?: boolean;
  onOpenAuth?: () => void;
  onUnlockVip?: () => void;
}

export const TransparentRecommendationCard: React.FC<TransparentRecommendationCardProps> = ({
  recommendation,
  onApply,
  selectedCategory,
  onCategoryChange,
  isAuthorizedForAi = true,
  onOpenAuth,
  onUnlockVip,
}) => {
  const [showFormula, setShowFormula] = useState(false);
  const [applied, setApplied] = useState(false);

  if (!isAuthorizedForAi) {
    return (
      <VipCodeGate
        featureName="Special AI Recommendation Engine"
        featureDescription="Transparent ultradian wave recommendation algorithms tailored to your cognitive domains are available exclusively to signed-in users or Creator VIP Code."
        onOpenAuth={onOpenAuth}
        onUnlocked={onUnlockVip}
      />
    );
  }

  const categories: CategoryTag[] = ['Coding', 'Writing', 'Design', 'Research', 'Strategy', 'Study'];

  const handleApplyClick = () => {
    onApply(
      recommendation.suggestedWorkMinutes,
      recommendation.suggestedBreakMinutes,
      recommendation.suggestedAmbient
    );
    setApplied(true);
    setTimeout(() => setApplied(false), 2500);
  };

  return (
    <div className="w-full p-5 sm:p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800/90 shadow-xs relative overflow-hidden transition-all">
      {/* Accent top gradient line */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-emerald-500 to-indigo-500" />

      {/* Header & Category Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                TRANSPARENT RECOMMENDATION ENGINE
              </span>
              <span className="px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 rounded-full">
                {recommendation.sampleSize} logs
              </span>
            </div>
            <h3 className="font-serif text-lg font-medium text-stone-900 dark:text-stone-100 mt-0.5">
              {recommendation.title}
            </h3>
          </div>
        </div>

        {/* Domain Tag Picker */}
        <div className="flex items-center space-x-1 overflow-x-auto max-w-full pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800/60 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Rationale Summary */}
      <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed mb-4">
        {recommendation.summary}
      </p>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 p-3 rounded-xl bg-stone-50 dark:bg-stone-850 border border-stone-200/60 dark:border-stone-800 mb-4">
        <div className="text-center">
          <span className="block text-[9px] font-mono font-bold uppercase text-stone-400 dark:text-stone-500">
            SUGGESTED FOCUS
          </span>
          <span className="text-base sm:text-lg font-serif font-semibold text-stone-900 dark:text-stone-100">
            {recommendation.suggestedWorkMinutes}m
          </span>
        </div>
        <div className="text-center border-x border-stone-200/80 dark:border-stone-800">
          <span className="block text-[9px] font-mono font-bold uppercase text-stone-400 dark:text-stone-500">
            RECOVERY REST
          </span>
          <span className="text-base sm:text-lg font-serif font-semibold text-stone-900 dark:text-stone-100">
            {recommendation.suggestedBreakMinutes}m
          </span>
        </div>
        <div className="text-center">
          <span className="block text-[9px] font-mono font-bold uppercase text-stone-400 dark:text-stone-500">
            PEAK WINDOW
          </span>
          <span className="text-xs sm:text-sm font-sans font-semibold text-amber-600 dark:text-amber-400 truncate block mt-0.5">
            {recommendation.recommendedTimeOfDay}
          </span>
        </div>
      </div>

      {/* Action Buttons & Formula Inspector Toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        <button
          onClick={() => setShowFormula(!showFormula)}
          className="flex items-center space-x-1.5 text-xs text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200 transition-colors font-medium"
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Why this recommendation?</span>
          {showFormula ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={handleApplyClick}
          className={`flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all active:scale-95 ${
            applied
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-stone-200 text-stone-100 dark:text-stone-900 shadow-sm'
          }`}
        >
          {applied ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>Recommendation Applied!</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Apply Recommendation ({recommendation.suggestedWorkMinutes}m)</span>
            </>
          )}
        </button>
      </div>

      {/* Formula Transparency Card */}
      {showFormula && (
        <div className="mt-4 p-4 rounded-xl bg-stone-900 text-stone-100 border border-stone-800 text-xs space-y-3 animate-fade-in font-mono">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2">
            <span className="text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" /> Model Rationale & Formula
            </span>
            <span className="text-[10px] text-stone-400">Sample: {recommendation.sampleSize} logs</span>
          </div>

          <p className="text-stone-300 font-sans leading-relaxed text-[11px]">
            {recommendation.rationale}
          </p>

          <div className="p-2.5 rounded-lg bg-stone-950 border border-stone-800 text-[10px] text-amber-300/90 leading-normal">
            <strong>Transparent Algorithm:</strong> {recommendation.formulaExplanation}
          </div>

          <div className="text-[10px] text-stone-400 font-sans italic border-t border-stone-800/80 pt-2">
            ⚠️ <strong>Disclaimer:</strong> {NON_BIOLOGICAL_DISCLAIMER}
          </div>
        </div>
      )}
    </div>
  );
};
