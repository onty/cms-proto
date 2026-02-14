'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Tag } from '@/types';

interface EditTagPageProps {
  params: Promise<{ id: string }>;
}

export default function EditTagPage({ params }: EditTagPageProps) {
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tag, setTag] = useState<Tag | null>(null);
  const router = useRouter();

  // Resolve params
  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  // Fetch data when params are resolved
  useEffect(() => {
    if (resolvedParams?.id) {
      fetchTag();
    }
  }, [resolvedParams]);

  const fetchTag = async () => {
    if (!resolvedParams?.id) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/tags/${resolvedParams.id}`);
      const data = await response.json();

      if (data.success) {
        const tagData = data.data;
        setTag(tagData);
        setFormData({
          name: tagData.name,
          slug: tagData.slug,
        });
      } else {
        setError('Tag not found');
      }
    } catch (err) {
      setError('Failed to load tag');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGenerateSlug = () => {
    setFormData(prev => ({
      ...prev,
      slug: generateSlug(prev.name)
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Tag name is required');
      return false;
    }
    if (!formData.slug.trim()) {
      setError('Tag slug is required');
      return false;
    }
    if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      setError('Slug can only contain lowercase letters, numbers, and hyphens');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/tags/${resolvedParams?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        router.push('/admin/tags');
      } else {
        setError(data.error || 'Failed to update tag');
      }
    } catch (err) {
      setError('An error occurred while updating the tag');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center">
            <div className="h-6 w-6 bg-gray-200 animate-pulse rounded mr-4"></div>
            <div className="h-8 w-48 bg-gray-200 animate-pulse rounded"></div>
          </div>
          <div className="max-w-2xl">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 w-20 bg-gray-200 animate-pulse rounded"></div>
                      <div className="h-10 w-full bg-gray-200 animate-pulse rounded"></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error && !tag) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/admin/tags">
            <Button>Back to Tags</Button>
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link
              href="/admin/tags"
              className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Tag</h1>
              <p className="text-gray-600">Update tag details</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Tag Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Tag Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Tag Name *
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter tag name"
                      autoFocus
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      The display name for this tag (e.g., "JavaScript", "Web Development")
                    </p>
                  </div>

                  {/* Slug */}
                  <div>
                    <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                      Slug *
                    </label>
                    <div className="flex space-x-2">
                      <Input
                        id="slug"
                        name="slug"
                        type="text"
                        required
                        value={formData.slug}
                        onChange={handleInputChange}
                        placeholder="tag-slug"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={handleGenerateSlug}
                      >
                        Generate
                      </Button>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      URL-friendly version of the name. Only lowercase letters, numbers, and hyphens.
                    </p>
                  </div>
                </div>

                {/* Preview */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preview
                  </label>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      #{formData.name || 'tag-name'}
                    </span>
                    {formData.slug && (
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        /{formData.slug}
                      </code>
                    )}
                  </div>
                </div>

                {/* Tag Stats */}
                {tag && (
                  <div className="bg-blue-50 p-4 rounded-md">
                    <h3 className="text-sm font-medium text-blue-800 mb-2">Tag Statistics</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-blue-600">Posts:</span>
                        <span className="ml-1 font-medium text-blue-900">
                          {tag.post_count || 0}
                        </span>
                      </div>
                      <div>
                        <span className="text-blue-600">Created:</span>
                        <span className="ml-1 font-medium text-blue-900">
                          {new Date(tag.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Warning for used tags */}
                {tag && tag.post_count && tag.post_count > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
                    <div className="flex">
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">
                          Tag in Use
                        </h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <p>
                            This tag is currently used in {tag.post_count} post{tag.post_count > 1 ? 's' : ''}. 
                            Changes to the slug will affect URLs and may impact SEO.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit */}
                <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                  <Link
                    href="/admin/tags"
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    Cancel
                  </Link>
                  <Button type="submit" loading={saving}>
                    Update Tag
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}