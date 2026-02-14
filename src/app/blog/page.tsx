'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { BlogLayout } from '@/components/blog/BlogLayout';
import { Post } from '@/types';
import { 
  CalendarIcon, 
  UserIcon, 
  EyeIcon,
  FolderIcon
} from '@heroicons/react/24/outline';

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [page]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/posts?status=published&page=${page}&limit=10&sort=published_at&order=desc`);
      const data = await response.json();

      if (data.success) {
        if (page === 1) {
          setPosts(data.data);
        } else {
          setPosts(prev => [...prev, ...data.data]);
        }
        setHasMore(data.pagination.hasNext);
      } else {
        setError(data.error || 'Failed to load posts');
      }
    } catch (err) {
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const PostCard = ({ post }: { post: Post }) => (
    <article className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {post.featured_image && (
        <div className="aspect-w-16 aspect-h-9">
          <img
            src={post.featured_image}
            alt={post.title}
            className="w-full h-48 object-cover"
          />
        </div>
      )}
      <div className="p-6">
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <CalendarIcon className="h-4 w-4" />
            {formatDate(post.published_at || post.created_at)}
          </div>
          {post.author_name && (
            <div className="flex items-center gap-1">
              <UserIcon className="h-4 w-4" />
              {post.author_name}
            </div>
          )}
          <div className="flex items-center gap-1">
            <EyeIcon className="h-4 w-4" />
            {post.view_count}
          </div>
        </div>

        <h2 className="text-xl font-semibold text-gray-900 mb-3 hover:text-blue-600">
          <Link href={`/blog/${post.slug}`}>
            {post.title}
          </Link>
        </h2>

        {post.excerpt && (
          <p className="text-gray-600 mb-4 line-clamp-3">
            {post.excerpt}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {post.category_name && (
              <Link href={`/categories/${post.category?.slug || post.category_id}`}>
                <span 
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium"
                  style={{ 
                    backgroundColor: `${post.category_color || '#3b82f6'}20`,
                    color: post.category_color || '#3b82f6'
                  }}
                >
                  <FolderIcon className="h-3 w-3" />
                  {post.category_name}
                </span>
              </Link>
            )}
            {post.tags && post.tags.slice(0, 3).map((tag) => (
              <Link key={tag.id} href={`/tags/${tag.slug}`}>
                <span className="text-sm text-gray-500 hover:text-gray-700">
                  #{tag.name}
                </span>
              </Link>
            ))}
          </div>
          <Link 
            href={`/blog/${post.slug}`}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            Read more →
          </Link>
        </div>
      </div>
    </article>
  );

  if (error) {
    return (
      <BlogLayout>
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => {
              setError(null);
              setPage(1);
              fetchPosts();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </BlogLayout>
    );
  }

  return (
    <BlogLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog</h1>
          <p className="text-xl text-gray-600">
            Discover our latest articles and insights
          </p>
        </div>

        {/* Posts Grid */}
        {posts.length > 0 ? (
          <div className="space-y-8">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : loading && page === 1 ? (
          <div className="space-y-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No posts published yet.</p>
            <Link 
              href="/admin"
              className="mt-4 inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create Your First Post
            </Link>
          </div>
        )}

        {/* Load More Button */}
        {hasMore && (
          <div className="text-center mt-12">
            <button
              onClick={() => setPage(prev => prev + 1)}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : 'Load More Posts'}
            </button>
          </div>
        )}
      </div>
    </BlogLayout>
  );
}