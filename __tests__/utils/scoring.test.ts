import { getMoodLabel, getDaysUntilExam, getStressTrend } from '@/lib/utils';

describe('scoring utilities', () => {
  describe('getMoodLabel', () => {
    test('returns "Critical" for score 1-3', () => {
      expect(getMoodLabel(1)).toBe('Critical');
      expect(getMoodLabel(2)).toBe('Critical');
      expect(getMoodLabel(3)).toBe('Critical');
    });

    test('returns "Low" for score 4-5', () => {
      expect(getMoodLabel(4)).toBe('Low');
      expect(getMoodLabel(5)).toBe('Low');
    });

    test('returns "Moderate" for score 6-7', () => {
      expect(getMoodLabel(6)).toBe('Moderate');
      expect(getMoodLabel(7)).toBe('Moderate');
    });

    test('returns "Good" for score 8-10', () => {
      expect(getMoodLabel(8)).toBe('Good');
      expect(getMoodLabel(10)).toBe('Good');
    });
  });

  describe('getDaysUntilExam', () => {
    test('returns correct number of days', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);
      const dateString = futureDate.toISOString().split('T')[0];
      
      expect(getDaysUntilExam(dateString)).toBe(10);
    });

    test('returns null if no date provided', () => {
      expect(getDaysUntilExam(null)).toBeNull();
    });
  });

  describe('getStressTrend', () => {
    test('returns "worsening" when last 3 scores are increasing compared to older ones', () => {
      expect(getStressTrend([1, 2, 2, 4, 5, 6])).toBe('worsening');
    });

    test('returns "improving" when last 3 scores are decreasing compared to older ones', () => {
      expect(getStressTrend([5, 6, 6, 2, 1, 1])).toBe('improving');
    });

    test('returns "stable" otherwise', () => {
      expect(getStressTrend([3, 3, 3, 3, 3, 3])).toBe('stable');
    });
  });
});
