import { NextRequest } from 'next/server';
import { CategoryModel } from '@/models';
import { 
  successResponse, 
  errorResponse, 
  handleDatabaseError,
  generateSlug
} from '@/lib/api-utils';
import { UpdateCategoryData } from '@/types';

/**
 * GET /api/categories/[id] - Get a specific category by ID
 */
export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    if (isNaN(id)) {
      return errorResponse('Invalid category ID');
    }

    const category = await CategoryModel.getById(id);
    
    if (!category) {
      return errorResponse('Category not found', 404);
    }

    // Get children if requested
    const { searchParams } = new URL(request.url);
    if (searchParams.get('include_children') === 'true') {
      category.children = await CategoryModel.getChildren(id);
    }

    return successResponse(category);
  } catch (error) {
    return handleDatabaseError(error);
  }
}

/**
 * PUT /api/categories/[id] - Update a specific category
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
      return errorResponse('Invalid category ID');
    }

    // Check if category exists
    const existingCategory = await CategoryModel.getById(id);
    if (!existingCategory) {
      return errorResponse('Category not found', 404);
    }

    // Generate slug if name is being updated but slug is not provided
    if (body.name && !body.slug) {
      body.slug = generateSlug(body.name);
    }

    // Ensure unique slug if slug is being updated
    if (body.slug) {
      body.slug = await CategoryModel.ensureUniqueSlug(body.slug, id);
    }

    // Validate parent_id if provided
    if (body.parent_id !== undefined && body.parent_id !== null && isNaN(parseInt(body.parent_id))) {
      return errorResponse('parent_id must be a valid number');
    }

    // Prevent setting self as parent
    if (body.parent_id && parseInt(body.parent_id) === id) {
      return errorResponse('Category cannot be its own parent');
    }

    const updateData: UpdateCategoryData = {
      name: body.name,
      slug: body.slug,
      description: body.description,
      color: body.color,
      parent_id: body.parent_id ? parseInt(body.parent_id) : undefined,
      sort_order: body.sort_order
    };

    const category = await CategoryModel.update(id, updateData);
    
    if (!category) {
      return errorResponse('Failed to update category', 500);
    }

    return successResponse(category, 'Category updated successfully');
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      return errorResponse('A category with this slug already exists');
    }
    return handleDatabaseError(error);
  }
}

/**
 * DELETE /api/categories/[id] - Delete a specific category
 */
export async function DELETE(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    if (isNaN(id)) {
      return errorResponse('Invalid category ID');
    }

    // Check if category exists
    const existingCategory = await CategoryModel.getById(id);
    if (!existingCategory) {
      return errorResponse('Category not found', 404);
    }

    const deleted = await CategoryModel.delete(id);
    
    if (!deleted) {
      return errorResponse('Failed to delete category', 500);
    }

    return successResponse({ deleted: true }, 'Category deleted successfully');
  } catch (error) {
    return handleDatabaseError(error);
  }
}