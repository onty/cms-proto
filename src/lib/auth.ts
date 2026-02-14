import { UserModel } from '@/models/User';
import { AuthUser, LoginCredentials } from '@/types';

/**
 * Basic authentication utilities
 * This can be easily migrated to Cloudflare Workers later
 */

export class AuthService {
  /**
   * Authenticate user with email and password
   */
  static async login(credentials: LoginCredentials): Promise<AuthUser | null> {
    try {
      const user = await UserModel.getByEmailWithPassword(credentials.email);
      
      if (!user) {
        return null;
      }

      const isPasswordValid = await UserModel.verifyPassword(credentials.password, user.password_hash);
      
      if (!isPasswordValid) {
        return null;
      }

      // Update last login
      await UserModel.updateLastLogin(user.id);

      // Return user without password hash
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar_url: user.avatar_url
      };
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  }

  /**
   * Get user by ID
   */
  static async getUser(userId: number): Promise<AuthUser | null> {
    try {
      const user = await UserModel.getById(userId);
      
      if (!user) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar_url: user.avatar_url
      };
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }

  /**
   * Check if user has required role
   */
  static hasRole(user: AuthUser, requiredRole: 'admin' | 'editor' | 'author'): boolean {
    const roleHierarchy = {
      'admin': 3,
      'editor': 2,
      'author': 1
    };

    return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
  }

  /**
   * Check if user can access admin features
   */
  static canAccessAdmin(user: AuthUser): boolean {
    return ['admin', 'editor', 'author'].includes(user.role);
  }

  /**
   * Check if user can manage users
   */
  static canManageUsers(user: AuthUser): boolean {
    return user.role === 'admin';
  }

  /**
   * Check if user can edit post
   */
  static canEditPost(user: AuthUser, postAuthorId: number): boolean {
    // Admins can edit any post, others can only edit their own
    return user.role === 'admin' || user.id === postAuthorId;
  }

  /**
   * Check if user can delete post
   */
  static canDeletePost(user: AuthUser, postAuthorId: number): boolean {
    // Only admins or the post author can delete posts
    return user.role === 'admin' || user.id === postAuthorId;
  }

  /**
   * Check if user can manage categories and tags
   */
  static canManageCategories(user: AuthUser): boolean {
    return ['admin', 'editor'].includes(user.role);
  }
}

/**
 * Simple JWT-like token for session management
 * In production, use proper JWT or session management
 */
export class TokenService {
  private static SECRET = process.env.NEXTAUTH_SECRET || 'your-secret-key-here';

  /**
   * Create a simple session token
   */
  static createToken(user: AuthUser): string {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      iat: Date.now()
    };

    // Simple base64 encoding - in production use proper JWT
    return Buffer.from(JSON.stringify(payload)).toString('base64');
  }

  /**
   * Verify and decode token
   */
  static verifyToken(token: string): { userId: number; email: string; role: string } | null {
    try {
      const payload = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
      
      // Check if token is not too old (24 hours)
      if (Date.now() - payload.iat > 24 * 60 * 60 * 1000) {
        return null;
      }

      return {
        userId: payload.userId,
        email: payload.email,
        role: payload.role
      };
    } catch (error) {
      return null;
    }
  }
}