/**
 * D1 Database Adapter for Cloudflare Workers
 * Replaces MySQL connection with D1 (SQLite) database
 */

interface D1Result<T = any> {
  results: T[];
  success: boolean;
  meta: {
    changed_db: boolean;
    changes: number;
    last_row_id: number;
    duration: number;
  };
}

interface D1PreparedStatement {
  bind(...values: any[]): D1PreparedStatement;
  first<T = any>(): Promise<T | null>;
  all<T = any>(): Promise<D1Result<T>>;
  run(): Promise<D1Result>;
}

interface D1Database {
  prepare(sql: string): D1PreparedStatement;
  exec(sql: string): Promise<D1Result>;
  batch(statements: D1PreparedStatement[]): Promise<D1Result[]>;
}

export class D1DatabaseAdapter {
  constructor(private db: D1Database) {}

  /**
   * Execute a query and return all results
   */
  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    try {
      const stmt = this.db.prepare(sql);
      const result = await stmt.bind(...params).all();
      
      if (!result.success) {
        throw new Error('Database query failed');
      }
      
      return result.results as T[];
    } catch (error) {
      console.error('D1 query error:', error);
      throw error;
    }
  }

  /**
   * Execute a query and return the first result
   */
  async queryOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
    try {
      const stmt = this.db.prepare(sql);
      const result = await stmt.bind(...params).first();
      return result as T | null;
    } catch (error) {
      console.error('D1 queryOne error:', error);
      throw error;
    }
  }

  /**
   * Execute an INSERT and return the inserted ID
   */
  async insert(sql: string, params: any[] = []): Promise<number> {
    try {
      const stmt = this.db.prepare(sql);
      const result = await stmt.bind(...params).run();
      
      if (!result.success) {
        throw new Error('Database insert failed');
      }
      
      return result.meta.last_row_id;
    } catch (error) {
      console.error('D1 insert error:', error);
      throw error;
    }
  }

  /**
   * Execute an UPDATE and return the number of affected rows
   */
  async update(sql: string, params: any[] = []): Promise<number> {
    try {
      const stmt = this.db.prepare(sql);
      const result = await stmt.bind(...params).run();
      
      if (!result.success) {
        throw new Error('Database update failed');
      }
      
      return result.meta.changes;
    } catch (error) {
      console.error('D1 update error:', error);
      throw error;
    }
  }

  /**
   * Execute a DELETE and return the number of affected rows
   */
  async delete(sql: string, params: any[] = []): Promise<number> {
    try {
      const stmt = this.db.prepare(sql);
      const result = await stmt.bind(...params).run();
      
      if (!result.success) {
        throw new Error('Database delete failed');
      }
      
      return result.meta.changes;
    } catch (error) {
      console.error('D1 delete error:', error);
      throw error;
    }
  }

  /**
   * Execute multiple statements in a transaction
   */
  async batch(statements: { sql: string; params: any[] }[]): Promise<D1Result[]> {
    try {
      const preparedStatements = statements.map(({ sql, params }) =>
        this.db.prepare(sql).bind(...params)
      );
      
      return await this.db.batch(preparedStatements);
    } catch (error) {
      console.error('D1 batch error:', error);
      throw error;
    }
  }

  /**
   * Execute raw SQL (for schema creation, etc.)
   */
  async exec(sql: string): Promise<D1Result> {
    try {
      return await this.db.exec(sql);
    } catch (error) {
      console.error('D1 exec error:', error);
      throw error;
    }
  }

  /**
   * Test database connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.query('SELECT 1 as test');
      return true;
    } catch (error) {
      console.error('D1 connection test failed:', error);
      return false;
    }
  }

  /**
   * Get database info
   */
  async getInfo(): Promise<any> {
    try {
      // SQLite pragma queries for database info
      const [tables, version] = await Promise.all([
        this.query("SELECT name FROM sqlite_master WHERE type='table'"),
        this.query("SELECT sqlite_version() as version")
      ]);
      
      return {
        connected: true,
        tables: tables.map((t: any) => t.name),
        version: version[0]?.version,
        type: 'D1 (SQLite)'
      };
    } catch (error) {
      console.error('Failed to get D1 info:', error);
      return {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Global database instance type for Workers environment is declared in src/index.ts

// Create database instance (will be initialized in Workers environment)
let dbInstance: D1DatabaseAdapter | null = null;

export function getDatabase(): D1DatabaseAdapter {
  if (!dbInstance) {
    if (typeof DB === 'undefined') {
      throw new Error('D1 database not available. Make sure DB binding is configured in wrangler.toml');
    }
    dbInstance = new D1DatabaseAdapter(DB as any);
  }
  return dbInstance;
}

// Export the adapter as default database for compatibility
export default D1DatabaseAdapter;