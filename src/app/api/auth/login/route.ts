import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { AuthService, TokenService } from '@/lib/auth';
import { 
  successResponse, 
  errorResponse, 
  handleDatabaseError,
  validateRequiredFields,
  isValidEmail
} from '@/lib/api-utils';
import { LoginCredentials } from '@/types';

/**
 * POST /api/auth/login - Authenticate user
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const validationError = validateRequiredFields(body, ['email', 'password']);
    if (validationError) {
      return errorResponse(validationError);
    }

    // Validate email format
    if (!isValidEmail(body.email)) {
      return errorResponse('Invalid email format');
    }

    const credentials: LoginCredentials = {
      email: body.email.toLowerCase().trim(),
      password: body.password
    };

    // Authenticate user
    const user = await AuthService.login(credentials);
    
    if (!user) {
      return errorResponse('Invalid email or password', 401);
    }

    // Create session token
    const token = TokenService.createToken(user);
    
    // Set HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/'
    });

    return successResponse(user, 'Login successful');
  } catch (error) {
    return handleDatabaseError(error);
  }
}