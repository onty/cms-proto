import React from 'react';
import { BlogLayout } from '@/components/blog/BlogLayout';
import { 
  UserGroupIcon, 
  RocketLaunchIcon, 
  HeartIcon, 
  CodeBracketIcon,
  CloudIcon,
  BoltIcon
} from '@heroicons/react/24/outline';

export default function AboutPage() {
  return (
    <BlogLayout title="CMS Prototype" description="About our modern content management system">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            About Our CMS
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A modern, powerful content management system built with Next.js, designed for performance, 
            scalability, and seamless migration to edge computing platforms.
          </p>
        </div>

        {/* Mission Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-12">
          <div className="text-center mb-8">
            <RocketLaunchIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-lg text-gray-600">
              To provide a modern, efficient, and user-friendly content management solution 
              that grows with your needs and embraces the future of web development.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <CodeBracketIcon className="h-10 w-10 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Modern Technology</h3>
            <p className="text-gray-600">
              Built with Next.js 15, TypeScript, and Tailwind CSS for optimal performance and developer experience.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <BoltIcon className="h-10 w-10 text-green-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Lightning Fast</h3>
            <p className="text-gray-600">
              Optimized for speed with server-side rendering, intelligent caching, and edge-ready architecture.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <CloudIcon className="h-10 w-10 text-purple-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Edge-Ready</h3>
            <p className="text-gray-600">
              Designed for easy migration to Cloudflare Workers and D1 database for global edge deployment.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <UserGroupIcon className="h-10 w-10 text-indigo-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Role-Based Access</h3>
            <p className="text-gray-600">
              Comprehensive user management with Admin, Editor, and Author roles for team collaboration.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <HeartIcon className="h-10 w-10 text-red-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">User-Friendly</h3>
            <p className="text-gray-600">
              Intuitive admin interface with beautiful forms, real-time previews, and seamless content management.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <RocketLaunchIcon className="h-10 w-10 text-orange-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Production Ready</h3>
            <p className="text-gray-600">
              Complete with authentication, CRUD operations, media handling, and all features needed for real projects.
            </p>
          </div>
        </div>

        {/* Technology Stack */}
        <div className="bg-gray-50 rounded-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Built With</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-white rounded-lg p-4 shadow-sm mb-3">
                <img src="https://nextjs.org/static/favicon/favicon-32x32.png" alt="Next.js" className="w-8 h-8 mx-auto" />
              </div>
              <h4 className="font-semibold text-gray-900">Next.js 15</h4>
              <p className="text-sm text-gray-600">React Framework</p>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-lg p-4 shadow-sm mb-3">
                <div className="w-8 h-8 bg-blue-600 rounded mx-auto flex items-center justify-center">
                  <span className="text-white text-xs font-bold">TS</span>
                </div>
              </div>
              <h4 className="font-semibold text-gray-900">TypeScript</h4>
              <p className="text-sm text-gray-600">Type Safety</p>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-lg p-4 shadow-sm mb-3">
                <div className="w-8 h-8 bg-cyan-500 rounded mx-auto flex items-center justify-center">
                  <span className="text-white text-xs font-bold">TW</span>
                </div>
              </div>
              <h4 className="font-semibold text-gray-900">Tailwind CSS</h4>
              <p className="text-sm text-gray-600">Styling</p>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-lg p-4 shadow-sm mb-3">
                <div className="w-8 h-8 bg-orange-500 rounded mx-auto flex items-center justify-center">
                  <span className="text-white text-xs font-bold">SQL</span>
                </div>
              </div>
              <h4 className="font-semibold text-gray-900">MySQL</h4>
              <p className="text-sm text-gray-600">Database</p>
            </div>
          </div>
        </div>

        {/* Future Plans */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">What's Coming Next</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <div>
                <h4 className="font-semibold text-gray-900">Rich Text Editor</h4>
                <p className="text-gray-600">Advanced WYSIWYG editor with markdown support</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-2 h-2 bg-green-600 rounded-full mt-2"></div>
              <div>
                <h4 className="font-semibold text-gray-900">Media Library</h4>
                <p className="text-gray-600">File upload, image optimization, and media management</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
              <div>
                <h4 className="font-semibold text-gray-900">Comments System</h4>
                <p className="text-gray-600">Moderation tools and spam protection</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-2 h-2 bg-orange-600 rounded-full mt-2"></div>
              <div>
                <h4 className="font-semibold text-gray-900">Analytics Dashboard</h4>
                <p className="text-gray-600">Real-time insights and performance metrics</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-2 h-2 bg-red-600 rounded-full mt-2"></div>
              <div>
                <h4 className="font-semibold text-gray-900">Cloudflare Migration</h4>
                <p className="text-gray-600">Seamless transition to edge computing with D1 database</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="text-center bg-blue-50 rounded-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Get Started</h2>
          <p className="text-lg text-gray-600 mb-6">
            Ready to experience the power of modern content management?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/admin"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Try the Admin Dashboard
            </a>
            <a
              href="/blog"
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Explore the Blog
            </a>
          </div>
        </div>
      </div>
    </BlogLayout>
  );
}