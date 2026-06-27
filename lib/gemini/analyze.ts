import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import type { GeminiAnalysisOutput } from '@/types';
import { ANALYSIS_SYSTEM_PROMPT } from './prompts';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export function buildAnalysisPrompt(entryText: string): string {
  return `Analyze this student journal entry:\n\n"${entryText}"`;
}

const analysisResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    mood_score: {
      type: SchemaType.INTEGER,
      description: 'Overall emotional valence score from 1 (very negative) to 10 (very positive)',
    },
    stress_score: {
      type: SchemaType.INTEGER,
      description: 'Stress level from 1 (calm) to 10 (overwhelmed)',
    },
    confidence_score: {
      type: SchemaType.INTEGER,
      description: 'Self-efficacy about exam performance from 1 (no confidence) to 10 (very confident)',
    },
    burnout_risk: {
      type: SchemaType.STRING,
      enum: ['low', 'moderate', 'high', 'critical'],
      description: 'Burnout risk assessment',
    },
    dominant_emotion: {
      type: SchemaType.STRING,
      description: 'The primary emotion expressed in the entry',
    },
    stress_triggers: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: 'Specific identifiable causes of stress',
    },
    cognitive_patterns: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: 'Cognitive distortions or thinking patterns detected',
    },
    support_priority: {
      type: SchemaType.STRING,
      enum: ['none', 'gentle', 'active', 'urgent'],
      description: 'How urgently the student needs support',
    },
    gemini_insight: {
      type: SchemaType.STRING,
      description: 'A 1-2 sentence empathetic observation about the student\'s state',
    },
  },
  required: [
    'mood_score',
    'stress_score',
    'confidence_score',
    'burnout_risk',
    'dominant_emotion',
    'stress_triggers',
    'cognitive_patterns',
    'support_priority',
    'gemini_insight',
  ],
};

/**
 * Analyze a journal entry using Gemini structured output.
 * Returns a typed GeminiAnalysisOutput object.
 */
export function parseAnalysisResponse(responseText: string): GeminiAnalysisOutput {
  const analysis: GeminiAnalysisOutput = JSON.parse(responseText);

  // Clamp scores to valid range
  analysis.mood_score = Math.max(1, Math.min(10, analysis.mood_score));
  analysis.stress_score = Math.max(1, Math.min(10, analysis.stress_score));
  analysis.confidence_score = Math.max(1, Math.min(10, analysis.confidence_score));

  return analysis;
}

/**
 * Analyze a journal entry using Gemini structured output.
 * Returns a typed GeminiAnalysisOutput object.
 */
export async function analyzeJournalEntry(
  entryText: string
): Promise<GeminiAnalysisOutput> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: ANALYSIS_SYSTEM_PROMPT,
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: analysisResponseSchema,
      temperature: 0.3, // Lower temperature for consistent structured output
    },
  });

  const prompt = buildAnalysisPrompt(entryText);
  const result = await model.generateContent(prompt);

  const responseText = result.response.text();
  return parseAnalysisResponse(responseText);
}
