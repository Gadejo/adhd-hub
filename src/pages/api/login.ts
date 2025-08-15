/**
 * POST /api/login
 * User login endpoint
 */

import type { APIRoute } from 'astro';
import { z } from 'zod';
import { DatabaseService } from '../../lib/db';
import { verifyPassword, generateToken } from '../../lib/auth';

const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export const prerender = false;

export const POST: APIRoute = async ({ request, locals, cookies }) => {
  try {
    const db = new DatabaseService(locals.runtime.env.DB);
    
    // Parse request body
    const body = await request.json().catch(() => ({}));
    const validation = LoginSchema.safeParse(body);
    
    if (!validation.success) {
      return new Response(JSON.stringify({
        error: 'Validation failed',
        details: validation.error.errors
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { email, password } = validation.data;

    // Find user by email
    const user = await db.getUserByEmail(email);
    if (!user) {
      return new Response(JSON.stringify({
        error: 'Invalid email or password'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.pw_hash);
    if (!isValidPassword) {
      return new Response(JSON.stringify({
        error: 'Invalid email or password'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generate JWT token
    const token = generateToken(user);

    // Set HTTP-only cookie
    cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });

    return new Response(JSON.stringify({
      success: true,
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
    console.error('Login error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};