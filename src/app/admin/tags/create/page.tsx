'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function CreateTagPage() {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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
    
    if (name === 'name' && !formData.slug) {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        slug: generateSlug(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
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

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        router.push('/admin/tags');
      } else {
        setError(data.error || 'Failed to create tag');
      }
    } catch (err) {
      setError('An error occurred while creating the tag');
    } finally {
      setLoading(false);
    }
  };

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
              <h1 className="text-2xl font-bold text-gray-900">Create Tag</h1>
              <p className="text-gray-600">Add a new tag to organize your content</p>
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

                {/* Usage Tips */}
                <div className="bg-blue-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-blue-800 mb-2">Tag Best Practices</h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Use specific, descriptive tags (e.g., "React Hooks" vs "Programming")</li>
                    <li>• Keep tags consistent across your content</li>
                    <li>• Avoid creating too many similar tags</li>
                    <li>• Tags help readers find related content</li>
                  </ul>
                </div>

                {/* Submit */}
                <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                  <Link
                    href="/admin/tags"
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    Cancel
                  </Link>
                  <Button type="submit" loading={loading}>
                    Create Tag
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