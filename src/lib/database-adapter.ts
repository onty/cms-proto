/**
 * Universal Database Adapter
 * Works with both MySQL (Next.js) and D1 (Cloudflare Workers)
 */

// Dynamic imports to avoid bundling issues

export interface DatabaseInterface {
  query<T = any>(sql: string, params?: any[]): Promise<T[]>;
  queryOne<T = any>(sql: string, params?: any[]): Promise<T | null>;
  insert(sql: string, params?: any[]): Promise<number>;
  update(sql: string, params?: any[]): Promise<number>;
  delete(sql: string, params?: any[]): Promise<number>;
}

class UniversalDatabaseAdapter implements DatabaseInterface {
  private isWorkers(): boolean {
    // Check if we're in Cloudflare Workers environment
    return typeof (globalThis as any).DB !== 'undefined' || (typeof globalThis !== 'undefined' && 'DB' in globalThis);
  }

  private isNextJS(): boolean {
    // Check if we're in Next.js environment
    return typeof process !== 'undefined' && process.env !== undefined;
  }

  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    if (this.isWorkers()) {
      // Use D1 in Workers environment
      const { getDatabase } = await import('./d1-db');
      const db = getDatabase();
      return await db.query<T>(sql, params);
    } else if (this.isNextJS()) {
      // Use MySQL in Next.js environment
      const { Database: MySQLDatabase } = await import('./db');
      // Convert SQLite syntax to MySQL syntax if needed
      const mysqlSql = this.convertSQLiteToMySQL(sql);
      return await MySQLDatabase.query<T>(mysqlSql, params);
    } else {
      throw new Error('Unsupported environment: Neither Workers nor Next.js detected');
    }
  }

  async queryOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
    if (this.isWorkers()) {
      const { getDatabase } = await import('./d1-db');
      const db = getDatabase();
      return await db.queryOne<T>(sql, params);
    } else if (this.isNextJS()) {
      const { Database: MySQLDatabase } = await import('./db');
      const mysqlSql = this.convertSQLiteToMySQL(sql);
      return await MySQLDatabase.queryOne<T>(mysqlSql, params);
    } else {
      throw new Error('Unsupported environment: Neither Workers nor Next.js detected');
    }
  }

  async insert(sql: string, params: any[] = []): Promise<number> {
    if (this.isWorkers()) {
      const { getDatabase } = await import('./d1-db');
      const db = getDatabase();
      return await db.insert(sql, params);
    } else if (this.isNextJS()) {
      const { Database: MySQLDatabase } = await import('./db');
      const mysqlSql = this.convertSQLiteToMySQL(sql);
      return await MySQLDatabase.insert(mysqlSql, params);
    } else {
      throw new Error('Unsupported environment: Neither Workers nor Next.js detected');
    }
  }

  async update(sql: string, params: any[] = []): Promise<number> {
    if (this.isWorkers()) {
      const { getDatabase } = await import('./d1-db');
      const db = getDatabase();
      return await db.update(sql, params);
    } else if (this.isNextJS()) {
      const { Database: MySQLDatabase } = await import('./db');
      const mysqlSql = this.convertSQLiteToMySQL(sql);
      return await MySQLDatabase.update(mysqlSql, params);
    } else {
      throw new Error('Unsupported environment: Neither Workers nor Next.js detected');
    }
  }

  async delete(sql: string, params: any[] = []): Promise<number> {
    if (this.isWorkers()) {
      const { getDatabase } = await import('./d1-db');
      const db = getDatabase();
      return await db.delete(sql, params);
    } else if (this.isNextJS()) {
      const { Database: MySQLDatabase } = await import('./db');
      const mysqlSql = this.convertSQLiteToMySQL(sql);
      return await MySQLDatabase.delete(mysqlSql, params);
    } else {
      throw new Error('Unsupported environment: Neither Workers nor Next.js detected');
    }
  }

  private convertSQLiteToMySQL(sql: string): string {
    return sql
      // Convert datetime("now") to CURRENT_TIMESTAMP
      .replace(/datetime\("now"\)/g, 'CURRENT_TIMESTAMP')
      // Convert SQLite boolean values (1/0) to MySQL boolean values (TRUE/FALSE)
      .replace(/is_active = 1/g, 'is_active = TRUE')
      .replace(/is_active = 0/g, 'is_active = FALSE')
      .replace(/is_featured = 1/g, 'is_featured = TRUE')
      .replace(/is_featured = 0/g, 'is_featured = FALSE')
      // Handle WHERE clauses with boolean values
      .replace(/WHERE is_active = 1/g, 'WHERE is_active = TRUE')
      .replace(/WHERE is_active = 0/g, 'WHERE is_active = FALSE')
      .replace(/AND is_active = 1/g, 'AND is_active = TRUE')
      .replace(/AND is_active = 0/g, 'AND is_active = FALSE');
  }
}

// Export singleton instance
export const Database = new UniversalDatabaseAdapter();

// For backward compatibility
export default Database;