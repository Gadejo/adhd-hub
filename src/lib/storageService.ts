/**
 * Unified storage service that handles both local and cloud storage
 * Automatically switches based on authentication status
 */

import type { AppData, Resource, Session, Goal, Settings, Subject } from './models.js';
import { calculateSessionXP, calculateResourceXP, calculateGoalCompletionXP, calculateStreak, calculateLevel } from './xp.js';
import { calculateReviewProgression, calculateSnoozeDate } from './review.js';
import { authService } from './authService.js';
import { cloudStorage } from './cloudStorage.js';

// Re-export everything from the original storage.ts for compatibility
export * from './storage.js';

class UnifiedStorageService {
  private isAuthenticated(): boolean {
    return authService.getState().isAuthenticated;
  }

  /**
   * Get all data - from cloud if authenticated, local otherwise
   */
  async getAll(): Promise<AppData> {
    if (this.isAuthenticated()) {
      try {
        return await cloudStorage.getAll();
      } catch (error) {
        console.error('Failed to get cloud data, falling back to local:', error);
        // Fallback to local storage
        return await this.getLocalData();
      }
    }
    return await this.getLocalData();
  }

  /**
   * Get local data (original implementation)
   */
  private async getLocalData(): Promise<AppData> {
    // Use dynamic import for original getAll function from storage.ts
    const { getAll } = await import('./storage.js');
    return getAll();
  }

  /**
   * Save resource - to cloud if authenticated, local otherwise
   */
  async saveResource(resource: Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>): Promise<Resource> {
    if (this.isAuthenticated()) {
      try {
        const savedResource = await cloudStorage.saveResource(resource);
        
        // Grant XP for high-priority resources
        const xpGain = calculateResourceXP(savedResource.priority);
        if (xpGain) {
          const currentSettings = await this.getSettings();
          const newXP = currentSettings.xp + xpGain.amount;
          const levelInfo = calculateLevel(newXP);
          
          await this.updateSettings({
            xp: newXP,
            level: levelInfo.level
          });
          
          console.log(`🎉 +${xpGain.amount} XP: ${xpGain.reason}`);
          console.log(`📈 Level ${levelInfo.level} (${Math.round(levelInfo.progressToNext * 100)}% to next)`);
        }
        
        return savedResource;
      } catch (error) {
        console.error('Failed to save resource to cloud:', error);
        throw error;
      }
    }
    
    // Fallback to local storage
    const { saveResource: saveLocalResource } = await import('./storage.js');
    return saveLocalResource(resource);
  }

  /**
   * Update resource
   */
  async updateResource(id: string, updates: Partial<Resource>): Promise<Resource | null> {
    if (this.isAuthenticated()) {
      try {
        return await cloudStorage.updateResource(id, updates);
      } catch (error) {
        console.error('Failed to update resource in cloud:', error);
        throw error;
      }
    }
    
    // Fallback to local storage
    const { updateResource: updateLocalResource } = await import('./storage.js');
    return updateLocalResource(id, updates);
  }

  /**
   * Delete resource
   */
  async deleteResource(id: string): Promise<boolean> {
    if (this.isAuthenticated()) {
      try {
        return await cloudStorage.deleteResource(id);
      } catch (error) {
        console.error('Failed to delete resource from cloud:', error);
        throw error;
      }
    }
    
    // Fallback to local storage
    const { deleteResource: deleteLocalResource } = await import('./storage.js');
    return deleteLocalResource(id);
  }

  /**
   * Save session
   */
  async saveSession(session: Omit<Session, 'id'>): Promise<Session> {
    if (this.isAuthenticated()) {
      try {
        const savedSession = await cloudStorage.saveSession(session);
        
        // Grant XP and update streak
        const xpGain = calculateSessionXP(savedSession.durationMin);
        const allSessions = (await this.getAll()).sessions;
        const streakInfo = calculateStreak([...allSessions, savedSession]);
        
        const currentSettings = await this.getSettings();
        const newXP = currentSettings.xp + xpGain.amount;
        const levelInfo = calculateLevel(newXP);
        
        await this.updateSettings({
          xp: newXP,
          level: levelInfo.level,
          streak: streakInfo.currentStreak,
          longestStreak: Math.max(currentSettings.longestStreak, streakInfo.longestStreak)
        });
        
        if (xpGain.amount > 0) {
          console.log(`🎉 +${xpGain.amount} XP: ${xpGain.reason}`);
          console.log(`📈 Level ${levelInfo.level} (${Math.round(levelInfo.progressToNext * 100)}% to next)`);
        }
        
        return savedSession;
      } catch (error) {
        console.error('Failed to save session to cloud:', error);
        throw error;
      }
    }
    
    // Fallback to local storage
    const { saveSession: saveLocalSession } = await import('./storage.js');
    return saveLocalSession(session);
  }

