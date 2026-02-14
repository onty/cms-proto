import { NextResponse } from 'next/server';
import { ApiResponse, PaginatedResponse } from '@/types';

/**
 * Create a standardized success response
 */
export function successResponse<T>(data: T, message?: string): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    message
  });
}

/**
 * Create a standardized error response
 */
export function errorResponse(error: string, status: number = 400): NextResponse<ApiResponse<null>> {
  return NextResponse.json({
    success: false,
    error,
    data: null
  }, { status });
}

/**
 * Create a paginated response
 */
export function paginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
): NextResponse<PaginatedResponse<T>> {
  const pages = Math.ceil(total / limit);
  
  return NextResponse.json({
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      pages,
      hasNext: page < pages,
      hasPrev: page > 1
    }
  });
}

/**
 * Handle database connection errors
 */
export function handleDatabaseError(error: any): NextResponse<ApiResponse<null>> {
  console.error('Database error:', error);
  
  if (error.code === 'ER_NO_SUCH_TABLE') {
    return errorResponse(
      'Database not initialized. Please run the setup first.',
      503
    );
  }
  
  if (error.code === 'ECONNREFUSED') {
    return errorResponse(
      'Cannot connect to database. Please check your database configuration.',
      503
    );
  }
  
  return errorResponse(
    'Internal server error. Please try again later.',
    500
  );
}

/**
 * Validate required fields in request body
 */
export function validateRequiredFields(
  body: any, 
  requiredFields: string[]
): string | null {
  for (const field of requiredFields) {
    if (!body || body[field] === undefined || body[field] === null || body[field] === '') {
      return `Missing required field: ${field}`;
    }
  }
  return null;
}

/**
 * Parse query parameters
 */
export function parseQueryParams(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')));
  const search = searchParams.get('search') || undefined;
  const sort = searchParams.get('sort') || undefined;
  const order = (searchParams.get('order') || 'desc').toLowerCase() as 'asc' | 'desc';
  
  return { page, limit, search, sort, order };
}

/**
 * Sanitize HTML content (basic implementation)
 */
export function sanitizeHtml(html: string): string {
  // This is a basic implementation. In production, use a proper HTML sanitizer like DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '');
}

/**
 * Generate slug from text
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Extract pagination info from request
 */
export function extractPaginationFromUrl(url: string) {
  const urlObj = new URL(url);
  return parseQueryParams(urlObj.searchParams);
}