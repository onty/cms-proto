import { NextRequest } from 'next/server';
import { SettingsModel } from '@/models';
import { 
  successResponse, 
  errorResponse, 
  handleDatabaseError
} from '@/lib/api-utils';

/**
 * GET /api/settings/[key] - Get a specific setting by key
 */
export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params;
    const setting = await SettingsModel.get(key);
    
    if (!setting) {
      return errorResponse('Setting not found', 404);
    }

    const value = await SettingsModel.getValue(key);
    return successResponse({ 
      ...setting, 
      value 
    });
  } catch (error) {
    return handleDatabaseError(error);
  }
}

/**
 * PUT /api/settings/[key] - Update a specific setting
 */
export async function PUT(
  request: NextRequest, 
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params;
    const body = await request.json();
    
    if (body.value === undefined) {
      return errorResponse('Value is required');
    }

    // Validate type
    const validTypes = ['string', 'number', 'boolean', 'json'];
    const type = body.type || 'string';
    if (!validTypes.includes(type)) {
      return errorResponse('Invalid type. Must be string, number, boolean, or json');
    }

    await SettingsModel.set(key, body.value, type, body.description);
    
    const setting = await SettingsModel.get(key);
    return successResponse(setting, 'Setting updated successfully');
  } catch (error) {
    return handleDatabaseError(error);
  }
}

/**
 * DELETE /api/settings/[key] - Delete a specific setting
 */
export async function DELETE(
  request: NextRequest, 
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params;
    // Check if setting exists
    const existingSetting = await SettingsModel.get(key);
    if (!existingSetting) {
      return errorResponse('Setting not found', 404);
    }

    const deleted = await SettingsModel.delete(key);
    
    if (!deleted) {
      return errorResponse('Failed to delete setting', 500);
    }

    return successResponse({ deleted: true }, 'Setting deleted successfully');
  } catch (error) {
    return handleDatabaseError(error);
  }
}