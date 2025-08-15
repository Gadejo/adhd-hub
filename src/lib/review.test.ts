/**
 * Unit tests for spaced repetition review system
 */

import {
  calculateReviewProgression,
  calculateSnoozeDate,
  isDueToday,
  getDueResources,
  getNextReviewText,
  getStatusColor,
  getDaysUntilReview,
  formatReviewDate,
  getReviewProgress,
  REVIEW_INTERVALS
} from './review.js';
import type { Resource } from './models.js';

// Helper function to create mock resources
const createMockResource = (overrides: Partial<Resource> = {}): Resource => ({
  id: 'test-resource',
  title: 'Test Resource',
  url: 'https://example.com',
  subject: 'Test Subject',
  type: 'article',
  priority: 3,
  notes: '',
  favorite: false,
  status: 'new',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
});

describe('Spaced Repetition Review System', () => {
  describe('REVIEW_INTERVALS', () => {
    test('should have correct interval progression', () => {
      expect(REVIEW_INTERVALS).toEqual([3, 7, 14, 30]);
    });
  });

  describe('calculateReviewProgression', () => {
    test('should progress new resource to reviewing with 3-day interval', () => {
      const resource = createMockResource({ status: 'new' });
      const result = calculateReviewProgression(resource);

      expect(result.status).toBe('reviewing');
      expect(result.lastReviewInterval).toBe(3);
      expect(result.nextReviewDate).toBeDefined();

      const expectedDate = new Date();
      expectedDate.setHours(0, 0, 0, 0);
      expectedDate.setDate(expectedDate.getDate() + 3);
      
      expect(result.nextReviewDate?.getTime()).toBe(expectedDate.getTime());
    });

    test('should progress learning resource to reviewing with 3-day interval', () => {
      const resource = createMockResource({ status: 'learning' });
      const result = calculateReviewProgression(resource);

      expect(result.status).toBe('reviewing');
      expect(result.lastReviewInterval).toBe(3);
      expect(result.nextReviewDate).toBeDefined();
    });

    test('should progress through reviewing intervals correctly', () => {
      // First review (3 days)
      const resource1 = createMockResource({ 
        status: 'reviewing', 
        lastReviewInterval: 3 
      });
      const result1 = calculateReviewProgression(resource1);
      expect(result1.status).toBe('reviewing');
      expect(result1.lastReviewInterval).toBe(7);

      // Second review (7 days)
      const resource2 = createMockResource({ 
        status: 'reviewing', 
        lastReviewInterval: 7 
      });
      const result2 = calculateReviewProgression(resource2);
      expect(result2.status).toBe('reviewing');
      expect(result2.lastReviewInterval).toBe(14);

      // Third review (14 days)
      const resource3 = createMockResource({ 
        status: 'reviewing', 
        lastReviewInterval: 14 
      });
      const result3 = calculateReviewProgression(resource3);
      expect(result3.status).toBe('reviewing');
      expect(result3.lastReviewInterval).toBe(30);

      // Final review (30 days) - should mark as done
      const resource4 = createMockResource({ 
        status: 'reviewing', 
        lastReviewInterval: 30 
      });
      const result4 = calculateReviewProgression(resource4);
      expect(result4.status).toBe('done');
      expect(result4.nextReviewDate).toBeUndefined();
      expect(result4.lastReviewInterval).toBe(30);
    });

    test('should not change done resources', () => {
      const resource = createMockResource({ 
        status: 'done',
        nextReviewDate: undefined,
        lastReviewInterval: 30
      });
      const result = calculateReviewProgression(resource);

      expect(result.status).toBe('done');
      expect(result.nextReviewDate).toBeUndefined();
      expect(result.lastReviewInterval).toBe(30);
    });

    test('should handle reviewing resource without lastReviewInterval', () => {
      const resource = createMockResource({ 
        status: 'reviewing'
        // No lastReviewInterval set
      });
      const result = calculateReviewProgression(resource);

      expect(result.status).toBe('reviewing');
      expect(result.lastReviewInterval).toBe(7); // Should progress from default 3 to 7
    });
  });

  describe('calculateSnoozeDate', () => {
    test('should add 1 day to existing review date', () => {
      const today = new Date();
      const reviewDate = new Date(today);
      reviewDate.setDate(today.getDate() + 5);

      const resource = createMockResource({ 
        nextReviewDate: reviewDate 
      });
      
      const snoozeDate = calculateSnoozeDate(resource);
      const expectedDate = new Date(reviewDate);
      expectedDate.setDate(reviewDate.getDate() + 1);

      expect(snoozeDate.getTime()).toBe(expectedDate.getTime());
    });

    test('should add 1 day to today if no review date set', () => {
      const resource = createMockResource({ 
        nextReviewDate: undefined 
      });
      
      const snoozeDate = calculateSnoozeDate(resource);
      const expectedDate = new Date();
      expectedDate.setHours(0, 0, 0, 0);
      expectedDate.setDate(expectedDate.getDate() + 1);

      expect(snoozeDate.getTime()).toBe(expectedDate.getTime());
    });
  });

  describe('isDueToday', () => {
    test('should return false for resources without review date', () => {
      const resource = createMockResource({ nextReviewDate: undefined });
      expect(isDueToday(resource)).toBe(false);
    });

    test('should return false for done resources', () => {
      const today = new Date();
      const resource = createMockResource({ 
        status: 'done',
        nextReviewDate: today 
      });
      expect(isDueToday(resource)).toBe(false);
    });

    test('should return true for resources due today', () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const resource = createMockResource({ 
        status: 'reviewing',
        nextReviewDate: today 
      });
      expect(isDueToday(resource)).toBe(true);
    });

    test('should return true for overdue resources', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      
      const resource = createMockResource({ 
        status: 'reviewing',
        nextReviewDate: yesterday 
      });
      expect(isDueToday(resource)).toBe(true);
    });

    test('should return false for future resources', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const resource = createMockResource({ 
        status: 'reviewing',
        nextReviewDate: tomorrow 
      });
      expect(isDueToday(resource)).toBe(false);
    });
  });

  describe('getDueResources', () => {
    test('should filter resources that are due today', () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      const resources = [
        createMockResource({ id: '1', status: 'reviewing', nextReviewDate: today }),
        createMockResource({ id: '2', status: 'reviewing', nextReviewDate: tomorrow }),
        createMockResource({ id: '3', status: 'done', nextReviewDate: today }),
        createMockResource({ id: '4', status: 'new' })
      ];

      const dueResources = getDueResources(resources);
      expect(dueResources).toHaveLength(1);
      expect(dueResources[0].id).toBe('1');
    });
  });

  describe('getNextReviewText', () => {
    test('should return correct text for each status', () => {
      expect(getNextReviewText(createMockResource({ status: 'new' })))
        .toBe('First review in 3 days');
      
      expect(getNextReviewText(createMockResource({ status: 'learning' })))
        .toBe('First review in 3 days');
      
      expect(getNextReviewText(createMockResource({ status: 'done' })))
        .toBe('Completed');
    });

    test('should return correct text for reviewing status with different intervals', () => {
      expect(getNextReviewText(createMockResource({ 
        status: 'reviewing', 
        lastReviewInterval: 3 
      }))).toBe('Next review in 7 days');

      expect(getNextReviewText(createMockResource({ 
        status: 'reviewing', 
        lastReviewInterval: 7 
      }))).toBe('Next review in 14 days');

      expect(getNextReviewText(createMockResource({ 
        status: 'reviewing', 
        lastReviewInterval: 14 
      }))).toBe('Next review in 30 days');

      expect(getNextReviewText(createMockResource({ 
        status: 'reviewing', 
        lastReviewInterval: 30 
      }))).toBe('Final review - will mark as done');
    });
  });

  describe('getStatusColor', () => {
    test('should return correct colors for each status', () => {
      expect(getStatusColor('new')).toContain('bg-gray-100');
      expect(getStatusColor('learning')).toContain('bg-blue-100');
      expect(getStatusColor('reviewing')).toContain('bg-yellow-100');
      expect(getStatusColor('done')).toContain('bg-green-100');
    });
  });

  describe('getDaysUntilReview', () => {
    test('should return null for resources without review date or done status', () => {
      expect(getDaysUntilReview(createMockResource({ nextReviewDate: undefined })))
        .toBeNull();
      
      expect(getDaysUntilReview(createMockResource({ status: 'done' })))
        .toBeNull();
    });

    test('should calculate days correctly', () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      
      const inThreeDays = new Date(today);
      inThreeDays.setDate(today.getDate() + 3);

      expect(getDaysUntilReview(createMockResource({ 
        nextReviewDate: today 
      }))).toBe(0);

      expect(getDaysUntilReview(createMockResource({ 
        nextReviewDate: tomorrow 
      }))).toBe(1);

      expect(getDaysUntilReview(createMockResource({ 
        nextReviewDate: inThreeDays 
      }))).toBe(3);
    });
  });

  describe('formatReviewDate', () => {
    test('should return empty string for inappropriate resources', () => {
      expect(formatReviewDate(createMockResource({ 
        nextReviewDate: undefined 
      }))).toBe('');
      
      expect(formatReviewDate(createMockResource({ 
        status: 'done' 
      }))).toBe('');
    });

    test('should format dates correctly', () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      
      const inThreeDays = new Date(today);
      inThreeDays.setDate(today.getDate() + 3);

      expect(formatReviewDate(createMockResource({ 
        nextReviewDate: yesterday 
      }))).toBe('Overdue');

      expect(formatReviewDate(createMockResource({ 
        nextReviewDate: today 
      }))).toBe('Due today');

      expect(formatReviewDate(createMockResource({ 
        nextReviewDate: tomorrow 
      }))).toBe('Due tomorrow');

      expect(formatReviewDate(createMockResource({ 
        nextReviewDate: inThreeDays 
      }))).toBe('Due in 3 days');
    });
  });

  describe('getReviewProgress', () => {
    test('should return correct progress percentages', () => {
      expect(getReviewProgress(createMockResource({ status: 'new' }))).toBe(0);
      expect(getReviewProgress(createMockResource({ status: 'learning' }))).toBe(25);
      expect(getReviewProgress(createMockResource({ status: 'done' }))).toBe(100);
    });

    test('should calculate reviewing progress correctly', () => {
      // 25% base + (interval index + 1) * 18.75%
      expect(getReviewProgress(createMockResource({ 
        status: 'reviewing', 
        lastReviewInterval: 3 
      }))).toBe(43.75); // 25 + 1 * 18.75

      expect(getReviewProgress(createMockResource({ 
        status: 'reviewing', 
        lastReviewInterval: 7 
      }))).toBe(62.5); // 25 + 2 * 18.75

      expect(getReviewProgress(createMockResource({ 
        status: 'reviewing', 
        lastReviewInterval: 14 
      }))).toBe(81.25); // 25 + 3 * 18.75

      expect(getReviewProgress(createMockResource({ 
        status: 'reviewing', 
        lastReviewInterval: 30 
      }))).toBe(100); // 25 + 4 * 18.75
    });
  });

  describe('Integration Tests', () => {
    test('should simulate complete review cycle', () => {
      let resource = createMockResource({ status: 'new' });

      // First review
      let result = calculateReviewProgression(resource);
      expect(result.status).toBe('reviewing');
      expect(result.lastReviewInterval).toBe(3);

      // Simulate progression through all intervals
      resource = { ...resource, ...result };
      result = calculateReviewProgression(resource);
      expect(result.lastReviewInterval).toBe(7);

      resource = { ...resource, ...result };
      result = calculateReviewProgression(resource);
      expect(result.lastReviewInterval).toBe(14);

      resource = { ...resource, ...result };
      result = calculateReviewProgression(resource);
      expect(result.lastReviewInterval).toBe(30);

      // Final review should mark as done
      resource = { ...resource, ...result };
      result = calculateReviewProgression(resource);
      expect(result.status).toBe('done');
      expect(result.nextReviewDate).toBeUndefined();
    });

    test('should handle snoozing correctly', () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const resource = createMockResource({ 
        status: 'reviewing',
        nextReviewDate: today,
        lastReviewInterval: 7
      });

      // Should be due today
      expect(isDueToday(resource)).toBe(true);

      // Snooze it
      const snoozeDate = calculateSnoozeDate(resource);
      const snoozedResource = { ...resource, nextReviewDate: snoozeDate };

      // Should no longer be due today
      expect(isDueToday(snoozedResource)).toBe(false);
      expect(getDaysUntilReview(snoozedResource)).toBe(1);
    });
  });
});