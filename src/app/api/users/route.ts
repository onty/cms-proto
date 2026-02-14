import { NextRequest } from 'next/server';
import { UserModel } from '@/models';
import { 
  successResponse, 
  errorResponse, 
  paginatedResponse,
  handleDatabaseError,
  validateRequiredFields,
  parseQueryParams,
  isValidEmail
} from '@/lib/api-utils';
import { CreateUserData } from '@/types';

/**
 * GET /api/users - Get all users with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit } = parseQueryParams(searchParams);
    
    const role = searchParams.get('role');
    
    // Get users by role
    if (role && ['admin', 'editor', 'author'].includes(role)) {
      const users = await UserModel.getByRole(role as any);
      return successResponse(users);
    }

    // Get all users with pagination
    const { users, total } = await UserModel.getAll(page, limit);
    return paginatedResponse(users, page, limit, total);
  } catch (error) {
    return handleDatabaseError(error);
  }
}

/**
 * POST /api/users - Create a new user
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const validationError = validateRequiredFields(body, ['email', 'name', 'password']);
    if (validationError) {
      return errorResponse(validationError);
    }

    // Validate email format
    if (!isValidEmail(body.email)) {
      return errorResponse('Invalid email format');
    }

    // Validate password length
    if (body.password.length < 6) {
      return errorResponse('Password must be at least 6 characters long');
    }

    // Check if email already exists
    const emailExists = await UserModel.emailExists(body.email);
    if (emailExists) {
      return errorResponse('A user with this email already exists');
    }

    // Validate role
    if (body.role && !['admin', 'editor', 'author'].includes(body.role)) {
      return errorResponse('Invalid role. Must be admin, editor, or author');
    }

    const userData: CreateUserData = {
      email: body.email,
      name: body.name,
      password: body.password,
      role: body.role || 'author',
      avatar_url: body.avatar_url
    };

    const user = await UserModel.create(userData);
    return successResponse(user, 'User created successfully');
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      return errorResponse('A user with this email already exists');
    }
    return handleDatabaseError(error);
  }
}