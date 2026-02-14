import { NextRequest } from 'next/server';
import Database from '@/lib/db';
import { UserModel, SettingsModel, CategoryModel, TagModel } from '@/models';
import { successResponse, errorResponse } from '@/lib/api-utils';

/**
 * GET /api/debug-db - Debug database queries to identify issues
 */
export async function GET(request: NextRequest) {
  const results: any = {};
  
  try {
    // Test basic connection
    results.connection = await Database.testConnection();
    
    // Test table structure
    results.tables = await Database.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE()
    `);
    
    // Test each model one by one to identify which one is failing
    try {
      results.users = await UserModel.getAll(1, 1);
      results.usersStatus = 'OK';
    } catch (error: any) {
      results.usersError = error.message;
      results.usersStatus = 'FAILED';
    }
    
    try {
      results.categories = await CategoryModel.getAll({ page: 1, limit: 1 });
      results.categoriesStatus = 'OK';
    } catch (error: any) {
      results.categoriesError = error.message;
      results.categoriesStatus = 'FAILED';
    }
    
    try {
      results.tags = await TagModel.getAll(1, 1);
      results.tagsStatus = 'OK';
    } catch (error: any) {
      results.tagsError = error.message;
      results.tagsStatus = 'FAILED';
    }
    
    try {
      results.settings = await SettingsModel.getAll();
      results.settingsStatus = 'OK';
    } catch (error: any) {
      results.settingsError = error.message;
      results.settingsStatus = 'FAILED';
    }
    
    // Test specific problematic queries
    try {
      results.settingsQuery = await Database.query('SELECT `key`, `value`, `type` FROM settings LIMIT 1');
      results.settingsQueryStatus = 'OK';
    } catch (error: any) {
      results.settingsQueryError = error.message;
      results.settingsQueryStatus = 'FAILED';
    }
    
    return successResponse(results);
  } catch (error: any) {
    return errorResponse(`Debug failed: ${error.message}`, 500);
  }
}