  /**
   * Save goal
   */
  async saveGoal(goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Goal> {
    if (this.isAuthenticated()) {
      try {
        return await cloudStorage.saveGoal(goal);
      } catch (error) {
        console.error('Failed to save goal to cloud:', error);
        throw error;
      }
    }
    
    // Fallback to local storage
    const { saveGoal: saveLocalGoal } = await import('./storage.js');
    return saveLocalGoal(goal);
  }

  /**
   * Update goal
   */
  async updateGoal(id: string, updates: Partial<Goal>): Promise<Goal | null> {
    if (this.isAuthenticated()) {
      try {
        const updatedGoal = await cloudStorage.updateGoal(id, updates);
        
        // Grant XP for completing a goal
        if (updates.status === 'completed') {
          const xpGain = calculateGoalCompletionXP();
          const currentSettings = await this.getSettings();
          const newXP = currentSettings.xp + xpGain.amount;
          const levelInfo = calculateLevel(newXP);
          
          await this.updateSettings({
            xp: newXP,
            level: levelInfo.level
          });
          
          console.log(`🎉 +${xpGain.amount} XP: ${xpGain.reason}`);
          console.log(`📈 Level ${levelInfo.level} (${Math.round(levelInfo.progressToNext * 100)}% to next)`);
        }
        
        return updatedGoal;
      } catch (error) {
        console.error('Failed to update goal in cloud:', error);
        throw error;
      }
    }
    
    // Fallback to local storage
    const { updateGoal: updateLocalGoal } = await import('./storage.js');
    return updateLocalGoal(id, updates);
  }

  /**
   * Delete goal
   */
  async deleteGoal(id: string): Promise<boolean> {
    if (this.isAuthenticated()) {
      try {
        return await cloudStorage.deleteGoal(id);
      } catch (error) {
        console.error('Failed to delete goal from cloud:', error);
        throw error;
      }
    }
    
    // Fallback to local storage
    const { deleteGoal: deleteLocalGoal } = await import('./storage.js');
    return deleteLocalGoal(id);
  }

  /**
   * Update settings
   */
  async updateSettings(updates: Partial<Settings>): Promise<Settings> {
    if (this.isAuthenticated()) {
      try {
        return await cloudStorage.updateSettings(updates);
      } catch (error) {
        console.error('Failed to update settings in cloud:', error);
        throw error;
      }
    }
    
    // Fallback to local storage
    const { updateSettings: updateLocalSettings } = await import('./storage.js');
    return updateLocalSettings(updates);
  }

  /**
   * Get current settings
   */
  async getSettings(): Promise<Settings> {
    const data = await this.getAll();
    return data.settings;
  }

  /**
   * Review resource (spaced repetition)
   */
  async reviewResource(id: string): Promise<Resource | null> {
    if (this.isAuthenticated()) {
      try {
        // Get current resource
        const allData = await this.getAll();
        const resource = allData.resources.find(r => r.id === id);
        if (!resource) return null;
        
        // Calculate review progression
        const reviewResult = calculateReviewProgression(resource);
        
        // Update resource with new review data
        return await this.updateResource(id, {
          status: reviewResult.status,
          nextReviewDate: reviewResult.nextReviewDate,
          lastReviewInterval: reviewResult.lastReviewInterval
        });
      } catch (error) {
        console.error('Failed to review resource in cloud:', error);
        throw error;
      }
    }
    
    // Fallback to local storage
    const { reviewResource: reviewLocalResource } = await import('./storage.js');
    return reviewLocalResource(id);
  }

  /**
   * Snooze resource
   */
  async snoozeResource(id: string): Promise<Resource | null> {
    if (this.isAuthenticated()) {
      try {
        // Get current resource
        const allData = await this.getAll();
        const resource = allData.resources.find(r => r.id === id);
        if (!resource) return null;
        
        // Calculate snooze date
        const snoozeDate = calculateSnoozeDate(resource);
        
        // Update resource with new review date
        return await this.updateResource(id, {
          nextReviewDate: snoozeDate
        });
      } catch (error) {
        console.error('Failed to snooze resource in cloud:', error);
        throw error;
      }
    }
    
    // Fallback to local storage
    const { snoozeResource: snoozeLocalResource } = await import('./storage.js');
    return snoozeLocalResource(id);
  }

  /**
   * Export data as JSON (works for both cloud and local)
   */
  async exportJSON(): Promise<string> {
    const data = await this.getAll();
    return JSON.stringify(data, null, 2);
  }

  /**
   * Import data from JSON (local only)
   */
  async importJSON(jsonString: string): Promise<AppData> {
    // Import is always local-only for guest mode
    const { importJSON: importLocalJSON } = await import('./storage.js');
    return importLocalJSON(jsonString);
  }
}

// Create and export singleton
export const storageService = new UnifiedStorageService();

// Export compatibility functions for existing code
export async function getAll(): Promise<AppData> {
  return storageService.getAll();
}

export async function saveResource(resource: Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>): Promise<Resource> {
  return storageService.saveResource(resource);
}

export async function updateResource(id: string, updates: Partial<Resource>): Promise<Resource | null> {
  return storageService.updateResource(id, updates);
}

export async function deleteResource(id: string): Promise<boolean> {
  return storageService.deleteResource(id);
}

export async function saveSession(session: Omit<Session, 'id'>): Promise<Session> {
  return storageService.saveSession(session);
}

export async function saveGoal(goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Goal> {
  return storageService.saveGoal(goal);
}

export async function updateGoal(id: string, updates: Partial<Goal>): Promise<Goal | null> {
  return storageService.updateGoal(id, updates);
}

export async function deleteGoal(id: string): Promise<boolean> {
  return storageService.deleteGoal(id);
}

export async function updateSettings(updates: Partial<Settings>): Promise<Settings> {
  return storageService.updateSettings(updates);
}

export async function reviewResource(id: string): Promise<Resource | null> {
  return storageService.reviewResource(id);
}

export async function snoozeResource(id: string): Promise<Resource | null> {
  return storageService.snoozeResource(id);
}

export async function exportJSON(): Promise<string> {
  return storageService.exportJSON();
}