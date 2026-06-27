/**
 * @jest-environment node
 */

import { POST } from '@/app/api/journal/analyze/route';
import { NextRequest } from 'next/server';
import { mockSupabase } from '../../__mocks__/supabase';
import { analyzeJournalEntry } from '@/lib/gemini/analyze';

jest.mock('@/lib/gemini/analyze', () => ({
  analyzeJournalEntry: jest.fn(),
}));

describe('POST /api/journal/analyze', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createRequest = (body: any) => {
    return new NextRequest('http://localhost:3000/api/journal/analyze', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  };

  test('returns 400 if entry_text is missing', async () => {
    const req = createRequest({ user_id: 'test-user-id' });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Journal entry must be at least 20 characters.');
  });

  test('returns 400 if entry_text is under 20 characters', async () => {
    const req = createRequest({ entry_text: 'Short entry', user_id: 'test-user-id' });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Journal entry must be at least 20 characters.');
  });

  test('returns 400 if user_id is missing', async () => {
    const req = createRequest({ entry_text: 'This is a long enough journal entry to analyze.' });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('User ID is required.');
  });

  test('returns 401 if user is unauthorized', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null });
    const req = createRequest({
      entry_text: 'This is a long enough journal entry to analyze.',
      user_id: 'test-user-id',
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe('Unauthorized.');
  });

  test('returns 200 with valid analysis on success', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: 'test-user-id', email: 'test@example.com' } },
      error: null,
    });

    const mockAnalysis = {
      mood_score: 8,
      stress_score: 3,
      confidence_score: 9,
      burnout_risk: 'low',
      dominant_emotion: 'Excited',
      stress_triggers: ['Exams'],
      cognitive_patterns: ['Productive planning'],
      support_priority: 'low',
      gemini_insight: 'You are doing great!',
    };

    (analyzeJournalEntry as jest.Mock).mockResolvedValueOnce(mockAnalysis);

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'journal_entries') {
        return {
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: { id: 'test-entry-id' }, error: null }),
          eq: jest.fn().mockReturnThis(),
          gte: jest.fn().mockReturnThis(),
          lt: jest.fn().mockReturnThis(),
          limit: jest.fn().mockResolvedValue({ data: [], error: null }),
        };
      }
      if (table === 'entry_analyses') {
        return {
          insert: jest.fn().mockResolvedValue({ error: null }),
        };
      }
      if (table === 'profiles') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: { streak_count: 5 }, error: null }),
          update: jest.fn().mockReturnThis(),
        };
      }
      return mockSupabase;
    });

    const req = createRequest({
      entry_text: 'This is a long enough journal entry to analyze.',
      user_id: 'test-user-id',
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.entry_id).toBe('test-entry-id');
    expect(json.analysis).toEqual(mockAnalysis);
  });
});
