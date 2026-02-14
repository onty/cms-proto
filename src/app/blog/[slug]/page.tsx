'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { BlogLayout } from '@/components/blog/BlogLayout';
import { Post } from '@/types';
import { 
  CalendarIcon, 
  UserIcon, 
  EyeIcon,
  FolderIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

export default function BlogPostPage() {
  const params = useParams();
  const slug = params?.slug as string;
  
  const [post, setPost] = useState<Post | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/posts/slug/${slug}?incrementViews=true`);
      const data = await response.json();

      if (data.success) {
        setPost(data.data);
        // Fetch related posts
        if (data.data.id) {
          fetchRelatedPosts(data.data.id);
        }
      } else {
        setError(data.error || 'Post not found');
      }
    } catch (err) {
      setError('Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedPosts = async (postId: number) => {
    try {
      // For now, just fetch recent posts since we don't have the related posts endpoint
      const response = await fetch(`/api/posts?status=published&limit=3&sort=published_at&order=desc`);
      const data = await response.json();

      if (data.success) {
        // Filter out the current post
        const filtered = data.data.filter((p: Post) => p.id !== postId);
        setRelatedPosts(filtered.slice(0, 3));
      }
    } catch (err) {
      console.error('Failed to fetch related posts:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <BlogLayout>
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </BlogLayout>
    );
  }

  if (error || !post) {
    return (
      <BlogLayout>
        <div className="max-w-4xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h1>
          <p className="text-gray-600 mb-6">
            {error || 'The post you are looking for does not exist.'}
          </p>
          <Link 
            href="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Blog
          </Link>
        </div>
      </BlogLayout>
    );
  }

  return (
    <BlogLayout title={post.seo_title || post.title} description={post.seo_description || post.excerpt}>
      <div className="max-w-4xl mx-auto">
        {/* Back to Blog */}
        <Link 
          href="/blog"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Blog
        </Link>

        {/* Featured Image */}
        {post.featured_image && (
          <div className="mb-8">
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
            />
          </div>
        )}

        {/* Article Header */}
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-6">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              {formatDate(post.published_at || post.created_at)}
            </div>
            {post.author_name && (
              <div className="flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                {post.author_name}
              </div>
            )}
            <div className="flex items-center gap-2">
              <EyeIcon className="h-4 w-4" />
              {post.view_count} views
            </div>
          </div>

          {/* Category and Tags */}
          <div className="flex flex-wrap items-center gap-4">
            {post.category_name && (
              <Link href={`/categories/${post.category?.slug || post.category_id}`}>
                <span 
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium"
                  style={{ 
                    backgroundColor: `${post.category_color || '#3b82f6'}20`,
                    color: post.category_color || '#3b82f6'
                  }}
                >
                  <FolderIcon className="h-4 w-4" />
                  {post.category_name}
                </span>
              </Link>
            )}
            {post.tags && post.tags.map((tag) => (
              <Link key={tag.id} href={`/tags/${tag.slug}`}>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200">
                  #{tag.name}
                </span>
              </Link>
            ))}
          </div>
        </header>

        {/* Article Content */}
        <article className="prose prose-lg prose-gray max-w-none mb-12">
          <div 
            dangerouslySetInnerHTML={{ __html: post.content }}
            className="prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900"
          />
        </article>

        {/* Share Buttons (placeholder) */}
        <div className="border-t border-b border-gray-200 py-8 mb-12">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Share this post</h3>
          <div className="flex items-center space-x-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
              </svg>
              Twitter
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-900">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </button>
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Posts</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <article key={relatedPost.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  {relatedPost.featured_image && (
                    <img
                      src={relatedPost.featured_image}
                      alt={relatedPost.title}
                      className="w-full h-32 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      <Link href={`/blog/${relatedPost.slug}`} className="hover:text-blue-600">
                        {relatedPost.title}
                      </Link>
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">
                      {formatDate(relatedPost.published_at || relatedPost.created_at)}
                    </p>
                    {relatedPost.excerpt && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {relatedPost.excerpt}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </BlogLayout>
  );
}