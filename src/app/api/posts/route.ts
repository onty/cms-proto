import { NextRequest } from 'next/server';
import { PostModel } from '@/models';
import { 
  successResponse, 
  errorResponse, 
  paginatedResponse,
  handleDatabaseError,
  validateRequiredFields,
  parseQueryParams,
  generateSlug,
  sanitizeHtml
} from '@/lib/api-utils';
import { CreatePostData, PostQuery } from '@/types';

/**
 * GET /api/posts - Get all posts with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit, search, sort, order } = parseQueryParams(searchParams);
    
    const query: PostQuery = {
      page,
      limit,
      search,
      sort: sort as any,
      order
    };

    // Additional filters
    const status = searchParams.get('status');
    const categoryId = searchParams.get('category_id');
    const authorId = searchParams.get('author_id');
    const tagId = searchParams.get('tag_id');

    if (status) query.status = status as any;
    if (categoryId) query.category_id = parseInt(categoryId);
    if (authorId) query.author_id = parseInt(authorId);
    if (tagId) query.tag_id = parseInt(tagId);

    const { posts, total } = await PostModel.getAll(query);
    return paginatedResponse(posts, page, limit, total);
  } catch (error) {
    return handleDatabaseError(error);
  }
}

/**
 * POST /api/posts - Create a new post
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const validationError = validateRequiredFields(body, ['title', 'content', 'author_id']);
    if (validationError) {
      return errorResponse(validationError);
    }

    // Generate slug if not provided
    if (!body.slug) {
      body.slug = generateSlug(body.title);
    }

    // Ensure unique slug
    body.slug = await PostModel.ensureUniqueSlug(body.slug);

    // Sanitize content (basic sanitization)
    if (body.content) {
      body.content = sanitizeHtml(body.content);
    }
    if (body.excerpt) {
      body.excerpt = sanitizeHtml(body.excerpt);
    }

    // Validate author_id is a number
    if (isNaN(parseInt(body.author_id))) {
      return errorResponse('author_id must be a valid number');
    }

    // Validate category_id if provided
    if (body.category_id && isNaN(parseInt(body.category_id))) {
      return errorResponse('category_id must be a valid number');
    }

    const postData: CreatePostData = {
      title: body.title,
      slug: body.slug,
      excerpt: body.excerpt,
      content: body.content,
      status: body.status || 'draft',
      featured_image: body.featured_image,
      author_id: parseInt(body.author_id),
      category_id: body.category_id ? parseInt(body.category_id) : undefined,
      published_at: body.published_at,
      seo_title: body.seo_title,
      seo_description: body.seo_description,
      tag_ids: body.tag_ids || []
    };

    const post = await PostModel.create(postData);
    return successResponse(post, 'Post created successfully');
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      return errorResponse('A post with this slug already exists');
    }
    return handleDatabaseError(error);
  }
}