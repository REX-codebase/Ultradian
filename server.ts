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
    try {
      const { userNote } = req.body;
      if (!userNote || typeof userNote !== 'string') {
        res.status(400).json({ error: 'userNote string is required' });
        return;
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        // Fallback rule-based parser if key is missing
        const noteLower = userNote.toLowerCase();
        let cat = 'General';
        if (noteLower.includes('code') || noteLower.includes('api') || noteLower.includes('bug') || noteLower.includes('refactor')) cat = 'Coding';
        else if (noteLower.includes('write') || noteLower.includes('doc') || noteLower.includes('draft')) cat = 'Writing';
        else if (noteLower.includes('design') || noteLower.includes('ui') || noteLower.includes('ux')) cat = 'Design';
        else if (noteLower.includes('research') || noteLower.includes('read') || noteLower.includes('study')) cat = 'Research';

        let focus = 4;
        if (noteLower.includes('distracted') || noteLower.includes('sluggish') || noteLower.includes('lost')) focus = 2;
        if (noteLower.includes('crushed') || noteLower.includes('flow') || noteLower.includes('deep')) focus = 5;

        res.json({
          category: cat,
          focusScore: focus,
          energyLevelAfter: focus >= 4 ? 4 : 2,
          distractionsCount: noteLower.includes('slack') || noteLower.includes('phone') || noteLower.includes('social') ? 2 : 0,
          distractionSummary: noteLower.includes('slack') ? 'Slack notifications' : 'Minor interruptions',
          notes: userNote,
        });
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
        model: 'gemini-3.6-flash',
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
      console.error('Error analyzing session reflection with Gemini:', err);
      res.status(500).json({
        error: 'Failed to analyze note with Gemini',
        details: err instanceof Error ? err.message : String(err),
      });
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
