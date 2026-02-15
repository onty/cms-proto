/**
 * Authentication Routes Handler for Cloudflare Workers
 * Handles all /api/auth/* requests
 */

import type { Env } from '../index';
import { UserModel } from '../models/User';
import { verifyPassword } from '../lib/password-hasher';
import { SettingsModel } from '../models/Settings';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// JWT secret for Workers (in production, use wrangler secrets)
const JWT_SECRET = 'your-jwt-secret-key-change-in-production';

export async function handleAuthRoutes(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  try {
    // Route to appropriate auth handler
    if (path === '/api/auth/login' && method === 'POST') {
      return await handleLogin(request);
    }
    
    if (path === '/api/auth/register' && method === 'POST') {
      return await handleRegister(request);
    }
    
    if (path === '/api/auth/logout' && method === 'POST') {
      return await handleLogout(request);
    }
    
    if (path === '/api/auth/user' && method === 'GET') {
      return await handleGetCurrentUser(request);
    }
    
    if (path === '/api/auth/refresh' && method === 'POST') {
      return await handleRefreshToken(request);
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Auth endpoint not found' }),
      { 
        status: 404, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  } catch (error) {
    console.error('Auth route error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Authentication error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
}

async function handleLogin(request: Request): Promise<Response> {
  try {
    const body = await request.json() as any;
    const { email, password } = body;

    if (!email || !password) {
      return jsonResponse({
        success: false,
        error: 'Email and password are required'
      }, 400);
    }

    // Find user by email
    const user = await UserModel.getByEmail(email);
    if (!user) {
      return jsonResponse({
        success: false,
        error: 'Invalid email or password'
      }, 401);
    }

    // Check if user is active
    if (!user.is_active) {
      return jsonResponse({
        success: false,
        error: 'Account is inactive'
      }, 401);
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return jsonResponse({
        success: false,
        error: 'Invalid email or password'
      }, 401);
    }

    // Update last login
    await UserModel.updateLastLogin(user.id);

    // Generate JWT token
    const token = await generateJWT({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    // Remove password from response
    const { password_hash, ...userResponse } = user;

    return jsonResponse({
      success: true,
      data: userResponse,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    return jsonResponse({
      success: false,
      error: 'Login failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
}

async function handleRegister(request: Request): Promise<Response> {
  try {
    // Check if registration is enabled
    const registrationSetting = await SettingsModel.get('allow_registration');
    const isRegistrationEnabled = registrationSetting?.value === 'true';

    if (!isRegistrationEnabled) {
      return jsonResponse({
        success: false,
        error: 'Registration is currently disabled'
      }, 403);
    }

    const body = await request.json() as any;
    const { name, email, password, role = 'author', avatar_url, is_active = true } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return jsonResponse({
        success: false,
        error: 'Name, email, and password are required'
      }, 400);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return jsonResponse({
        success: false,
        error: 'Invalid email format'
      }, 400);
    }

    // Validate password strength
    if (password.length < 6) {
      return jsonResponse({
        success: false,
        error: 'Password must be at least 6 characters long'
      }, 400);
    }

    // Check if user already exists
    const existingUser = await UserModel.getByEmail(email);
    if (existingUser) {
      return jsonResponse({
        success: false,
        error: 'User with this email already exists'
      }, 409);
    }

    // Create new user
    const user = await UserModel.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: password,
      role: role as 'admin' | 'editor' | 'author',
      avatar_url: avatar_url || undefined,
      is_active: is_active
    });

    // Remove password from response
    const { password_hash, ...userResponse } = user;

    return jsonResponse({
      success: true,
      message: 'User registered successfully',
      data: userResponse
    }, 201);

  } catch (error) {
    console.error('Registration error:', error);
    return jsonResponse({
      success: false,
      error: 'Registration failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
}

async function handleLogout(request: Request): Promise<Response> {
  // In a stateless JWT system, logout is handled client-side
  // In the future, you might want to implement token blacklisting
  return jsonResponse({
    success: true,
    message: 'Logged out successfully'
  });
}

async function handleGetCurrentUser(request: Request): Promise<Response> {
  try {
    const user = await getCurrentUser(request);
    
    if (!user) {
      return jsonResponse({
        success: false,
        error: 'Not authenticated'
      }, 401);
    }

    // Remove password from response
    const { password_hash, ...userResponse } = user;

    return jsonResponse({
      success: true,
      data: userResponse
    });

  } catch (error) {
    console.error('Get current user error:', error);
    return jsonResponse({
      success: false,
      error: 'Failed to get user information'
    }, 500);
  }
}

async function handleRefreshToken(request: Request): Promise<Response> {
  try {
    const user = await getCurrentUser(request);
    
    if (!user) {
      return jsonResponse({
        success: false,
        error: 'Invalid token'
      }, 401);
    }

    // Generate new JWT token
    const token = await generateJWT({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    // Remove password from response
    const { password_hash, ...userResponse } = user;

    return jsonResponse({
      success: true,
      data: userResponse,
      token
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    return jsonResponse({
      success: false,
      error: 'Token refresh failed'
    }, 401);
  }
}

// Helper functions
async function getCurrentUser(request: Request): Promise<any | null> {
  try {
    const authorization = request.headers.get('Authorization');
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return null;
    }

    const token = authorization.substring(7);
    const payload = await verifyJWT(token);
    
    if (!payload || !payload.userId) {
      return null;
    }

    const user = await UserModel.getById(payload.userId);
    return user;

  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

// Simple JWT implementation for Workers
async function generateJWT(payload: any): Promise<string> {
  // In production, use a proper JWT library or Workers' Web Crypto API
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const claims = btoa(JSON.stringify({ 
    ...payload, 
    exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  }));
  
  const signature = await sign(`${header}.${claims}`, JWT_SECRET);
  return `${header}.${claims}.${signature}`;
}

async function verifyJWT(token: string): Promise<any | null> {
  try {
    const [header, payload, signature] = token.split('.');
    
    // Verify signature
    const expectedSignature = await sign(`${header}.${payload}`, JWT_SECRET);
    if (signature !== expectedSignature) {
      return null;
    }

    const claims = JSON.parse(atob(payload));
    
    // Check expiration
    if (claims.exp < Date.now()) {
      return null;
    }

    return claims;
  } catch (error) {
    console.error('JWT verify error:', error);
    return null;
  }
}

async function sign(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

function jsonResponse(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}