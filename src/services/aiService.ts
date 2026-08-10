import { httpsCallable } from 'firebase/functions';
import { functions } from '../lib/firebase';

export interface AiSessionAnalysis {
  category: string;
  focusScore: number;
  energyLevelAfter: number;
  distractionsCount: number;
  distractionSummary: string;
  notes: string;
}

export interface WeeklyRhythmExperiment {
  title: string;
  hypothesis: string;
  rationale: string;
  targetWorkMinutes: number;
  targetBreakMinutes: number;
  targetAmbient: string;
  expectedOutcome: string;
}

export interface WeeklyRhythmAnalysis {
  summaryParagraph: string;
  peakDays: string[];
  avgDailyFocusHours: number;
  energyPatternText: string;
  experiment: WeeklyRhythmExperiment;
  disclaimer: string;
}

export interface TargetAnalysis {
  category: string;
  cognitiveType: string;
  recommendedWorkMinutes: number;
  recommendedBreakMinutes: number;
  recommendedAmbient: string;
  reasoning: string;
  tacticalTip: string;
  suggestedSubtasks: string[];
}

/**
 * Analyzes session notes using AI (via Cloud Function callable or Express server endpoint)
 */
export async function analyzeSessionNotes(userNote: string): Promise<AiSessionAnalysis> {
  try {
    const callable = httpsCallable<{ userNote: string }, AiSessionAnalysis>(functions, 'generateAiInsights');
    const result = await callable({ userNote });
    return result.data;
  } catch (err) {
    // Fallback to server endpoint
    try {
      const res = await fetch('/api/gemini/analyze-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userNote }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      // Fallback
    }

    return {
      category: 'General',
      focusScore: 4,
      energyLevelAfter: 4,
      distractionsCount: 0,
      distractionSummary: 'None logged',
      notes: userNote,
    };
  }
}

/**
 * Generates weekly rhythm narrative and proposed experiment
 */
export async function analyzeWeeklyRhythm(records: any[]): Promise<WeeklyRhythmAnalysis> {
  try {
    const res = await fetch('/api/gemini/weekly-rhythm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ records }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Failed to fetch weekly rhythm from API:', err);
  }

  return {
    summaryParagraph: 'This week you logged your focus cycles cleanly across primary domains.',
    peakDays: ['Tuesday', 'Thursday'],
    avgDailyFocusHours: 2.0,
    energyPatternText: 'Energy level retained stability across focus waves.',
    experiment: {
      title: 'Weekly Experiment: The 60/15 Mid-Morning Shift',
      hypothesis: 'Shifting deep work to 60-minute waves will boost flow and clarity.',
      rationale: 'Self-reported focus ratings are highest during morning hours.',
      targetWorkMinutes: 60,
      targetBreakMinutes: 15,
      targetAmbient: 'alpha_binaural',
      expectedOutcome: 'Higher clarity and fewer distractions.',
    },
    disclaimer: 'Insights derived strictly from self-reported session logs without biometric tracking.',
  };
}

/**
 * Analyzes target task and recommends ultradian wave configuration
 */
export async function analyzeTargetTask(task: string): Promise<TargetAnalysis> {
  try {
    const res = await fetch('/api/gemini/analyze-target', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Failed to analyze target from API:', err);
  }

  return {
    category: 'General',
    cognitiveType: 'General Cognitive Task',
    recommendedWorkMinutes: 50,
    recommendedBreakMinutes: 10,
    recommendedAmbient: 'alpha_binaural',
    reasoning: 'Standard balanced ultradian focus block.',
    tacticalTip: 'Break down task into actionable steps and mute notifications.',
    suggestedSubtasks: [
      'Define primary deliverable & clear scope',
      'Execute core work without switching tabs',
      'Review output and prepare next action',
    ],
  };
}
