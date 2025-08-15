/**
 * /api/goals
 * CRUD endpoints for goals
 */

import type { APIRoute } from 'astro';
import { z } from 'zod';
import { DatabaseService } from '../../lib/db';
import { getUserFromContext } from '../../lib/auth';

const CreateGoalSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  subject: z.string().min(1, 'Subject is required'),
  due_date: z.number().int().positive('Due date must be a valid timestamp'),
  progress_pct: z.number().min(0).max(100).default(0),
  status: z.enum(['active', 'completed', 'paused', 'cancelled']).default('active')
});

const UpdateGoalSchema = CreateGoalSchema.partial();

export const prerender = false;

// GET /api/goals - Get all goals for authenticated user
export const GET: APIRoute = async (context) => {
  try {
    const { locals } = context;
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

    // Get user's goals
    const goals = await db.getGoalsByUserId(user.userId);

    return new Response(JSON.stringify({
      goals
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Get goals error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// POST /api/goals - Create new goal
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
    const validation = CreateGoalSchema.safeParse(body);
    
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

    // Create goal
    const goal = await db.createGoal(user.userId, data);

    return new Response(JSON.stringify({
      goal
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Create goal error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// PUT /api/goals?id=123 - Update goal
export const PUT: APIRoute = async (context) => {
  try {
    const { request, locals, url } = context;
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

    // Get goal ID from query params
    const goalId = url.searchParams.get('id');
    if (!goalId) {
      return new Response(JSON.stringify({
        error: 'Goal ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Parse and validate request body
    const body = await request.json().catch(() => ({}));
    const validation = UpdateGoalSchema.safeParse(body);
    
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

    // Update goal
    const goal = await db.updateGoal(goalId, user.userId, data);

    if (!goal) {
      return new Response(JSON.stringify({
        error: 'Goal not found or not authorized'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      goal
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Update goal error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// DELETE /api/goals?id=123 - Delete goal
export const DELETE: APIRoute = async (context) => {
  try {
    const { locals, url } = context;
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

    // Get goal ID from query params
    const goalId = url.searchParams.get('id');
    if (!goalId) {
      return new Response(JSON.stringify({
        error: 'Goal ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Delete goal
    const deleted = await db.deleteGoal(goalId, user.userId);

    if (!deleted) {
      return new Response(JSON.stringify({
        error: 'Goal not found or not authorized'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Goal deleted successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Delete goal error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};