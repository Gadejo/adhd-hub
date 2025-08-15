/**
 * POST /api/sync
 * Bulk sync endpoint for transferring local data to cloud
 */

import type { APIRoute } from 'astro';
import { z } from 'zod';
import { DatabaseService } from '../../lib/db';
import { getUserFromContext } from '../../lib/auth';

const SyncDataSchema = z.object({
  resources: z.array(z.object({
    title: z.string(),
    url: z.string().url(),
    subject: z.string(),
    type: z.enum(['video', 'article', 'book', 'course', 'podcast', 'other']),
    priority: z.number().min(1).max(5),
    notes: z.string(),
    favorite: z.boolean(),
    status: z.enum(['new', 'learning', 'reviewing', 'done']),
    next_review_date: z.number().nullable().optional(),
    interval_days: z.number().nullable().optional(),
    created_at: z.number(),
    updated_at: z.number()
  })).default([]),
  sessions: z.array(z.object({
    started_at: z.number(),
    duration_min: z.number().min(0),
    subject: z.string().nullable().optional(),
    resource_id: z.string().nullable().optional()
  })).default([]),
  goals: z.array(z.object({
    name: z.string(),
    subject: z.string(),
    due_date: z.number(),
    progress_pct: z.number().min(0).max(100),
    status: z.enum(['active', 'completed', 'paused', 'cancelled']),
    created_at: z.number(),
    updated_at: z.number()
  })).default([]),
  settings: z.object({
    theme: z.enum(['dark', 'light']),
    xp: z.number().min(0),
    level: z.number().min(1),
    streak: z.number().min(0),
    longest_streak: z.number().min(0),
    selected_subject_id: z.string().optional()
  }).optional()
});

export const prerender = false;

export const POST: APIRoute = async (context) => {
  try {
    const { request, locals } = context;
    const db = new DatabaseService(locals.runtime.env.DB);
    
    // Check authentication
    const user = getUserFromContext(context);
    if (!user) {
      return new Response(JSON.stringify({
        error: 'Authentication required'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Parse and validate request body
    const body = await request.json().catch(() => ({}));
    const validation = SyncDataSchema.safeParse(body);
    
    if (!validation.success) {
      return new Response(JSON.stringify({
        error: 'Validation failed',
        details: validation.error.errors
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = validation.data;
    const results = {
      resources: 0,
      sessions: 0,
      goals: 0,
      settings_updated: false
    };

    // Sync resources
    for (const resource of data.resources) {
      try {
        await db.createResource(user.userId, {
          ...resource,
          favorite: resource.favorite ? 1 : 0
        });
        results.resources++;
      } catch (error) {
        console.warn('Failed to sync resource:', resource.title, error);
      }
    }

    // Sync sessions  
    for (const session of data.sessions) {
      try {
        await db.createSession(user.userId, {
          started_at: session.started_at,
          duration_min: session.duration_min,
          subject: session.subject || null,
          resource_id: session.resource_id || null
        });
        results.sessions++;
      } catch (error) {
        console.warn('Failed to sync session:', error);
      }
    }

    // Sync goals
    for (const goal of data.goals) {
      try {
        await db.createGoal(user.userId, goal);
        results.goals++;
      } catch (error) {
        console.warn('Failed to sync goal:', goal.name, error);
      }
    }

    // Sync settings
    if (data.settings) {
      try {
        await db.updateSettings(user.userId, data.settings);
        results.settings_updated = true;
      } catch (error) {
        console.warn('Failed to sync settings:', error);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Data synced successfully',
      synced: results
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Sync error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};