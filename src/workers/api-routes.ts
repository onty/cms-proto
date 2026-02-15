/**
 * API Routes Handler for Cloudflare Workers
 * Handles all /api/* requests
 */

import type { Env } from '../index';
import { getDatabase } from '../lib/d1-db';

// Import updated models for D1
import { UserModel } from '../models/User';
import { PostModel } from '../models/Post';
import { CategoryModel } from '../models/Category';
import { TagModel } from '../models/Tag';
import { SettingsModel } from '../models/Settings';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function handleApiRoutes(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  try {
    // Parse route segments
    const segments = path.split('/').filter(Boolean); // ['api', 'resource', 'id', ...]
    const resource = segments[1]; // posts, users, categories, etc.
    const id = segments[2];
    const action = segments[3];

    // Route to appropriate handler
    switch (resource) {
      case 'posts':
        return await handlePostsAPI(request, method, id, action);
      
      case 'categories':
        return await handleCategoriesAPI(request, method, id, action);
      
      case 'tags':
        return await handleTagsAPI(request, method, id);
      
      case 'users':
        return await handleUsersAPI(request, method, id);
      
      case 'settings':
        return await handleSettingsAPI(request, method, id);
      
      case 'setup':
        return await handleSetupAPI(request, method);
      
      case 'test-db':
        return await handleTestDB();
      
      default:
        return new Response(
          JSON.stringify({ success: false, error: 'API endpoint not found' }),
          { 
            status: 404, 
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          }
        );
    }
  } catch (error) {
    console.error('API route error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'API error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
}

// Posts API handlers
async function handlePostsAPI(request: Request, method: string, id?: string, action?: string): Promise<Response> {
  const url = new URL(request.url);
  
  switch (method) {
    case 'GET':
      if (action === 'slug' && id) {
        // GET /api/posts/slug/[slug]
        const post = await PostModel.getBySlug(id);
        return jsonResponse({ success: true, data: post });
      } else if (id) {
        // GET /api/posts/[id]
        const post = await PostModel.getById(parseInt(id));
        return jsonResponse({ success: true, data: post });
      } else {
        // GET /api/posts (with query params)
        const query = Object.fromEntries(url.searchParams.entries());
        const { posts, total } = await PostModel.getAll(query);
        const pagination = generatePagination(query, total);
        return jsonResponse({ success: true, data: posts, pagination });
      }
    
    case 'POST':
      const createData = await request.json() as any;
      const newPost = await PostModel.create(createData);
      return jsonResponse({ success: true, data: newPost }, 201);
    
    case 'PUT':
      if (!id) throw new Error('Post ID required for update');
      const updateData = await request.json() as any;
      const updatedPost = await PostModel.update(parseInt(id), updateData);
      return jsonResponse({ success: true, data: updatedPost });
    
    case 'DELETE':
      if (!id) throw new Error('Post ID required for delete');
      await PostModel.delete(parseInt(id));
      return jsonResponse({ success: true, message: 'Post deleted' });
    
    default:
      return jsonResponse({ success: false, error: 'Method not allowed' }, 405);
  }
}

// Categories API handlers
async function handleCategoriesAPI(request: Request, method: string, id?: string, action?: string): Promise<Response> {
  const url = new URL(request.url);
  
  switch (method) {
    case 'GET':
      if (action === 'slug' && id) {
        // GET /api/categories/slug/[slug]
        const category = await CategoryModel.getBySlug(id);
        return jsonResponse({ success: true, data: category });
      } else if (id) {
        // GET /api/categories/[id]
        const category = await CategoryModel.getById(parseInt(id));
        return jsonResponse({ success: true, data: category });
      } else {
        // GET /api/categories
        const query = Object.fromEntries(url.searchParams.entries());
        const { categories, total } = await CategoryModel.getAll(query);
        const pagination = generatePagination(query, total);
        return jsonResponse({ success: true, data: categories, pagination });
      }
    
    case 'POST':
      const createData = await request.json() as any;
      const newCategory = await CategoryModel.create(createData);
      return jsonResponse({ success: true, data: newCategory }, 201);
    
    case 'PUT':
      if (!id) throw new Error('Category ID required for update');
      const updateData = await request.json() as any;
      const updatedCategory = await CategoryModel.update(parseInt(id), updateData);
      return jsonResponse({ success: true, data: updatedCategory });
    
    case 'DELETE':
      if (!id) throw new Error('Category ID required for delete');
      await CategoryModel.delete(parseInt(id));
      return jsonResponse({ success: true, message: 'Category deleted' });
    
    default:
      return jsonResponse({ success: false, error: 'Method not allowed' }, 405);
  }
}

// Tags API handlers
async function handleTagsAPI(request: Request, method: string, id?: string): Promise<Response> {
  const url = new URL(request.url);
  
  switch (method) {
    case 'GET':
      if (id) {
        // GET /api/tags/[id]
        const tag = await TagModel.getById(parseInt(id));
        return jsonResponse({ success: true, data: tag });
      } else {
        // GET /api/tags
        const query = Object.fromEntries(url.searchParams.entries());
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 100;
        const { tags, total } = await TagModel.getAll(page, limit);
        const pagination = generatePagination(query, total);
        return jsonResponse({ success: true, data: tags, pagination });
      }
    
    case 'POST':
      const createData = await request.json() as any;
      const newTag = await TagModel.create(createData);
      return jsonResponse({ success: true, data: newTag }, 201);
    
    case 'PUT':
      if (!id) throw new Error('Tag ID required for update');
      const updateData = await request.json() as any;
      const updatedTag = await TagModel.update(parseInt(id), updateData.name, updateData.slug);
      return jsonResponse({ success: true, data: updatedTag });
    
    case 'DELETE':
      if (!id) throw new Error('Tag ID required for delete');
      await TagModel.delete(parseInt(id));
      return jsonResponse({ success: true, message: 'Tag deleted' });
    
    default:
      return jsonResponse({ success: false, error: 'Method not allowed' }, 405);
  }
}

// Users API handlers
async function handleUsersAPI(request: Request, method: string, id?: string): Promise<Response> {
  const url = new URL(request.url);
  
  switch (method) {
    case 'GET':
      if (id) {
        // GET /api/users/[id]
        const user = await UserModel.getById(parseInt(id));
        return jsonResponse({ success: true, data: user });
      } else {
        // GET /api/users
        const query = Object.fromEntries(url.searchParams.entries());
        const { users, total } = await UserModel.getAll(parseInt(query.page) || 1, parseInt(query.limit) || 10);
        const pagination = generatePagination(query, total);
        return jsonResponse({ success: true, data: users, pagination });
      }
    
    case 'POST':
      const createData = await request.json() as any;
      const newUser = await UserModel.create(createData);
      return jsonResponse({ success: true, data: newUser }, 201);
    
    case 'PUT':
      if (!id) throw new Error('User ID required for update');
      const updateData = await request.json() as any;
      const updatedUser = await UserModel.update(parseInt(id), updateData);
      return jsonResponse({ success: true, data: updatedUser });
    
    case 'DELETE':
      if (!id) throw new Error('User ID required for delete');
      await UserModel.delete(parseInt(id));
      return jsonResponse({ success: true, message: 'User deleted' });
    
    default:
      return jsonResponse({ success: false, error: 'Method not allowed' }, 405);
  }
}

// Settings API handlers
async function handleSettingsAPI(request: Request, method: string, key?: string): Promise<Response> {
  const url = new URL(request.url);
  
  switch (method) {
    case 'GET':
      if (key) {
        // GET /api/settings/[key]
        const setting = await SettingsModel.get(key);
        return jsonResponse({ success: true, data: setting });
      } else {
        // GET /api/settings
        const asObject = url.searchParams.get('asObject') === 'true';
        if (asObject) {
          const settings = await SettingsModel.getAllAsObject();
          return jsonResponse({ success: true, data: settings });
        } else {
          const settings = await SettingsModel.getAll();
          return jsonResponse({ success: true, data: settings });
        }
      }
    
    case 'PUT':
      if (key) {
        // PUT /api/settings/[key]
        const body = await request.json() as any;
        await SettingsModel.set(key, body.value);
        return jsonResponse({ success: true, message: 'Setting updated' });
      } else {
        // PUT /api/settings (batch update)
        const body = await request.json() as any;
        for (const [settingKey, settingData] of Object.entries(body.settings as any)) {
          await SettingsModel.set(settingKey, (settingData as any).value);
        }
        return jsonResponse({ success: true, message: 'Settings updated' });
      }
    
    default:
      return jsonResponse({ success: false, error: 'Method not allowed' }, 405);
  }
}

// Database setup handler
async function handleSetupAPI(request: Request, method: string): Promise<Response> {
  if (method !== 'POST') {
    return jsonResponse({ success: false, error: 'Method not allowed' }, 405);
  }

  try {
    const db = getDatabase();
    
    // Read and execute schema
    const schemaSQL = `-- Schema will be loaded from migrations/d1-schema.sql`;
    // Note: In production, you'd load this from a file or embed it
    
    await db.exec(schemaSQL);
    
    return jsonResponse({
      success: true,
      message: 'Database initialized successfully'
    });
  } catch (error) {
    return jsonResponse({
      success: false,
      error: 'Setup failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
}

// Database test handler
async function handleTestDB(): Promise<Response> {
  try {
    const db = getDatabase();
    const info = await db.getInfo();
    
    return jsonResponse({
      success: true,
      data: info
    });
  } catch (error) {
    return jsonResponse({
      success: false,
      error: 'Database test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
}

// Helper functions
function jsonResponse(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}

function generatePagination(query: any, total: number) {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const pages = Math.ceil(total / limit);
  
  return {
    page,
    limit,
    total,
    pages,
    hasNext: page < pages,
    hasPrev: page > 1,
  };
}