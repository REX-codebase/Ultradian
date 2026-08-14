import React, { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { InsightCard } from '../utils/rhythmEngine';
import { SignInGate } from './SignInGate';
import {
  IconSparkle,
  IconFocusTarget,
  IconAlert,
  IconVolume,
  IconCheck,
  IconArrowRight,
} from './icons';

interface InsightCardsGridProps {
  cards: InsightCard[];
  onApplyAction?: (payload: InsightCard['actionPayload']) => void;
  isAuthorizedForAi?: boolean;
  onOpenAuth?: () => void;
}

export const InsightCardsGrid: React.FC<InsightCardsGridProps> = ({
  cards,
  onApplyAction,
  isAuthorizedForAi = true,
  onOpenAuth,
}) => {
  const [selectedDomain, setSelectedDomain] = useState<string>('All');
  const [appliedCardIds, setAppliedCardIds] = useState<Record<string, boolean>>({});

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
        featureName="Pattern Intelligence"
        featureDescription="Sign in to discover domain-specific sweet spots, distraction patterns, and biological rhythm triggers."
        onOpenAuth={onOpenAuth}
      />
    );
  }

  const domainOptions = ['All', 'Coding', 'Writing', 'Design', 'Research', 'Strategy', 'Study'];

  const filteredCards = cards.filter((c) => {
    if (selectedDomain === 'All') return true;
    return c.category === selectedDomain || c.category === 'All';
  });

  const getCardIcon = (type: InsightCard['type']) => {
    switch (type) {
      case 'sweet_spot':
        return <IconFocusTarget size={16} className="text-[color:var(--ink)]" />;
      case 'peak_window':
        return <IconSparkle size={16} className="text-[color:var(--ink)]" />;
      case 'distraction_trigger':
        return <IconAlert size={16} className="text-[color:var(--ink-soft)]" />;
      case 'soundscape_synergy':
        return <IconVolume size={16} className="text-[color:var(--ink)]" />;
      default:
        return <IconSparkle size={16} className="text-[color:var(--ink)]" />;
    }
  };

  const handleActionClick = (card: InsightCard) => {
    if (card.actionPayload && onApplyAction) {
      triggerHaptic();
      onApplyAction(card.actionPayload);
      setAppliedCardIds((prev) => ({ ...prev, [card.id]: true }));
      setTimeout(() => {
        setAppliedCardIds((prev) => ({ ...prev, [card.id]: false }));
      }, 2500);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="liquid-glass-badge p-1.5 rounded-xl">
            <IconSparkle size={16} className="text-[color:var(--ink)]" />
          </span>
          <h3 className="font-serif text-lg font-normal text-[color:var(--ink)]">
            Self-Reported Pattern Insights
          </h3>
        </div>

        <div className="chip-rail max-w-full pb-1 sm:pb-0">
          {domainOptions.map((domain) => (
            <motion.button
              key={domain}
              type="button"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => {
                triggerHaptic();
                setSelectedDomain(domain);
              }}
              className={`px-3 py-1 rounded-full text-[11px] font-medium tracking-wide transition-all whitespace-nowrap ${
                selectedDomain === domain
                  ? 'bg-[color:var(--ink)] text-[color:var(--paper)] shadow-xs'
                  : 'text-[color:var(--ink-mute)] hover:text-[color:var(--ink)] hover:bg-[color:var(--line)]/40'
              }`}
            >
              {domain}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCards.map((card) => {
          const isApplied = appliedCardIds[card.id];
          return (
            <div
              key={card.id}
              className="liquid-glass-card p-5 flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-[color:var(--line)]/50">
                      {getCardIcon(card.type)}
                    </div>
                    <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[color:var(--ink-mute)]">
                      {card.category}
                    </span>
                  </div>

                  <span className="liquid-glass-badge px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium uppercase tracking-wider text-[color:var(--ink-soft)]">
                    {card.metricBadge}
                  </span>
                </div>

                <h4 className="font-serif text-base font-normal text-[color:var(--ink)]">
                  {card.title}
                </h4>

                <p className="text-xs text-[color:var(--ink-soft)] leading-relaxed">
                  {card.description}
                </p>
              </div>

              <div className="pt-2 border-t border-[color:var(--line)]/60 flex items-center justify-between">
                <span className="text-[10px] text-[color:var(--ink-mute)] font-mono">
                  {card.dataPoint}
                </span>

                {card.actionLabel && (
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleActionClick(card)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-wide transition-all flex items-center gap-1.5 ${
                      isApplied
                        ? 'bg-[color:var(--ink)] text-[color:var(--paper)]'
                        : 'bg-[color:var(--ink)] text-[color:var(--paper)] hover:opacity-90 shadow-xs'
                    }`}
                  >
                    {isApplied ? (
                      <>
                        <IconCheck size={13} />
                        <span>Applied</span>
                      </>
                    ) : (
                      <>
                        <span>{card.actionLabel}</span>
                        <IconArrowRight size={13} />
                      </>
                    )}
                  </motion.button>
                )}
              </div>
            </div>
          );
        })}

        {filteredCards.length === 0 && (
          <div className="col-span-full p-8 text-center liquid-glass-card text-xs text-[color:var(--ink-mute)] font-serif italic">
            No pattern insights for '{selectedDomain}' domain yet. Complete a focus wave in this category to generate insights.
          </div>
        )}
      </div>
    </div>
  );
};
