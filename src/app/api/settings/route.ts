import { NextRequest } from 'next/server';
import { SettingsModel } from '@/models';
import { 
  successResponse, 
  errorResponse, 
  handleDatabaseError,
  validateRequiredFields
} from '@/lib/api-utils';

/**
 * GET /api/settings - Get all settings or specific settings
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keys = searchParams.get('keys');
    const key = searchParams.get('key');
    const asObject = searchParams.get('asObject') === 'true';
    
    // Get specific setting by key
    if (key) {
      const setting = await SettingsModel.get(key);
      if (!setting) {
        return errorResponse('Setting not found', 404);
      }
      const value = await SettingsModel.getValue(key);
      return successResponse({ key, value, type: setting.type });
    }
    
    // Get multiple settings by keys
    if (keys) {
      const keyArray = keys.split(',').map(k => k.trim());
      const settings = await SettingsModel.getMany(keyArray);
      return successResponse(settings);
    }
    
    // Get all settings
    if (asObject) {
      const settings = await SettingsModel.getAllAsObject();
      return successResponse(settings);
    } else {
      const settings = await SettingsModel.getAll();
      return successResponse(settings);
    }
  } catch (error) {
    return handleDatabaseError(error);
  }
}

/**
 * POST /api/settings - Create or update settings
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Handle bulk update
    if (body.settings && typeof body.settings === 'object') {
      await SettingsModel.setMany(body.settings);
      return successResponse(null, 'Settings updated successfully');
    }
    
    // Handle single setting
    const validationError = validateRequiredFields(body, ['key', 'value']);
    if (validationError) {
      return errorResponse(validationError);
    }

    // Validate type
    const validTypes = ['string', 'number', 'boolean', 'json'];
    const type = body.type || 'string';
    if (!validTypes.includes(type)) {
      return errorResponse('Invalid type. Must be string, number, boolean, or json');
    }

    await SettingsModel.set(body.key, body.value, type, body.description);
    
    const setting = await SettingsModel.get(body.key);
    return successResponse(setting, 'Setting updated successfully');
  } catch (error) {
    return handleDatabaseError(error);
  }
}

/**
 * PUT /api/settings - Update multiple settings
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.settings || typeof body.settings !== 'object') {
      return errorResponse('Settings object is required');
    }

    await SettingsModel.setMany(body.settings);
    return successResponse(null, 'Settings updated successfully');
  } catch (error) {
    return handleDatabaseError(error);
  }
}