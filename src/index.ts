/**
 * Cloudflare Workers Entry Point for CMS Prototype
 * Handles all HTTP requests and routing for the CMS
 */

import { getDatabase } from './lib/d1-db';

// Import route handlers
import { handleAuthRoutes } from './workers/auth-routes';
import { handleApiRoutes } from './workers/api-routes';
import { handleStaticRoutes } from './workers/static-routes';
import { handleAdminRoutes } from './workers/admin-routes';

export interface Env {
  DB: D1Database;
  ENVIRONMENT?: string;
}

// Extend global types for D1
declare global {
  const DB: D1Database;
}

// CORS headers for API responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Make D1 database available globally
    (globalThis as any).DB = env.DB;

    const url = new URL(request.url);
    const path = url.pathname;

    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    try {
      // Test database connection on first request
      const db = getDatabase();
      
      // Route handling
      if (path.startsWith('/api/auth/')) {
        return await handleAuthRoutes(request, env);
      }
      
      if (path.startsWith('/api/')) {
        return await handleApiRoutes(request, env);
      }
      
      if (path.startsWith('/admin/')) {
        return await handleAdminRoutes(request, env);
      }
      
      // Handle static routes (blog, categories, about, etc.)
      return await handleStaticRoutes(request, env);

    } catch (error) {
      console.error('Worker error:', error);
      
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error'
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }
  },

  // Scheduled event handler (for cron jobs, etc.)
  async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    // Example: cleanup sessions, update view counts, etc.
    console.log('Scheduled event triggered:', controller.scheduledTime);
  },
};