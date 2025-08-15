/**
 * Cloud storage service
 * API-based storage operations for authenticated users
 */

import type { AppData, Resource, Session, Goal, Settings } from './models';

class CloudStorageService {
  /**
   * Generic API request handler
   */
  private async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(endpoint, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `Request failed with status ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get all user data from cloud
   */
  async getAll(): Promise<AppData> {
    try {
      const [resourcesRes, sessionsRes, goalsRes, settingsRes] = await Promise.all([
        this.request<{ resources: Resource[] }>('/api/resources'),
        this.request<{ sessions: Session[] }>('/api/sessions'),
        this.request<{ goals: Goal[] }>('/api/goals'),
        this.request<{ settings: Settings }>('/api/settings')
      ]);

      // Convert timestamps back to Date objects
      const resources = resourcesRes.resources.map(r => ({
        ...r,
        createdAt: new Date(r.created_at * 1000),
        updatedAt: new Date(r.updated_at * 1000),
        nextReviewDate: r.next_review_date ? new Date(r.next_review_date * 1000) : undefined,
        lastReviewInterval: r.interval_days || undefined
      }));

      const sessions = sessionsRes.sessions.map(s => ({
        ...s,
        startedAt: new Date(s.started_at * 1000),
        resourceId: s.resource_id || undefined,
        durationMin: s.duration_min
      }));

      const goals = goalsRes.goals.map(g => ({
        ...g,
        dueDate: new Date(g.due_date * 1000),
        progressPct: g.progress_pct,
        createdAt: new Date(g.created_at * 1000),
        updatedAt: new Date(g.updated_at * 1000)
      }));

      const settings: Settings = {
        theme: settingsRes.settings.theme,
        xp: settingsRes.settings.xp,
        level: settingsRes.settings.level,
        streak: settingsRes.settings.streak,
        longestStreak: settingsRes.settings.longest_streak,
        selectedSubjectId: settingsRes.settings.selected_subject_id
      };

      return {
        resources,
        sessions,
        goals,
        subjects: [], // TODO: Add subjects API
        settings
      };
    } catch (error) {
      console.error('Failed to get cloud data:', error);
      throw error;
    }
  }

  // Resource operations
  async saveResource(resource: Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>): Promise<Resource> {
    const data = {
      title: resource.title,
      url: resource.url,
      subject: resource.subject,
      type: resource.type,
      priority: resource.priority,
      notes: resource.notes,
      favorite: resource.favorite,
      status: resource.status,
      next_review_date: resource.nextReviewDate ? Math.floor(resource.nextReviewDate.getTime() / 1000) : null,
      interval_days: resource.lastReviewInterval || null
    };

    const result = await this.request<{ resource: any }>('/api/resources', {
      method: 'POST',
      body: JSON.stringify(data)
    });

    const r = result.resource;
    return {
      id: r.id,
      title: r.title,
      url: r.url,
      subject: r.subject,
      type: r.type,
      priority: r.priority,
      notes: r.notes,
      favorite: r.favorite,
      status: r.status,
      nextReviewDate: r.next_review_date ? new Date(r.next_review_date * 1000) : undefined,
      lastReviewInterval: r.interval_days || undefined,
      createdAt: new Date(r.created_at * 1000),
      updatedAt: new Date(r.updated_at * 1000)
    };
  }

  async updateResource(id: string, updates: Partial<Resource>): Promise<Resource | null> {
    const data: any = {};
    
    if (updates.title !== undefined) data.title = updates.title;
    if (updates.url !== undefined) data.url = updates.url;
    if (updates.subject !== undefined) data.subject = updates.subject;
    if (updates.type !== undefined) data.type = updates.type;
    if (updates.priority !== undefined) data.priority = updates.priority;
    if (updates.notes !== undefined) data.notes = updates.notes;
    if (updates.favorite !== undefined) data.favorite = updates.favorite;
    if (updates.status !== undefined) data.status = updates.status;
    if (updates.nextReviewDate !== undefined) {
      data.next_review_date = updates.nextReviewDate ? Math.floor(updates.nextReviewDate.getTime() / 1000) : null;
    }
    if (updates.lastReviewInterval !== undefined) data.interval_days = updates.lastReviewInterval;

    const result = await this.request<{ resource: any }>(`/api/resources?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });

    const r = result.resource;
    return {
      id: r.id,
      title: r.title,
      url: r.url,
      subject: r.subject,
      type: r.type,
      priority: r.priority,
      notes: r.notes,
      favorite: r.favorite,
      status: r.status,
      nextReviewDate: r.next_review_date ? new Date(r.next_review_date * 1000) : undefined,
      lastReviewInterval: r.interval_days || undefined,
      createdAt: new Date(r.created_at * 1000),
      updatedAt: new Date(r.updated_at * 1000)
    };
  }

  async deleteResource(id: string): Promise<boolean> {
    try {
      await this.request(`/api/resources?id=${id}`, {
        method: 'DELETE'
      });
      return true;
    } catch (error) {
      console.error('Failed to delete resource:', error);
      return false;
    }
  }

  // Session operations
  async saveSession(session: Omit<Session, 'id'>): Promise<Session> {
    const data = {
      started_at: Math.floor(session.startedAt.getTime() / 1000),
      duration_min: session.durationMin,
      subject: session.subject,
      resource_id: session.resourceId
    };

    const result = await this.request<{ session: any }>('/api/sessions', {
      method: 'POST',
      body: JSON.stringify(data)
    });

    const s = result.session;
    return {
      id: s.id,
      startedAt: new Date(s.started_at * 1000),
      durationMin: s.duration_min,
      subject: s.subject,
      resourceId: s.resource_id
    };
  }

  // Goal operations
  async saveGoal(goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Goal> {
    const data = {
      name: goal.name,
      subject: goal.subject,
      due_date: Math.floor(goal.dueDate.getTime() / 1000),
      progress_pct: goal.progressPct,
      status: goal.status
    };

    const result = await this.request<{ goal: any }>('/api/goals', {
      method: 'POST',
      body: JSON.stringify(data)
    });

    const g = result.goal;
    return {
      id: g.id,
      name: g.name,
      subject: g.subject,
      dueDate: new Date(g.due_date * 1000),
      progressPct: g.progress_pct,
      status: g.status,
      createdAt: new Date(g.created_at * 1000),
      updatedAt: new Date(g.updated_at * 1000)
    };
  }

  async updateGoal(id: string, updates: Partial<Goal>): Promise<Goal | null> {
    const data: any = {};
    
    if (updates.name !== undefined) data.name = updates.name;
    if (updates.subject !== undefined) data.subject = updates.subject;
    if (updates.dueDate !== undefined) data.due_date = Math.floor(updates.dueDate.getTime() / 1000);
    if (updates.progressPct !== undefined) data.progress_pct = updates.progressPct;
    if (updates.status !== undefined) data.status = updates.status;

    const result = await this.request<{ goal: any }>(`/api/goals?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });

    const g = result.goal;
    return {
      id: g.id,
      name: g.name,
      subject: g.subject,
      dueDate: new Date(g.due_date * 1000),
      progressPct: g.progress_pct,
      status: g.status,
      createdAt: new Date(g.created_at * 1000),
      updatedAt: new Date(g.updated_at * 1000)
    };
  }

  async deleteGoal(id: string): Promise<boolean> {
    try {
      await this.request(`/api/goals?id=${id}`, {
        method: 'DELETE'
      });
      return true;
    } catch (error) {
      console.error('Failed to delete goal:', error);
      return false;
    }
  }

  // Settings operations
  async updateSettings(updates: Partial<Settings>): Promise<Settings> {
    const data: any = {};
    
    if (updates.theme !== undefined) data.theme = updates.theme;
    if (updates.xp !== undefined) data.xp = updates.xp;
    if (updates.level !== undefined) data.level = updates.level;
    if (updates.streak !== undefined) data.streak = updates.streak;
    if (updates.longestStreak !== undefined) data.longest_streak = updates.longestStreak;
    if (updates.selectedSubjectId !== undefined) data.selected_subject_id = updates.selectedSubjectId;

    const result = await this.request<{ settings: any }>('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(data)
    });

    const s = result.settings;
    return {
      theme: s.theme,
      xp: s.xp,
      level: s.level,
      streak: s.streak,
      longestStreak: s.longest_streak,
      selectedSubjectId: s.selected_subject_id
    };
  }
}

export const cloudStorage = new CloudStorageService();