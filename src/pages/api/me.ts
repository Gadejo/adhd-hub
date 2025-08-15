/**
 * GET /api/me
 * Get current authenticated user info
 */

import type { APIRoute } from 'astro';
import { DatabaseService } from '../../lib/db';
import { getUserFromContext } from '../../lib/auth';

export const prerender = false;

export const GET: APIRoute = async (context) => {
  try {
    const { locals } = context;
    const db = new DatabaseService(locals.runtime.env.DB);
    
    // Get user from JWT token
    const jwtPayload = getUserFromContext(context);
    if (!jwtPayload) {
      return new Response(JSON.stringify({
        error: 'Not authenticated'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get user from database
    const user = await db.getUserById(jwtPayload.userId);
    if (!user) {
      return new Response(JSON.stringify({
        error: 'User not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Get user error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};