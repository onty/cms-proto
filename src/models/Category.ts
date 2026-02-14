import Database from '@/lib/db';
import { Category, CreateCategoryData, UpdateCategoryData, CategoryQuery } from '@/types';

export class CategoryModel {
  /**
   * Get all categories with optional filtering and pagination
   */
  static async getAll(query: CategoryQuery = {}): Promise<{ categories: Category[], total: number }> {
    const {
      page = 1,
      limit = 100,
      parent_id,
      sort = 'sort_order',
      order = 'asc'
    } = query;

    const offset = (page - 1) * limit;
    let whereClause = '';
    let whereParams: any[] = [];

    if (parent_id !== undefined) {
      whereClause = parent_id === null ? 'WHERE parent_id IS NULL' : 'WHERE parent_id = ?';
      if (parent_id !== null) {
        whereParams.push(parent_id);
      }
    }

    const orderClause = `ORDER BY ${sort} ${order.toUpperCase()}`;
    
    // Separate parameters for main query (includes pagination)
    const mainQueryParams = [...whereParams, limit, offset];

    const categories = await Database.query<Category>(
      `SELECT c.*, 
              COUNT(p.id) as post_count
       FROM categories c
       LEFT JOIN posts p ON c.id = p.category_id AND p.status = 'published'
       ${whereClause}
       GROUP BY c.id
       ${orderClause}
       LIMIT ? OFFSET ?`,
      mainQueryParams
    );

    // Get total count (uses only WHERE parameters, no pagination)
    const totalResult = await Database.queryOne<{ count: number }>(
      `SELECT COUNT(*) as count FROM categories ${whereClause}`,
      whereParams
    );
    const total = totalResult?.count || 0;

    return { categories, total };
  }

  /**
   * Get category by ID
   */
  static async getById(id: number): Promise<Category | null> {
    return await Database.queryOne<Category>(
      `SELECT c.*, 
              COUNT(p.id) as post_count
       FROM categories c
       LEFT JOIN posts p ON c.id = p.category_id AND p.status = 'published'
       WHERE c.id = ?
       GROUP BY c.id`,
      [id]
    );
  }

  /**
   * Get category by slug
   */
  static async getBySlug(slug: string): Promise<Category | null> {
    return await Database.queryOne<Category>(
      `SELECT c.*, 
              COUNT(p.id) as post_count
       FROM categories c
       LEFT JOIN posts p ON c.id = p.category_id AND p.status = 'published'
       WHERE c.slug = ?
       GROUP BY c.id`,
      [slug]
    );
  }

  /**
   * Get category tree (hierarchical structure)
   */
  static async getTree(): Promise<Category[]> {
    const allCategories = await Database.query<Category>(
      `SELECT c.*, 
              COUNT(p.id) as post_count
       FROM categories c
       LEFT JOIN posts p ON c.id = p.category_id AND p.status = 'published'
       GROUP BY c.id
       ORDER BY c.parent_id ASC, c.sort_order ASC, c.name ASC`
    );

    // Build tree structure
    const categoryMap = new Map<number, Category>();
    const rootCategories: Category[] = [];

    // First pass: create map and initialize children arrays
    allCategories.forEach(cat => {
      cat.children = [];
      categoryMap.set(cat.id, cat);
    });

    // Second pass: build tree
    allCategories.forEach(cat => {
      if (cat.parent_id) {
        const parent = categoryMap.get(cat.parent_id);
        if (parent) {
          parent.children!.push(cat);
          cat.parent = parent;
        }
      } else {
        rootCategories.push(cat);
      }
    });

    return rootCategories;
  }

  /**
   * Get child categories of a parent
   */
  static async getChildren(parentId: number): Promise<Category[]> {
    return await Database.query<Category>(
      `SELECT c.*, 
              COUNT(p.id) as post_count
       FROM categories c
       LEFT JOIN posts p ON c.id = p.category_id AND p.status = 'published'
       WHERE c.parent_id = ?
       GROUP BY c.id
       ORDER BY c.sort_order ASC, c.name ASC`,
      [parentId]
    );
  }

  /**
   * Create new category
   */
  static async create(categoryData: CreateCategoryData): Promise<Category> {
    const categoryId = await Database.insert(
      `INSERT INTO categories (name, slug, description, color, parent_id, sort_order) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        categoryData.name,
        categoryData.slug,
        categoryData.description || null,
        categoryData.color || '#3b82f6',
        categoryData.parent_id || null,
        categoryData.sort_order || 0
      ]
    );

    const category = await this.getById(categoryId);
    if (!category) {
      throw new Error('Failed to create category');
    }
    return category;
  }

  /**
   * Update category
   */
  static async update(id: number, categoryData: UpdateCategoryData): Promise<Category | null> {
    const updates: string[] = [];
    const values: any[] = [];

    if (categoryData.name !== undefined) {
      updates.push('name = ?');
      values.push(categoryData.name);
    }
    if (categoryData.slug !== undefined) {
      updates.push('slug = ?');
      values.push(categoryData.slug);
    }
    if (categoryData.description !== undefined) {
      updates.push('description = ?');
      values.push(categoryData.description);
    }
    if (categoryData.color !== undefined) {
      updates.push('color = ?');
      values.push(categoryData.color);
    }
    if (categoryData.parent_id !== undefined) {
      updates.push('parent_id = ?');
      values.push(categoryData.parent_id);
    }
    if (categoryData.sort_order !== undefined) {
      updates.push('sort_order = ?');
      values.push(categoryData.sort_order);
    }

    if (updates.length === 0) {
      return await this.getById(id);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await Database.update(
      `UPDATE categories SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    return await this.getById(id);
  }

  /**
   * Delete category
   */
  static async delete(id: number): Promise<boolean> {
    // First, update any posts using this category to have no category
    await Database.update(
      'UPDATE posts SET category_id = NULL WHERE category_id = ?',
      [id]
    );

    // Update any child categories to have no parent
    await Database.update(
      'UPDATE categories SET parent_id = NULL WHERE parent_id = ?',
      [id]
    );

    // Delete the category
    const affectedRows = await Database.delete(
      'DELETE FROM categories WHERE id = ?',
      [id]
    );
    return affectedRows > 0;
  }

  /**
   * Check if slug already exists
   */
  static async slugExists(slug: string, excludeId?: number): Promise<boolean> {
    const query = excludeId 
      ? 'SELECT COUNT(*) as count FROM categories WHERE slug = ? AND id != ?'
      : 'SELECT COUNT(*) as count FROM categories WHERE slug = ?';
    
    const params = excludeId ? [slug, excludeId] : [slug];
    const result = await Database.queryOne<{ count: number }>(query, params);
    return (result?.count || 0) > 0;
  }

  /**
   * Get categories with post count
   */
  static async getCategoriesWithPostCount(): Promise<Category[]> {
    return await Database.query<Category>(
      `SELECT c.*, 
              COUNT(p.id) as post_count
       FROM categories c
       LEFT JOIN posts p ON c.id = p.category_id AND p.status = 'published'
       GROUP BY c.id
       ORDER BY post_count DESC, c.name ASC`
    );
  }

  /**
   * Reorder categories
   */
  static async reorder(categoryOrders: { id: number; sort_order: number }[]): Promise<void> {
    for (const { id, sort_order } of categoryOrders) {
      await Database.update(
        'UPDATE categories SET sort_order = ? WHERE id = ?',
        [sort_order, id]
      );
    }
  }

  /**
   * Generate unique slug from name
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