import React, { useState } from 'react';
import { Lightbulb, Target, Clock, ShieldAlert, Volume2, ArrowRight, CheckCircle2, Filter } from 'lucide-react';
import { InsightCard } from '../utils/rhythmEngine';
import { CategoryTag } from '../types';

interface InsightCardsGridProps {
  cards: InsightCard[];
  onApplyAction?: (payload: InsightCard['actionPayload']) => void;
}

export const InsightCardsGrid: React.FC<InsightCardsGridProps> = ({
  cards,
  onApplyAction,
}) => {
  const [selectedDomain, setSelectedDomain] = useState<string>('All');
  const [appliedCardIds, setAppliedCardIds] = useState<Record<string, boolean>>({});

  const domainOptions = ['All', 'Coding', 'Writing', 'Design', 'Research', 'Strategy', 'Study'];

  const filteredCards = cards.filter((c) => {
    if (selectedDomain === 'All') return true;
    return c.category === selectedDomain || c.category === 'All';
  });

  const getCardIcon = (type: InsightCard['type']) => {
    switch (type) {
      case 'sweet_spot':
        return <Target className="w-4 h-4 text-amber-500" />;
      case 'peak_window':
        return <Clock className="w-4 h-4 text-emerald-500" />;
      case 'distraction_trigger':
        return <ShieldAlert className="w-4 h-4 text-red-500" />;
      case 'soundscape_synergy':
        return <Volume2 className="w-4 h-4 text-indigo-500" />;
      default:
        return <Lightbulb className="w-4 h-4 text-amber-500" />;
    }
  };

  const handleActionClick = (card: InsightCard) => {
    if (card.actionPayload && onApplyAction) {
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
        <div className="flex items-center space-x-2">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          <h3 className="font-serif text-lg font-medium text-stone-900 dark:text-stone-100">
            Self-Reported Pattern Insights
          </h3>
        </div>

        <div className="flex items-center space-x-1 overflow-x-auto max-w-full pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-stone-400 mr-1 shrink-0" />
          {domainOptions.map((domain) => (
            <button
              key={domain}
              onClick={() => setSelectedDomain(domain)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                selectedDomain === domain
                  ? 'bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-750'
              }`}
            >
              {domain}
            </button>
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
              className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800/80 shadow-xs flex flex-col justify-between space-y-3 transition-all hover:border-stone-300 dark:hover:border-stone-700"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 rounded-lg bg-stone-100 dark:bg-stone-800">
                      {getCardIcon(card.type)}
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">
                      {card.category}
                    </span>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    {card.metricBadge}
                  </span>
                </div>

                <h4 className="font-serif text-base font-medium text-stone-900 dark:text-stone-100">
                  {card.title}
                </h4>

                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                  {card.description}
                </p>
              </div>

              <div className="pt-2 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between">
                <span className="text-[10px] text-stone-400 dark:text-stone-500 font-mono">
                  {card.dataPoint}
                </span>

                {card.actionLabel && (
                  <button
                    onClick={() => handleActionClick(card)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center space-x-1 ${
                      isApplied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-stone-200 text-stone-100 dark:text-stone-900'
                    }`}
                  >
                    {isApplied ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Applied</span>
                      </>
                    ) : (
                      <>
                        <span>{card.actionLabel}</span>
                        <ArrowRight className="w-3 h-3" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {filteredCards.length === 0 && (
          <div className="col-span-full p-8 text-center bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 text-xs text-stone-400 font-serif italic">
            No pattern insights for '{selectedDomain}' domain yet. Log a session in this category to generate insights.
          </div>
        )}
      </div>
    </div>
  );
};
