'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { BlogLayout } from '@/components/blog/BlogLayout';
import { Category } from '@/types';
import { 
  FolderIcon, 
  DocumentTextIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/categories?limit=100');
      const data = await response.json();

      if (data.success) {
        setCategories(data.data);
      } else {
        setError(data.error || 'Failed to load categories');
      }
    } catch (err) {
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const CategoryCard = ({ category }: { category: Category }) => (
    <Link href={`/categories/${category.slug}`}>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer group">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <div
              className="w-4 h-4 rounded mr-3 flex-shrink-0"
              style={{ backgroundColor: category.color }}
            ></div>
            <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600">
              {category.name}
            </h3>
          </div>
          <FolderIcon className="h-6 w-6 text-gray-400 group-hover:text-blue-500" />
        </div>

        {category.description && (
          <p className="text-gray-600 mb-4 line-clamp-2">
            {category.description}
          </p>
        )}

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <DocumentTextIcon className="h-4 w-4" />
              <span>{category.post_count || 0} posts</span>
            </div>
            <div className="flex items-center gap-1">
              <CalendarIcon className="h-4 w-4" />
              <span>Created {formatDate(category.created_at)}</span>
            </div>
          </div>
          <span className="text-blue-600 group-hover:text-blue-700 font-medium">
            View posts →
          </span>
        </div>
      </div>
    </Link>
  );

  if (loading) {
    return (
      <BlogLayout>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="h-10 bg-gray-200 rounded w-48 mx-auto mb-4 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
                <div className="flex items-center mb-4">
                  <div className="w-4 h-4 bg-gray-200 rounded mr-3"></div>
                  <div className="h-6 bg-gray-200 rounded w-32"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
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
          <button 
            onClick={fetchCategories}
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Categories</h1>
          <p className="text-xl text-gray-600">
            Explore our content organized by topics and themes
          </p>
        </div>

        {/* Categories Grid */}
        {categories.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {categories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>

            {/* Stats */}
            <div className="bg-gray-50 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Category Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {categories.length}
                  </div>
                  <div className="text-gray-600">Total Categories</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {categories.filter(c => (c.post_count || 0) > 0).length}
                  </div>
                  <div className="text-gray-600">With Content</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {categories.reduce((sum, c) => sum + (c.post_count || 0), 0)}
                  </div>
                  <div className="text-gray-600">Total Posts</div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <FolderIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No categories yet</h3>
            <p className="text-gray-500 mb-6">
              Categories will appear here once they are created.
            </p>
            <Link 
              href="/admin/categories"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create Categories
            </Link>
          </div>
        )}

        {/* Popular Categories */}
        {categories.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Most Popular</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {categories
                .filter(c => (c.post_count || 0) > 0)
                .sort((a, b) => (b.post_count || 0) - (a.post_count || 0))
                .slice(0, 10)
                .map((category) => (
                  <Link key={category.id} href={`/categories/${category.slug}`}>
                    <span
                      className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium hover:opacity-80 transition-opacity"
                      style={{ 
                        backgroundColor: `${category.color}20`,
                        color: category.color,
                        border: `1px solid ${category.color}40`
                      }}
                    >
                      <FolderIcon className="h-3 w-3 mr-1" />
                      {category.name} ({category.post_count})
                    </span>
                  </Link>
                ))}
            </div>
          </div>
        )}
      </div>
    </BlogLayout>
  );
}