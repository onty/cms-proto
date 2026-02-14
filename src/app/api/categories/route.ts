import { NextRequest } from 'next/server';
import { CategoryModel } from '@/models';
import { 
  successResponse, 
  errorResponse, 
  paginatedResponse,
  handleDatabaseError,
  validateRequiredFields,
  parseQueryParams,
  generateSlug
} from '@/lib/api-utils';
import { CreateCategoryData, CategoryQuery } from '@/types';

/**
 * GET /api/categories - Get all categories with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit, sort, order } = parseQueryParams(searchParams);
    
    const query: CategoryQuery = {
      page,
      limit,
      sort: sort as any || 'sort_order',
      order
    };

    // Additional filters
    const parentId = searchParams.get('parent_id');
    const tree = searchParams.get('tree') === 'true';

    if (parentId !== null) {
      query.parent_id = parentId === 'null' ? undefined : parseInt(parentId);
    }

    // If tree is requested, get hierarchical structure
    if (tree) {
      const categories = await CategoryModel.getTree();
      return successResponse(categories);
    }

    const { categories, total } = await CategoryModel.getAll(query);
    return paginatedResponse(categories, page, limit, total);
  } catch (error) {
    return handleDatabaseError(error);
  }
}

/**
 * POST /api/categories - Create a new category
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const validationError = validateRequiredFields(body, ['name']);
    if (validationError) {
      return errorResponse(validationError);
    }

    // Generate slug if not provided
    if (!body.slug) {
      body.slug = generateSlug(body.name);
    }

    // Ensure unique slug
    body.slug = await CategoryModel.ensureUniqueSlug(body.slug);

    // Validate parent_id if provided
    if (body.parent_id && isNaN(parseInt(body.parent_id))) {
      return errorResponse('parent_id must be a valid number');
    }

    const categoryData: CreateCategoryData = {
      name: body.name,
      slug: body.slug,
      description: body.description,
      color: body.color || '#3b82f6',
      parent_id: body.parent_id ? parseInt(body.parent_id) : undefined,
      sort_order: body.sort_order || 0
    };

    const category = await CategoryModel.create(categoryData);
    return successResponse(category, 'Category created successfully');
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      return errorResponse('A category with this slug already exists');
    }
    return handleDatabaseError(error);
  }
}