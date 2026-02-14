import { NextRequest } from 'next/server';
import { TagModel } from '@/models';
import { 
  successResponse, 
  errorResponse, 
  handleDatabaseError,
  generateSlug
} from '@/lib/api-utils';

/**
 * GET /api/tags/[id] - Get a specific tag by ID
 */
export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    if (isNaN(id)) {
      return errorResponse('Invalid tag ID');
    }

    const tag = await TagModel.getById(id);
    
    if (!tag) {
      return errorResponse('Tag not found', 404);
    }

    return successResponse(tag);
  } catch (error) {
    return handleDatabaseError(error);
  }
}

/**
 * PUT /api/tags/[id] - Update a specific tag
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
      return errorResponse('Invalid tag ID');
    }

    // Check if tag exists
    const existingTag = await TagModel.getById(id);
    if (!existingTag) {
      return errorResponse('Tag not found', 404);
    }

    if (!body.name) {
      return errorResponse('Tag name is required');
    }

    // Generate slug if not provided
    let slug = body.slug;
    if (!slug) {
      slug = generateSlug(body.name);
    }

    // Ensure unique slug
    slug = await TagModel.ensureUniqueSlug(slug, id);

    const tag = await TagModel.update(id, body.name, slug);
    
    if (!tag) {
      return errorResponse('Failed to update tag', 500);
    }

    return successResponse(tag, 'Tag updated successfully');
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      return errorResponse('A tag with this slug already exists');
    }
    return handleDatabaseError(error);
  }
}

/**
 * DELETE /api/tags/[id] - Delete a specific tag
 */
export async function DELETE(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    if (isNaN(id)) {
      return errorResponse('Invalid tag ID');
    }

    // Check if tag exists
    const existingTag = await TagModel.getById(id);
    if (!existingTag) {
      return errorResponse('Tag not found', 404);
    }

    const deleted = await TagModel.delete(id);
    
    if (!deleted) {
      return errorResponse('Failed to delete tag', 500);
    }

    return successResponse({ deleted: true }, 'Tag deleted successfully');
  } catch (error) {
    return handleDatabaseError(error);
  }
}