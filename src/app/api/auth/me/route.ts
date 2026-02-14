import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { AuthService, TokenService } from '@/lib/auth';
import { 
  successResponse, 
  errorResponse, 
  handleDatabaseError
} from '@/lib/api-utils';

/**
 * GET /api/auth/me - Get current authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // Get token from cookie
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return errorResponse('Not authenticated', 401);
    }

    // Verify token
    const tokenData = TokenService.verifyToken(token);
    
    if (!tokenData) {
      return errorResponse('Invalid or expired token', 401);
    }

    // Get user data
    const user = await AuthService.getUser(tokenData.userId);
    
    if (!user) {
      return errorResponse('User not found', 401);
    }

    return successResponse(user);
  } catch (error) {
    return handleDatabaseError(error);
  }
}