// ============================================================
// MindAnchor — TypeScript Type Definitions
// ============================================================

// --- Enums ---

export type ExamType = 'NEET' | 'JEE' | 'CUET' | 'CAT' | 'GATE' | 'UPSC' | 'OTHER';

export type StudyIntensity = 'light' | 'moderate' | 'intense';

export type BurnoutRisk = 'low' | 'moderate' | 'high' | 'critical';

export type SupportPriority = 'none' | 'gentle' | 'active' | 'urgent';

export type ActionType =
  | 'breathing'
  | 'grounding'
  | 'affirmation'
  | 'lighter_plan'
  | 'exam_prep_boost'
  | 'rest_mode';

export type GroundingTechnique = '5-4-3-2-1' | 'box_breathing' | 'body_scan';

// --- Database Models ---

export interface Profile {
  id: string;
  full_name: string | null;
  exam_type: ExamType | null;
  exam_date: string | null; // ISO date string
  study_intensity: StudyIntensity | null;
  weak_subjects: string[] | null;
  streak_count: number;
  created_at: string;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  entry_text: string;
  created_at: string;
}

export interface EntryAnalysis {
  id: string;
  entry_id: string;
  user_id: string;
  mood_score: number;       // 1-10
  stress_score: number;     // 1-10
  confidence_score: number; // 1-10
  burnout_risk: BurnoutRisk;
  dominant_emotion: string;
  stress_triggers: string[];
  cognitive_patterns: string[];
  support_priority: SupportPriority;
  gemini_insight: string;
  created_at: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  function_call?: {
    name: string;
    args: Record<string, unknown>;
  };
}

export interface ChatSession {
  id: string;
  user_id: string;
  messages: ChatMessage[];
  session_date: string;
  created_at: string;
}

export interface CopingAction {
  id: string;
  user_id: string;
  action_type: ActionType;
  triggered_by: string;
  completed: boolean;
  created_at: string;
}

// --- Gemini AI Contracts ---

export interface GeminiAnalysisOutput {
  mood_score: number;
  stress_score: number;
  confidence_score: number;
  burnout_risk: BurnoutRisk;
  dominant_emotion: string;
  stress_triggers: string[];
  cognitive_patterns: string[];
  support_priority: SupportPriority;
  gemini_insight: string;
}

export interface CompanionContext {
  student_name: string;
  exam_type: ExamType;
  days_until_exam: number;
  study_intensity: StudyIntensity;
  weak_subjects: string[];
  recent_analyses: Pick<
    EntryAnalysis,
    'mood_score' | 'stress_score' | 'burnout_risk' | 'dominant_emotion' | 'created_at'
  >[];
  stress_trend: 'improving' | 'stable' | 'worsening';
  current_support_priority: SupportPriority;
}

export interface CompanionResponse {
  reply: string;
  function_call?: {
    name: string;
    args: Record<string, unknown>;
  };
}

// --- API Request/Response Types ---

export interface AnalyzeRequest {
  entry_text: string;
  user_id: string;
}

export interface AnalyzeResponse {
  entry_id: string;
  analysis: GeminiAnalysisOutput;
}

export interface ChatRequest {
  message: string;
  session_id?: string;
  user_id: string;
}

export interface ChatResponse {
  reply: string;
  session_id: string;
  function_call?: {
    name: string;
    args: Record<string, unknown>;
  };
}

export interface WeeklyInsightsResponse {
  charts_data: {
    mood_trend: { date: string; score: number }[];
    stress_trend: { date: string; score: number }[];
    confidence_trend: { date: string; score: number }[];
    burnout_history: { date: string; risk: BurnoutRisk }[];
    trigger_frequency: { trigger: string; count: number }[];
  };
  narrative: string;
}

// --- Component Props ---

export interface ScoreBarProps {
  label: string;
  value: number;
  max: number;
  color?: string;
}

export interface ChatBubbleProps {
  message: ChatMessage;
}

export interface CopingComponentProps {
  args: Record<string, unknown>;
  onComplete?: () => void;
}
