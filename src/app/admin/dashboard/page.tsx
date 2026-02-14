'use client';

import React, { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import {
  DocumentTextIcon,
  FolderIcon,
  TagIcon,
  UsersIcon,
  EyeIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

interface DashboardStats {
  posts: {
    total: number;
    published: number;
    drafts: number;
    archived: number;
    totalViews: number;
  };
  categories: number;
  tags: number;
  users: number;
}

interface RecentPost {
  id: number;
  title: string;
  status: string;
  created_at: string;
  view_count: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch stats from different endpoints
      const [postsRes, categoriesRes, tagsRes, usersRes, recentPostsRes] = await Promise.all([
        fetch('/api/posts?limit=1').then(r => r.json()),
        fetch('/api/categories?limit=1').then(r => r.json()),
        fetch('/api/tags?limit=1').then(r => r.json()),
        fetch('/api/users?limit=1').then(r => r.json()),
        fetch('/api/posts?limit=5&sort=created_at&order=desc').then(r => r.json())
      ]);

      // Get post stats (we'll need a dedicated endpoint for this)
      const postStatsRes = await fetch('/api/posts?status=published&limit=1').then(r => r.json());
      const draftStatsRes = await fetch('/api/posts?status=draft&limit=1').then(r => r.json());
      const archivedStatsRes = await fetch('/api/posts?status=archived&limit=1').then(r => r.json());

      const dashboardStats: DashboardStats = {
        posts: {
          total: postsRes.pagination?.total || 0,
          published: postStatsRes.pagination?.total || 0,
          drafts: draftStatsRes.pagination?.total || 0,
          archived: archivedStatsRes.pagination?.total || 0,
          totalViews: 0 // We'll calculate this from the posts
        },
        categories: categoriesRes.pagination?.total || 0,
        tags: tagsRes.pagination?.total || 0,
        users: usersRes.pagination?.total || 0
      };

      setStats(dashboardStats);
      setRecentPosts(recentPostsRes.data || []);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, href }: {
    title: string;
    value: number;
    icon: React.ComponentType<any>;
    color: string;
    href?: string;
  }) => (
    <Card className="relative overflow-hidden">
      <CardContent>
        <div className="flex items-center justify-between p-6">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
          </div>
          <div className={`p-3 rounded-full ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
        {href && (
          <Link href={href} className="absolute inset-0 hover:bg-gray-50 hover:bg-opacity-50 transition-colors" />
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
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
          <Button onClick={fetchDashboardData}>Try Again</Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4">
          <Link href="/admin/posts/new">
            <Button className="flex items-center gap-2">
              <PlusIcon className="h-4 w-4" />
              New Post
            </Button>
          </Link>
          <Link href="/admin/categories">
            <Button variant="secondary" className="flex items-center gap-2">
              <FolderIcon className="h-4 w-4" />
              Manage Categories
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Posts"
            value={stats?.posts.total || 0}
            icon={DocumentTextIcon}
            color="bg-blue-500"
            href="/admin/posts"
          />
          <StatCard
            title="Categories"
            value={stats?.categories || 0}
            icon={FolderIcon}
            color="bg-green-500"
            href="/admin/categories"
          />
          <StatCard
            title="Tags"
            value={stats?.tags || 0}
            icon={TagIcon}
            color="bg-purple-500"
            href="/admin/tags"
          />
          <StatCard
            title="Users"
            value={stats?.users || 0}
            icon={UsersIcon}
            color="bg-orange-500"
            href="/admin/users"
          />
        </div>

        {/* Detailed Post Stats */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <StatCard
            title="Published Posts"
            value={stats?.posts.published || 0}
            icon={DocumentTextIcon}
            color="bg-green-600"
          />
          <StatCard
            title="Draft Posts"
            value={stats?.posts.drafts || 0}
            icon={DocumentTextIcon}
            color="bg-yellow-600"
          />
          <StatCard
            title="Archived Posts"
            value={stats?.posts.archived || 0}
            icon={DocumentTextIcon}
            color="bg-gray-600"
          />
        </div>

        {/* Recent Posts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentPosts.length > 0 ? recentPosts.map((post) => (
                  <div key={post.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {post.title}
                      </h4>
                      <div className="flex items-center gap-4 mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          post.status === 'published' ? 'bg-green-100 text-green-800' :
                          post.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {post.status}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <EyeIcon className="h-3 w-3" />
                          {post.view_count}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 ml-4">
                      {new Date(post.created_at).toLocaleDateString()}
                    </div>
                  </div>
                )) : (
                  <p className="text-gray-500 text-sm">No posts yet</p>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <Link href="/admin/posts">
                  <Button variant="ghost" className="w-full">
                    View All Posts
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Database</span>
                  <span className="text-sm font-medium text-green-600">Connected</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">API Status</span>
                  <span className="text-sm font-medium text-green-600">Operational</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Backup</span>
                  <span className="text-sm text-gray-500">Never</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <Link href="/admin/setup">
                  <Button variant="ghost" className="w-full">
                    System Setup
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}