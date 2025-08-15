/**
 * Authentication utilities for ADHD Hub
 * Handles JWT tokens, password hashing, and user authentication
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import type { APIContext } from 'astro';

// JWT secret - in production, this should come from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

export interface User {
  id: string;
  email: string;
  created_at: number;
}

export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Verify a password against its hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

/**
 * Generate a JWT token for a user
 */
export function generateToken(user: User): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

/**
 * Get user from JWT token in cookies
 */
export function getUserFromContext(context: APIContext): JWTPayload | null {
  const token = context.cookies.get('auth-token')?.value;
  
  if (!token) {
    return null;
  }
  
  return verifyToken(token);
}

/**
 * Set authentication cookie
 */
export function setAuthCookie(context: APIContext, token: string): void {
  context.cookies.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/'
  });
}

/**
 * Clear authentication cookie
 */
export function clearAuthCookie(context: APIContext): void {
  context.cookies.delete('auth-token', {
    path: '/'
  });
}

/**
 * Middleware to require authentication
 */
export function requireAuth(context: APIContext): JWTPayload | Response {
  const user = getUserFromContext(context);
  
  if (!user) {
    return new Response(JSON.stringify({ error: 'Authentication required' }), {
      status: 401,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
  
  return user;
}