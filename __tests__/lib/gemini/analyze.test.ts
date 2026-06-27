import { buildAnalysisPrompt, parseAnalysisResponse } from '@/lib/gemini/analyze';

describe('Gemini analyze helpers', () => {
  describe('buildAnalysisPrompt', () => {
    test('returns correct prompt containing the entry text', () => {
      const entryText = 'I feel extremely stressed about the exam tomorrow.';
      const prompt = buildAnalysisPrompt(entryText);
      expect(prompt).toContain(entryText);
      expect(prompt).toContain('Analyze this student journal entry:');
    });
  });

  describe('parseAnalysisResponse', () => {
    test('correctly maps Gemini output to TypeScript type and clamps scores', () => {
      const mockResponse = JSON.stringify({
        mood_score: 12, // should clamp to 10
        stress_score: 0, // should clamp to 1
        confidence_score: 5,
        burnout_risk: 'moderate',
        dominant_emotion: 'Anxious',
        stress_triggers: ['Time limit'],
        cognitive_patterns: ['Catastrophizing'],
        support_priority: 'active',
        gemini_insight: 'You are feeling anxious due to time limits.',
      });

      const parsed = parseAnalysisResponse(mockResponse);

      expect(parsed.mood_score).toBe(10);
      expect(parsed.stress_score).toBe(1);
      expect(parsed.confidence_score).toBe(5);
      expect(parsed.burnout_risk).toBe('moderate');
      expect(parsed.dominant_emotion).toBe('Anxious');
      expect(parsed.stress_triggers).toEqual(['Time limit']);
      expect(parsed.cognitive_patterns).toEqual(['Catastrophizing']);
      expect(parsed.support_priority).toBe('active');
      expect(parsed.gemini_insight).toBe('You are feeling anxious due to time limits.');
    });

    test('throws error if Gemini returns malformed JSON', () => {
      const malformed = '{ mood_score: 12, ... }';
      expect(() => parseAnalysisResponse(malformed)).toThrow();
    });
  });
});
