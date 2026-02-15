import { Database } from '@/lib/database-adapter';
import { Post, CreatePostData, UpdatePostData, PostQuery } from '@/types';
import { TagModel } from './Tag';

export class PostModel {
  /**
   * Get all posts with filtering, searching, and pagination
   */
  static async getAll(query: PostQuery = {}): Promise<{ posts: Post[], total: number }> {
    const {
      page = 1,
      limit = 10,
      status,
      category_id,
      author_id,
      tag_id,
      search,
      sort = 'created_at',
      order = 'desc'
    } = query;

    const offset = (page - 1) * limit;
    const conditions: string[] = [];
    const whereParams: any[] = [];

    // Build WHERE conditions
    if (status) {
      conditions.push('p.status = ?');
      whereParams.push(status);
    }
    if (category_id) {
      conditions.push('p.category_id = ?');
      whereParams.push(category_id);
    }
    if (author_id) {
      conditions.push('p.author_id = ?');
      whereParams.push(author_id);
    }
    if (tag_id) {
      conditions.push('EXISTS (SELECT 1 FROM post_tags pt WHERE pt.post_id = p.id AND pt.tag_id = ?)');
      whereParams.push(tag_id);
    }
    if (search) {
      conditions.push('(p.title LIKE ? OR p.content LIKE ? OR p.excerpt LIKE ?)');
      const searchTerm = `%${search}%`;
      whereParams.push(searchTerm, searchTerm, searchTerm);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const orderClause = `ORDER BY p.${sort} ${order.toUpperCase()}`;

    // Separate parameters for main query (includes pagination)
    const mainQueryParams = [...whereParams, limit, offset];

    const posts = await Database.query<Post>(
      `SELECT p.*, 
              u.name as author_name, u.email as author_email, u.avatar_url as author_avatar,
              c.name as category_name, c.slug as category_slug, c.color as category_color
       FROM posts p
       LEFT JOIN users u ON p.author_id = u.id
       LEFT JOIN categories c ON p.category_id = c.id
       ${whereClause}
       ${orderClause}
       LIMIT ? OFFSET ?`,
      mainQueryParams
    );

    // Get total count (uses only WHERE parameters, no pagination)
    const totalResult = await Database.queryOne<{ count: number }>(
      `SELECT COUNT(*) as count 
       FROM posts p
       ${whereClause}`,
      whereParams
    );
    const total = totalResult?.count || 0;

    // Load tags for each post
    for (const post of posts) {
      post.tags = await TagModel.getByPostId(post.id);
    }

    return { posts, total };
  }

  /**
   * Get post by ID with related data
   */
  static async getById(id: number): Promise<Post | null> {
    const post = await Database.queryOne<Post>(
      `SELECT p.*, 
              u.name as author_name, u.email as author_email, u.avatar_url as author_avatar,
              c.name as category_name, c.slug as category_slug, c.color as category_color
       FROM posts p
       LEFT JOIN users u ON p.author_id = u.id
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`,
      [id]
    );

    if (post) {
      post.tags = await TagModel.getByPostId(post.id);
    }

    return post;
  }

  /**
   * Get post by slug with related data
   */
  static async getBySlug(slug: string): Promise<Post | null> {
    const post = await Database.queryOne<Post>(
      `SELECT p.*, 
              u.name as author_name, u.email as author_email, u.avatar_url as author_avatar,
              c.name as category_name, c.slug as category_slug, c.color as category_color
       FROM posts p
       LEFT JOIN users u ON p.author_id = u.id
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.slug = ?`,
      [slug]
    );

    if (post) {
      post.tags = await TagModel.getByPostId(post.id);
    }

    return post;
  }

  /**
   * Get published posts for public display
   */
  static async getPublished(page: number = 1, limit: number = 10): Promise<{ posts: Post[], total: number }> {
    return await this.getAll({
      page,
      limit,
      status: 'published',
      sort: 'published_at',
      order: 'desc'
    });
  }

  /**
   * Get featured posts (latest published posts)
   */
  static async getFeatured(limit: number = 5): Promise<Post[]> {
    const result = await this.getAll({
      page: 1,
      limit,
      status: 'published',
      sort: 'published_at',
      order: 'desc'
    });
    return result.posts;
  }

  /**
   * Get related posts (same category or tags)
   */
  static async getRelated(postId: number, limit: number = 5): Promise<Post[]> {
    const posts = await Database.query<Post>(
      `SELECT DISTINCT p.*, 
              u.name as author_name, u.email as author_email,
              c.name as category_name, c.slug as category_slug
       FROM posts p
       LEFT JOIN users u ON p.author_id = u.id
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN post_tags pt ON p.id = pt.post_id
       WHERE p.id != ? AND p.status = 'published'
         AND (p.category_id IN (
           SELECT category_id FROM posts WHERE id = ? AND category_id IS NOT NULL
         ) OR pt.tag_id IN (
           SELECT tag_id FROM post_tags WHERE post_id = ?
         ))
       ORDER BY p.published_at DESC
       LIMIT ?`,
      [postId, postId, postId, limit]
    );

    // Load tags for each post
    for (const post of posts) {
      post.tags = await TagModel.getByPostId(post.id);
    }

    return posts;
  }

  /**
   * Create new post
   */
  static async create(postData: CreatePostData): Promise<Post> {
    const now = new Date().toISOString();
    const published_at = postData.status === 'published' 
      ? (postData.published_at || now)
      : null;

    const postId = await Database.insert(
      `INSERT INTO posts (title, slug, excerpt, content, status, featured_image, 
                         author_id, category_id, published_at, seo_title, seo_description) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        postData.title,
        postData.slug,
        postData.excerpt || null,
        postData.content,
        postData.status || 'draft',
        postData.featured_image || null,
        postData.author_id,
        postData.category_id || null,
        published_at,
        postData.seo_title || null,
        postData.seo_description || null
      ]
    );

    // Add tags if provided
    if (postData.tag_ids && postData.tag_ids.length > 0) {
      await TagModel.addToPost(postId, postData.tag_ids);
    }

    const post = await this.getById(postId);
    if (!post) {
      throw new Error('Failed to create post');
    }
    return post;
  }

  /**
   * Update post
   */
  static async update(id: number, postData: UpdatePostData): Promise<Post | null> {
    const updates: string[] = [];
    const values: any[] = [];

    if (postData.title !== undefined) {
      updates.push('title = ?');
      values.push(postData.title);
    }
    if (postData.slug !== undefined) {
      updates.push('slug = ?');
      values.push(postData.slug);
    }
    if (postData.excerpt !== undefined) {
      updates.push('excerpt = ?');
      values.push(postData.excerpt);
    }
    if (postData.content !== undefined) {
      updates.push('content = ?');
      values.push(postData.content);
    }
    if (postData.status !== undefined) {
      updates.push('status = ?');
      values.push(postData.status);
      
      // If changing to published and no published_at date, set it now
      if (postData.status === 'published' && !postData.published_at) {
        updates.push('published_at = CURRENT_TIMESTAMP');
      }
    }
    if (postData.featured_image !== undefined) {
      updates.push('featured_image = ?');
      values.push(postData.featured_image);
    }
    if (postData.category_id !== undefined) {
      updates.push('category_id = ?');
      values.push(postData.category_id);
    }
    if (postData.published_at !== undefined) {
      updates.push('published_at = ?');
      values.push(postData.published_at);
    }
    if (postData.seo_title !== undefined) {
      updates.push('seo_title = ?');
      values.push(postData.seo_title);
    }
    if (postData.seo_description !== undefined) {
      updates.push('seo_description = ?');
      values.push(postData.seo_description);
    }

    if (updates.length === 0 && !postData.tag_ids) {
      return await this.getById(id);
    }

    if (updates.length > 0) {
      updates.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);

      await Database.update(
        `UPDATE posts SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
    }

    // Update tags if provided
    if (postData.tag_ids !== undefined) {
      await TagModel.addToPost(id, postData.tag_ids);
    }

    return await this.getById(id);
  }

  /**
   * Delete post
   */
  static async delete(id: number): Promise<boolean> {
    // First remove all tag associations
    await Database.delete('DELETE FROM post_tags WHERE post_id = ?', [id]);
    
    // Then delete the post
    const affectedRows = await Database.delete('DELETE FROM posts WHERE id = ?', [id]);
    return affectedRows > 0;
  }

  /**
   * Increment view count
   */
  static async incrementViewCount(id: number): Promise<void> {
    await Database.update(
      'UPDATE posts SET view_count = view_count + 1 WHERE id = ?',
      [id]
    );
  }

  /**
   * Check if slug already exists
   */
  static async slugExists(slug: string, excludeId?: number): Promise<boolean> {
    const query = excludeId 
      ? 'SELECT COUNT(*) as count FROM posts WHERE slug = ? AND id != ?'
      : 'SELECT COUNT(*) as count FROM posts WHERE slug = ?';
    
    const params = excludeId ? [slug, excludeId] : [slug];
    const result = await Database.queryOne<{ count: number }>(query, params);
    return (result?.count || 0) > 0;
  }

  /**
   * Generate unique slug from title
   */
  static generateSlug(title: string): string {
    return title
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

  /**
   * Get post statistics
   */
  static async getStats(): Promise<{
    total: number;
    published: number;
    drafts: number;
    archived: number;
    totalViews: number;
  }> {
    const stats = await Database.queryOne<{
      total: number;
      published: number;
      drafts: number;
      archived: number;
      totalViews: number;
    }>(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as published,
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as drafts,
        SUM(CASE WHEN status = 'archived' THEN 1 ELSE 0 END) as archived,
        SUM(view_count) as totalViews
      FROM posts
    `);

    return stats || {
      total: 0,
      published: 0,
      drafts: 0,
      archived: 0,
      totalViews: 0
    };
  }

  /**
   * Search posts by content
   */
  static async search(query: string, limit: number = 20): Promise<Post[]> {
    const result = await this.getAll({
      search: query,
      limit,
      status: 'published',
      sort: 'published_at',
      order: 'desc'
    });
    return result.posts;
  }

  /**
   * Get archive (posts grouped by month/year)
   */
  static async getArchive(): Promise<{ year: number; month: number; count: number; posts?: Post[] }[]> {
    return await Database.query(`
      SELECT 
        YEAR(published_at) as year,
        MONTH(published_at) as month,
        COUNT(*) as count
      FROM posts 
      WHERE status = 'published' AND published_at IS NOT NULL
      GROUP BY YEAR(published_at), MONTH(published_at)
      ORDER BY year DESC, month DESC
    `);
  }
}