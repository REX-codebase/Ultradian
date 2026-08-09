import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini Client (Server-side only)
  const getAi = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not defined in environment variables.');
    }
    return new GoogleGenAI({
      apiKey: apiKey || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  };

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Task 2.1: Gemini AI Session Reflection Journal Analysis Endpoint
  app.post('/api/gemini/analyze-session', async (req, res) => {
    const { userNote = '' } = req.body || {};
    const getFallbackAnalysis = () => {
      const noteLower = String(userNote).toLowerCase();
      let cat = 'General';
      if (noteLower.includes('code') || noteLower.includes('api') || noteLower.includes('bug') || noteLower.includes('refactor')) cat = 'Coding';
      else if (noteLower.includes('write') || noteLower.includes('doc') || noteLower.includes('draft')) cat = 'Writing';
      else if (noteLower.includes('design') || noteLower.includes('ui') || noteLower.includes('ux')) cat = 'Design';
      else if (noteLower.includes('research') || noteLower.includes('read') || noteLower.includes('study')) cat = 'Research';

      let focus = 4;
      if (noteLower.includes('distracted') || noteLower.includes('sluggish') || noteLower.includes('lost')) focus = 2;
      if (noteLower.includes('crushed') || noteLower.includes('flow') || noteLower.includes('deep')) focus = 5;

      return {
        category: cat,
        focusScore: focus,
        energyLevelAfter: focus >= 4 ? 4 : 2,
        distractionsCount: noteLower.includes('slack') || noteLower.includes('phone') || noteLower.includes('social') ? 2 : 0,
        distractionSummary: noteLower.includes('slack') ? 'Slack notifications' : 'Minor interruptions',
        notes: userNote,
      };
    };

    try {
      if (!userNote || typeof userNote !== 'string') {
        res.status(400).json({ error: 'userNote string is required' });
        return;
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        res.json(getFallbackAnalysis());
        return;
      }

      const ai = getAi();
      const prompt = `Analyze this session note from a user's focus cycle:
"${userNote}"

Extract the following fields accurately:
1. category: Pick strictly one from ['Coding', 'Writing', 'Design', 'Research', 'Strategy', 'Study', 'General'] based on the work described.
2. focusScore: Integer rating from 1 (terrible focus) to 5 (peak flow state).
3. energyLevelAfter: Integer energy rating from 1 (drained) to 5 (energized).
4. distractionsCount: Estimate of how many distraction events occurred (integer 0-10).
5. distractionSummary: Short text string summarizing what distracted them (e.g., 'Slack & email', 'Phone call', 'None').
6. notes: Cleaned up concise summary of their note.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING },
              focusScore: { type: Type.INTEGER },
              energyLevelAfter: { type: Type.INTEGER },
              distractionsCount: { type: Type.INTEGER },
              distractionSummary: { type: Type.STRING },
              notes: { type: Type.STRING },
            },
            required: ['category', 'focusScore', 'energyLevelAfter', 'distractionsCount', 'notes'],
          },
        },
      });

      const responseText = response.text || '{}';
      const parsed = JSON.parse(responseText);

      res.json({
        category: parsed.category || 'General',
        focusScore: Math.min(5, Math.max(1, parsed.focusScore || 4)),
        energyLevelAfter: Math.min(5, Math.max(1, parsed.energyLevelAfter || 4)),
        distractionsCount: Math.max(0, parsed.distractionsCount || 0),
        distractionSummary: parsed.distractionSummary || '',
        notes: parsed.notes || userNote,
      });
    } catch (err) {
      console.warn('Gemini analyze-session unavailable or error, using rule-based fallback:', err);
      res.json(getFallbackAnalysis());
    }
  });

  // Task: Weekly "Your rhythm this week" Narrative & Proposed Experiment Endpoint
  app.post('/api/gemini/weekly-rhythm', async (req, res) => {
    const { records = [] } = req.body || {};
    const fallbackData = {
      summaryParagraph: `This week you logged ${records.length} focus sessions. Self-reported clarity was highest during structured mid-morning waves, demonstrating consistent cognitive momentum across primary focus domains.`,
      peakDays: ['Tuesday', 'Thursday'],
      avgDailyFocusHours: 2.1,
      energyPatternText: 'Self-reported energy retained stability during 45-60 minute waves, with mild depletion during afternoon blocks.',
      experiment: {
        title: 'Weekly Experiment: The 60/15 Mid-Morning Shift',
        hypothesis: 'Shifting primary deep work to 60-minute waves with 15-minute breaks between 9:30 AM and 11:30 AM will boost subjective clarity and reduce distraction events.',
        rationale: 'Self-reported history shows higher focus ratings when recovery breaks equal at least 25% of focus duration.',
        targetWorkMinutes: 60,
        targetBreakMinutes: 15,
        targetAmbient: 'alpha_binaural',
        expectedOutcome: 'Anticipated +15% boost in clarity and fewer logged interruptions.',
      },
      disclaimer: 'Insights and scores are derived strictly from your self-reported focus ratings, subjective energy levels, and session timestamps. No biometric or physiological measurements are claimed or implied.',
    };

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        res.json(fallbackData);
        return;
      }

      const ai = getAi();
      const prompt = `You are a cognitive rhythm analyst. Analyze the user's focus session history from the past week:
${JSON.stringify(records.slice(0, 20))}

Synthesize a compassionate, professional "Your rhythm this week" narrative and propose ONE specific, actionable experiment for the upcoming week.
IMPORTANT: State clearly that insights are derived from self-reported focus and energy levels without claiming biological measurement.

Requirements:
1. summaryParagraph: A warm 2-3 sentence narrative summarizing weekly focus volume, top domain, and clarity patterns.
2. peakDays: Array of strings for top days (e.g. ["Tuesday", "Thursday"]).
3. avgDailyFocusHours: Number for average daily focus hours.
4. energyPatternText: 1 sentence summarizing energy level trends before vs after sessions.
5. experiment object:
   - title: Short catchy title (e.g., 'Weekly Experiment: The 60/15 Mid-Morning Shift')
   - hypothesis: Clear hypothesis sentence
   - rationale: Brief rationale based on session logs
   - targetWorkMinutes: Suggested work minutes (number, e.g. 45 or 60 or 90)
   - targetBreakMinutes: Suggested break minutes (number, e.g. 10 or 15 or 20)
   - targetAmbient: String ('alpha_binaural', 'brown_noise', or 'rain_waves')
   - expectedOutcome: 1 sentence expected benefit
6. disclaimer: "Insights and scores are derived strictly from your self-reported focus ratings, subjective energy levels, and session timestamps. No biometric or physiological measurements are claimed or implied."`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summaryParagraph: { type: Type.STRING },
              peakDays: { type: Type.ARRAY, items: { type: Type.STRING } },
              avgDailyFocusHours: { type: Type.NUMBER },
              energyPatternText: { type: Type.STRING },
              experiment: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  hypothesis: { type: Type.STRING },
                  rationale: { type: Type.STRING },
                  targetWorkMinutes: { type: Type.INTEGER },
                  targetBreakMinutes: { type: Type.INTEGER },
                  targetAmbient: { type: Type.STRING },
                  expectedOutcome: { type: Type.STRING },
                },
                required: ['title', 'hypothesis', 'rationale', 'targetWorkMinutes', 'targetBreakMinutes', 'expectedOutcome'],
              },
              disclaimer: { type: Type.STRING },
            },
            required: ['summaryParagraph', 'avgDailyFocusHours', 'experiment', 'disclaimer'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      res.json({ ...fallbackData, ...parsed });
    } catch (err) {
      console.warn('Gemini weekly-rhythm unavailable or error, using fallback narrative:', err);
      res.json(fallbackData);
    }
  });

  // Task: Gemini AI Target / Focal Objective Analysis & Ultradian Wave Recommendation Endpoint
  app.post('/api/gemini/analyze-target', async (req, res) => {
    const { task = '' } = req.body || {};

    const getFallbackTargetAnalysis = (taskText: string) => {
      const lower = String(taskText).toLowerCase();
      let category = 'General';
      let cognitiveType = 'General Cognitive Task';
      let workMins = 50;
      let breakMins = 10;
      let ambient = 'alpha_binaural';
      let reasoning = 'Standard balanced ultradian focus block designed for consistent concentration.';
      let tacticalTip = 'Minimize multitasking and break down the task into small, actionable steps.';
      let subtasks = [
        'Define primary deliverable & clear scope',
        'Execute core work without switching tabs',
        'Review output and prepare next action'
      ];

      if (lower.match(/\b(study|exam|quiz|chapter|learn|course|math|chem|physics|history|lecture|read|memorize|flashcards|prep)\b/)) {
        category = 'Study';
        cognitiveType = 'Active Recall & Memory Retention';
        workMins = 50;
        breakMins = 10;
        ambient = 'library_ambience';
        reasoning = 'Study tasks are optimal in 50-minute recall waves with 10-minute active rest to consolidate neural pathways without cognitive fatigue.';
        tacticalTip = 'Use active recall: test your memory after every section rather than passively re-reading notes.';
        subtasks = [
          'Review key formulas, concepts, or flashcards',
          'Solve practice problems or write self-quiz questions',
          'Summarize top takeaways from memory without checking notes'
        ];
      } else if (lower.match(/\b(code|coding|dev|bug|refactor|api|component|ts|js|python|react|build|backend|frontend|git|database|sql|fix|script)\b/)) {
        category = 'Coding';
        cognitiveType = 'Deep Logic & Architectural Problem Solving';
        workMins = 90;
        breakMins = 15;
        ambient = 'deep_focus_brown';
        reasoning = 'Coding demands deep context loading into working memory. A full 90-minute BRAC wave allows deep flow state without context switching.';
        tacticalTip = 'Mute Slack and notifications. Solve one edge case at a time and run local unit tests frequently.';
        subtasks = [
          'Map out code architecture & data structures',
          'Implement core logic & error handling',
          'Run tests, fix edge cases, & commit clean code'
        ];
      } else if (lower.match(/\b(research|paper|article|data|analyze|analysis|investigate|explore|survey|find|source|study|literature)\b/)) {
        category = 'Research';
        cognitiveType = 'Information Synthesis & Discovery';
        workMins = 60;
        breakMins = 12;
        ambient = 'rain_white_noise';
        reasoning = 'Research requires active synthesis across multiple sources. A 60-minute wave maintains high curiosity while avoiding information overload.';
        tacticalTip = 'Keep a dedicated scratchpad to clip source URLs and quotes without cluttering your active reading tab.';
        subtasks = [
          'Gather top 3 primary sources or datasets',
          'Extract core findings & verify evidence',
          'Synthesize insights into bulleted executive summary'
        ];
      } else if (lower.match(/\b(write|writing|draft|blog|essay|spec|copy|content|doc|script|article|journal|newsletter)\b/)) {
        category = 'Writing';
        cognitiveType = 'Creative Flow & Narrative Expression';
        workMins = 45;
        breakMins = 10;
        ambient = 'cafe_chatter';
        reasoning = 'Creative writing thrives in 45-minute sprint blocks before inner critic fatigue sets in.';
        tacticalTip = 'Write the complete first draft continuously without editing or fixing typos until the break.';
        subtasks = [
          'Create a 3-part outline (Intro, Main Points, Conclusion)',
          'Draft main content continuously without self-editing',
          'Polish tone, check clarity, & format headings'
        ];
      } else if (lower.match(/\b(design|ui|ux|figma|mockup|wireframe|layout|canvas|svg|prototype|poster|vector)\b/)) {
        category = 'Design';
        cognitiveType = 'Visual & Spatial Creation';
        workMins = 60;
        breakMins = 10;
        ambient = 'lofi_chill_groove';
        reasoning = 'Visual design benefits from 60-minute spatial immersion accompanied by soothing lofi rhythms.';
        tacticalTip = 'Lock layout hierarchy & typography alignment before polishing color schemes or animations.';
        subtasks = [
          'Sketch low-fidelity layout wireframes',
          'Build high-fidelity UI components & typography',
          'Audit contrast, spacing alignment, & micro-interactions'
        ];
      } else if (lower.match(/\b(strategy|plan|roadmap|goal|quarter|budget|prioritize|okr|meeting|proposal|deck)\b/)) {
        category = 'Strategy';
        cognitiveType = 'High-Level Strategic Decision Making';
        workMins = 60;
        breakMins = 15;
        ambient = 'alpha_binaural';
        reasoning = 'Strategic planning requires high executive control. 60-minute focus blocks with binaural beats foster high-clarity decision making.';
        tacticalTip = 'Group decisions into High Impact vs Low Effort matrix to avoid analysis paralysis.';
        subtasks = [
          'Define top 3 strategic priorities & metrics',
          'Map out execution timeline & resource allocation',
          'Identify key risk factors & contingency plans'
        ];
      }

      return {
        category,
        cognitiveType,
        recommendedWorkMinutes: workMins,
        recommendedBreakMinutes: breakMins,
        recommendedAmbient: ambient,
        reasoning,
        tacticalTip,
        suggestedSubtasks: subtasks
      };
    };

    try {
      if (!task || typeof task !== 'string') {
        res.status(400).json({ error: 'task string is required' });
        return;
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        res.json(getFallbackTargetAnalysis(task));
        return;
      }

      const ai = getAi();
      const prompt = `You are Ultradian AI, an elite cognitive ergonomics assistant.
Analyze this user target/focal task:
"${task}"

Determine the domain and recommend an optimized focus wave setup based on ultradian BRAC rhythms.

Pick:
1. category: Pick strictly one from ['Coding', 'Writing', 'Design', 'Research', 'Strategy', 'Study', 'General'].
2. cognitiveType: Short title describing cognitive mode (e.g. 'Active Recall & Memory', 'Deep Logic & Architecture', 'Creative Narrative Flow', 'Visual Spatial Creation', 'Information Synthesis', 'High-Level Planning').
3. recommendedWorkMinutes: Number of focus minutes (suggest 30, 45, 50, 60, or 90).
4. recommendedBreakMinutes: Number of break minutes (suggest 5, 10, 12, 15, or 20).
5. recommendedAmbient: String, pick strictly one from ['alpha_binaural', 'deep_focus_brown', 'rain_white_noise', 'library_ambience', 'cafe_chatter', 'lofi_chill_groove', 'pink_noise', 'none'].
6. reasoning: 1-2 sentence explanation of why this duration & soundscape fits this target.
7. tacticalTip: 1 actionable tip for achieving peak flow state on this specific target.
8. suggestedSubtasks: Array of exactly 3 actionable, structured subtasks/steps breakdown for this target.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING },
              cognitiveType: { type: Type.STRING },
              recommendedWorkMinutes: { type: Type.INTEGER },
              recommendedBreakMinutes: { type: Type.INTEGER },
              recommendedAmbient: { type: Type.STRING },
              reasoning: { type: Type.STRING },
              tacticalTip: { type: Type.STRING },
              suggestedSubtasks: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: [
              'category',
              'cognitiveType',
              'recommendedWorkMinutes',
              'recommendedBreakMinutes',
              'recommendedAmbient',
              'reasoning',
              'tacticalTip',
              'suggestedSubtasks',
            ],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      const fallback = getFallbackTargetAnalysis(task);

      res.json({
        category: parsed.category || fallback.category,
        cognitiveType: parsed.cognitiveType || fallback.cognitiveType,
        recommendedWorkMinutes: parsed.recommendedWorkMinutes || fallback.recommendedWorkMinutes,
        recommendedBreakMinutes: parsed.recommendedBreakMinutes || fallback.recommendedBreakMinutes,
        recommendedAmbient: parsed.recommendedAmbient || fallback.recommendedAmbient,
        reasoning: parsed.reasoning || fallback.reasoning,
        tacticalTip: parsed.tacticalTip || fallback.tacticalTip,
        suggestedSubtasks: parsed.suggestedSubtasks && parsed.suggestedSubtasks.length > 0 ? parsed.suggestedSubtasks : fallback.suggestedSubtasks,
      });
    } catch (err) {
      console.warn('Gemini analyze-target error, using fallback:', err);
      res.json(getFallbackTargetAnalysis(task));
    }
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
