import { NextRequest } from 'next/server';
import { TagModel } from '@/models';
import { 
  successResponse, 
  errorResponse, 
  paginatedResponse,
  handleDatabaseError,
  validateRequiredFields,
  parseQueryParams,
  generateSlug
} from '@/lib/api-utils';
import { CreateTagData } from '@/types';

/**
 * GET /api/tags - Get all tags with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit, search } = parseQueryParams(searchParams);
    
    const popular = searchParams.get('popular') === 'true';
    const postId = searchParams.get('post_id');
    
    // Get tags for a specific post
    if (postId) {
      const tags = await TagModel.getByPostId(parseInt(postId));
      return successResponse(tags);
    }
    
    // Get popular tags
    if (popular) {
      const popularLimit = Math.min(50, limit);
      const tags = await TagModel.getPopular(popularLimit);
      return successResponse(tags);
    }
    
    // Search tags
    if (search) {
      const tags = await TagModel.search(search, limit);
      return successResponse(tags);
    }

    // Get all tags with pagination
    const { tags, total } = await TagModel.getAll(page, limit);
    return paginatedResponse(tags, page, limit, total);
  } catch (error) {
    return handleDatabaseError(error);
  }
}

/**
 * POST /api/tags - Create a new tag or multiple tags
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Handle bulk creation from names
    if (body.names && Array.isArray(body.names)) {
      const tags = await TagModel.findOrCreateMany(body.names);
      return successResponse(tags, 'Tags created successfully');
    }
    
    // Single tag creation
    const validationError = validateRequiredFields(body, ['name']);
    if (validationError) {
      return errorResponse(validationError);
    }

    // Generate slug if not provided
    if (!body.slug) {
      body.slug = generateSlug(body.name);
    }

    // Ensure unique slug
    body.slug = await TagModel.ensureUniqueSlug(body.slug);

    const tagData: CreateTagData = {
      name: body.name,
      slug: body.slug
    };

    const tag = await TagModel.create(tagData);
    return successResponse(tag, 'Tag created successfully');
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      return errorResponse('A tag with this slug already exists');
    }
    return handleDatabaseError(error);
  }
}

/**
 * DELETE /api/tags - Bulk operations
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    if (action === 'cleanup') {
      // Delete unused tags
      const deletedCount = await TagModel.deleteUnused();
      return successResponse(
        { deleted: deletedCount }, 
        `Deleted ${deletedCount} unused tags`
      );
    }
    
    return errorResponse('Invalid action. Use action=cleanup');
  } catch (error) {
    return handleDatabaseError(error);
  }
}