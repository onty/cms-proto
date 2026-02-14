import mysql from 'mysql2/promise';

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'cms_prototype',
};

// Create connection pool for better performance
export const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Database utility functions
export class Database {
  // Execute a query with parameters
  static async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    try {
      // Use .query() instead of .execute() to avoid prepared statement issues with LIMIT/OFFSET
      const [results] = await pool.query(sql, params);
      return results as T[];
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  // Get a single record
  static async queryOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
    const results = await this.query<T>(sql, params);
    return results[0] || null;
  }

  // Insert and get the inserted ID
  static async insert(sql: string, params: any[] = []): Promise<number> {
    try {
      const [result] = await pool.query(sql, params) as any;
      return result.insertId;
    } catch (error) {
      console.error('Database insert error:', error);
      throw error;
    }
  }

  // Update and get affected rows
  static async update(sql: string, params: any[] = []): Promise<number> {
    try {
      const [result] = await pool.query(sql, params) as any;
      return result.affectedRows;
    } catch (error) {
      console.error('Database update error:', error);
      throw error;
    }
  }

  // Delete and get affected rows
  static async delete(sql: string, params: any[] = []): Promise<number> {
    try {
      const [result] = await pool.query(sql, params) as any;
      return result.affectedRows;
    } catch (error) {
      console.error('Database delete error:', error);
      throw error;
    }
  }

  // Test database connection
  static async testConnection(): Promise<boolean> {
    try {
      await this.query('SELECT 1');
      return true;
    } catch (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
  }
}

export default Database;