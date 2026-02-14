import { NextRequest } from 'next/server';
import { AuthService, TokenService } from '@/lib/auth';
import { errorResponse } from '@/lib/api-utils';

/**
 * Auth middleware for protecting API routes
 */
export async function withAuth(
  request: NextRequest,
  requiredRole?: 'admin' | 'editor' | 'author'
) {
  try {
    // Get token from cookie or Authorization header
    let token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      const authHeader = request.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return { error: errorResponse('Authentication required', 401) };
    }

    // Verify token
    const tokenData = TokenService.verifyToken(token);
    
    if (!tokenData) {
      return { error: errorResponse('Invalid or expired token', 401) };
    }

    // Get user data
    const user = await AuthService.getUser(tokenData.userId);
    
    if (!user) {
      return { error: errorResponse('User not found', 401) };
    }

    // Check role if required
    if (requiredRole && !AuthService.hasRole(user, requiredRole)) {
      return { error: errorResponse('Insufficient permissions', 403) };
    }

    return { user };
  } catch (error) {
    console.error('Auth middleware error:', error);
    return { error: errorResponse('Authentication error', 500) };
  }
}

/**
 * Higher-order function to wrap API route handlers with auth
 */
export function requireAuth(
  handler: (request: NextRequest, context: any, user: any) => Promise<Response>,
  requiredRole?: 'admin' | 'editor' | 'author'
) {
  return async (request: NextRequest, context: any) => {
    const authResult = await withAuth(request, requiredRole);
    
    if (authResult.error) {
      return authResult.error;
    }

    return handler(request, context, authResult.user);
  };
}

/**
 * Check if request has valid auth (for optional auth)
 */
export async function getAuthUser(request: NextRequest) {
  const authResult = await withAuth(request);
  return authResult.user || null;
}