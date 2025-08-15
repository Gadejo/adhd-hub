/**
 * POST /api/signup
 * User registration endpoint
 */

import type { APIRoute } from 'astro';
import { z } from 'zod';
import { DatabaseService } from '../../lib/db';
import { hashPassword, generateToken, setAuthCookie } from '../../lib/auth';

const SignupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

export const prerender = false;

export const POST: APIRoute = async ({ request, locals, cookies }) => {
  try {
    const db = new DatabaseService(locals.runtime.env.DB);
    
    // Parse request body
    const body = await request.json().catch(() => ({}));
    const validation = SignupSchema.safeParse(body);
    
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

    // Check if user already exists
    const existingUser = await db.getUserByEmail(email);
    if (existingUser) {
      return new Response(JSON.stringify({
        error: 'User already exists with this email'
      }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password);
    const user = await db.createUser(email, passwordHash);

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
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Signup error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};