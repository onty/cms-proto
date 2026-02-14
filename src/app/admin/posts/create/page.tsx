'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Category, Tag } from '@/types';

export default function CreatePostPage() {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    status: 'draft' as 'draft' | 'published' | 'archived',
    category_id: null as number | null,
    tags: [] as number[],
    featured_image: '',
    is_featured: false,
    published_at: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchCategories();
    fetchTags();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories?limit=100');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/tags?limit=100');
      const data = await response.json();
      if (data.success) {
        setTags(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch tags:', err);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (name === 'title' && !formData.slug) {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        slug: generateSlug(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'category_id' ? (value === '' ? null : parseInt(value)) : value
      }));
    }
  };

  const handleTagToggle = (tag: Tag) => {
    const isSelected = selectedTags.some(t => t.id === tag.id);
    if (isSelected) {
      setSelectedTags(prev => prev.filter(t => t.id !== tag.id));
      setFormData(prev => ({
        ...prev,
        tags: prev.tags.filter(id => id !== tag.id)
      }));
    } else {
      setSelectedTags(prev => [...prev, tag]);
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag.id]
      }));
    }
  };

  const generateSlugFromTitle = () => {
    setFormData(prev => ({
      ...prev,
      slug: generateSlug(prev.title)
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return false;
    }
    if (!formData.slug.trim()) {
      setError('Slug is required');
      return false;
    }
    if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      setError('Slug can only contain lowercase letters, numbers, and hyphens');
      return false;
    }
    if (!formData.content.trim()) {
      setError('Content is required');
      return false;
    }
    if (formData.status === 'published' && !formData.published_at) {
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      setFormData(prev => ({ ...prev, published_at: now.toISOString().slice(0, 16) }));
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
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        router.push('/admin/posts');
      } else {
        setError(data.error || 'Failed to create post');
      }
    } catch (err) {
      setError('An error occurred while creating the post');
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
              href="/admin/posts"
              className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create Post</h1>
              <p className="text-gray-600">Write and publish a new blog post</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Post Content</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                      {error}
                    </div>
                  )}

                  {/* Title & Slug */}
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                        Title *
                      </label>
                      <Input
                        id="title"
                        name="title"
                        type="text"
                        required
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Enter post title"
                        autoFocus
                      />
                    </div>

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
                          placeholder="post-slug"
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={generateSlugFromTitle}
                        >
                          Generate
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Excerpt */}
                  <div>
                    <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
                      Excerpt
                    </label>
                    <Textarea
                      id="excerpt"
                      name="excerpt"
                      rows={3}
                      value={formData.excerpt}
                      onChange={handleInputChange}
                      placeholder="Brief description of this post (optional)"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      If left blank, an excerpt will be generated from the content.
                    </p>
                  </div>

                  {/* Content */}
                  <div>
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                      Content *
                    </label>
                    <Textarea
                      id="content"
                      name="content"
                      rows={12}
                      value={formData.content}
                      onChange={handleInputChange}
                      placeholder="Write your post content here... (Markdown supported)"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Supports Markdown formatting. A rich text editor will be available soon.
                    </p>
                  </div>

                  {/* Submit Buttons - Desktop */}
                  <div className="hidden lg:flex items-center justify-end space-x-4 pt-6 border-t">
                    <Link
                      href="/admin/posts"
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                    >
                      Cancel
                    </Link>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setFormData(prev => ({ ...prev, status: 'draft' }))}
                      loading={loading && formData.status === 'draft'}
                    >
                      Save as Draft
                    </Button>
                    <Button
                      type="submit"
                      onClick={() => setFormData(prev => ({ ...prev, status: 'published' }))}
                      loading={loading && formData.status === 'published'}
                    >
                      Publish
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                    Publication Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                {formData.status === 'published' && (
                  <div>
                    <label htmlFor="published_at" className="block text-sm font-medium text-gray-700 mb-2">
                      Publish Date
                    </label>
                    <Input
                      id="published_at"
                      name="published_at"
                      type="datetime-local"
                      value={formData.published_at}
                      onChange={handleInputChange}
                    />
                  </div>
                )}

                <div>
                  <div className="flex items-center">
                    <input
                      id="is_featured"
                      name="is_featured"
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_featured" className="ml-2 block text-sm text-gray-900">
                      Featured Post
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Category */}
            <Card>
              <CardHeader>
                <CardTitle>Category</CardTitle>
              </CardHeader>
              <CardContent>
                <select
                  id="category_id"
                  name="category_id"
                  value={formData.category_id || ''}
                  onChange={handleInputChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Uncategorized</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {tags.map((tag) => (
                    <div key={tag.id} className="flex items-center">
                      <input
                        id={`tag-${tag.id}`}
                        type="checkbox"
                        checked={selectedTags.some(t => t.id === tag.id)}
                        onChange={() => handleTagToggle(tag)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`tag-${tag.id}`} className="ml-2 block text-sm text-gray-900">
                        #{tag.name}
                      </label>
                    </div>
                  ))}
                </div>
                {selectedTags.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex flex-wrap gap-1">
                      {selectedTags.map((tag) => (
                        <span
                          key={tag.id}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          #{tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Featured Image */}
            <Card>
              <CardHeader>
                <CardTitle>Featured Image</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Input
                    id="featured_image"
                    name="featured_image"
                    type="url"
                    value={formData.featured_image}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Optional URL for the post's featured image
                  </p>
                  {formData.featured_image && (
                    <div className="mt-3">
                      <img
                        src={formData.featured_image}
                        alt="Featured preview"
                        className="w-full rounded-md"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Submit Buttons - Mobile */}
            <div className="lg:hidden flex flex-col space-y-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setFormData(prev => ({ ...prev, status: 'draft' }))}
                loading={loading && formData.status === 'draft'}
                className="w-full"
              >
                Save as Draft
              </Button>
              <Button
                type="submit"
                onClick={() => setFormData(prev => ({ ...prev, status: 'published' }))}
                loading={loading && formData.status === 'published'}
                className="w-full"
              >
                Publish
              </Button>
              <Link
                href="/admin/posts"
                className="block w-full text-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Cancel
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}