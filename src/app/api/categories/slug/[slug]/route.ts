import { NextRequest, NextResponse } from 'next/server';
import { CategoryModel } from '@/models/Category';
import { 
  successResponse, 
  errorResponse, 
  handleDatabaseError 
} from '@/lib/api-utils';

/**
 * GET /api/categories/slug/[slug] - Get category by slug
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return errorResponse('Category slug is required', 400);
    }

    const category = await CategoryModel.getBySlug(slug);
    
    if (!category) {
      return errorResponse('Category not found', 404);
    }

    return successResponse(category, 'Category retrieved successfully');
  } catch (error) {
    return handleDatabaseError(error);
  }
}