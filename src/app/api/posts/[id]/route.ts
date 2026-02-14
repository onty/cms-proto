import { NextRequest } from 'next/server';
import { PostModel } from '@/models';
import { 
  successResponse, 
  errorResponse, 
  handleDatabaseError,
  generateSlug,
  sanitizeHtml
} from '@/lib/api-utils';
import { UpdatePostData } from '@/types';

/**
 * GET /api/posts/[id] - Get a specific post by ID
 */
export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    if (isNaN(id)) {
      return errorResponse('Invalid post ID');
    }

    const post = await PostModel.getById(id);
    
    if (!post) {
      return errorResponse('Post not found', 404);
    }

    return successResponse(post);
  } catch (error) {
    return handleDatabaseError(error);
  }
}

/**
 * PUT /api/posts/[id] - Update a specific post
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
      return errorResponse('Invalid post ID');
    }

    // Check if post exists
    const existingPost = await PostModel.getById(id);
    if (!existingPost) {
      return errorResponse('Post not found', 404);
    }

    // Generate slug if title is being updated but slug is not provided
    if (body.title && !body.slug) {
      body.slug = generateSlug(body.title);
    }

    // Ensure unique slug if slug is being updated
    if (body.slug) {
      body.slug = await PostModel.ensureUniqueSlug(body.slug, id);
    }

    // Sanitize content
    if (body.content) {
      body.content = sanitizeHtml(body.content);
    }
    if (body.excerpt) {
      body.excerpt = sanitizeHtml(body.excerpt);
    }

    // Validate numeric fields
    if (body.category_id !== undefined && body.category_id !== null && isNaN(parseInt(body.category_id))) {
      return errorResponse('category_id must be a valid number');
    }

    const updateData: UpdatePostData = {
      title: body.title,
      slug: body.slug,
      excerpt: body.excerpt,
      content: body.content,
      status: body.status,
      featured_image: body.featured_image,
      category_id: body.category_id ? parseInt(body.category_id) : undefined,
      published_at: body.published_at,
      seo_title: body.seo_title,
      seo_description: body.seo_description,
      tag_ids: body.tag_ids
    };

    const post = await PostModel.update(id, updateData);
    
    if (!post) {
      return errorResponse('Failed to update post', 500);
    }

    return successResponse(post, 'Post updated successfully');
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      return errorResponse('A post with this slug already exists');
    }
    return handleDatabaseError(error);
  }
}

/**
 * DELETE /api/posts/[id] - Delete a specific post
 */
export async function DELETE(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    if (isNaN(id)) {
      return errorResponse('Invalid post ID');
    }

    // Check if post exists
    const existingPost = await PostModel.getById(id);
    if (!existingPost) {
      return errorResponse('Post not found', 404);
    }

    const deleted = await PostModel.delete(id);
    
    if (!deleted) {
      return errorResponse('Failed to delete post', 500);
    }

    return successResponse({ deleted: true }, 'Post deleted successfully');
  } catch (error) {
    return handleDatabaseError(error);
  }
}