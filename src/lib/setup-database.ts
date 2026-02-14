import fs from 'fs';
import path from 'path';
import Database from './db';

/**
 * Parse SQL file into individual statements
 */
function parseSQLStatements(sql: string): string[] {
  // Remove comments and split by semicolon, handling multiline statements
  const cleaned = sql
    .replace(/--.*$/gm, '') // Remove line comments
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
  
  // Split by semicolon and filter empty statements
  return cleaned
    .split(';')
    .map(statement => statement.trim())
    .filter(statement => statement.length > 0);
}

/**
 * Set up the database by running the schema and seed files
 */
export async function setupDatabase() {
  try {
    console.log('🔄 Setting up database...');

    // Test connection first
    const isConnected = await Database.testConnection();
    if (!isConnected) {
      throw new Error('Cannot connect to the database. Please check your configuration.');
    }

    // Disable foreign key checks during setup
    await Database.query('SET FOREIGN_KEY_CHECKS = 0');

    // Read and execute schema
    const schemaPath = path.join(process.cwd(), 'src/lib/sql/schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    const statements = parseSQLStatements(schemaSQL);

    for (const statement of statements) {
      try {
        await Database.query(statement);
        console.log(`✓ Executed: ${statement.substring(0, 50)}...`);
      } catch (error) {
        console.error(`✗ Failed: ${statement.substring(0, 50)}...`);
        console.error('Error:', error);
        throw error;
      }
    }

    // Re-enable foreign key checks
    await Database.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('✅ Database schema created successfully');

    // Check if we need to seed data (check if users table is empty)
    const userCount = await Database.queryOne<{ count: number }>(
      'SELECT COUNT(*) as count FROM users'
    );

    if (userCount && userCount.count === 0) {
      console.log('🌱 Seeding database with initial data...');
      
      // Read and execute seed data
      const seedPath = path.join(process.cwd(), 'src/lib/sql/seed.sql');
      const seedSQL = fs.readFileSync(seedPath, 'utf8');
      
      const seedStatements = parseSQLStatements(seedSQL);

      for (const statement of seedStatements) {
        try {
          await Database.query(statement);
          console.log(`✓ Seeded: ${statement.substring(0, 50)}...`);
        } catch (error) {
          console.error(`✗ Seed failed: ${statement.substring(0, 50)}...`);
          console.error('Error:', error);
          throw error;
        }
      }

      console.log('✅ Database seeded successfully');
    } else {
      console.log('📊 Database already contains data, skipping seed');
    }

    console.log('🎉 Database setup complete!');
    return true;
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    return false;
  }
}

/**
 * Reset the database (DROP and recreate all tables)
 * USE WITH CAUTION - This will delete all data!
 */
export async function resetDatabase() {
  try {
    console.log('⚠️  Resetting database...');

    // Drop tables in reverse order due to foreign key constraints
    const dropStatements = [
      'DROP TABLE IF EXISTS post_tags',
      'DROP TABLE IF EXISTS settings', 
      'DROP TABLE IF EXISTS tags',
      'DROP TABLE IF EXISTS posts',
      'DROP TABLE IF EXISTS categories',
      'DROP TABLE IF EXISTS users',
    ];

    for (const statement of dropStatements) {
      await Database.query(statement);
    }

    console.log('🗑️  All tables dropped');
    
    // Now recreate everything
    await setupDatabase();
    
    return true;
  } catch (error) {
    console.error('❌ Database reset failed:', error);
    return false;
  }
}

// If this file is run directly, setup the database
if (require.main === module) {
  setupDatabase().then(success => {
    process.exit(success ? 0 : 1);
  });
}