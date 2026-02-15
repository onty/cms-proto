-- D1 Seed data for CMS Prototype
-- Converted from MySQL to SQLite format

-- Insert default users with Web Crypto API password hashes (compatible with Workers)
-- admin123, editor123, author123
INSERT OR IGNORE INTO users (id, email, name, password_hash, role, is_active) VALUES
(1, 'admin@example.com', 'Admin User', 'pbkdf2:U/aIL3Er7BAUxv4BmkbMlPYBseOl6uZ6tfKhBZjd3dRTtL3UqbwAyTCs3aLKitET', 'admin', 1),
(2, 'editor@example.com', 'Editor User', 'pbkdf2:U+r0L2qKCyqwnqrkYdiwl5U7YNE+uUKN5jpPrU4NJktKIfUTGZgfv91ylhsR5M4V', 'editor', 1),
(3, 'author@example.com', 'Author User', 'pbkdf2:QC4Jkslnhf7DzRK3Bva3tTU9Xzk3eZnP4eBNSjMycpDYG79+bns0ijjxHUWaMdGo', 'author', 1);

-- Insert default categories
INSERT OR IGNORE INTO categories (id, name, slug, description, color) VALUES
(1, 'Technology', 'technology', 'Posts about technology and programming', '#3b82f6'),
(2, 'News', 'news', 'Latest news and updates', '#ef4444'),
(3, 'Tutorials', 'tutorials', 'Step-by-step tutorials and guides', '#10b981'),
(4, 'Reviews', 'reviews', 'Product and service reviews', '#f59e0b');

-- Insert default tags
INSERT OR IGNORE INTO tags (id, name, slug) VALUES
(1, 'JavaScript', 'javascript'),
(2, 'React', 'react'),
(3, 'Next.js', 'nextjs'),
(4, 'Web Development', 'web-development'),
(5, 'Tutorial', 'tutorial'),
(6, 'Cloudflare', 'cloudflare'),
(7, 'Workers', 'workers'),
(8, 'D1', 'd1');

-- Insert sample posts
INSERT OR IGNORE INTO posts (id, title, slug, content, excerpt, status, author_id, category_id, is_featured, published_at) VALUES
(1, 'Welcome to CMS Prototype', 'welcome-to-cms-prototype', 
'<p>Welcome to our modern CMS built with Next.js and now running on Cloudflare Workers with D1 database!</p><p>This CMS features:</p><ul><li>Role-based authentication</li><li>Content management</li><li>Categories and tags</li><li>Responsive design</li><li>Edge deployment ready</li></ul>', 
'Welcome to our modern CMS built with Next.js and Cloudflare Workers', 'published', 1, 1, 1, datetime('now')),

(2, 'Getting Started with Cloudflare Workers', 'getting-started-cloudflare-workers',
'<p>Cloudflare Workers provide a serverless execution environment that allows you to create entirely new applications or augment existing ones without configuring or maintaining infrastructure.</p><p>Key benefits include:</p><ul><li>Global edge deployment</li><li>Zero cold starts</li><li>Built-in security</li><li>Cost-effective scaling</li></ul>',
'Learn how to get started with Cloudflare Workers for modern web applications', 'published', 2, 1, 0, datetime('now')),

(3, 'Migrating to D1 Database', 'migrating-to-d1-database',
'<p>D1 is Cloudflares first SQL database, built on SQLite. This tutorial covers the migration process from traditional databases.</p><p>Migration steps:</p><ol><li>Schema conversion</li><li>Data migration</li><li>Query adaptation</li><li>Performance optimization</li></ol>',
'Complete guide to migrating your application to Cloudflare D1 database', 'published', 1, 3, 1, datetime('now'));

-- Link posts to tags
INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES
(1, 3), (1, 4), (1, 6), (1, 7),
(2, 6), (2, 7), (2, 4), (2, 5),
(3, 8), (3, 6), (3, 5), (3, 4);

-- Insert default settings
INSERT OR IGNORE INTO settings (key, value, type, description) VALUES
('site_name', 'CMS Prototype', 'string', 'The name of your website'),
('site_description', 'A powerful CMS built with Next.js and Cloudflare Workers', 'string', 'Description of your website'),
('posts_per_page', '10', 'number', 'Number of posts to show per page'),
('allow_registration', 'false', 'boolean', 'Allow new user registration'),
('default_post_status', 'draft', 'string', 'Default status for new posts'),
('featured_posts_count', '5', 'number', 'Number of featured posts to show'),
('site_url', 'https://your-cms.your-domain.workers.dev', 'string', 'Your Cloudflare Workers domain'),
('admin_email', 'admin@example.com', 'string', 'Administrator email address'),
('timezone', 'UTC', 'string', 'Site timezone'),
('enable_comments', 'true', 'boolean', 'Enable comments system');