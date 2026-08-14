import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Recommendation, NON_BIOLOGICAL_DISCLAIMER } from '../utils/rhythmEngine';
import { CategoryTag } from '../types';
import { SignInGate } from './SignInGate';
import {
  IconSparkle,
  IconCheck,
  IconChevronDown,
  IconSettings,
} from './icons';

interface TransparentRecommendationCardProps {
  recommendation: Recommendation;
  onApply: (workMins: number, breakMins: number, ambient: any) => void;
  selectedCategory: CategoryTag;
  onCategoryChange: (cat: CategoryTag) => void;
  isAuthorizedForAi?: boolean;
  onOpenAuth?: () => void;
}

export const TransparentRecommendationCard: React.FC<TransparentRecommendationCardProps> = ({
  recommendation,
  onApply,
  selectedCategory,
  onCategoryChange,
  isAuthorizedForAi = true,
  onOpenAuth,
}) => {
  const [showFormula, setShowFormula] = useState(false);
  const [applied, setApplied] = useState(false);

  const triggerHaptic = useCallback(() => {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(8);
      }
    } catch {}
  }, []);

  if (!isAuthorizedForAi) {
    return (
      <SignInGate
        featureName="Wave recommendation"
        featureDescription="Sign in to see a duration recommendation drawn from your logged waves."
        onOpenAuth={onOpenAuth}
      />
    );
  }

  const categories: CategoryTag[] = ['Coding', 'Writing', 'Design', 'Research', 'Strategy', 'Study'];

  const handleApplyClick = () => {
    triggerHaptic();
    onApply(
      recommendation.suggestedWorkMinutes,
      recommendation.suggestedBreakMinutes,
      recommendation.suggestedAmbient
    );
    setApplied(true);
    setTimeout(() => setApplied(false), 2500);
  };

  return (
    <div className="liquid-glass-card w-full p-5 sm:p-7 relative overflow-hidden transition-all">
      {/* Header & Category Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="liquid-glass-badge p-2 rounded-xl">
            <IconSparkle size={18} className="text-[color:var(--ink)]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[color:var(--ink-mute)]">
                TRANSPARENT ALGORITHM ENGINE
              </span>
              <span className="liquid-glass-badge px-2 py-0.2 text-[9px] font-mono font-semibold uppercase tracking-wider rounded-full text-[color:var(--ink-soft)]">
                {recommendation.sampleSize} logs
              </span>
            </div>
            <h3 className="font-serif text-xl font-normal text-[color:var(--ink)] mt-0.5">
              {recommendation.title}
            </h3>
          </div>
        </div>

        {/* Domain Tag Picker */}
        <div className="chip-rail max-w-full pb-1 sm:pb-0">
          {categories.map((cat) => (
            <motion.button
              key={cat}
              type="button"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => {
                triggerHaptic();
                onCategoryChange(cat);
              }}
              className={`px-3 py-1 rounded-full text-[11px] font-medium tracking-wide transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[color:var(--ink)] text-[color:var(--paper)] shadow-xs'
                  : 'text-[color:var(--ink-mute)] hover:text-[color:var(--ink)] hover:bg-[color:var(--line)]/40'
              }`}
            >
              {cat}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Main Rationale Summary */}
      <p className="text-xs text-[color:var(--ink-soft)] leading-relaxed mb-5">
        {recommendation.summary}
      </p>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 p-3 rounded-2xl bg-[color:var(--paper)]/80 border border-[color:var(--line)]/60 mb-5">
        <div className="text-center py-1">
          <span className="block text-[9px] font-mono font-bold uppercase text-[color:var(--ink-mute)] tracking-wider">
            SUGGESTED FOCUS
          </span>
          <span className="clock-face text-lg sm:text-xl font-serif font-medium text-[color:var(--ink)]">
            {recommendation.suggestedWorkMinutes}m
          </span>
        </div>
        <div className="text-center py-1 border-x border-[color:var(--line)]/60">
          <span className="block text-[9px] font-mono font-bold uppercase text-[color:var(--ink-mute)] tracking-wider">
            RECOVERY REST
          </span>
          <span className="clock-face text-lg sm:text-xl font-serif font-medium text-[color:var(--ink)]">
            {recommendation.suggestedBreakMinutes}m
          </span>
        </div>
        <div className="text-center py-1">
          <span className="block text-[9px] font-mono font-bold uppercase text-[color:var(--ink-mute)] tracking-wider">
            PEAK WINDOW
          </span>
          <span className="text-xs sm:text-sm font-sans font-medium text-[color:var(--ink)] truncate block mt-0.5">
            {recommendation.recommendedTimeOfDay}
          </span>
        </div>
      </div>

      {/* Action Buttons & Formula Inspector Toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        <button
          type="button"
          onClick={() => {
            triggerHaptic();
            setShowFormula(!showFormula);
          }}
          className="flex items-center gap-1.5 text-xs text-[color:var(--ink-mute)] hover:text-[color:var(--ink)] transition-colors font-medium cursor-pointer"
        >
          <IconSettings size={14} />
          <span>Why this recommendation?</span>
          <IconChevronDown size={14} className={`transition-transform duration-200 ${showFormula ? 'rotate-180' : ''}`} />
        </button>

        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={handleApplyClick}
          className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all shadow-sm ${
            applied
              ? 'bg-[color:var(--ink)] text-[color:var(--paper)]'
              : 'bg-[color:var(--ink)] text-[color:var(--paper)] hover:opacity-90'
          }`}
        >
          {applied ? (
            <>
              <IconCheck size={14} />
              <span>Applied to Focus</span>
            </>
          ) : (
            <span>Apply Recommendation ({recommendation.suggestedWorkMinutes}m)</span>
          )}
        </motion.button>
      </div>

      {/* Formula Transparency Card */}
      <AnimatePresence>
        {showFormula && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="mt-4 p-4 rounded-xl bg-[color:var(--paper)] border border-[color:var(--line)] text-xs space-y-3 font-mono overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-[color:var(--line)]/60 pb-2">
              <span className="font-bold uppercase tracking-wider text-[color:var(--ink)] flex items-center gap-1.5">
                Model Rationale & Formula
              </span>
              <span className="text-[10px] text-[color:var(--ink-mute)]">Sample: {recommendation.sampleSize} logs</span>
            </div>

            <p className="text-[color:var(--ink-soft)] font-sans leading-relaxed text-[11px]">
              {recommendation.rationale}
            </p>

            <div className="p-2.5 rounded-lg bg-[color:var(--paper-raised)] border border-[color:var(--line)] text-[10px] text-[color:var(--ink)] leading-normal">
              <strong>Transparent Algorithm:</strong> {recommendation.formulaExplanation}
            </div>

            <div className="text-[10px] text-[color:var(--ink-mute)] font-sans italic border-t border-[color:var(--line)]/60 pt-2">
              {NON_BIOLOGICAL_DISCLAIMER}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
