-- Seed data for CMS Prototype
-- This file contains initial data to get the CMS up and running

-- Insert default admin user (password: admin123 - you should change this!)
INSERT INTO users (email, name, password_hash, role) VALUES
('admin@example.com', 'Admin User', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeWuEsOdM8tC/.2Y2', 'admin');

-- Insert default categories
INSERT INTO categories (name, slug, description, color) VALUES
('Technology', 'technology', 'Posts about technology and programming', '#3b82f6'),
('News', 'news', 'Latest news and updates', '#ef4444'),
('Tutorials', 'tutorials', 'Step-by-step tutorials and guides', '#10b981'),
('Reviews', 'reviews', 'Product and service reviews', '#f59e0b');

-- Insert default tags
INSERT INTO tags (name, slug) VALUES
('JavaScript', 'javascript'),
('React', 'react'),
('Next.js', 'nextjs'),
('Web Development', 'web-development'),
('Tutorial', 'tutorial'),
('Beginner', 'beginner'),
('Advanced', 'advanced');

-- Insert sample posts
INSERT INTO posts (title, slug, excerpt, content, status, author_id, category_id, published_at) VALUES
('Welcome to Your New CMS', 'welcome-to-your-new-cms', 'This is your first post in the new CMS prototype. Learn how to use all the features.', '<h1>Welcome to Your New CMS</h1><p>This is your first post! This CMS prototype includes:</p><ul><li><strong>Content Management</strong>: Create, edit, and publish posts</li><li><strong>Categories &amp; Tags</strong>: Organize your content</li><li><strong>User Management</strong>: Multiple user roles</li><li><strong>SEO Friendly</strong>: Clean URLs and meta tags</li><li><strong>Responsive Design</strong>: Works on all devices</li></ul><h2>Getting Started</h2><ol><li>Log in to the admin panel</li><li>Create your first category</li><li>Write your first post</li><li>Customize your settings</li></ol><h2>Migration Ready</h2><p>This CMS is designed to be easily migrated to Cloudflare Workers and D1 database when you are ready to scale.</p><p>Happy writing!</p>', 'published', 1, 1, NOW());

INSERT INTO posts (title, slug, excerpt, content, status, author_id, category_id, published_at) VALUES
('How to Create Your First Post', 'how-to-create-your-first-post', 'A step-by-step guide to creating and publishing your first post in the CMS.', '<h1>How to Create Your First Post</h1><p>Creating content in this CMS is simple and intuitive. Follow these steps:</p><h2>Step 1: Access the Admin Panel</h2><p>Navigate to <code>/admin</code> and log in with your credentials.</p><h2>Step 2: Click "New Post"</h2><p>In the admin dashboard, click the "New Post" button.</p><h2>Step 3: Fill in the Details</h2><ul><li><strong>Title</strong>: Choose a compelling title</li><li><strong>Content</strong>: Write your content using Markdown</li><li><strong>Category</strong>: Select an appropriate category</li><li><strong>Tags</strong>: Add relevant tags</li><li><strong>SEO</strong>: Set meta title and description</li></ul><h2>Step 4: Preview and Publish</h2><p>Use the preview feature to see how your post will look, then hit publish!</p><h2>Tips for Great Content</h2><ul><li>Use headings to structure your content</li><li>Add images to make posts more engaging</li><li>Write compelling excerpts</li><li>Use tags for better discoverability</li></ul><p>That is it! Your post is now live and ready for your audience.</p>', 'published', 1, 3, NOW());

-- Link posts to tags
INSERT INTO post_tags (post_id, tag_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4),
(2, 4), (2, 5), (2, 6);

-- Insert default settings
INSERT INTO settings (`key`, `value`, `type`, description) VALUES
('site_name', 'CMS Prototype', 'string', 'The name of your website'),
('site_description', 'A powerful and flexible CMS built with Next.js', 'string', 'Description of your website'),
('posts_per_page', '10', 'number', 'Number of posts to show per page'),
('allow_registration', 'false', 'boolean', 'Allow new user registration'),
('default_post_status', 'draft', 'string', 'Default status for new posts'),
('featured_posts_count', '5', 'number', 'Number of featured posts to show');