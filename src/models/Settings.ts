import { Database } from '@/lib/database-adapter';
import { Setting } from '@/types';

export class SettingsModel {
  /**
   * Get all settings
   */
  static async getAll(): Promise<Setting[]> {
    return await Database.query<Setting>(
      'SELECT * FROM settings ORDER BY `key` ASC'
    );
  }

  /**
   * Get setting by key
   */
  static async get(key: string): Promise<Setting | null> {
    return await Database.queryOne<Setting>(
      'SELECT * FROM settings WHERE `key` = ?',
      [key]
    );
  }

  /**
   * Get setting value by key with type conversion
   */
  static async getValue<T = any>(key: string): Promise<T | null> {
    const setting = await this.get(key);
    if (!setting) return null;

    switch (setting.type) {
      case 'number':
        return Number(setting.value) as T;
      case 'boolean':
        return (setting.value === 'true') as T;
      case 'json':
        try {
          return JSON.parse(setting.value) as T;
        } catch {
          return null;
        }
      default:
        return setting.value as T;
    }
  }

  /**
   * Set or update a setting
   */
  static async set(key: string, value: any, type: 'string' | 'number' | 'boolean' | 'json' = 'string', description?: string): Promise<void> {
    let stringValue: string;

    switch (type) {
      case 'number':
        stringValue = String(value);
        break;
      case 'boolean':
        stringValue = String(Boolean(value));
        break;
      case 'json':
        stringValue = JSON.stringify(value);
        break;
      default:
        stringValue = String(value);
    }

    // Use INSERT ... ON DUPLICATE KEY UPDATE for MySQL
    await Database.query(
      `INSERT INTO settings (\`key\`, \`value\`, \`type\`, description, updated_at) 
       VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
       ON DUPLICATE KEY UPDATE 
         \`value\` = VALUES(\`value\`),
         \`type\` = VALUES(\`type\`),
         description = COALESCE(VALUES(description), description),
         updated_at = CURRENT_TIMESTAMP`,
      [key, stringValue, type, description || null]
    );
  }

  /**
   * Delete a setting
   */
  static async delete(key: string): Promise<boolean> {
    const affectedRows = await Database.delete(
      'DELETE FROM settings WHERE `key` = ?',
      [key]
    );
    return affectedRows > 0;
  }

  /**
   * Get multiple settings by keys
   */
  static async getMany(keys: string[]): Promise<{ [key: string]: any }> {
    if (keys.length === 0) return {};

    const placeholders = keys.map(() => '?').join(',');
    const settings = await Database.query<Setting>(
      `SELECT * FROM settings WHERE \`key\` IN (${placeholders})`,
      keys
    );

    const result: { [key: string]: any } = {};
    for (const setting of settings) {
      result[setting.key] = await this.getValue(setting.key);
    }

    return result;
  }

  /**
   * Set multiple settings at once
   */
  static async setMany(settingsData: { [key: string]: { value: any; type?: string; description?: string } }): Promise<void> {
    for (const [key, data] of Object.entries(settingsData)) {
      await this.set(key, data.value, data.type as any || 'string', data.description);
    }
  }

  /**
   * Get all settings as key-value object
   */
  static async getAllAsObject(): Promise<{ [key: string]: any }> {
    const settings = await this.getAll();
    const result: { [key: string]: any } = {};

    for (const setting of settings) {
      result[setting.key] = await this.getValue(setting.key);
    }

    return result;
  }

  /**
   * Initialize default settings
   */
  static async initializeDefaults(): Promise<void> {
    const defaults = [
      { key: 'site_name', value: 'CMS Prototype', type: 'string', description: 'The name of your website' },
      { key: 'site_description', value: 'A powerful and flexible CMS built with Next.js', type: 'string', description: 'Description of your website' },
      { key: 'posts_per_page', value: 10, type: 'number', description: 'Number of posts to show per page' },
      { key: 'allow_registration', value: false, type: 'boolean', description: 'Allow new user registration' },
      { key: 'default_post_status', value: 'draft', type: 'string', description: 'Default status for new posts' },
      { key: 'featured_posts_count', value: 5, type: 'number', description: 'Number of featured posts to show' },
      { key: 'enable_comments', value: false, type: 'boolean', description: 'Enable comments on posts' },
      { key: 'site_url', value: 'http://localhost:3000', type: 'string', description: 'Base URL of the website' },
      { key: 'admin_email', value: 'admin@example.com', type: 'string', description: 'Administrator email address' },
      { key: 'timezone', value: 'UTC', type: 'string', description: 'Default timezone' },
    ];

    for (const setting of defaults) {
      const existing = await this.get(setting.key);
      if (!existing) {
        await this.set(setting.key, setting.value, setting.type as any, setting.description);
      }
    }
  }

  /**
   * Get website configuration (commonly used settings)
   */
  static async getWebsiteConfig(): Promise<{
    siteName: string;
    siteDescription: string;
    siteUrl: string;
    postsPerPage: number;
    featuredPostsCount: number;
    adminEmail: string;
    timezone: string;
  }> {
    const config = await this.getMany([
      'site_name',
      'site_description', 
      'site_url',
      'posts_per_page',
      'featured_posts_count',
      'admin_email',
      'timezone'
    ]);

    return {
      siteName: config.site_name || 'CMS Prototype',
      siteDescription: config.site_description || 'A powerful CMS',
      siteUrl: config.site_url || 'http://localhost:3000',
      postsPerPage: config.posts_per_page || 10,
      featuredPostsCount: config.featured_posts_count || 5,
      adminEmail: config.admin_email || 'admin@example.com',
      timezone: config.timezone || 'UTC'
    };
  }

  /**
   * Backup settings to JSON
   */
  static async backup(): Promise<Setting[]> {
    return await this.getAll();
  }

  /**
   * Restore settings from JSON backup
   */
  static async restore(settings: Setting[]): Promise<void> {
    for (const setting of settings) {
      await this.set(setting.key, setting.value, setting.type, setting.description);
    }
  }
}