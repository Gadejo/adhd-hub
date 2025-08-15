/**
 * Database utilities for ADHD Hub
 * Handles D1 database operations and data conversion
 */

import { z } from 'zod';
import type { D1Database } from '@cloudflare/workers-types';

// Database schemas for validation
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  pw_hash: z.string(),
  created_at: z.number()
});

export const ResourceSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  title: z.string(),
  url: z.string().url(),
  subject: z.string(),
  type: z.enum(['video', 'article', 'book', 'course', 'podcast', 'other']),
  priority: z.number().min(1).max(5),
  notes: z.string(),
  favorite: z.number().min(0).max(1),
  status: z.enum(['new', 'learning', 'reviewing', 'done']),
  next_review_date: z.number().nullable(),
  interval_days: z.number().nullable(),
  created_at: z.number(),
  updated_at: z.number()
});

export const SessionSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  started_at: z.number(),
  duration_min: z.number().min(0),
  subject: z.string().nullable(),
  resource_id: z.string().nullable(),
  created_at: z.number()
});

export const GoalSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  name: z.string(),
  subject: z.string(),
  due_date: z.number(),
  progress_pct: z.number().min(0).max(100),
  status: z.enum(['active', 'completed', 'paused', 'cancelled']),
  created_at: z.number(),
  updated_at: z.number()
});

export const SettingsSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  theme: z.enum(['dark', 'light']),
  xp: z.number().min(0),
  level: z.number().min(1),
  streak: z.number().min(0),
  longest_streak: z.number().min(0),
  selected_subject_id: z.string().nullable(),
  created_at: z.number(),
  updated_at: z.number()
});

// Type definitions
export type User = z.infer<typeof UserSchema>;
export type Resource = z.infer<typeof ResourceSchema>;
export type Session = z.infer<typeof SessionSchema>;
export type Goal = z.infer<typeof GoalSchema>;
export type Settings = z.infer<typeof SettingsSchema>;

/**
 * Database utility class
 */
export class DatabaseService {
  constructor(private db: D1Database) {}

  // User operations
  async createUser(email: string, passwordHash: string): Promise<User> {
    const result = await this.db.prepare(`
      INSERT INTO users (email, pw_hash)
      VALUES (?, ?)
      RETURNING *
    `).bind(email, passwordHash).first();

    if (!result) {
      throw new Error('Failed to create user');
    }

    return UserSchema.parse(result);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const result = await this.db.prepare(`
      SELECT * FROM users WHERE email = ?
    `).bind(email).first();

    return result ? UserSchema.parse(result) : null;
  }

  async getUserById(id: string): Promise<User | null> {
    const result = await this.db.prepare(`
      SELECT * FROM users WHERE id = ?
    `).bind(id).first();

    return result ? UserSchema.parse(result) : null;
  }

  // Resource operations
  async getResourcesByUserId(userId: string): Promise<Resource[]> {
    const result = await this.db.prepare(`
      SELECT * FROM resources WHERE user_id = ?
      ORDER BY created_at DESC
    `).bind(userId).all();

    return result.results.map(row => ResourceSchema.parse(row));
  }

  async createResource(userId: string, data: Omit<Resource, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Resource> {
    const result = await this.db.prepare(`
      INSERT INTO resources (
        user_id, title, url, subject, type, priority, notes, favorite, 
        status, next_review_date, interval_days
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `).bind(
      userId,
      data.title,
      data.url,
      data.subject,
      data.type,
      data.priority,
      data.notes,
      data.favorite,
      data.status,
      data.next_review_date,
      data.interval_days
    ).first();

    if (!result) {
      throw new Error('Failed to create resource');
    }

    return ResourceSchema.parse(result);
  }

  async updateResource(id: string, userId: string, data: Partial<Omit<Resource, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<Resource | null> {
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (fields.length === 0) {
      return null;
    }

    values.push(id, userId);

    const result = await this.db.prepare(`
      UPDATE resources 
      SET ${fields.join(', ')}
      WHERE id = ? AND user_id = ?
      RETURNING *
    `).bind(...values).first();

    return result ? ResourceSchema.parse(result) : null;
  }

  async deleteResource(id: string, userId: string): Promise<boolean> {
    const result = await this.db.prepare(`
      DELETE FROM resources WHERE id = ? AND user_id = ?
    `).bind(id, userId).run();

    return result.changes > 0;
  }

  // Session operations
  async getSessionsByUserId(userId: string): Promise<Session[]> {
    const result = await this.db.prepare(`
      SELECT * FROM sessions WHERE user_id = ?
      ORDER BY started_at DESC
    `).bind(userId).all();

    return result.results.map(row => SessionSchema.parse(row));
  }

  async createSession(userId: string, data: Omit<Session, 'id' | 'user_id' | 'created_at'>): Promise<Session> {
    const result = await this.db.prepare(`
      INSERT INTO sessions (user_id, started_at, duration_min, subject, resource_id)
      VALUES (?, ?, ?, ?, ?)
      RETURNING *
    `).bind(
      userId,
      data.started_at,
      data.duration_min,
      data.subject,
      data.resource_id
    ).first();

    if (!result) {
      throw new Error('Failed to create session');
    }

    return SessionSchema.parse(result);
  }

  // Goal operations
  async getGoalsByUserId(userId: string): Promise<Goal[]> {
    const result = await this.db.prepare(`
      SELECT * FROM goals WHERE user_id = ?
      ORDER BY due_date ASC
    `).bind(userId).all();

    return result.results.map(row => GoalSchema.parse(row));
  }

  async createGoal(userId: string, data: Omit<Goal, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Goal> {
    const result = await this.db.prepare(`
      INSERT INTO goals (user_id, name, subject, due_date, progress_pct, status)
      VALUES (?, ?, ?, ?, ?, ?)
      RETURNING *
    `).bind(
      userId,
      data.name,
      data.subject,
      data.due_date,
      data.progress_pct,
      data.status
    ).first();

    if (!result) {
      throw new Error('Failed to create goal');
    }

    return GoalSchema.parse(result);
  }

  async updateGoal(id: string, userId: string, data: Partial<Omit<Goal, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<Goal | null> {
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (fields.length === 0) {
      return null;
    }

    values.push(id, userId);

    const result = await this.db.prepare(`
      UPDATE goals 
      SET ${fields.join(', ')}
      WHERE id = ? AND user_id = ?
      RETURNING *
    `).bind(...values).first();

    return result ? GoalSchema.parse(result) : null;
  }

  async deleteGoal(id: string, userId: string): Promise<boolean> {
    const result = await this.db.prepare(`
      DELETE FROM goals WHERE id = ? AND user_id = ?
    `).bind(id, userId).run();

    return result.changes > 0;
  }

  // Settings operations
  async getSettingsByUserId(userId: string): Promise<Settings | null> {
    const result = await this.db.prepare(`
      SELECT * FROM settings WHERE user_id = ?
    `).bind(userId).first();

    return result ? SettingsSchema.parse(result) : null;
  }

  async updateSettings(userId: string, data: Partial<Omit<Settings, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<Settings | null> {
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (fields.length === 0) {
      return null;
    }

    values.push(userId);

    const result = await this.db.prepare(`
      UPDATE settings 
      SET ${fields.join(', ')}
      WHERE user_id = ?
      RETURNING *
    `).bind(...values).first();

    return result ? SettingsSchema.parse(result) : null;
  }
}