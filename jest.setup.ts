import '@testing-library/jest-dom';

// Global mocks
export const mockSupabase = {
  auth: {
    getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'test-user-id', email: 'test@example.com' } }, error: null }),
    signInWithPassword: jest.fn(),
    signInWithOAuth: jest.fn().mockResolvedValue({ data: {}, error: null }),
    signUp: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChange: jest.fn(() => ({
      data: { subscription: { unsubscribe: jest.fn() } },
    })),
    exchangeCodeForSession: jest.fn().mockResolvedValue({ data: { session: {} }, error: null }),
  },
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  range: jest.fn().mockReturnThis(),
};

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase,
}));

jest.mock('@/lib/supabase/server', () => ({
  createClient: () => Promise.resolve(mockSupabase),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));

jest.mock('next/headers', () => ({
  cookies: jest.fn().mockImplementation(() => ({
    getAll: jest.fn().mockReturnValue([]),
    set: jest.fn(),
  })),
}));

// Mock Google Generative AI
export const mockGenerateContent = jest.fn().mockResolvedValue({
  response: {
    text: () => JSON.stringify({
      mood_score: 8,
      stress_score: 3,
      confidence_score: 9,
      burnout_risk: 'low',
      dominant_emotion: 'Excited',
      stress_triggers: ['Exams'],
      cognitive_patterns: ['Productive planning'],
      support_priority: 'low',
      gemini_insight: 'You are on track and managing stress well.',
    }),
  },
});

export const mockSendMessage = jest.fn().mockResolvedValue({
  response: {
    text: () => 'Mocked companion response.',
    functionCalls: () => [],
  },
});

export const mockStartChat = jest.fn().mockReturnValue({
  sendMessage: mockSendMessage,
});

export const mockGetGenerativeModel = jest.fn().mockReturnValue({
  generateContent: mockGenerateContent,
  startChat: mockStartChat,
});

export const mockGoogleGenerativeAI = jest.fn().mockImplementation(() => ({
  getGenerativeModel: mockGetGenerativeModel,
}));

jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: mockGoogleGenerativeAI,
  SchemaType: {
    STRING: 'STRING',
    NUMBER: 'NUMBER',
    OBJECT: 'OBJECT',
    ARRAY: 'ARRAY',
    BOOLEAN: 'BOOLEAN',
  },
}));
