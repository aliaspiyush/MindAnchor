/**
 * @jest-environment node
 */

import { POST } from '@/app/api/companion/chat/route';
import { NextRequest } from 'next/server';
import { mockSupabase } from '../../__mocks__/supabase';
import { companionChat } from '@/lib/gemini/companion';

jest.mock('@/lib/gemini/companion', () => ({
  companionChat: jest.fn(),
}));

describe('POST /api/companion/chat', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createRequest = (body: any) => {
    return new NextRequest('http://localhost:3000/api/companion/chat', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  };

  test('returns 400 if message is missing', async () => {
    const req = createRequest({ user_id: 'test-user-id' });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Message and user_id are required.');
  });

  test('returns 400 if user_id is missing', async () => {
    const req = createRequest({ message: 'Hello' });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Message and user_id are required.');
  });

  test('returns 401 if user is unauthorized', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null });
    const req = createRequest({ message: 'Hello', user_id: 'test-user-id' });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  test('returns 200 with reply on success', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: 'test-user-id', email: 'test@example.com' } },
      error: null,
    });

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: { full_name: 'Test Student' }, error: null }),
        };
      }
      if (table === 'entry_analyses') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          limit: jest.fn().mockResolvedValue({ data: [], error: null }),
        };
      }
      if (table === 'chat_sessions') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: { id: 'test-session-id', messages: [] }, error: null }),
          update: jest.fn().mockResolvedValue({ error: null }),
        };
      }
      return mockSupabase;
    });

    (companionChat as jest.Mock).mockResolvedValueOnce({
      reply: 'Hello there!',
    });

    const req = createRequest({ message: 'Hello', user_id: 'test-user-id', session_id: 'test-session-id' });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.reply).toBe('Hello there!');
  });

  test('returns 200 with function_call when companion triggers a tool', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: 'test-user-id', email: 'test@example.com' } },
      error: null,
    });

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: { full_name: 'Test Student' }, error: null }),
        };
      }
      if (table === 'entry_analyses') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          limit: jest.fn().mockResolvedValue({ data: [], error: null }),
        };
      }
      if (table === 'chat_sessions') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: { id: 'test-session-id', messages: [] }, error: null }),
          update: jest.fn().mockResolvedValue({ error: null }),
        };
      }
      if (table === 'coping_actions') {
        return {
          insert: jest.fn().mockResolvedValue({ error: null }),
        };
      }
      return mockSupabase;
    });

    (companionChat as jest.Mock).mockResolvedValueOnce({
      reply: 'Taking a breath is helpful.',
      function_call: {
        name: 'trigger_breathing_session',
        args: { duration_minutes: 5 },
      },
    });

    const req = createRequest({ message: 'Breathe', user_id: 'test-user-id', session_id: 'test-session-id' });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.function_call.name).toBe('trigger_breathing_session');
  });
});
