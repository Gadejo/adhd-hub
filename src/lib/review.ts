/**
 * Spaced Repetition Review System
 * 
 * Implements spaced review intervals for learning resources to optimize retention.
 */

import type { Resource } from './models.js';

/**
 * Spaced repetition intervals in days
 * Progression: 3d -> 7d -> 14d -> 30d
 */
export const REVIEW_INTERVALS = [3, 7, 14, 30] as const;

export interface ReviewResult {
  status: Resource['status'];
  nextReviewDate?: Date;
  lastReviewInterval?: number;
}

/**
 * Calculate next review date and status when marking a resource as reviewed
 */
export function calculateReviewProgression(resource: Resource): ReviewResult {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start of day
  
  // Handle new/learning resources
  if (resource.status === 'new' || resource.status === 'learning') {
    const nextReviewDate = new Date(today);
    nextReviewDate.setDate(today.getDate() + REVIEW_INTERVALS[0]); // 3 days
    
    return {
      status: 'reviewing',
      nextReviewDate,
      lastReviewInterval: REVIEW_INTERVALS[0]
    };
  }
  
  // Handle reviewing resources - progress through intervals
  if (resource.status === 'reviewing') {
    const currentInterval = resource.lastReviewInterval || REVIEW_INTERVALS[0];
    const currentIndex = REVIEW_INTERVALS.indexOf(currentInterval as typeof REVIEW_INTERVALS[number]);
    
    // If we're at the last interval, mark as done
    if (currentIndex === REVIEW_INTERVALS.length - 1) {
      return {
        status: 'done',
        nextReviewDate: undefined,
        lastReviewInterval: currentInterval
      };
    }
    
    // Progress to next interval
    const nextIntervalIndex = currentIndex + 1;
    const nextInterval = REVIEW_INTERVALS[nextIntervalIndex];
    const nextReviewDate = new Date(today);
    nextReviewDate.setDate(today.getDate() + nextInterval);
    
    return {
      status: 'reviewing',
      nextReviewDate,
      lastReviewInterval: nextInterval
    };
  }
  
  // Done resources don't change
  return {
    status: resource.status,
    nextReviewDate: resource.nextReviewDate,
    lastReviewInterval: resource.lastReviewInterval
  };
}

/**
 * Calculate new review date when snoozing a resource
 */
export function calculateSnoozeDate(resource: Resource): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // If no review date set, snooze from today
  const baseDate = resource.nextReviewDate || today;
  const snoozeDate = new Date(baseDate);
  snoozeDate.setDate(snoozeDate.getDate() + 1); // +1 day
  
  return snoozeDate;
}

/**
 * Check if a resource is due for review today
 */
export function isDueToday(resource: Resource): boolean {
  if (!resource.nextReviewDate || resource.status === 'done') {
    return false;
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const reviewDate = new Date(resource.nextReviewDate);
  reviewDate.setHours(0, 0, 0, 0);
  
  return reviewDate <= today;
}

/**
 * Get all resources that are due for review today
 */
export function getDueResources(resources: Resource[]): Resource[] {
  return resources.filter(isDueToday);
}

/**
 * Get the next review interval description for display
 */
export function getNextReviewText(resource: Resource): string {
  if (resource.status === 'done') {
    return 'Completed';
  }
  
  if (resource.status === 'new' || resource.status === 'learning') {
    return 'First review in 3 days';
  }
  
  if (resource.status === 'reviewing') {
    const currentInterval = resource.lastReviewInterval || REVIEW_INTERVALS[0];
    const currentIndex = REVIEW_INTERVALS.indexOf(currentInterval as typeof REVIEW_INTERVALS[number]);
    
    if (currentIndex === REVIEW_INTERVALS.length - 1) {
      return 'Final review - will mark as done';
    }
    
    const nextInterval = REVIEW_INTERVALS[currentIndex + 1];
    return `Next review in ${nextInterval} days`;
  }
  
  return '';
}

/**
 * Get status color for UI display
 */
export function getStatusColor(status: Resource['status']): string {
  const colors = {
    'new': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
    'learning': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    'reviewing': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    'done': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
  };
  return colors[status];
}

/**
 * Get days until next review
 */
export function getDaysUntilReview(resource: Resource): number | null {
  if (!resource.nextReviewDate || resource.status === 'done') {
    return null;
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const reviewDate = new Date(resource.nextReviewDate);
  reviewDate.setHours(0, 0, 0, 0);
  
  const diffTime = reviewDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Format review date for display
 */
export function formatReviewDate(resource: Resource): string {
  if (!resource.nextReviewDate || resource.status === 'done') {
    return '';
  }
  
  const daysUntil = getDaysUntilReview(resource);
  
  if (daysUntil === null) return '';
  if (daysUntil < 0) return 'Overdue';
  if (daysUntil === 0) return 'Due today';
  if (daysUntil === 1) return 'Due tomorrow';
  
  return `Due in ${daysUntil} days`;
}

/**
 * Get review progress percentage (0-100)
 */
export function getReviewProgress(resource: Resource): number {
  if (resource.status === 'new') return 0;
  if (resource.status === 'learning') return 25;
  if (resource.status === 'done') return 100;
  
  if (resource.status === 'reviewing') {
    const currentInterval = resource.lastReviewInterval || REVIEW_INTERVALS[0];
    const currentIndex = REVIEW_INTERVALS.indexOf(currentInterval as typeof REVIEW_INTERVALS[number]);
    
    // 25% for learning -> reviewing, then 25% for each interval
    return 25 + ((currentIndex + 1) * 18.75); // 25 + 18.75 * 4 = 100
  }
  
  return 0;
}