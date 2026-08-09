import { SessionRecord, CategoryTag } from '../types';

/**
 * Checks whether a session record is a sample/demo session.
 * Sample sessions are clearly marked and excluded from competitive leaderboards.
 */
export function isSampleSession(record: SessionRecord): boolean {
  if (!record) return false;
  return !!record.isSample || record.id.startsWith('sample_') || record.id.startsWith('seed_');
}

/**
 * Generates 14 days of realistic ultradian rhythm session records.
 * Timestamps are dynamically generated relative to current time (Date.now())
 * so charts, SQI metrics, and narratives are rich, vibrant, and current on Day One.
 */
export function generate14DaySampleSessions(): SessionRecord[] {
  const sessions: SessionRecord[] = [];
  const now = Date.now();
  const DAY_MS = 24 * 60 * 60 * 1000;

  const codingTasks = [
    'Refactored Core State Engine & Audio Pipeline',
    'Algorithmic Efficiency & Benchmark Tests',
    'UI System Redesign & Tailwind Token Audit',
    'Database Schema Migration & Indexing',
    'Code Review & Async Event Loop Optimization',
  ];

  const researchTasks = [
    'Deep Research: Ultradian Rhythm Biological Waves',
    'Literature Review: BRAC 90m Rest-Activity Cycle',
    'Competitive Analysis & UX Heuristic Audit',
    'Cognitive Load & Distraction Density Study',
  ];

  const writingTasks = [
    'Drafted Technical Spec for Client Storage API',
    'Authored Weekly Rhythm Narrative & Release Notes',
    'Technical Documentation & API Integration Guide',
  ];

  const strategyTasks = [
    'Quarterly Product Roadmap & Priority Alignment',
    'System Architecture & Scalability Review',
    'Sprint Backlog Refinement & Scope Audit',
  ];

  const designTasks = [
    'Visual System Design & Dark Mode Contrast Tuning',
    'Micro-Interaction & Animation Timing Curve',
    'Responsive Grid Layout & Typographic Scale',
  ];

  const studyTasks = [
    'Advanced TypeScript Type Guards & Generics',
    'Performance Profiling & Memory Leak Audit',
  ];

  // Generate 14 days of data (dayOffset 13 down to 0, where 0 is today)
  for (let dayOffset = 13; dayOffset >= 0; dayOffset--) {
    const dayDate = new Date(now - dayOffset * DAY_MS);
    const dateString = dayDate.toISOString().split('T')[0];
    const dayOfWeek = dayDate.getDay(); // 0 is Sun, 6 is Sat
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    const sessionConfigs = isWeekend
      ? [
          {
            hour: 10,
            category: 'Research' as CategoryTag,
            dur: 45,
            task: researchTasks[dayOffset % researchTasks.length],
            rating: 5,
            distractions: 0,
          },
          {
            hour: 15,
            category: 'Writing' as CategoryTag,
            dur: 60,
            task: writingTasks[dayOffset % writingTasks.length],
            rating: 4,
            distractions: 1,
          },
        ]
      : [
          {
            hour: 9,
            category: 'Coding' as CategoryTag,
            dur: 60,
            task: codingTasks[dayOffset % codingTasks.length],
            rating: 5,
            distractions: 0,
          },
          {
            hour: 11,
            category: 'Strategy' as CategoryTag,
            dur: 45,
            task: strategyTasks[dayOffset % strategyTasks.length],
            rating: 4,
            distractions: 0,
          },
          {
            hour: 14,
            category: 'Design' as CategoryTag,
            dur: 90,
            task: designTasks[dayOffset % designTasks.length],
            rating: 5,
            distractions: 1,
          },
          {
            hour: 16,
            category: 'Coding' as CategoryTag,
            dur: 45,
            task: codingTasks[(dayOffset + 1) % codingTasks.length],
            rating: 4,
            distractions: 0,
          },
        ];

    sessionConfigs.forEach((cfg, idx) => {
      const sDate = new Date(dayDate);
      sDate.setHours(cfg.hour, 15, 0, 0);
      const timestamp = sDate.getTime();

      sessions.push({
        id: `sample_session_14d_${dayOffset}_${idx}`,
        timestamp,
        dateString,
        durationMinutes: cfg.dur,
        actualSecondsCompleted: cfg.dur * 60,
        type: 'work',
        presetName: cfg.dur === 45 ? 'level_1_apprentice' : cfg.dur === 60 ? 'level_2_adept' : 'level_3_master',
        category: cfg.category,
        taskName: cfg.task,
        focusRating: cfg.rating,
        energyLevelBefore: 4,
        energyLevelAfter: cfg.rating >= 5 ? 5 : 4,
        distractionsCount: cfg.distractions,
        notes: cfg.rating >= 5 ? 'Exceptional flow state with Alpha binaural soundscape.' : 'Consistent focus wave completed.',
        isSample: true,
      });
    });
  }

  return sessions.sort((a, b) => b.timestamp - a.timestamp);
}
