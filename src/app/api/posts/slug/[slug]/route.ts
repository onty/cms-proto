import { NextRequest } from 'next/server';
import { PostModel } from '@/models';
import { 
  successResponse, 
  errorResponse, 
  handleDatabaseError
} from '@/lib/api-utils';

/**
 * GET /api/posts/slug/[slug] - Get a post by slug and optionally increment view count
 */
export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const incrementViews = searchParams.get('incrementViews') === 'true';
    
    const post = await PostModel.getBySlug(slug);
    
    if (!post) {
      return errorResponse('Post not found', 404);
    }

    // Only show published posts to public (unless specifically requesting drafts)
    const showDrafts = searchParams.get('showDrafts') === 'true';
    if (!showDrafts && post.status !== 'published') {
      return errorResponse('Post not found', 404);
    }

    // Increment view count if requested
    if (incrementViews && post.status === 'published') {
      await PostModel.incrementViewCount(post.id);
      post.view_count += 1; // Update the returned data
    }

    return successResponse(post);
  } catch (error) {
    return handleDatabaseError(error);
  }
}

/**
 * POST /api/posts/slug/[slug]/views - Increment view count for a post
 */
export async function POST(
  request: NextRequest, 
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const post = await PostModel.getBySlug(slug);
    
    if (!post) {
      return errorResponse('Post not found', 404);
    }

    // Only increment for published posts
    if (post.status !== 'published') {
      return errorResponse('Cannot increment views for unpublished post');
    }

    await PostModel.incrementViewCount(post.id);
    
    return successResponse({ 
      view_count: post.view_count + 1 
    }, 'View count updated');
  } catch (error) {
    return handleDatabaseError(error);
  }
}