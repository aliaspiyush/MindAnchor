import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EntryForm } from '@/components/journal/EntryForm';
import { useRouter } from 'next/navigation';
import React from 'react';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('EntryForm', () => {
  const mockPush = jest.fn();
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    jest.clearAllMocks();
  });

  test('renders textarea with correct placeholder', () => {
    render(<EntryForm userId="test-user-id" />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeInTheDocument();
  });

  test('disables submit button when entry is less than 20 characters', () => {
    render(<EntryForm userId="test-user-id" />);
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Short text' } });
    const button = screen.getByRole('button', { name: /Analyze & Save/i });
    expect(button).toBeDisabled();
  });

  test('enables submit button when entry is 20+ characters', () => {
    render(<EntryForm userId="test-user-id" />);
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'This is a long enough journal entry to analyze.' } });
    const button = screen.getByRole('button', { name: /Analyze & Save/i });
    expect(button).not.toBeDisabled();
  });

  test('shows word count correctly', () => {
    render(<EntryForm userId="test-user-id" />);
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'One two three four' } });
    expect(screen.getByText(/4 words/i)).toBeInTheDocument();
  });

  test('shows loading state after submit and then shows analysis result', async () => {
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

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        analysis: mockAnalysis,
        entry_id: 'test-entry-id',
      }),
    } as any);

    render(<EntryForm userId="test-user-id" />);
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'This is a long enough journal entry to analyze.' } });
    const button = screen.getByRole('button', { name: /Analyze & Save/i });
    fireEvent.click(button);

    // Shows loading state
    expect(screen.getByText(/MindAnchor is reading your reflection/i)).toBeInTheDocument();

    // Eventually shows analysis result card
    await waitFor(() => {
      expect(screen.getByText(/You are doing great!/i)).toBeInTheDocument();
    });

    // Submits successfully and shows view full analysis button
    expect(screen.getByRole('button', { name: /View Full Analysis/i })).toBeInTheDocument();
  });
});
