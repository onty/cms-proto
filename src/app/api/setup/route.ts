import { NextRequest } from 'next/server';
import { successResponse, errorResponse, handleDatabaseError } from '@/lib/api-utils';
import { setupDatabase, resetDatabase } from '@/lib/setup-database';

/**
 * POST /api/setup - Initialize or reset the database
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action = 'setup' } = body;

    let result: boolean;
    let message: string;

    switch (action) {
      case 'setup':
        result = await setupDatabase();
        message = result 
          ? 'Database setup completed successfully' 
          : 'Database setup failed';
        break;
        
      case 'reset':
        result = await resetDatabase();
        message = result 
          ? 'Database reset and reinitialized successfully' 
          : 'Database reset failed';
        break;
        
      default:
        return errorResponse('Invalid action. Use "setup" or "reset".');
    }

    if (result) {
      return successResponse({ initialized: true }, message);
    } else {
      return errorResponse(message, 500);
    }
  } catch (error) {
    return handleDatabaseError(error);
  }
}

/**
 * GET /api/setup - Check database status
 */
export async function GET() {
  try {
    const Database = (await import('@/lib/db')).default;
    const isConnected = await Database.testConnection();
    
    if (!isConnected) {
      return successResponse({
        connected: false,
        initialized: false,
        message: 'Cannot connect to database'
      });
    }

    // Check if tables exist by trying to count users
    try {
      await Database.queryOne('SELECT COUNT(*) as count FROM users LIMIT 1');
      return successResponse({
        connected: true,
        initialized: true,
        message: 'Database is connected and initialized'
      });
    } catch (error: any) {
      if (error.code === 'ER_NO_SUCH_TABLE') {
        return successResponse({
          connected: true,
          initialized: false,
          message: 'Database connected but not initialized'
        });
      }
      throw error;
    }
  } catch (error) {
    return handleDatabaseError(error);
  }
}