/**
 * Rate limiting utilities for Dubai Adventures
 * Prevents brute force attacks on auth endpoints
 */

import { NextRequest, NextResponse } from 'next/server';

interface RateLimitStore {
  [key: string]: {
    attempts: number;
    resetTime: number;
  };
}

// In-memory store (replace with Redis in production)
const store: RateLimitStore = {};

/**
 * Get client IP from request
 */
export const getClientIP = (req: NextRequest): string => {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';
  return ip;
};

/**
 * Check and enforce rate limit
 * Returns true if within limit, false if exceeded
 */
export const checkRateLimit = (
  identifier: string,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000 // 15 minutes default
): boolean => {
  const now = Date.now();
  const key = identifier;

  if (!store[key]) {
    store[key] = { attempts: 1, resetTime: now + windowMs };
    return true;
  }

  const record = store[key];

  // Reset if window has passed
  if (now > record.resetTime) {
    record.attempts = 1;
    record.resetTime = now + windowMs;
    return true;
  }

  // Increment attempt
  record.attempts++;

  // Check if exceeded
  return record.attempts <= maxAttempts;
};

/**
 * Get remaining attempts
 */
export const getRemainingAttempts = (
  identifier: string,
  maxAttempts: number = 5
): number => {
  const record = store[identifier];
  if (!record) return maxAttempts;

  if (Date.now() > record.resetTime) {
    return maxAttempts;
  }

  return Math.max(0, maxAttempts - record.attempts);
};

/**
 * Get reset time for identifier
 */
export const getResetTime = (identifier: string): number | null => {
  const record = store[identifier];
  if (!record) return null;

  if (Date.now() > record.resetTime) {
    return null;
  }

  return record.resetTime;
};

/**
 * Cleanup expired entries (call periodically)
 */
export const cleanupExpiredEntries = (): void => {
  const now = Date.now();
  Object.keys(store).forEach(key => {
    if (now > store[key].resetTime) {
      delete store[key];
    }
  });
};

/**
 * Rate limit middleware for API routes
 * Usage:
 * const response = checkRateLimitMiddleware(req);
 * if (response) return response;
 */
export const checkRateLimitMiddleware = (
  req: NextRequest,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000
): NextResponse | null => {
  const ip = getClientIP(req);

  if (!checkRateLimit(ip, maxAttempts, windowMs)) {
    const resetTime = getResetTime(ip);
    return NextResponse.json(
      {
        message: 'Too many requests. Please try again later.',
        retryAfter: resetTime ? Math.ceil((resetTime - Date.now()) / 1000) : 900,
      },
      {
        status: 429,
        headers: {
          'Retry-After': resetTime
            ? Math.ceil((resetTime - Date.now()) / 1000).toString()
            : '900',
        },
      }
    );
  }

  return null;
};

// Cleanup every 30 minutes
setInterval(cleanupExpiredEntries, 30 * 60 * 1000);
