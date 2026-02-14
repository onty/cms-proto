import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { successResponse } from '@/lib/api-utils';

/**
 * POST /api/auth/logout - Logout user
 */
export async function POST(request: NextRequest) {
  try {
    // Clear the auth cookie
    const cookieStore = await cookies();
    cookieStore.delete('auth-token');

    return successResponse(null, 'Logout successful');
  } catch (error) {
    // Even if there's an error, we still want to clear the cookie
    const cookieStore = await cookies();
    cookieStore.delete('auth-token');
    
    return successResponse(null, 'Logout completed');
  }
}