/**
 * /api/resources
 * CRUD endpoints for resources
 */

import type { APIRoute } from 'astro';
import { z } from 'zod';
import { DatabaseService } from '../../lib/db';
import { getUserFromContext } from '../../lib/auth';

const CreateResourceSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  url: z.string().url('Invalid URL'),
  subject: z.string().min(1, 'Subject is required'),
  type: z.enum(['video', 'article', 'book', 'course', 'podcast', 'other']),
  priority: z.number().min(1).max(5),
  notes: z.string().default(''),
  favorite: z.boolean().default(false),
  status: z.enum(['new', 'learning', 'reviewing', 'done']).default('new'),
  next_review_date: z.number().nullable().optional(),
  interval_days: z.number().nullable().optional()
});

const UpdateResourceSchema = CreateResourceSchema.partial();

export const prerender = false;

// GET /api/resources - Get all resources for authenticated user
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

    // Get user's resources
    const resources = await db.getResourcesByUserId(user.userId);

    return new Response(JSON.stringify({
      resources: resources.map(resource => ({
        ...resource,
        favorite: Boolean(resource.favorite)
      }))
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Get resources error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// POST /api/resources - Create new resource
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
    const validation = CreateResourceSchema.safeParse(body);
    
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

    // Create resource
    const resource = await db.createResource(user.userId, {
      ...data,
      favorite: data.favorite ? 1 : 0
    });

    return new Response(JSON.stringify({
      resource: {
        ...resource,
        favorite: Boolean(resource.favorite)
      }
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Create resource error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// PUT /api/resources?id=123 - Update resource
export const PUT: APIRoute = async (context) => {
  try {
    const { request, locals, url } = context;
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

    // Get resource ID from query params
    const resourceId = url.searchParams.get('id');
    if (!resourceId) {
      return new Response(JSON.stringify({
        error: 'Resource ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Parse and validate request body
    const body = await request.json().catch(() => ({}));
    const validation = UpdateResourceSchema.safeParse(body);
    
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

    // Update resource
    const resource = await db.updateResource(resourceId, user.userId, {
      ...data,
      favorite: data.favorite !== undefined ? (data.favorite ? 1 : 0) : undefined
    });

    if (!resource) {
      return new Response(JSON.stringify({
        error: 'Resource not found or not authorized'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      resource: {
        ...resource,
        favorite: Boolean(resource.favorite)
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Update resource error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// DELETE /api/resources?id=123 - Delete resource
export const DELETE: APIRoute = async (context) => {
  try {
    const { locals, url } = context;
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

    // Get resource ID from query params
    const resourceId = url.searchParams.get('id');
    if (!resourceId) {
      return new Response(JSON.stringify({
        error: 'Resource ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Delete resource
    const deleted = await db.deleteResource(resourceId, user.userId);

    if (!deleted) {
      return new Response(JSON.stringify({
        error: 'Resource not found or not authorized'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Resource deleted successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Delete resource error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};