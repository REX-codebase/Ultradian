import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HomeCommandCenter } from '../HomeCommandCenter';
import { AnalyticsDashboard } from '../AnalyticsDashboard';
import { TribalLeaderboardCard } from '../TribalLeaderboardCard';
import { SocialShareModal } from '../SocialShareModal';
import { DEFAULT_SETTINGS } from '../../utils/storage';
import { SessionRecord } from '../../types';

// Mock Recharts ResponsiveContainer to render in JSDOM
vi.mock('recharts', async () => {
  const actual: any = await vi.importActual('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children }: any) => <div style={{ width: 500, height: 300 }}>{children}</div>,
  };
});

describe('Focus, Rhythm, and League Tabs Rendering & Aesthetics', () => {
  const sampleRecords: SessionRecord[] = [
    {
      id: 's1',
      timestamp: Date.now() - 3600000,
      dateString: new Date().toISOString().split('T')[0],
      durationMinutes: 90,
      actualSecondsCompleted: 5400,
      type: 'work',
      category: 'Coding',
      presetName: 'level_3_master',
      taskName: 'Refactor Core Architecture',
      focusRating: 5,
      energyLevelAfter: 4,
      distractionsCount: 0,
      notes: 'Deep focus wave',
    },
  ];

  it('renders Focus tab HomeCommandCenter with chronometer, category chips, and command deck', () => {
    render(
      <HomeCommandCenter
        currentTask="Build UI Masterpiece"
        onTaskChange={vi.fn()}
        category="Design"
        onCategoryChange={vi.fn()}
        secondsLeft={5400}
        totalSeconds={5400}
        isRunning={false}
        sessionType="work"
        onStart={vi.fn()}
        onPause={vi.fn()}
        onReset={vi.fn()}
        onSkip={vi.fn()}
        distractionsCount={0}
        onAddDistraction={vi.fn()}
        completedCyclesToday={2}
        targetCycles={4}
        settings={DEFAULT_SETTINGS}
        onSelectPreset={vi.fn()}
        onApplyRecommendation={vi.fn()}
        sessionRecords={sampleRecords}
        activeAmbient="none"
        onToggleAmbient={vi.fn()}
        onToggleZen={vi.fn()}
        onOpenSettings={vi.fn()}
      />
    );

    expect(screen.getByText('Build UI Masterpiece')).toBeInTheDocument();
    expect(screen.getByText('Focus Wave')).toBeInTheDocument();
    expect(screen.getByText('90:00')).toBeInTheDocument();
    expect(screen.getByText(/Begin 90m Wave/i)).toBeInTheDocument();
    expect(screen.getByText('Reset')).toBeInTheDocument();
    expect(screen.getByText('Skip')).toBeInTheDocument();
    expect(screen.getByText('Sound')).toBeInTheDocument();
    expect(screen.getByText('Zen')).toBeInTheDocument();
  });

  it('renders Rhythm tab AnalyticsDashboard with editorial stat cards and recent ledger', () => {
    render(
      <AnalyticsDashboard
        records={sampleRecords}
        dailyGoalCycles={4}
        settings={DEFAULT_SETTINGS}
        onApplyRecommendation={vi.fn()}
      />
    );

    expect(screen.getByText('Total Focus')).toBeInTheDocument();
    expect(screen.getByText('Completed Waves')).toBeInTheDocument();
    expect(screen.getByText('Clarity Index')).toBeInTheDocument();
    expect(screen.getByText('Rhythm SQI')).toBeInTheDocument();
    expect(screen.getByText('Weekly Rhythm Cadence')).toBeInTheDocument();
    expect(screen.getByText('Recent Waves Ledger')).toBeInTheDocument();
  });

  it('renders League tab TribalLeaderboardCard cleanly', () => {
    render(<TribalLeaderboardCard userTribeId="deep_work" />);
    expect(screen.getByText('Tribe Standings')).toBeInTheDocument();
  });

  it('renders League tab SocialShareModal inline standings and metrics', () => {
    render(
      <SocialShareModal
        userStats={{
          weeklyHours: 12.5,
          completedCycles: 8,
          focusScore: 92,
          topCategory: 'Coding',
        }}
        globalRank={3}
        isInline={true}
      />
    );

    expect(screen.getByText('League Standings')).toBeInTheDocument();
    expect(screen.getByText('#3')).toBeInTheDocument();
    expect(screen.getByText('12.5h')).toBeInTheDocument();
    expect(screen.getByText('Division Standings')).toBeInTheDocument();
  });
});
