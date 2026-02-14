'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/types';
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  TagIcon
} from '@heroicons/react/24/outline';

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tags?limit=100');
      const data = await response.json();

      if (data.success) {
        setTags(data.data);
      } else {
        setError(data.error || 'Failed to load tags');
      }
    } catch (err) {
      setError('Failed to load tags');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this tag?')) return;

    try {
      const response = await fetch(`/api/tags/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.success) {
        fetchTags(); // Refresh the list
      } else {
        alert(data.error || 'Failed to delete tag');
      }
    } catch (err) {
      alert('Failed to delete tag');
    }
  };

  const handleCleanupUnused = async () => {
    if (!confirm('Are you sure you want to delete all unused tags?')) return;

    try {
      const response = await fetch('/api/tags?action=cleanup', {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.success) {
        alert(`Deleted ${data.data.deleted} unused tags`);
        fetchTags(); // Refresh the list
      } else {
        alert(data.error || 'Failed to cleanup tags');
      }
    } catch (err) {
      alert('Failed to cleanup tags');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Tags</h1>
          </div>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchTags}>Try Again</Button>
        </div>
      </AdminLayout>
    );
  }

  const usedTags = tags.filter(tag => (tag.post_count || 0) > 0);
  const unusedTags = tags.filter(tag => (tag.post_count || 0) === 0);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tags</h1>
            <p className="text-gray-600">Manage content tags for better organization</p>
          </div>
          <div className="flex items-center gap-2">
            {unusedTags.length > 0 && (
              <Button 
                variant="secondary" 
                size="sm"
                onClick={handleCleanupUnused}
                className="text-red-600"
              >
                <TrashIcon className="h-4 w-4 mr-1" />
                Cleanup Unused ({unusedTags.length})
              </Button>
            )}
            <Link href="/admin/tags/create">
              <Button className="flex items-center gap-2">
                <PlusIcon className="h-4 w-4" />
                Add Tag
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent>
              <div className="flex items-center p-6">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Total Tags</p>
                  <p className="text-2xl font-bold text-gray-900">{tags.length}</p>
                </div>
                <TagIcon className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="flex items-center p-6">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Used Tags</p>
                  <p className="text-2xl font-bold text-gray-900">{usedTags.length}</p>
                </div>
                <TagIcon className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="flex items-center p-6">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Unused</p>
                  <p className="text-2xl font-bold text-gray-900">{unusedTags.length}</p>
                </div>
                <TagIcon className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="flex items-center p-6">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Popular</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {usedTags.filter(tag => (tag.post_count || 0) > 1).length}
                  </p>
                </div>
                <TagIcon className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tags Grid */}
        <Card>
          <CardHeader>
            <CardTitle>All Tags</CardTitle>
          </CardHeader>
          <CardContent>
            {tags.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tags.map((tag) => (
                  <div 
                    key={tag.id} 
                    className={`p-4 border rounded-lg hover:shadow-md transition-shadow ${
                      (tag.post_count || 0) === 0 ? 'border-gray-200 bg-gray-50' : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900">#{tag.name}</h3>
                        <p className="text-xs text-gray-500 mt-1">
                          Slug: <code className="bg-gray-100 px-1 rounded">{tag.slug}</code>
                        </p>
                        <div className="mt-2 flex items-center gap-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            (tag.post_count || 0) > 0 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {tag.post_count || 0} posts
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(tag.created_at)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Link href={`/admin/tags/${tag.id}/edit`}>
                          <Button variant="ghost" size="sm">
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDelete(tag.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <TagIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No tags</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating a new tag.
                </p>
                <div className="mt-6">
                  <Link href="/admin/tags/create">
                    <Button>
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Add Tag
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Popular Tags */}
        {usedTags.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Popular Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {usedTags
                  .sort((a, b) => (b.post_count || 0) - (a.post_count || 0))
                  .slice(0, 20)
                  .map((tag) => (
                    <span
                      key={tag.id}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                      style={{ fontSize: `${Math.min(16, 10 + (tag.post_count || 0))}px` }}
                    >
                      #{tag.name} ({tag.post_count})
                    </span>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}