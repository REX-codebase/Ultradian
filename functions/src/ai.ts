import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { GoogleGenAI, Type } from '@google/genai';

/**
 * Callable Function: generateAiInsights
 */
export const generateAiInsights = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated to generate AI insights.');
  }

  const userNote = request.data?.userNote || '';
  if (!userNote || typeof userNote !== 'string') {
    throw new HttpsError('invalid-argument', 'The userNote argument must be a non-empty string.');
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const noteLower = userNote.toLowerCase();
    let cat = 'General';
    if (noteLower.includes('code') || noteLower.includes('refactor')) cat = 'Coding';
    else if (noteLower.includes('write') || noteLower.includes('doc')) cat = 'Writing';
    else if (noteLower.includes('design') || noteLower.includes('ui')) cat = 'Design';
    else if (noteLower.includes('research') || noteLower.includes('read')) cat = 'Research';
    else if (noteLower.includes('strategy')) cat = 'Strategy';
    else if (noteLower.includes('study')) cat = 'Study';

    return {
      category: cat,
      focusScore: 4,
      energyLevelAfter: 4,
      distractionsCount: 0,
      distractionSummary: 'None logged',
      notes: userNote,
    };
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `Analyze this session note from a user's focus cycle:
"${userNote}"

Extract the following fields accurately:
1. category: Pick strictly one from ['Coding', 'Writing', 'Design', 'Research', 'Strategy', 'Study', 'General'] based on the work described.
2. focusScore: Integer rating from 1 (terrible focus) to 5 (peak flow state).
3. energyLevelAfter: Integer energy rating from 1 (drained) to 5 (energized).
4. distractionsCount: Estimate of how many distraction events occurred (integer 0-10).
5. distractionSummary: Short text string summarizing what distracted them (e.g., 'Slack & email', 'Phone call', 'None').
6. notes: Cleaned up concise summary of their note.`;

  let response;
  try {
    response = await ai.models.generateContent({
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
  } catch (err: any) {
    console.error('Gemini error in generateAiInsights:', err);
    throw new HttpsError('internal', err?.message || 'Failed to process AI session analysis.');
  }

  let parsed: any;
  try {
    parsed = JSON.parse(response.text || '{}');
  } catch (err) {
    console.warn('Gemini returned malformed JSON; using a safe fallback:', err);
    parsed = {};
  }

  return {
    category: parsed.category || 'General',
    focusScore: Math.min(5, Math.max(1, parsed.focusScore || 4)),
    energyLevelAfter: Math.min(5, Math.max(1, parsed.energyLevelAfter || 4)),
    distractionsCount: Math.max(0, parsed.distractionsCount || 0),
    distractionSummary: parsed.distractionSummary || '',
    notes: parsed.notes || userNote,
  };
});
