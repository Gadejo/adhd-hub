/**
 * /api/settings
 * CRUD endpoints for user settings
 */

import type { APIRoute } from 'astro';
import { z } from 'zod';
import { DatabaseService } from '../../lib/db';
import { getUserFromContext } from '../../lib/auth';

const UpdateSettingsSchema = z.object({
  theme: z.enum(['dark', 'light']).optional(),
  xp: z.number().min(0).optional(),
  level: z.number().min(1).optional(),
  streak: z.number().min(0).optional(),
  longest_streak: z.number().min(0).optional(),
  selected_subject_id: z.string().optional()
});

export const prerender = false;

// GET /api/settings - Get user settings
export const GET: APIRoute = async (context) => {
  try {
    const { locals } = context;
    const db = new DatabaseService(locals.runtime.env.DB);
    
    // Check authentication
    const user = await getUserFromContext(context);
    if (!user) {
      return new Response(JSON.stringify({
        error: 'Authentication required'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get user's settings
    const settings = await db.getSettingsByUserId(user.userId);

    if (!settings) {
      return new Response(JSON.stringify({
        error: 'Settings not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      settings
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Get settings error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// PUT /api/settings - Update user settings
export const PUT: APIRoute = async (context) => {
  try {
    const { request, locals } = context;
    const db = new DatabaseService(locals.runtime.env.DB);
    
    // Check authentication
    const user = await getUserFromContext(context);
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
    const validation = UpdateSettingsSchema.safeParse(body);
    
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

    // Update settings
    const settings = await db.updateSettings(user.userId, data);

    if (!settings) {
      return new Response(JSON.stringify({
        error: 'Settings not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      settings
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Update settings error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
