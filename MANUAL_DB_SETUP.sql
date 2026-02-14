-- Manual Database Setup for CMS Prototype
-- Run these commands one by one in MySQL

-- Step 1: Use the database
USE cms_prototype;

-- Step 2: Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- Step 3: Drop existing tables if any (in case of partial setup)
DROP TABLE IF EXISTS post_tags;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS settings;

-- Step 4: Create users table first (no dependencies)
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'editor', 'author') DEFAULT 'author',
  avatar_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL,
  is_active TINYINT(1) DEFAULT 1
);

-- Step 5: Create categories table
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#3b82f6',
  parent_id INT DEFAULT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Step 6: Create tags table
CREATE TABLE tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 7: Create posts table
CREATE TABLE posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) UNIQUE NOT NULL,
  excerpt TEXT,
  content LONGTEXT NOT NULL,
  status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
  featured_image VARCHAR(500),
  author_id INT NOT NULL,
  category_id INT DEFAULT NULL,
  view_count INT DEFAULT 0,
  published_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  seo_title VARCHAR(500),
  seo_description VARCHAR(500)
);

-- Step 8: Create post_tags junction table
CREATE TABLE post_tags (
  post_id INT NOT NULL,
  tag_id INT NOT NULL,
  PRIMARY KEY (post_id, tag_id)
);

-- Step 9: Create settings table
CREATE TABLE settings (
  `key` VARCHAR(100) PRIMARY KEY,
  `value` TEXT NOT NULL,
  `type` ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
  description TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Step 10: Add foreign key constraints
ALTER TABLE categories ADD FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL;
ALTER TABLE posts ADD FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE posts ADD FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;
ALTER TABLE post_tags ADD FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE;
ALTER TABLE post_tags ADD FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE;

-- Step 11: Create indexes
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_category ON posts(category_id);
CREATE INDEX idx_posts_published ON posts(published_at);
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_users_email ON users(email);

-- Step 12: Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Step 13: Insert sample data
INSERT INTO users (email, name, password_hash, role) VALUES
('admin@example.com', 'Admin User', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeWuEsOdM8tC/.2Y2', 'admin');

INSERT INTO categories (name, slug, description, color) VALUES
('Technology', 'technology', 'Posts about technology and programming', '#3b82f6'),
('News', 'news', 'Latest news and updates', '#ef4444'),
('Tutorials', 'tutorials', 'Step-by-step tutorials and guides', '#10b981'),
('Reviews', 'reviews', 'Product and service reviews', '#f59e0b');

INSERT INTO tags (name, slug) VALUES
('JavaScript', 'javascript'),
('React', 'react'),
('Next.js', 'nextjs'),
('Web Development', 'web-development'),
('Tutorial', 'tutorial'),
('Beginner', 'beginner'),
('Advanced', 'advanced');

INSERT INTO posts (title, slug, excerpt, content, status, author_id, category_id, published_at) VALUES
('Welcome to Your New CMS', 'welcome-to-your-new-cms', 'This is your first post in the new CMS prototype.', 
'<h1>Welcome to Your New CMS</h1><p>This is your first post! This CMS prototype includes content management, categories, tags, and user management.</p>', 
'published', 1, 1, NOW());

INSERT INTO post_tags (post_id, tag_id) VALUES
(1, 1), (1, 2), (1, 3);

INSERT INTO settings (`key`, `value`, `type`, description) VALUES
('site_name', 'CMS Prototype', 'string', 'The name of your website'),
('site_description', 'A powerful and flexible CMS built with Next.js', 'string', 'Description of your website'),
('posts_per_page', '10', 'number', 'Number of posts to show per page');

-- Verify everything was created
SHOW TABLES;
SELECT COUNT(*) as user_count FROM users;
SELECT COUNT(*) as post_count FROM posts;
SELECT COUNT(*) as category_count FROM categories;