import { Database } from '@/lib/database-adapter';
import { Tag, CreateTagData } from '@/types';

export class TagModel {
  /**
   * Get all tags with post count
   */
  static async getAll(page: number = 1, limit: number = 100): Promise<{ tags: Tag[], total: number }> {
    const offset = (page - 1) * limit;

    const tags = await Database.query<Tag>(
      `SELECT t.*, 
              COUNT(pt.post_id) as post_count
       FROM tags t
       LEFT JOIN post_tags pt ON t.id = pt.tag_id
       LEFT JOIN posts p ON pt.post_id = p.id AND p.status = 'published'
       GROUP BY t.id
       ORDER BY post_count DESC, t.name ASC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const totalResult = await Database.queryOne<{ count: number }>(
      'SELECT COUNT(*) as count FROM tags'
    );
    const total = totalResult?.count || 0;

    return { tags, total };
  }

  /**
   * Get tag by ID
   */
  static async getById(id: number): Promise<Tag | null> {
    return await Database.queryOne<Tag>(
      `SELECT t.*, 
              COUNT(pt.post_id) as post_count
       FROM tags t
       LEFT JOIN post_tags pt ON t.id = pt.tag_id
       LEFT JOIN posts p ON pt.post_id = p.id AND p.status = 'published'
       WHERE t.id = ?
       GROUP BY t.id`,
      [id]
    );
  }

  /**
   * Get tag by slug
   */
  static async getBySlug(slug: string): Promise<Tag | null> {
    return await Database.queryOne<Tag>(
      `SELECT t.*, 
              COUNT(pt.post_id) as post_count
       FROM tags t
       LEFT JOIN post_tags pt ON t.id = pt.tag_id
       LEFT JOIN posts p ON pt.post_id = p.id AND p.status = 'published'
       WHERE t.slug = ?
       GROUP BY t.id`,
      [slug]
    );
  }

  /**
   * Get tags for a specific post
   */
  static async getByPostId(postId: number): Promise<Tag[]> {
    return await Database.query<Tag>(
      `SELECT t.*
       FROM tags t
       INNER JOIN post_tags pt ON t.id = pt.tag_id
       WHERE pt.post_id = ?
       ORDER BY t.name ASC`,
      [postId]
    );
  }

  /**
   * Get popular tags (ordered by usage)
   */
  static async getPopular(limit: number = 20): Promise<Tag[]> {
    return await Database.query<Tag>(
      `SELECT t.*, 
              COUNT(pt.post_id) as post_count
       FROM tags t
       INNER JOIN post_tags pt ON t.id = pt.tag_id
       INNER JOIN posts p ON pt.post_id = p.id AND p.status = 'published'
       GROUP BY t.id
       HAVING post_count > 0
       ORDER BY post_count DESC, t.name ASC
       LIMIT ?`,
      [limit]
    );
  }

  /**
   * Search tags by name
   */
  static async search(query: string, limit: number = 10): Promise<Tag[]> {
    return await Database.query<Tag>(
      `SELECT t.*, 
              COUNT(pt.post_id) as post_count
       FROM tags t
       LEFT JOIN post_tags pt ON t.id = pt.tag_id
       LEFT JOIN posts p ON pt.post_id = p.id AND p.status = 'published'
       WHERE t.name LIKE ?
       GROUP BY t.id
       ORDER BY post_count DESC, t.name ASC
       LIMIT ?`,
      [`%${query}%`, limit]
    );
  }

  /**
   * Create new tag
   */
  static async create(tagData: CreateTagData): Promise<Tag> {
    const tagId = await Database.insert(
      'INSERT INTO tags (name, slug) VALUES (?, ?)',
      [tagData.name, tagData.slug]
    );

    const tag = await this.getById(tagId);
    if (!tag) {
      throw new Error('Failed to create tag');
    }
    return tag;
  }

  /**
   * Update tag
   */
  static async update(id: number, name: string, slug: string): Promise<Tag | null> {
    await Database.update(
      'UPDATE tags SET name = ?, slug = ? WHERE id = ?',
      [name, slug, id]
    );

    return await this.getById(id);
  }

  /**
   * Delete tag and remove from all posts
   */
  static async delete(id: number): Promise<boolean> {
    // First remove from all posts
    await Database.delete(
      'DELETE FROM post_tags WHERE tag_id = ?',
      [id]
    );

    // Then delete the tag
    const affectedRows = await Database.delete(
      'DELETE FROM tags WHERE id = ?',
      [id]
    );
    return affectedRows > 0;
  }

  /**
   * Check if slug already exists
   */
  static async slugExists(slug: string, excludeId?: number): Promise<boolean> {
    const query = excludeId 
      ? 'SELECT COUNT(*) as count FROM tags WHERE slug = ? AND id != ?'
      : 'SELECT COUNT(*) as count FROM tags WHERE slug = ?';
    
    const params = excludeId ? [slug, excludeId] : [slug];
    const result = await Database.queryOne<{ count: number }>(query, params);
    return (result?.count || 0) > 0;
  }

  /**
   * Find or create tag by name
   */
  static async findOrCreate(name: string): Promise<Tag> {
    const slug = this.generateSlug(name);
    
    // Try to find existing tag
    let tag = await Database.queryOne<Tag>(
      'SELECT * FROM tags WHERE slug = ?',
      [slug]
    );

    if (tag) {
      return tag;
    }

    // Create new tag
    return await this.create({ name, slug });
  }

  /**
   * Bulk find or create tags
   */
  static async findOrCreateMany(names: string[]): Promise<Tag[]> {
    const tags: Tag[] = [];
    
    for (const name of names) {
      const tag = await this.findOrCreate(name.trim());
      tags.push(tag);
    }
    
    return tags;
  }

  /**
   * Add tags to a post
   */
  static async addToPost(postId: number, tagIds: number[]): Promise<void> {
    // First remove existing tags
    await Database.delete(
      'DELETE FROM post_tags WHERE post_id = ?',
      [postId]
    );

    // Add new tags
    if (tagIds.length > 0) {
      const values = tagIds.map(tagId => `(${postId}, ${tagId})`).join(', ');
      await Database.query(
        `INSERT INTO post_tags (post_id, tag_id) VALUES ${values}`
      );
    }
  }

  /**
   * Remove tag from post
   */
  static async removeFromPost(postId: number, tagId: number): Promise<void> {
    await Database.delete(
      'DELETE FROM post_tags WHERE post_id = ? AND tag_id = ?',
      [postId, tagId]
    );
  }

  /**
   * Get unused tags (tags with no posts)
   */
  static async getUnused(): Promise<Tag[]> {
    return await Database.query<Tag>(
      `SELECT t.*
       FROM tags t
       LEFT JOIN post_tags pt ON t.id = pt.tag_id
       WHERE pt.tag_id IS NULL
       ORDER BY t.name ASC`
    );
  }

  /**
   * Delete unused tags
   */
  static async deleteUnused(): Promise<number> {
    const affectedRows = await Database.delete(
      `DELETE FROM tags 
       WHERE id NOT IN (
         SELECT DISTINCT tag_id 
         FROM post_tags
       )`
    );
    return affectedRows;
  }

  /**
   * Generate slug from name
   */
  static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Ensure unique slug
   */
  static async ensureUniqueSlug(baseSlug: string, excludeId?: number): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (await this.slugExists(slug, excludeId)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }
}