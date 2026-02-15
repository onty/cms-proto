import { Database } from '@/lib/database-adapter';
import { User, CreateUserData, UpdateUserData } from '@/types';
import { hashPassword, verifyPassword } from '@/lib/password-hasher';

export class UserModel {
  /**
   * Get all users with pagination
   */
  static async getAll(page: number = 1, limit: number = 10): Promise<{ users: User[], total: number }> {
    const offset = (page - 1) * limit;
    
    const users = await Database.query<User>(
      `SELECT id, email, name, role, avatar_url, created_at, updated_at, last_login, is_active 
       FROM users 
       WHERE is_active = TRUE 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const totalResult = await Database.queryOne<{ count: number }>(
      'SELECT COUNT(*) as count FROM users WHERE is_active = TRUE'
    );
    const total = totalResult?.count || 0;

    return { users, total };
  }

  /**
   * Get user by ID
   */
  static async getById(id: number): Promise<User | null> {
    return await Database.queryOne<User>(
      `SELECT id, email, name, role, avatar_url, created_at, updated_at, last_login, is_active 
       FROM users 
       WHERE id = ? AND is_active = TRUE`,
      [id]
    );
  }

  /**
   * Get user by email (includes password hash for authentication)
   */
  static async getByEmail(email: string): Promise<(User & { password_hash: string }) | null> {
    return await Database.queryOne<User & { password_hash: string }>(
      `SELECT id, email, name, role, avatar_url, password_hash, created_at, updated_at, last_login, is_active 
       FROM users 
       WHERE email = ? AND is_active = TRUE`,
      [email]
    );
  }

  /**
   * Get user by email with password hash (for authentication)
   * @deprecated Use getByEmail instead - it now includes password_hash by default
   */
  static async getByEmailWithPassword(email: string): Promise<(User & { password_hash: string }) | null> {
    return await this.getByEmail(email);
  }

  /**
   * Create a new user
   */
  static async create(userData: CreateUserData): Promise<User> {
    // Hash the password using universal hasher
    const password_hash = await hashPassword(userData.password);

    const userId = await Database.insert(
      `INSERT INTO users (email, name, password_hash, role, avatar_url, is_active) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userData.email,
        userData.name,
        password_hash,
        userData.role || 'author',
        userData.avatar_url || null,
        userData.is_active !== undefined ? userData.is_active : true
      ]
    );

    const user = await this.getById(userId);
    if (!user) {
      throw new Error('Failed to create user');
    }
    return user;
  }

  /**
   * Update user
   */
  static async update(id: number, userData: UpdateUserData): Promise<User | null> {
    const updates: string[] = [];
    const values: any[] = [];

    if (userData.email !== undefined) {
      updates.push('email = ?');
      values.push(userData.email);
    }
    if (userData.name !== undefined) {
      updates.push('name = ?');
      values.push(userData.name);
    }
    if (userData.password !== undefined) {
      const password_hash = await hashPassword(userData.password);
      updates.push('password_hash = ?');
      values.push(password_hash);
    }
    if (userData.role !== undefined) {
      updates.push('role = ?');
      values.push(userData.role);
    }
    if (userData.avatar_url !== undefined) {
      updates.push('avatar_url = ?');
      values.push(userData.avatar_url);
    }
    if (userData.is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(userData.is_active);
    }

    if (updates.length === 0) {
      return await this.getById(id);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await Database.update(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    return await this.getById(id);
  }

  /**
   * Update last login timestamp
   */
  static async updateLastLogin(id: number): Promise<void> {
    await Database.update(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );
  }

  /**
   * Soft delete user (set is_active to false)
   */
  static async delete(id: number): Promise<boolean> {
    const affectedRows = await Database.update(
      'UPDATE users SET is_active = FALSE WHERE id = ?',
      [id]
    );
    return affectedRows > 0;
  }

  /**
   * Hard delete user (permanently remove from database)
   * USE WITH CAUTION - This will also delete all associated posts
   */
  static async hardDelete(id: number): Promise<boolean> {
    const affectedRows = await Database.delete(
      'DELETE FROM users WHERE id = ?',
      [id]
    );
    return affectedRows > 0;
  }

  /**
   * Check if email already exists
   */
  static async emailExists(email: string, excludeId?: number): Promise<boolean> {
    const query = excludeId 
      ? 'SELECT COUNT(*) as count FROM users WHERE email = ? AND id != ? AND is_active = TRUE'
      : 'SELECT COUNT(*) as count FROM users WHERE email = ? AND is_active = TRUE';
    
    const params = excludeId ? [email, excludeId] : [email];
    const result = await Database.queryOne<{ count: number }>(query, params);
    return (result?.count || 0) > 0;
  }

  /**
   * Verify password
   */
  static async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await verifyPassword(plainPassword, hashedPassword);
  }

  /**
   * Get users by role
   */
  static async getByRole(role: 'admin' | 'editor' | 'author'): Promise<User[]> {
    return await Database.query<User>(
      `SELECT id, email, name, role, avatar_url, created_at, updated_at, last_login, is_active 
       FROM users 
       WHERE role = ? AND is_active = TRUE 
       ORDER BY name ASC`,
      [role]
    );
  }
}