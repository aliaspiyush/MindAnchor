import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import OnboardingPage from '@/app/onboarding/page';
import { mockSupabase } from '../../__mocks__/supabase';
import { useRouter } from 'next/navigation';
import React from 'react';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase,
}));

describe('OnboardingPage Flow', () => {
  const mockPush = jest.fn();
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush, refresh: jest.fn() });
    jest.clearAllMocks();
  });

  test('renders step 1 with exam type options', () => {
    render(<OnboardingPage />);
    expect(screen.getByText(/What exam are you preparing for/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'NEET' })).toBeInTheDocument();
  });

  test('disables continue button initially on step 1', () => {
    render(<OnboardingPage />);
    const continueBtn = screen.getByRole('button', { name: /Continue/i });
    expect(continueBtn).toBeDisabled();
  });

  test('enables continue button when exam type selected and advances to step 2', () => {
    render(<OnboardingPage />);
    const continueBtn = screen.getByRole('button', { name: /Continue/i });
    
    // Select NEET
    fireEvent.click(screen.getByRole('button', { name: 'NEET' }));
    expect(continueBtn).not.toBeDisabled();

    // Go to step 2
    fireEvent.click(continueBtn);
    expect(screen.getByText(/When is your exam/i)).toBeInTheDocument();
  });

  test('shows progress bar updating each step', () => {
    render(<OnboardingPage />);
    expect(screen.getByText(/Step 1 of 4/i)).toBeInTheDocument();
    
    // Step 1 to 2
    fireEvent.click(screen.getByRole('button', { name: 'NEET' }));
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
    
    expect(screen.getByText(/Step 2 of 4/i)).toBeInTheDocument();
  });

  test('submits form data correctly on final step', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: 'test-user-id', email: 'test@example.com' } },
      error: null,
    });

    const mockUpdate = jest.fn().mockResolvedValue({ error: null });
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          update: mockUpdate,
          eq: jest.fn().mockReturnThis(),
        };
      }
      return mockSupabase;
    });

    render(<OnboardingPage />);

    // Step 1
    fireEvent.click(screen.getByRole('button', { name: 'NEET' }));
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));

    // Step 2
    const dateInput = screen.getByLabelText(/Exam Date/i);
    fireEvent.change(dateInput, { target: { value: '2026-12-31' } });
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));

    // Step 3
    fireEvent.click(screen.getByRole('button', { name: /Intense/i }));
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));

    // Step 4 (optional weak subjects - click Biology)
    fireEvent.click(screen.getByRole('button', { name: 'Biology' }));
    const completeBtn = screen.getByRole('button', { name: /Complete Setup/i });
    fireEvent.click(completeBtn);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });
});
