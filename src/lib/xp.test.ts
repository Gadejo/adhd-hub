/**
 * Unit tests for XP system functions
 */

import { 
  calculateSessionXP, 
  calculateResourceXP, 
  calculateGoalCompletionXP,
  calculateLevel,
  getXPForLevel,
  calculateStreak,
  XP_RULES 
} from './xp.js';

// Mock session data for testing
const mockSessions = [
  { startedAt: new Date('2024-01-01'), durationMin: 25 },
  { startedAt: new Date('2024-01-02'), durationMin: 30 },
  { startedAt: new Date('2024-01-03'), durationMin: 15 },
  { startedAt: new Date('2024-01-05'), durationMin: 45 }, // Gap of 1 day
  { startedAt: new Date('2024-01-06'), durationMin: 20 },
];

describe('XP System', () => {
  describe('calculateSessionXP', () => {
    test('should calculate XP correctly for various durations', () => {
      // Rule: +2 XP per 5 minutes (rounded down)
      expect(calculateSessionXP(25)).toEqual({
        amount: 10, // 25/5 = 5 blocks × 2 XP = 10 XP
        reason: '25 minutes of study (5 blocks)'
      });

      expect(calculateSessionXP(15)).toEqual({
        amount: 6, // 15/5 = 3 blocks × 2 XP = 6 XP
        reason: '15 minutes of study (3 blocks)'
      });

      expect(calculateSessionXP(7)).toEqual({
        amount: 2, // 7/5 = 1.4 → 1 block × 2 XP = 2 XP
        reason: '7 minutes of study (1 blocks)'
      });

      expect(calculateSessionXP(3)).toEqual({
        amount: 0, // 3/5 = 0.6 → 0 blocks × 2 XP = 0 XP
        reason: '3 minutes of study (0 blocks)'
      });
    });

    test('should handle edge cases', () => {
      expect(calculateSessionXP(0)).toEqual({
        amount: 0,
        reason: '0 minutes of study (0 blocks)'
      });

      expect(calculateSessionXP(5)).toEqual({
        amount: 2,
        reason: '5 minutes of study (1 blocks)'
      });
    });
  });

  describe('calculateResourceXP', () => {
    test('should give XP for high priority resources', () => {
      expect(calculateResourceXP(1)).toEqual({
        amount: XP_RULES.HIGH_PRIORITY_RESOURCE,
        reason: 'Created high-priority resource'
      });
    });

    test('should not give XP for lower priority resources', () => {
      expect(calculateResourceXP(2)).toBeNull();
      expect(calculateResourceXP(3)).toBeNull();
      expect(calculateResourceXP(4)).toBeNull();
      expect(calculateResourceXP(5)).toBeNull();
    });
  });

  describe('calculateGoalCompletionXP', () => {
    test('should return consistent XP for goal completion', () => {
      const result = calculateGoalCompletionXP();
      expect(result).toEqual({
        amount: XP_RULES.COMPLETED_GOAL,
        reason: 'Completed a goal'
      });
    });
  });

  describe('Level System', () => {
    describe('getXPForLevel', () => {
      test('should calculate correct XP thresholds for levels', () => {
        expect(getXPForLevel(1)).toBe(0);
        expect(getXPForLevel(2)).toBe(4);   // (2 * (2-1))^2 = 4
        expect(getXPForLevel(3)).toBe(16);  // (2 * (3-1))^2 = 16
        expect(getXPForLevel(4)).toBe(36);  // (2 * (4-1))^2 = 36
        expect(getXPForLevel(5)).toBe(64);  // (2 * (5-1))^2 = 64
      });
    });

    describe('calculateLevel', () => {
      test('should calculate correct levels for various XP amounts', () => {
        // Level 1: 0-3 XP
        let result = calculateLevel(0);
        expect(result.level).toBe(1);
        expect(result.currentXP).toBe(0);
        expect(result.xpForCurrentLevel).toBe(0);
        expect(result.xpForNextLevel).toBe(4);
        expect(result.progressToNext).toBe(0);

        result = calculateLevel(3);
        expect(result.level).toBe(1);
        expect(result.progressToNext).toBe(0.75); // 3/4

        // Level 2: 4-15 XP
        result = calculateLevel(4);
        expect(result.level).toBe(2);
        expect(result.progressToNext).toBe(0);

        result = calculateLevel(10);
        expect(result.level).toBe(2);
        expect(result.progressToNext).toBe(0.5); // (10-4)/(16-4) = 6/12

        // Level 3: 16-35 XP
        result = calculateLevel(16);
        expect(result.level).toBe(3);
        expect(result.progressToNext).toBe(0);

        result = calculateLevel(26);
        expect(result.level).toBe(3);
        expect(result.progressToNext).toBe(0.5); // (26-16)/(36-16) = 10/20
      });

      test('should handle edge cases', () => {
        const result = calculateLevel(1000);
        expect(result.level).toBeGreaterThan(10);
        expect(result.progressToNext).toBeGreaterThanOrEqual(0);
        expect(result.progressToNext).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('Streak System', () => {
    describe('calculateStreak', () => {
      test('should handle empty sessions', () => {
        const result = calculateStreak([]);
        expect(result).toEqual({
          currentStreak: 0,
          longestStreak: 0
        });
      });

      test('should calculate streak correctly for consecutive days', () => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const twoDaysAgo = new Date(today);
        twoDaysAgo.setDate(today.getDate() - 2);

        const consecutiveSessions = [
          { startedAt: today, durationMin: 25 },
          { startedAt: yesterday, durationMin: 30 },
          { startedAt: twoDaysAgo, durationMin: 15 }
        ];

        const result = calculateStreak(consecutiveSessions);
        expect(result.currentStreak).toBe(3);
        expect(result.longestStreak).toBe(3);
      });

      test('should handle breaks in streak', () => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const threeDaysAgo = new Date(today);
        threeDaysAgo.setDate(today.getDate() - 3);
        const fourDaysAgo = new Date(today);
        fourDaysAgo.setDate(today.getDate() - 4);

        const brokenStreakSessions = [
          { startedAt: today, durationMin: 25 },
          { startedAt: yesterday, durationMin: 30 },
          // Gap of 1 day breaks the streak
          { startedAt: threeDaysAgo, durationMin: 15 },
          { startedAt: fourDaysAgo, durationMin: 20 }
        ];

        const result = calculateStreak(brokenStreakSessions);
        expect(result.currentStreak).toBe(2); // Today and yesterday
        expect(result.longestStreak).toBe(2); // Longest is still 2
      });

      test('should handle multiple study sessions on same day', () => {
        const today = new Date();
        const todayEvening = new Date(today);
        todayEvening.setHours(20, 0, 0, 0);
        const todayMorning = new Date(today);
        todayMorning.setHours(9, 0, 0, 0);

        const sameDaySessions = [
          { startedAt: todayEvening, durationMin: 25 },
          { startedAt: todayMorning, durationMin: 30 }
        ];

        const result = calculateStreak(sameDaySessions);
        expect(result.currentStreak).toBe(1); // Should count as 1 day
        expect(result.longestStreak).toBe(1);
      });

      test('should handle sessions with 0 duration', () => {
        const today = new Date();
        const zeroDurationSessions = [
          { startedAt: today, durationMin: 0 },
          { startedAt: today, durationMin: 25 }
        ];

        const result = calculateStreak(zeroDurationSessions);
        expect(result.currentStreak).toBe(1); // Should ignore 0-duration sessions
        expect(result.longestStreak).toBe(1);
      });
    });
  });

  describe('Integration Tests', () => {
    test('should simulate realistic XP progression', () => {
      let totalXP = 0;

      // Week 1: Daily 25-minute sessions
      for (let i = 0; i < 7; i++) {
        const sessionXP = calculateSessionXP(25);
        totalXP += sessionXP.amount;
      }

      // Add some high-priority resources
      const resourceXP = calculateResourceXP(1);
      if (resourceXP) {
        totalXP += resourceXP.amount * 2; // 2 high-priority resources
      }

      // Complete a goal
      const goalXP = calculateGoalCompletionXP();
      totalXP += goalXP.amount;

      // Should be around level 4-5 with 90 XP
      const levelInfo = calculateLevel(totalXP);
      expect(levelInfo.level).toBeGreaterThanOrEqual(4);
      expect(levelInfo.level).toBeLessThanOrEqual(6);
      expect(totalXP).toBe(7 * 10 + 2 * 5 + 10); // 70 + 10 + 10 = 90 XP
    });
  });
});