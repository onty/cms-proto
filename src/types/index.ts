// Database model types for the CMS

export interface User {
  id: number;
  email: string;
  name: string;
  password_hash?: string; // Optional when returning user data
  role: 'admin' | 'editor' | 'author';
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  last_login?: string;
  is_active: boolean;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  color: string;
  parent_id?: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
  // Virtual properties (computed)
  post_count?: number;
  parent?: Category;
  children?: Category[];
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  created_at: string;
  // Virtual properties
  post_count?: number;
}

export interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  status: 'draft' | 'published' | 'archived';
  featured_image?: string;
  author_id: number;
  category_id?: number;
  view_count: number;
  published_at?: string;
  created_at: string;
  updated_at: string;
  seo_title?: string;
  seo_description?: string;
  // Virtual properties (joined data)
  author?: User;
  category?: Category;
  tags?: Tag[];
  // Joined properties from SQL queries
  author_name?: string;
  author_email?: string;
  author_avatar?: string;
  category_name?: string;
  category_slug?: string;
  category_color?: string;
}

export interface PostTag {
  post_id: number;
  tag_id: number;
}

export interface Setting {
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  description?: string;
  updated_at: string;
}

// Form types for creating/updating records
export interface CreateUserData {
  email: string;
  name: string;
  password: string;
  role?: 'admin' | 'editor' | 'author';
  avatar_url?: string;
  is_active?: boolean;
}

export interface UpdateUserData {
  email?: string;
  name?: string;
  password?: string;
  role?: 'admin' | 'editor' | 'author';
  avatar_url?: string;
  is_active?: boolean;
}

export interface CreateCategoryData {
  name: string;
  slug: string;
  description?: string;
  color?: string;
  parent_id?: number;
  sort_order?: number;
}

export interface UpdateCategoryData {
  name?: string;
  slug?: string;
  description?: string;
  color?: string;
  parent_id?: number;
  sort_order?: number;
}

export interface CreatePostData {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  status?: 'draft' | 'published' | 'archived';
  featured_image?: string;
  author_id: number;
  category_id?: number;
  published_at?: string;
  seo_title?: string;
  seo_description?: string;
  tag_ids?: number[];
}

export interface UpdatePostData {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  status?: 'draft' | 'published' | 'archived';
  featured_image?: string;
  category_id?: number;
  published_at?: string;
  seo_title?: string;
  seo_description?: string;
  tag_ids?: number[];
}

export interface CreateTagData {
  name: string;
  slug: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Query parameters for filtering/searching
export interface PostQuery {
  page?: number;
  limit?: number;
  status?: 'draft' | 'published' | 'archived';
  category_id?: number;
  author_id?: number;
  tag_id?: number;
  search?: string;
  sort?: 'created_at' | 'updated_at' | 'published_at' | 'title' | 'view_count';
  order?: 'asc' | 'desc';
}

export interface CategoryQuery {
  page?: number;
  limit?: number;
  parent_id?: number;
  sort?: 'name' | 'sort_order' | 'created_at';
  order?: 'asc' | 'desc';
}

// Authentication types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'author';
  avatar_url?: string;
}