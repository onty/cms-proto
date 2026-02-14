import { NextRequest } from 'next/server';
import Database from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api-utils';

/**
 * GET /api/test-db - Test database connection and basic queries
 */
export async function GET(request: NextRequest) {
  try {
    // Test basic connection
    const isConnected = await Database.testConnection();
    if (!isConnected) {
      return errorResponse('Database connection failed', 503);
    }

    // Test basic query
    const result = await Database.query('SELECT 1 as test');
    
    // Test if tables exist
    const tables = await Database.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE()
    `);

    return successResponse({
      connected: true,
      testQuery: result,
      tables: tables.map((t: any) => t.table_name || t.TABLE_NAME),
      message: 'Database connection successful'
    });
  } catch (error: any) {
    return errorResponse(`Database error: ${error.message}`, 503);
  }
}