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
import { Category } from '@/types';

interface EditCategoryPageProps {
  params: Promise<{ id: string }>;
}

export default function EditCategoryPage({ params }: EditCategoryPageProps) {
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    color: '#3b82f6',
    parent_id: null as number | null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parents, setParents] = useState<Category[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const router = useRouter();

  // Resolve params
  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  // Fetch data when params are resolved
  useEffect(() => {
    if (resolvedParams?.id) {
      fetchCategory();
      fetchParentCategories();
    }
  }, [resolvedParams]);

  const fetchCategory = async () => {
    if (!resolvedParams?.id) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/categories/${resolvedParams.id}`);
      const data = await response.json();

      if (data.success) {
        const cat = data.data;
        setCategory(cat);
        setFormData({
          name: cat.name,
          slug: cat.slug,
          description: cat.description || '',
          color: cat.color || '#3b82f6',
          parent_id: cat.parent_id,
        });
      } else {
        setError('Category not found');
      }
    } catch (err) {
      setError('Failed to load category');
    } finally {
      setLoading(false);
    }
  };

  const fetchParentCategories = async () => {
    if (!resolvedParams?.id) return;
    
    try {
      const response = await fetch('/api/categories?limit=100');
      const data = await response.json();
      if (data.success) {
        // Filter out current category and its children to prevent circular references
        const filtered = data.data.filter((cat: Category) => 
          cat.id !== parseInt(resolvedParams.id) && 
          cat.parent_id !== parseInt(resolvedParams.id)
        );
        setParents(filtered);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'parent_id' ? (value === '' ? null : parseInt(value)) : value
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
      setError('Category name is required');
      return false;
    }
    if (!formData.slug.trim()) {
      setError('Category slug is required');
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
      const response = await fetch(`/api/categories/${resolvedParams?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        router.push('/admin/categories');
      } else {
        setError(data.error || 'Failed to update category');
      }
    } catch (err) {
      setError('An error occurred while updating the category');
    } finally {
      setSaving(false);
    }
  };

  const colorOptions = [
    { value: '#3b82f6', label: 'Blue' },
    { value: '#ef4444', label: 'Red' },
    { value: '#10b981', label: 'Green' },
    { value: '#f59e0b', label: 'Yellow' },
    { value: '#8b5cf6', label: 'Purple' },
    { value: '#06b6d4', label: 'Cyan' },
    { value: '#84cc16', label: 'Lime' },
    { value: '#f97316', label: 'Orange' },
    { value: '#ec4899', label: 'Pink' },
    { value: '#6b7280', label: 'Gray' },
  ];

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
                  {[1, 2, 3, 4].map((i) => (
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

  if (error && !category) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/admin/categories">
            <Button>Back to Categories</Button>
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
              href="/admin/categories"
              className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Category</h1>
              <p className="text-gray-600">Update category details</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Category Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Category Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Category Name *
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter category name"
                    />
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
                        placeholder="category-slug"
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

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <Textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Brief description of this category (optional)"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Color */}
                  <div>
                    <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-2">
                      Color
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        id="color"
                        name="color"
                        value={formData.color}
                        onChange={handleInputChange}
                        className="h-10 w-16 rounded border border-gray-300 cursor-pointer"
                      />
                      <select
                        name="color"
                        value={formData.color}
                        onChange={handleInputChange}
                        className="flex-1 appearance-none block px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        {colorOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Parent Category */}
                  <div>
                    <label htmlFor="parent_id" className="block text-sm font-medium text-gray-700 mb-2">
                      Parent Category
                    </label>
                    <select
                      id="parent_id"
                      name="parent_id"
                      value={formData.parent_id || ''}
                      onChange={handleInputChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">None (Top Level)</option>
                      {parents.map((parent) => (
                        <option key={parent.id} value={parent.id}>
                          {parent.name}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                      Optional. Choose a parent to create a subcategory.
                    </p>
                  </div>
                </div>

                {/* Preview */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preview
                  </label>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
                    <div
                      className="h-4 w-4 rounded"
                      style={{ backgroundColor: formData.color }}
                    ></div>
                    <span className="font-medium">
                      {formData.name || 'Category Name'}
                    </span>
                    {formData.description && (
                      <span className="text-gray-500 text-sm">
                        - {formData.description}
                      </span>
                    )}
                  </div>
                </div>

                {/* Category Stats */}
                {category && (
                  <div className="bg-blue-50 p-4 rounded-md">
                    <h3 className="text-sm font-medium text-blue-800 mb-2">Category Statistics</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-blue-600">Posts:</span>
                        <span className="ml-1 font-medium text-blue-900">
                          {category.post_count || 0}
                        </span>
                      </div>
                      <div>
                        <span className="text-blue-600">Created:</span>
                        <span className="ml-1 font-medium text-blue-900">
                          {new Date(category.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit */}
                <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                  <Link
                    href="/admin/categories"
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    Cancel
                  </Link>
                  <Button type="submit" loading={saving}>
                    Update Category
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