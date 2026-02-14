'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { BlogLayout } from '@/components/blog/BlogLayout';
import { Category, Post } from '@/types';
import { 
  CalendarIcon, 
  UserIcon, 
  EyeIcon,
  FolderIcon,
  ArrowLeftIcon,
  TagIcon
} from '@heroicons/react/24/outline';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const [resolvedParams, setResolvedParams] = useState<{ slug: string } | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Resolve params
  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  // Fetch data when params are resolved
  useEffect(() => {
    if (resolvedParams?.slug) {
      fetchCategoryAndPosts();
    }
  }, [resolvedParams, page]);

  const fetchCategoryAndPosts = async () => {
    if (!resolvedParams?.slug) return;

    try {
      setLoading(true);

      // Fetch category details
      const categoryResponse = await fetch(`/api/categories/slug/${resolvedParams.slug}`);
      const categoryData = await categoryResponse.json();

      if (!categoryData.success) {
        setError('Category not found');
        return;
      }

      setCategory(categoryData.data);

      // Fetch posts in this category
      const postsResponse = await fetch(
        `/api/posts?status=published&category_id=${categoryData.data.id}&page=${page}&limit=10&sort=published_at&order=desc`
      );
      const postsData = await postsResponse.json();

      if (postsData.success) {
        if (page === 1) {
          setPosts(postsData.data);
        } else {
          setPosts(prev => [...prev, ...postsData.data]);
        }
        setHasMore(postsData.pagination.hasNext);
      } else {
        setError(postsData.error || 'Failed to load posts');
      }
    } catch (err) {
      setError('Failed to load category');
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
          <div className="flex items-center gap-2">
            {post.tags && post.tags.slice(0, 3).map((tag) => (
              <Link key={tag.id} href={`/tags/${tag.slug}`}>
                <span className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
                  <TagIcon className="h-3 w-3" />
                  {tag.name}
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

  if (loading && page === 1) {
    return (
      <BlogLayout>
        <div className="max-w-4xl mx-auto">
          {/* Header Skeleton */}
          <div className="mb-12">
            <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-64 mb-4 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-96 animate-pulse"></div>
          </div>
          
          {/* Posts Skeleton */}
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
        </div>
      </BlogLayout>
    );
  }

  if (error) {
    return (
      <BlogLayout>
        <div className="max-w-4xl mx-auto text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <div className="flex justify-center gap-4">
            <Link 
              href="/categories"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Browse Categories
            </Link>
            <button 
              onClick={() => {
                setError(null);
                setPage(1);
                fetchCategoryAndPosts();
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </BlogLayout>
    );
  }

  return (
    <BlogLayout>
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/categories" className="hover:text-gray-700 flex items-center gap-1">
              <ArrowLeftIcon className="h-4 w-4" />
              Categories
            </Link>
            <span>›</span>
            {category && (
              <span className="text-gray-900 font-medium">{category.name}</span>
            )}
          </div>
        </nav>

        {/* Category Header */}
        {category && (
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div
                className="w-6 h-6 rounded"
                style={{ backgroundColor: category.color }}
              ></div>
              <h1 className="text-4xl font-bold text-gray-900">{category.name}</h1>
            </div>
            
            {category.description && (
              <p className="text-xl text-gray-600 mb-4">
                {category.description}
              </p>
            )}
            
            <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <FolderIcon className="h-4 w-4" />
                <span>{category.post_count || 0} posts</span>
              </div>
              <div className="flex items-center gap-1">
                <CalendarIcon className="h-4 w-4" />
                <span>Created {formatDate(category.created_at)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Posts */}
        {posts.length > 0 ? (
          <div className="space-y-8">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : !loading ? (
          <div className="text-center py-12">
            <FolderIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-500 mb-6">
              There are no published posts in this category yet.
            </p>
            <Link 
              href="/blog"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Explore All Posts
            </Link>
          </div>
        ) : null}

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

        {/* Related Categories */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Explore More Categories</h3>
            <Link 
              href="/categories"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              View All Categories →
            </Link>
          </div>
        </div>
      </div>
    </BlogLayout>
  );
}