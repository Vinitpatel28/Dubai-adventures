/**
 * CORS middleware for Dubai Adventures
 * Allows admin dashboard to call main app API
 */

import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_ORIGINS = [
  'http://localhost:3001', // Local admin dashboard
  'http://localhost:3000', // Local main app
  'https://admin.dubaiadventures.com', // Production admin
  'https://www.dubaiadventures.com', // Production main app
];

/**
 * Add CORS headers to response
 */
export const addCORSHeaders = (
  response: NextResponse,
  requestOrigin: string | null
): NextResponse => {
  // Check if origin is allowed
  if (requestOrigin && ALLOWED_ORIGINS.includes(requestOrigin)) {
    response.headers.set('Access-Control-Allow-Origin', requestOrigin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Admin-Key'
    );
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Max-Age', '86400');
  }

  return response;
};

/**
 * Handle CORS preflight requests
 */
export const handleCORSPreflight = (req: NextRequest): NextResponse | null => {
  if (req.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 });
    return addCORSHeaders(response, req.headers.get('origin'));
  }
  return null;
};

/**
 * CORS middleware wrapper
 * Usage:
 * export async function GET(req: NextRequest) {
 *   const corsResponse = handleCORS(req);
 *   if (corsResponse) return corsResponse;
 *   // ... rest of handler
 * }
 */
export const handleCORS = (req: NextRequest): NextResponse | null => {
  return handleCORSPreflight(req);
};

/**
 * Apply CORS to response
 * Usage:
 * const response = NextResponse.json({ data });
 * return applyCORS(response, req);
 */
export const applyCORS = (
  response: NextResponse,
  req: NextRequest
): NextResponse => {
  return addCORSHeaders(response, req.headers.get('origin'));
};
