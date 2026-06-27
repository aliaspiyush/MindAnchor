import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CompanionPage from '@/app/companion/page';
import { mockSupabase } from '../../__mocks__/supabase';
import React from 'react';

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase,
}));

describe('CompanionPage Chat', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'test-user-id', email: 'test@example.com' } },
      error: null,
    });
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: { exam_date: '2026-12-31', study_intensity: 'high' }, error: null }),
        };
      }
      if (table === 'chat_sessions') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: null, error: null }), // empty session initially
        };
      }
      return mockSupabase;
    });
  });

  test('renders empty chat state correctly', async () => {
    render(<CompanionPage />);
    await waitFor(() => {
      expect(screen.getByText(/MindAnchor is here for you/i)).toBeInTheDocument();
    });
  });

  test('renders user and assistant messages', async () => {
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: { exam_date: '2026-12-31', study_intensity: 'high' }, error: null }),
        };
      }
      if (table === 'chat_sessions') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: {
              id: 'session-id',
              messages: [
                { role: 'user', content: 'Help me feel better', timestamp: new Date().toISOString() },
                { role: 'assistant', content: 'You can do this!', timestamp: new Date().toISOString() },
              ],
            },
            error: null,
          }),
        };
      }
      return mockSupabase;
    });

    render(<CompanionPage />);
    await waitFor(() => {
      expect(screen.getByText('Help me feel better')).toBeInTheDocument();
      expect(screen.getByText('You can do this!')).toBeInTheDocument();
    });
  });

  test('input clears after message sent and send button is disabled when input is empty', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        reply: 'I hear you.',
        session_id: 'session-id',
      }),
    } as any);

    render(<CompanionPage />);

    // Wait for initial load
    await screen.findByPlaceholderText(/Type your message/i);

    const input = screen.getByPlaceholderText(/Type your message/i) as HTMLInputElement;
    const sendButton = screen.getByRole('button', { name: /Send message/i });

    // Send button should be disabled when empty
    expect(sendButton).toBeDisabled();

    fireEvent.change(input, { target: { value: 'New message' } });
    expect(sendButton).not.toBeDisabled();

    fireEvent.click(sendButton);

    // Input should be cleared
    expect(input.value).toBe('');

    await waitFor(() => {
      expect(screen.getByText('I hear you.')).toBeInTheDocument();
    });
  });

  test('renders BreathingCircle component when function call is trigger_breathing_session', async () => {
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: { exam_date: '2026-12-31', study_intensity: 'high' }, error: null }),
        };
      }
      if (table === 'chat_sessions') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: {
              id: 'session-id',
              messages: [
                {
                  role: 'assistant',
                  content: 'Let us do a breathing exercise.',
                  timestamp: new Date().toISOString(),
                  function_call: { name: 'trigger_breathing_session', args: { duration_minutes: 5 } },
                },
              ],
            },
            error: null,
          }),
        };
      }
      return mockSupabase;
    });

    render(<CompanionPage />);
    await waitFor(() => {
      expect(screen.getByText('Guided Breathing (5 min)')).toBeInTheDocument();
    });
  });

  test('renders AffirmationCard component when function call is show_affirmation_card', async () => {
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: { exam_date: '2026-12-31', study_intensity: 'high' }, error: null }),
        };
      }
      if (table === 'chat_sessions') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: {
              id: 'session-id',
              messages: [
                {
                  role: 'assistant',
                  content: 'Here is an affirmation.',
                  timestamp: new Date().toISOString(),
                  function_call: { name: 'show_affirmation_card', args: { exam_type: 'USMLE', mood_context: 'stressed' } },
                },
              ],
            },
            error: null,
          }),
        };
      }
      return mockSupabase;
    });

    render(<CompanionPage />);
    await waitFor(() => {
      expect(screen.getByText(/You've got this/i)).toBeInTheDocument();
      expect(screen.getByText(/USMLE/i)).toBeInTheDocument();
    });
  });
});
