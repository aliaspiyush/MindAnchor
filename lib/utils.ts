import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with conflict resolution
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculate days until a given exam date
 */
export function daysUntilExam(examDate: string | null): number | null {
  if (!examDate) return null;
  const now = new Date();
  const exam = new Date(examDate);
  const diff = exam.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function getDaysUntilExam(examDate: string | null): number | null {
  return daysUntilExam(examDate);
}

/**
 * Get mood label based on score
 */
export function getMoodLabel(score: number): 'Critical' | 'Low' | 'Moderate' | 'Good' {
  if (score >= 1 && score <= 3) return 'Critical';
  if (score >= 4 && score <= 5) return 'Low';
  if (score >= 6 && score <= 7) return 'Moderate';
  return 'Good';
}

/**
 * Format a date string for display
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format a date to relative time (e.g., "2 hours ago")
 */
export function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return formatDate(dateString);
}

/**
 * Determine stress trend from recent analyses
 */
export function getStressTrend(
  stressScores: number[]
): 'improving' | 'stable' | 'worsening' {
  if (stressScores.length < 2) return 'stable';

  const recent = stressScores.slice(-3);
  const older = stressScores.slice(-6, -3);

  if (older.length === 0) return 'stable';

  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;

  const diff = recentAvg - olderAvg;
  if (diff > 1) return 'worsening';
  if (diff < -1) return 'improving';
  return 'stable';
}

/**
 * Get color for burnout risk level
 */
export function getBurnoutColor(risk: string): string {
  switch (risk) {
    case 'low': return '#4ADE80';
    case 'moderate': return '#FBBF24';
    case 'high': return '#FB923C';
    case 'critical': return '#F87171';
    default: return '#8B8FA8';
  }
}

/**
 * Get color for support priority
 */
export function getSupportPriorityColor(priority: string): string {
  switch (priority) {
    case 'none': return '#4ADE80';
    case 'gentle': return '#6C8EFF';
    case 'active': return '#FBBF24';
    case 'urgent': return '#F87171';
    default: return '#8B8FA8';
  }
}

/**
 * Truncate text to a maximum length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '…';
}

/**
 * Journal placeholder prompts that rotate
 */
export const JOURNAL_PLACEHOLDERS = [
  'How did today\'s study session feel?',
  'What\'s weighing on your mind right now?',
  'One thing that went well today...',
  'How are you really feeling about your preparation?',
  'Describe your energy levels and motivation today...',
  'What challenged you the most today?',
  'Write about a moment that made you smile today...',
];

/**
 * Get a rotating placeholder based on time
 */
export function getRotatingPlaceholder(): string {
  const index = Math.floor(Date.now() / 10000) % JOURNAL_PLACEHOLDERS.length;
  return JOURNAL_PLACEHOLDERS[index];
}
