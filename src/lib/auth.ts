/**
 * Authentication utilities for ADHD Hub
 * Handles JWT tokens, password hashing, and user authentication
 * Uses Web-compatible APIs for Cloudflare Workers
 */

import { pbkdf2 } from '@noble/hashes/pbkdf2';
import { sha256 } from '@noble/hashes/sha256';
import * as jose from 'jose';
import type { APIContext } from 'astro';

// JWT secret - in production, this should come from environment variables
const getJWTSecret = (): string => {
  if (typeof process !== 'undefined' && process.env?.JWT_SECRET) {
    return process.env.JWT_SECRET;
  }
  // Fallback for Cloudflare Workers environment
  return 'your-super-secret-jwt-key-change-in-production';
};

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
 * Hash a password using PBKDF2 with SHA-256
 * Web-compatible alternative to bcryptjs
 */
export async function hashPassword(password: string): Promise<string> {
  // Generate random salt
  const salt = crypto.getRandomValues(new Uint8Array(16));
  
  // Hash password with PBKDF2
  const hash = pbkdf2(sha256, password, salt, { c: 100000, dkLen: 32 });
  
  // Combine salt and hash, then encode as base64
  const combined = new Uint8Array(salt.length + hash.length);
  combined.set(salt);
  combined.set(hash, salt.length);
  
  return btoa(String.fromCharCode(...combined));
}

/**
 * Verify a password against its hash
 * Web-compatible alternative to bcryptjs.compare
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    // Decode the base64 hash
    const combined = new Uint8Array(
      atob(hash).split('').map(c => c.charCodeAt(0))
    );
    
    // Extract salt (first 16 bytes) and stored hash (remaining bytes)
    const salt = combined.slice(0, 16);
    const storedHash = combined.slice(16);
    
    // Hash the provided password with the same salt
    const newHash = pbkdf2(sha256, password, salt, { c: 100000, dkLen: 32 });
    
    // Compare byte by byte
    if (storedHash.length !== newHash.length) {
      return false;
    }
    
    let result = 0;
    for (let i = 0; i < storedHash.length; i++) {
      result |= storedHash[i] ^ newHash[i];
    }
    
    return result === 0;
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

/**
 * Generate a JWT token for a user
 * Web-compatible alternative using jose library
 */
export async function generateToken(user: User): Promise<string> {
  const secret = new TextEncoder().encode(getJWTSecret());
  
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email
  };
  
  const jwt = await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(JWT_EXPIRES_IN)
    .setIssuedAt()
    .sign(secret);
    
  return jwt;
}

/**
 * Verify and decode a JWT token
 * Web-compatible alternative using jose library
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const secret = new TextEncoder().encode(getJWTSecret());
    const { payload } = await jose.jwtVerify(token, secret);
    
    return payload as JWTPayload;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

/**
 * Get user from JWT token in cookies
 */
export async function getUserFromContext(context: APIContext): Promise<JWTPayload | null> {
  const token = context.cookies.get('auth-token')?.value;
  
  if (!token) {
    return null;
  }
  
  return await verifyToken(token);
}

/**
 * Set authentication cookie
 */
export function setAuthCookie(context: APIContext, token: string): void {
  const isProduction = typeof process !== 'undefined' ? 
    process.env.NODE_ENV === 'production' : 
    false; // Default to false in Workers environment
    
  context.cookies.set('auth-token', token, {
    httpOnly: true,
    secure: isProduction,
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
export async function requireAuth(context: APIContext): Promise<JWTPayload | Response> {
  const user = await getUserFromContext(context);
  
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
