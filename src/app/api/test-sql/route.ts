import { NextRequest } from 'next/server';
import Database from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api-utils';

/**
 * GET /api/test-sql - Test basic SQL queries
 */
export async function GET(request: NextRequest) {
  try {
    const tests: any = {};
    
    // Test 1: Basic SELECT
    tests.basicSelect = await Database.query('SELECT 1 as test');
    
    // Test 2: Show tables
    tests.showTables = await Database.query('SHOW TABLES');
    
    // Test 3: Describe settings table
    try {
      tests.settingsStructure = await Database.query('DESCRIBE settings');
    } catch (error: any) {
      tests.settingsStructureError = error.message;
    }
    
    // Test 4: Simple settings query without reserved words
    try {
      tests.settingsCount = await Database.query('SELECT COUNT(*) as count FROM settings');
    } catch (error: any) {
      tests.settingsCountError = error.message;
    }
    
    // Test 5: Settings query with backticks
    try {
      tests.settingsBackticks = await Database.query('SELECT `key`, `value` FROM settings LIMIT 1');
    } catch (error: any) {
      tests.settingsBackticksError = error.message;
    }
    
    // Test 6: Users query
    try {
      tests.usersCount = await Database.query('SELECT COUNT(*) as count FROM users');
    } catch (error: any) {
      tests.usersCountError = error.message;
    }
    
    // Test 7: Test prepared statements with parameters
    try {
      tests.preparedStatement = await Database.query('SELECT * FROM users WHERE id = ? LIMIT 1', [1]);
    } catch (error: any) {
      tests.preparedStatementError = error.message;
    }
    
    return successResponse(tests);
  } catch (error: any) {
    return errorResponse(`SQL test failed: ${error.message}`, 500);
  }
}