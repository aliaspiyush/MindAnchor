import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import type { GeminiAnalysisOutput } from '@/types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const ANALYSIS_SYSTEM_PROMPT = `You are MindAnchor's emotional intelligence engine. Analyze the student's journal entry deeply. Look for hidden stress signals, cognitive distortions, burnout indicators, and exam-related anxiety patterns. Return ONLY a strict JSON object — no prose, no markdown.

Consider these dimensions:
- Mood: overall emotional valence (1=very negative, 10=very positive)
- Stress: physiological and psychological pressure (1=calm, 10=overwhelmed)
- Confidence: self-efficacy about exam performance (1=no confidence, 10=very confident)
- Burnout risk: based on exhaustion, cynicism, and reduced efficacy signals
- Dominant emotion: the primary emotion expressed
- Stress triggers: specific identifiable causes of stress mentioned or implied
- Cognitive patterns: any cognitive distortions or thinking patterns (e.g., catastrophizing, all-or-nothing thinking, comparison spiraling)
- Support priority: how urgently this student needs supportive intervention
- Insight: a 1-2 sentence empathetic observation about the student's state`;

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

  const result = await model.generateContent(
    `Analyze this student journal entry:\n\n"${entryText}"`
  );

  const responseText = result.response.text();
  const analysis: GeminiAnalysisOutput = JSON.parse(responseText);

  // Clamp scores to valid range
  analysis.mood_score = Math.max(1, Math.min(10, analysis.mood_score));
  analysis.stress_score = Math.max(1, Math.min(10, analysis.stress_score));
  analysis.confidence_score = Math.max(1, Math.min(10, analysis.confidence_score));

  return analysis;
}
