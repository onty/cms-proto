/**
 * Static Routes Handler for Cloudflare Workers
 * Handles all public static routes (blog, categories, about, etc.)
 */

import type { Env } from '../index';
import { PostModel } from '../models/Post';
import { CategoryModel } from '../models/Category';
import { TagModel } from '../models/Tag';
import { SettingsModel } from '../models/Settings';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Simple HTML template for static pages
const HTML_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}}</title>
    <meta name="description" content="{{description}}">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        .prose { max-width: none; }
        .prose img { max-width: 100%; height: auto; }
    </style>
</head>
<body class="bg-gray-50">
    <div id="root">{{content}}</div>
    <script>
        // Add any client-side JavaScript here
    </script>
</body>
</html>
`;

export async function handleStaticRoutes(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;

  try {
    // Route handling
    if (path === '/') {
      return await renderHomePage();
    }
    
    if (path === '/blog') {
      return await renderBlogPage(url.searchParams);
    }
    
    if (path.startsWith('/blog/')) {
      const slug = path.split('/')[2];
      return await renderPostPage(slug);
    }
    
    if (path === '/categories') {
      return await renderCategoriesPage();
    }
    
    if (path.startsWith('/categories/')) {
      const slug = path.split('/')[2];
      return await renderCategoryPage(slug, url.searchParams);
    }
    
    if (path === '/about') {
      return await renderAboutPage();
    }

    // 404 for unknown routes
    return new Response(
      renderTemplate('Page Not Found', 'Page not found', renderNotFound()),
      {
        status: 404,
        headers: { 
          'Content-Type': 'text/html',
          ...corsHeaders 
        }
      }
    );

  } catch (error) {
    console.error('Static route error:', error);
    return new Response(
      renderTemplate('Error', 'Server error', renderError()),
      {
        status: 500,
        headers: { 
          'Content-Type': 'text/html',
          ...corsHeaders 
        }
      }
    );
  }
}

async function renderHomePage(): Promise<Response> {
  try {
    const settings = await SettingsModel.getAllAsObject();
    const featuredPosts = await PostModel.getFeatured(3);
    const recentPosts = await PostModel.getAll({ status: 'published', limit: 6 });
    
    const content = `
      <div class="min-h-screen bg-gray-50">
        <!-- Header -->
        <header class="bg-white shadow-sm border-b">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center py-6">
              <div class="flex justify-start lg:w-0 lg:flex-1">
                <a href="/" class="flex items-center">
                  <h1 class="text-2xl font-bold text-gray-900">${settings.site_name || 'CMS Prototype'}</h1>
                </a>
              </div>
              <div class="hidden md:flex items-center justify-end md:flex-1 lg:w-0 space-x-4">
                <a href="/blog" class="text-gray-600 hover:text-gray-900 font-medium">Blog</a>
                <a href="/categories" class="text-gray-600 hover:text-gray-900 font-medium">Categories</a>
                <a href="/about" class="text-gray-600 hover:text-gray-900 font-medium">About</a>
                <a href="/admin/dashboard" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium">Admin</a>
              </div>
            </div>
          </div>
        </header>

        <!-- Hero Section -->
        <div class="bg-white">
          <div class="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
            <div class="text-center">
              <h1 class="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
                ${settings.site_name || 'Modern CMS'}
              </h1>
              <p class="max-w-xl mt-5 mx-auto text-xl text-gray-500">
                ${settings.site_description || 'A powerful content management system built with modern technologies'}
              </p>
              <div class="mt-8 flex justify-center space-x-4">
                <a href="/blog" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium">View Blog</a>
                <a href="/admin/dashboard" class="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-md font-medium">Admin Panel</a>
              </div>
            </div>
          </div>
        </div>

        <!-- Featured Posts -->
        ${featuredPosts && featuredPosts.length > 0 ? `
        <div class="py-16 bg-gray-50">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center">
              <h2 class="text-3xl font-extrabold text-gray-900">Featured Posts</h2>
              <p class="mt-4 text-xl text-gray-600">Discover our most popular content</p>
            </div>
            <div class="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              ${featuredPosts.map((post: any) => `
                <article class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  ${post.featured_image ? `<img src="${post.featured_image}" alt="${post.title}" class="w-full h-48 object-cover">` : ''}
                  <div class="p-6">
                    <h3 class="text-xl font-semibold text-gray-900 mb-2">
                      <a href="/blog/${post.slug}" class="hover:text-blue-600">${post.title}</a>
                    </h3>
                    <p class="text-gray-600 mb-4">${post.excerpt || ''}</p>
                    <div class="text-sm text-gray-500">
                      ${new Date(post.published_at || post.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </article>
              `).join('')}
            </div>
          </div>
        </div>
        ` : ''}

        <!-- Recent Posts -->
        ${recentPosts.posts && recentPosts.posts.length > 0 ? `
        <div class="py-16 bg-white">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center">
              <h2 class="text-3xl font-extrabold text-gray-900">Recent Posts</h2>
              <p class="mt-4 text-xl text-gray-600">Stay updated with our latest content</p>
            </div>
            <div class="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              ${recentPosts.posts.map((post: any) => `
                <article class="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors">
                  <h3 class="text-lg font-semibold text-gray-900 mb-2">
                    <a href="/blog/${post.slug}" class="hover:text-blue-600">${post.title}</a>
                  </h3>
                  <p class="text-gray-600 text-sm mb-4">${post.excerpt || ''}</p>
                  <div class="text-xs text-gray-500">
                    ${new Date(post.published_at || post.created_at).toLocaleDateString()}
                  </div>
                </article>
              `).join('')}
            </div>
            <div class="text-center mt-8">
              <a href="/blog" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium">View All Posts</a>
            </div>
          </div>
        </div>
        ` : ''}

        <!-- Footer -->
        <footer class="bg-gray-800">
          <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div class="text-center text-white">
              <p>&copy; 2024 ${settings.site_name || 'CMS Prototype'}. Built with Cloudflare Workers & D1.</p>
            </div>
          </div>
        </footer>
      </div>
    `;

    return new Response(
      renderTemplate(
        settings.site_name || 'CMS Prototype',
        settings.site_description || 'Modern CMS',
        content
      ),
      {
        status: 200,
        headers: { 
          'Content-Type': 'text/html',
          ...corsHeaders 
        }
      }
    );

  } catch (error) {
    console.error('Home page error:', error);
    throw error;
  }
}

async function renderBlogPage(searchParams: URLSearchParams): Promise<Response> {
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  
  const { posts, total } = await PostModel.getAll({ 
    status: 'published', 
    page, 
    limit 
  });
  
  const totalPages = Math.ceil(total / limit);
  
  const content = `
    <div class="min-h-screen bg-gray-50">
      <div class="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900">Blog</h1>
          <p class="mt-4 text-xl text-gray-600">Discover our latest articles and insights</p>
        </div>

        <div class="space-y-8">
          ${posts.map(post => `
            <article class="bg-white rounded-lg shadow-md p-8">
              <h2 class="text-2xl font-bold text-gray-900 mb-4">
                <a href="/blog/${post.slug}" class="hover:text-blue-600">${post.title}</a>
              </h2>
              <div class="text-gray-600 mb-4">
                ${new Date(post.published_at || post.created_at).toLocaleDateString()} 
                ${post.category_name ? `• ${post.category_name}` : ''}
              </div>
              <p class="text-gray-700 mb-4">${post.excerpt || ''}</p>
              <a href="/blog/${post.slug}" class="text-blue-600 hover:text-blue-800 font-medium">Read more →</a>
            </article>
          `).join('')}
        </div>

        ${totalPages > 1 ? `
        <div class="mt-12 flex justify-center space-x-4">
          ${page > 1 ? `<a href="/blog?page=${page - 1}" class="px-4 py-2 bg-blue-600 text-white rounded-md">Previous</a>` : ''}
          <span class="px-4 py-2 bg-gray-200 rounded-md">Page ${page} of ${totalPages}</span>
          ${page < totalPages ? `<a href="/blog?page=${page + 1}" class="px-4 py-2 bg-blue-600 text-white rounded-md">Next</a>` : ''}
        </div>
        ` : ''}
      </div>
    </div>
  `;

  return new Response(
    renderTemplate('Blog', 'Latest blog posts', content),
    {
      status: 200,
      headers: { 
        'Content-Type': 'text/html',
        ...corsHeaders 
      }
    }
  );
}

async function renderPostPage(slug: string): Promise<Response> {
  const post = await PostModel.getBySlug(slug);
  
  if (!post) {
    return new Response(
      renderTemplate('Post Not Found', 'Post not found', renderNotFound()),
      {
        status: 404,
        headers: { 
          'Content-Type': 'text/html',
          ...corsHeaders 
        }
      }
    );
  }

  // Increment view count
  await PostModel.incrementViewCount(post.id);

  const content = `
    <div class="min-h-screen bg-gray-50">
      <article class="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div class="bg-white rounded-lg shadow-lg p-8">
          <header class="mb-8">
            <h1 class="text-4xl font-bold text-gray-900 mb-4">${post.title}</h1>
            <div class="text-gray-600 mb-4">
              ${new Date(post.published_at || post.created_at).toLocaleDateString()}
              ${post.category_name ? `• ${post.category_name}` : ''}
              ${post.author_name ? `• By ${post.author_name}` : ''}
            </div>
            ${post.excerpt ? `<p class="text-xl text-gray-700">${post.excerpt}</p>` : ''}
          </header>

          <div class="prose max-w-none">
            ${post.content}
          </div>

          <footer class="mt-12 pt-8 border-t border-gray-200">
            <div class="text-sm text-gray-500">
              Views: ${post.view_count || 0}
            </div>
          </footer>
        </div>
      </article>
    </div>
  `;

  return new Response(
    renderTemplate(post.title, post.excerpt || post.title, content),
    {
      status: 200,
      headers: { 
        'Content-Type': 'text/html',
        ...corsHeaders 
      }
    }
  );
}

async function renderCategoriesPage(): Promise<Response> {
  const { categories } = await CategoryModel.getAll({});

  const content = `
    <div class="min-h-screen bg-gray-50">
      <div class="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900">Categories</h1>
          <p class="mt-4 text-xl text-gray-600">Explore posts by category</p>
        </div>

        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          ${categories.map(category => `
            <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div class="flex items-center mb-4">
                <div class="w-4 h-4 rounded-full mr-3" style="background-color: ${category.color}"></div>
                <h3 class="text-xl font-semibold text-gray-900">
                  <a href="/categories/${category.slug}" class="hover:text-blue-600">${category.name}</a>
                </h3>
              </div>
              ${category.description ? `<p class="text-gray-600 mb-4">${category.description}</p>` : ''}
              <div class="text-sm text-gray-500">
                ${category.post_count || 0} posts
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  return new Response(
    renderTemplate('Categories', 'Browse content by category', content),
    {
      status: 200,
      headers: { 
        'Content-Type': 'text/html',
        ...corsHeaders 
      }
    }
  );
}

async function renderCategoryPage(slug: string, searchParams: URLSearchParams): Promise<Response> {
  const category = await CategoryModel.getBySlug(slug);
  
  if (!category) {
    return new Response(
      renderTemplate('Category Not Found', 'Category not found', renderNotFound()),
      {
        status: 404,
        headers: { 
          'Content-Type': 'text/html',
          ...corsHeaders 
        }
      }
    );
  }

  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  
  const { posts, total } = await PostModel.getAll({ 
    status: 'published',
    category_id: category.id,
    page, 
    limit 
  });
  
  const totalPages = Math.ceil(total / limit);

  const content = `
    <div class="min-h-screen bg-gray-50">
      <div class="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <div class="flex items-center justify-center mb-4">
            <div class="w-6 h-6 rounded-full mr-3" style="background-color: ${category.color}"></div>
            <h1 class="text-4xl font-bold text-gray-900">${category.name}</h1>
          </div>
          ${category.description ? `<p class="text-xl text-gray-600">${category.description}</p>` : ''}
          <div class="text-sm text-gray-500 mt-2">${total} posts in this category</div>
        </div>

        <div class="space-y-8">
          ${posts.map(post => `
            <article class="bg-white rounded-lg shadow-md p-8">
              <h2 class="text-2xl font-bold text-gray-900 mb-4">
                <a href="/blog/${post.slug}" class="hover:text-blue-600">${post.title}</a>
              </h2>
              <div class="text-gray-600 mb-4">
                ${new Date(post.published_at || post.created_at).toLocaleDateString()}
                ${post.author_name ? `• By ${post.author_name}` : ''}
              </div>
              <p class="text-gray-700 mb-4">${post.excerpt || ''}</p>
              <a href="/blog/${post.slug}" class="text-blue-600 hover:text-blue-800 font-medium">Read more →</a>
            </article>
          `).join('')}
        </div>

        ${totalPages > 1 ? `
        <div class="mt-12 flex justify-center space-x-4">
          ${page > 1 ? `<a href="/categories/${slug}?page=${page - 1}" class="px-4 py-2 bg-blue-600 text-white rounded-md">Previous</a>` : ''}
          <span class="px-4 py-2 bg-gray-200 rounded-md">Page ${page} of ${totalPages}</span>
          ${page < totalPages ? `<a href="/categories/${slug}?page=${page + 1}" class="px-4 py-2 bg-blue-600 text-white rounded-md">Next</a>` : ''}
        </div>
        ` : ''}
      </div>
    </div>
  `;

  return new Response(
    renderTemplate(category.name, category.description || category.name, content),
    {
      status: 200,
      headers: { 
        'Content-Type': 'text/html',
        ...corsHeaders 
      }
    }
  );
}

async function renderAboutPage(): Promise<Response> {
  const settings = await SettingsModel.getAllAsObject();

  const content = `
    <div class="min-h-screen bg-gray-50">
      <div class="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div class="bg-white rounded-lg shadow-lg p-8">
          <h1 class="text-4xl font-bold text-gray-900 mb-8 text-center">About Us</h1>

          <div class="prose max-w-none">
            <p class="text-xl text-gray-600 mb-8 text-center">
              ${settings.site_description || 'A modern content management system built with cutting-edge technology.'}
            </p>

            <h2 class="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p class="text-gray-700 mb-6">
              We're dedicated to providing a powerful, flexible, and user-friendly content management system
              that empowers creators and developers to build amazing digital experiences.
            </p>

            <h2 class="text-2xl font-bold text-gray-900 mb-4">Technology Stack</h2>
            <p class="text-gray-700 mb-4">Our CMS is built with modern, scalable technologies:</p>
            <ul class="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li><strong>Cloudflare Workers:</strong> Global edge deployment for lightning-fast performance</li>
              <li><strong>D1 Database:</strong> Distributed SQLite database with global replication</li>
              <li><strong>TypeScript:</strong> Type-safe development for better reliability</li>
              <li><strong>Modern Web Standards:</strong> Built on web platform APIs</li>
            </ul>

            <h2 class="text-2xl font-bold text-gray-900 mb-4">Features</h2>
            <div class="grid md:grid-cols-2 gap-4 mb-6">
              <div class="bg-gray-50 p-4 rounded-lg">
                <h3 class="font-semibold text-gray-900 mb-2">Content Management</h3>
                <p class="text-gray-600 text-sm">Full-featured editor with categories and tags</p>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <h3 class="font-semibold text-gray-900 mb-2">User Management</h3>
                <p class="text-gray-600 text-sm">Role-based access control and authentication</p>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <h3 class="font-semibold text-gray-900 mb-2">Performance</h3>
                <p class="text-gray-600 text-sm">Edge deployment with global caching</p>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <h3 class="font-semibold text-gray-900 mb-2">Scalability</h3>
                <p class="text-gray-600 text-sm">Auto-scaling with zero configuration</p>
              </div>
            </div>

            <h2 class="text-2xl font-bold text-gray-900 mb-4">Contact</h2>
            <p class="text-gray-700">
              For questions or support, please contact us at: 
              <a href="mailto:${settings.admin_email || 'admin@example.com'}" class="text-blue-600 hover:text-blue-800">
                ${settings.admin_email || 'admin@example.com'}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `;

  return new Response(
    renderTemplate('About Us', 'Learn more about our CMS', content),
    {
      status: 200,
      headers: { 
        'Content-Type': 'text/html',
        ...corsHeaders 
      }
    }
  );
}

function renderNotFound(): string {
  return `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center">
      <div class="text-center">
        <h1 class="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p class="text-xl text-gray-600 mb-8">Page not found</p>
        <a href="/" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium">
          Go Home
        </a>
      </div>
    </div>
  `;
}

function renderError(): string {
  return `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center">
      <div class="text-center">
        <h1 class="text-6xl font-bold text-gray-900 mb-4">500</h1>
        <p class="text-xl text-gray-600 mb-8">Internal server error</p>
        <a href="/" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium">
          Go Home
        </a>
      </div>
    </div>
  `;
}

function renderTemplate(title: string, description: string, content: string): string {
  return HTML_TEMPLATE
    .replace('{{title}}', title)
    .replace('{{description}}', description)
    .replace('{{content}}', content);
}