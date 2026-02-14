import { NextRequest } from 'next/server';
import { UserModel } from '@/models';
import { 
  successResponse, 
  errorResponse, 
  handleDatabaseError,
  isValidEmail
} from '@/lib/api-utils';
import { UpdateUserData } from '@/types';

/**
 * GET /api/users/[id] - Get a specific user by ID
 */
export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    if (isNaN(id)) {
      return errorResponse('Invalid user ID');
    }

    const user = await UserModel.getById(id);
    
    if (!user) {
      return errorResponse('User not found', 404);
    }

    return successResponse(user);
  } catch (error) {
    return handleDatabaseError(error);
  }
}

/**
 * PUT /api/users/[id] - Update a specific user
 */
export async function PUT(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    const body = await request.json();
    
    if (isNaN(id)) {
      return errorResponse('Invalid user ID');
    }

    // Check if user exists
    const existingUser = await UserModel.getById(id);
    if (!existingUser) {
      return errorResponse('User not found', 404);
    }

    // Validate email format if provided
    if (body.email && !isValidEmail(body.email)) {
      return errorResponse('Invalid email format');
    }

    // Check if email already exists (excluding current user)
    if (body.email) {
      const emailExists = await UserModel.emailExists(body.email, id);
      if (emailExists) {
        return errorResponse('A user with this email already exists');
      }
    }

    // Validate password length if provided
    if (body.password && body.password.length < 6) {
      return errorResponse('Password must be at least 6 characters long');
    }

    // Validate role if provided
    if (body.role && !['admin', 'editor', 'author'].includes(body.role)) {
      return errorResponse('Invalid role. Must be admin, editor, or author');
    }

    const updateData: UpdateUserData = {
      email: body.email,
      name: body.name,
      password: body.password,
      role: body.role,
      avatar_url: body.avatar_url,
      is_active: body.is_active
    };

    const user = await UserModel.update(id, updateData);
    
    if (!user) {
      return errorResponse('Failed to update user', 500);
    }

    return successResponse(user, 'User updated successfully');
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      return errorResponse('A user with this email already exists');
    }
    return handleDatabaseError(error);
  }
}

/**
 * DELETE /api/users/[id] - Delete (deactivate) a specific user
 */
export async function DELETE(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    const { searchParams } = new URL(request.url);
    const hard = searchParams.get('hard') === 'true';
    
    if (isNaN(id)) {
      return errorResponse('Invalid user ID');
    }

    // Check if user exists
    const existingUser = await UserModel.getById(id);
    if (!existingUser) {
      return errorResponse('User not found', 404);
    }

    let deleted: boolean;
    if (hard) {
      // Hard delete - permanently remove from database
      deleted = await UserModel.hardDelete(id);
    } else {
      // Soft delete - deactivate user
      deleted = await UserModel.delete(id);
    }
    
    if (!deleted) {
      return errorResponse('Failed to delete user', 500);
    }

    const message = hard ? 'User permanently deleted' : 'User deactivated successfully';
    return successResponse({ deleted: true }, message);
  } catch (error) {
    return handleDatabaseError(error);
  }
}