/**
 * /api/sessions
 * CRUD endpoints for study sessions
 */

import type { APIRoute } from 'astro';
import { z } from 'zod';
import { DatabaseService } from '../../lib/db';
import { getUserFromContext } from '../../lib/auth';

const CreateSessionSchema = z.object({
  started_at: z.number().int().positive('Started at must be a valid timestamp'),
  duration_min: z.number().min(0, 'Duration must be non-negative'),
  subject: z.string().optional(),
  resource_id: z.string().optional()
});

export const prerender = false;

// GET /api/sessions - Get all sessions for authenticated user
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

    // Get user's sessions
    const sessions = await db.getSessionsByUserId(user.userId);

    return new Response(JSON.stringify({
      sessions
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Get sessions error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// POST /api/sessions - Create new session
export const POST: APIRoute = async (context) => {
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
    const validation = CreateSessionSchema.safeParse(body);
    
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

    // Create session
    const session = await db.createSession(user.userId, {
      started_at: data.started_at,
      duration_min: data.duration_min,
      subject: data.subject || null,
      resource_id: data.resource_id || null
    });

    return new Response(JSON.stringify({
      session
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Create session error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
