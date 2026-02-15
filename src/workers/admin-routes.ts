/**
 * Admin Routes Handler for Cloudflare Workers
 * Handles all /admin/* requests and serves admin interface
 */

import type { Env } from '../index';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Simple admin interface template
const ADMIN_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CMS Admin - {{title}}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <style>
        .admin-sidebar { position: fixed; left: 0; top: 0; bottom: 0; width: 256px; }
        .admin-content { margin-left: 256px; }
    </style>
</head>
<body class="bg-gray-50">
    <div id="admin-root">
        {{content}}
    </div>
    <script type="text/babel">
        // React components will be rendered here
        const { useState, useEffect } = React;
        
        // Simple Icons (inline SVGs)
        const HomeIcon = React.createElement('svg', {
            className: 'w-5 h-5',
            fill: 'none',
            stroke: 'currentColor',
            viewBox: '0 0 24 24'
        }, React.createElement('path', {
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            strokeWidth: 2,
            d: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
        }));

        const DocumentIcon = React.createElement('svg', {
            className: 'w-5 h-5',
            fill: 'none',
            stroke: 'currentColor',
            viewBox: '0 0 24 24'
        }, React.createElement('path', {
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            strokeWidth: 2,
            d: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
        }));

        const FolderIcon = React.createElement('svg', {
            className: 'w-5 h-5',
            fill: 'none',
            stroke: 'currentColor',
            viewBox: '0 0 24 24'
        }, React.createElement('path', {
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            strokeWidth: 2,
            d: 'M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z'
        }));

        const UsersIcon = React.createElement('svg', {
            className: 'w-5 h-5',
            fill: 'none',
            stroke: 'currentColor',
            viewBox: '0 0 24 24'
        }, React.createElement('path', {
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            strokeWidth: 2,
            d: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z'
        }));

        const CogIcon = React.createElement('svg', {
            className: 'w-5 h-5',
            fill: 'none',
            stroke: 'currentColor',
            viewBox: '0 0 24 24'
        }, [
            React.createElement('path', {
                key: 'outer',
                strokeLinecap: 'round',
                strokeLinejoin: 'round',
                strokeWidth: 2,
                d: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
            }),
            React.createElement('path', {
                key: 'inner',
                strokeLinecap: 'round',
                strokeLinejoin: 'round',
                strokeWidth: 2,
                d: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z'
            })
        ]);

        const LogoutIcon = React.createElement('svg', {
            className: 'w-5 h-5',
            fill: 'none',
            stroke: 'currentColor',
            viewBox: '0 0 24 24'
        }, React.createElement('path', {
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            strokeWidth: 2,
            d: 'M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75'
        }));

        const PlusIcon = React.createElement('svg', {
            className: 'w-4 h-4',
            fill: 'none',
            stroke: 'currentColor',
            viewBox: '0 0 24 24'
        }, React.createElement('path', {
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            strokeWidth: 2,
            d: 'M12 4v16m8-8H4'
        }));

        const PencilIcon = React.createElement('svg', {
            className: 'w-4 h-4',
            fill: 'none',
            stroke: 'currentColor',
            viewBox: '0 0 24 24'
        }, React.createElement('path', {
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            strokeWidth: 2,
            d: 'M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10'
        }));

        const TrashIcon = React.createElement('svg', {
            className: 'w-4 h-4',
            fill: 'none',
            stroke: 'currentColor',
            viewBox: '0 0 24 24'
        }, React.createElement('path', {
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            strokeWidth: 2,
            d: 'M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0'
        }));

        const TagIcon = React.createElement('svg', {
            className: 'w-5 h-5',
            fill: 'none',
            stroke: 'currentColor',
            viewBox: '0 0 24 24'
        }, React.createElement('path', {
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            strokeWidth: 2,
            d: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z'
        }));

        const WrenchIcon = React.createElement('svg', {
            className: 'w-5 h-5',
            fill: 'none',
            stroke: 'currentColor',
            viewBox: '0 0 24 24'
        }, React.createElement('path', {
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            strokeWidth: 2,
            d: 'M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z'
        }));

        // Icons are now defined as direct variables above

        // Main admin app component
        function AdminApp() {
            const [user, setUser] = useState(null);
            const [loading, setLoading] = useState(true);

            useEffect(() => {
                checkAuth();
            }, []);

            const checkAuth = async () => {
                try {
                    const token = localStorage.getItem('auth_token');
                    if (token) {
                        const response = await fetch('/api/auth/user', {
                            headers: { 'Authorization': 'Bearer ' + token }
                        });
                        if (response.ok) {
                            const data = await response.json();
                            setUser(data.data);
                        }
                    }
                } catch (error) {
                    console.error('Auth check error:', error);
                } finally {
                    setLoading(false);
                }
            };

            if (loading) {
                return React.createElement('div', {
                    className: 'min-h-screen flex items-center justify-center'
                }, React.createElement('div', {
                    className: 'text-gray-600'
                }, 'Loading...'));
            }

            if (!user) {
                return React.createElement(LoginForm, { onLogin: checkAuth });
            }

            return React.createElement(AdminDashboard, { user, onLogout: () => setUser(null) });
        }

        // Login form component
        function LoginForm({ onLogin }) {
            const [email, setEmail] = useState('admin@example.com');
            const [password, setPassword] = useState('admin123');
            const [error, setError] = useState('');
            const [loading, setLoading] = useState(false);

            const handleSubmit = async (e) => {
                e.preventDefault();
                setLoading(true);
                setError('');

                try {
                    const response = await fetch('/api/auth/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password })
                    });

                    const data = await response.json();
                    if (data.success) {
                        localStorage.setItem('auth_token', data.token);
                        onLogin();
                    } else {
                        setError(data.error);
                    }
                } catch (error) {
                    setError('Login failed');
                } finally {
                    setLoading(false);
                }
            };

            return React.createElement('div', {
                className: 'min-h-screen flex items-center justify-center bg-gray-50'
            }, React.createElement('div', {
                className: 'max-w-md w-full space-y-8'
            }, [
                React.createElement('div', { key: 'header' }, [
                    React.createElement('h2', {
                        key: 'title',
                        className: 'mt-6 text-center text-3xl font-extrabold text-gray-900'
                    }, 'CMS Admin Login'),
                    React.createElement('p', {
                        key: 'subtitle',
                        className: 'mt-2 text-center text-sm text-gray-600'
                    }, 'Sign in to your admin account')
                ]),
                React.createElement('form', {
                    key: 'form',
                    className: 'mt-8 space-y-6',
                    onSubmit: handleSubmit
                }, [
                    error && React.createElement('div', {
                        key: 'error',
                        className: 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded'
                    }, error),
                    React.createElement('div', { key: 'fields', className: 'space-y-4' }, [
                        React.createElement('input', {
                            key: 'email',
                            type: 'email',
                            required: true,
                            className: 'w-full px-3 py-2 border border-gray-300 rounded-md',
                            placeholder: 'Email address',
                            value: email,
                            onChange: (e) => setEmail(e.target.value)
                        }),
                        React.createElement('input', {
                            key: 'password',
                            type: 'password',
                            required: true,
                            className: 'w-full px-3 py-2 border border-gray-300 rounded-md',
                            placeholder: 'Password',
                            value: password,
                            onChange: (e) => setPassword(e.target.value)
                        })
                    ]),
                    React.createElement('button', {
                        key: 'submit',
                        type: 'submit',
                        disabled: loading,
                        className: 'w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50'
                    }, loading ? 'Signing in...' : 'Sign in')
                ])
            ]));
        }

        // Admin dashboard component
        function AdminDashboard({ user, onLogout }) {
            const [currentPage, setCurrentPage] = useState('dashboard');

            const handleLogout = () => {
                localStorage.removeItem('auth_token');
                onLogout();
            };

            return React.createElement('div', {
                className: 'min-h-screen bg-gray-50'
            }, [
                // Sidebar
                React.createElement('div', {
                    key: 'sidebar',
                    className: 'admin-sidebar bg-white shadow-lg border-r border-gray-200'
                }, [
                    React.createElement('div', {
                        key: 'header',
                        className: 'p-4 border-b border-gray-200'
                    }, [
                        React.createElement('h1', {
                            key: 'title',
                            className: 'text-xl font-bold text-gray-900'
                        }, 'CMS Admin'),
                        React.createElement('p', {
                            key: 'user',
                            className: 'text-sm text-gray-600'
                        }, 'Welcome, ' + user.name)
                    ]),
                    React.createElement('nav', {
                        key: 'nav',
                        className: 'mt-4 space-y-1'
                    }, [
                        React.createElement('a', {
                            key: 'dashboard',
                            href: '#',
                            className: 'flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 group ' + (currentPage === 'dashboard' ? 'bg-blue-50 border-r-4 border-blue-500 text-blue-700' : ''),
                            onClick: () => setCurrentPage('dashboard')
                        }, [
                            HomeIcon,
                            React.createElement('span', { key: 'text', className: 'ml-3' }, 'Dashboard')
                        ]),
                        React.createElement('a', {
                            key: 'posts',
                            href: '#',
                            className: 'flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 group ' + (currentPage === 'posts' ? 'bg-blue-50 border-r-4 border-blue-500 text-blue-700' : ''),
                            onClick: () => setCurrentPage('posts')
                        }, [
                            DocumentIcon,
                            React.createElement('span', { key: 'text', className: 'ml-3' }, 'Posts')
                        ]),
                        React.createElement('a', {
                            key: 'categories',
                            href: '#',
                            className: 'flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 group ' + (currentPage === 'categories' ? 'bg-blue-50 border-r-4 border-blue-500 text-blue-700' : ''),
                            onClick: () => setCurrentPage('categories')
                        }, [
                            FolderIcon,
                            React.createElement('span', { key: 'text', className: 'ml-3' }, 'Categories')
                        ]),
                        React.createElement('a', {
                            key: 'tags',
                            href: '#',
                            className: 'flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 group ' + (currentPage === 'tags' ? 'bg-blue-50 border-r-4 border-blue-500 text-blue-700' : ''),
                            onClick: () => setCurrentPage('tags')
                        }, [
                            TagIcon,
                            React.createElement('span', { key: 'text', className: 'ml-3' }, 'Tags')
                        ]),
                        React.createElement('a', {
                            key: 'users',
                            href: '#',
                            className: 'flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 group ' + (currentPage === 'users' ? 'bg-blue-50 border-r-4 border-blue-500 text-blue-700' : ''),
                            onClick: () => setCurrentPage('users')
                        }, [
                            UsersIcon,
                            React.createElement('span', { key: 'text', className: 'ml-3' }, 'Users')
                        ]),
                        React.createElement('a', {
                            key: 'settings',
                            href: '#',
                            className: 'flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 group ' + (currentPage === 'settings' ? 'bg-blue-50 border-r-4 border-blue-500 text-blue-700' : ''),
                            onClick: () => setCurrentPage('settings')
                        }, [
                            CogIcon,
                            React.createElement('span', { key: 'text', className: 'ml-3' }, 'Settings')
                        ]),
                        React.createElement('a', {
                            key: 'setup',
                            href: '#',
                            className: 'flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 group ' + (currentPage === 'setup' ? 'bg-blue-50 border-r-4 border-blue-500 text-blue-700' : ''),
                            onClick: () => setCurrentPage('setup')
                        }, [
                            WrenchIcon,
                            React.createElement('span', { key: 'text', className: 'ml-3' }, 'Setup')
                        ])
                    ]),
                    React.createElement('div', {
                        key: 'footer',
                        className: 'absolute bottom-4 left-4 right-4'
                    }, React.createElement('button', {
                        onClick: handleLogout,
                        className: 'w-full flex items-center justify-center px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded transition-colors duration-150'
                    }, [
                        LogoutIcon,
                        React.createElement('span', { key: 'text', className: 'ml-2' }, 'Logout')
                    ]))
                ]),
                // Main content
                React.createElement('div', {
                    key: 'content',
                    className: 'admin-content p-8'
                }, React.createElement(AdminContent, { page: currentPage }))
            ]);
        }

        // Admin content router - VERSION 2.0 UPDATED
        function AdminContent({ page }) {
            switch (page) {
                case 'posts':
                    return React.createElement(PostsManagement);
                case 'categories':
                    return React.createElement(CategoriesManagement);
                case 'tags':
                    return React.createElement(TagsManagement);
                case 'users':
                    return React.createElement(UsersManagement);
                case 'settings':
                    return React.createElement(SettingsManagement);
                case 'setup':
                    return React.createElement(SetupManagement);
                default:
                    return React.createElement(DashboardOverview);
            }
        }

        // Posts Management Component (Professional - Matching Next.js)
        function PostsManagement() {
            const [posts, setPosts] = useState([]);
            const [pagination, setPagination] = useState(null);
            const [loading, setLoading] = useState(true);
            const [error, setError] = useState(null);
            const [currentPage, setCurrentPage] = useState(1);
            const [filter, setFilter] = useState('all');
            const [showCreateForm, setShowCreateForm] = useState(false);
            const [editingPost, setEditingPost] = useState(null);

            useEffect(() => {
                fetchPosts();
            }, [currentPage, filter]);

            const fetchPosts = async () => {
                try {
                    setLoading(true);
                    const token = localStorage.getItem('auth_token');
                    let url = '/api/posts?page=' + currentPage + '&limit=10&sort=created_at&order=desc';
                    if (filter !== 'all') {
                        url += '&status=' + filter;
                    }

                    const response = await fetch(url, {
                        headers: { 'Authorization': 'Bearer ' + token }
                    });
                    const data = await response.json();

                    if (data.success) {
                        setPosts(data.data || []);
                        setPagination(data.pagination || null);
                        setError(null);
                    } else {
                        setError(data.error || 'Failed to load posts');
                    }
                } catch (error) {
                    console.error('Error fetching posts:', error);
                    setError('Failed to load posts');
                } finally {
                    setLoading(false);
                }
            };

            const deletePost = async (id) => {
                if (!confirm('Are you sure you want to delete this post?')) return;
                
                try {
                    const token = localStorage.getItem('auth_token');
                    const response = await fetch('/api/posts/' + id, {
                        method: 'DELETE',
                        headers: { 'Authorization': 'Bearer ' + token }
                    });
                    const data = await response.json();

                    if (data.success) {
                        fetchPosts();
                    } else {
                        alert(data.error || 'Failed to delete post');
                    }
                } catch (error) {
                    console.error('Error deleting post:', error);
                    alert('Failed to delete post');
                }
            };

            const formatDate = (dateString) => {
                return new Date(dateString).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
            };

            const truncateText = (text, maxLength) => {
                if (!text || text.length <= maxLength) return text || '';
                return text.substring(0, maxLength) + '...';
            };

            const getStatusBadgeColor = (status) => {
                switch (status) {
                    case 'published': return 'bg-green-100 text-green-800';
                    case 'draft': return 'bg-yellow-100 text-yellow-800';
                    case 'archived': return 'bg-gray-100 text-gray-800';
                    default: return 'bg-gray-100 text-gray-800';
                }
            };

            // Loading State (Professional Skeleton)
            if (loading && currentPage === 1) {
                return React.createElement('div', {
                    className: 'space-y-6'
                }, [
                    React.createElement('div', {
                        key: 'header',
                        className: 'flex justify-between items-center'
                    }, [
                        React.createElement('div', { key: 'left' }, [
                            React.createElement('div', {
                                key: 'title',
                                className: 'h-8 bg-gray-200 rounded w-32 mb-2 animate-pulse'
                            }),
                            React.createElement('div', {
                                key: 'subtitle',
                                className: 'h-4 bg-gray-200 rounded w-48 animate-pulse'
                            })
                        ]),
                        React.createElement('div', {
                            key: 'button',
                            className: 'h-10 bg-gray-200 rounded w-24 animate-pulse'
                        })
                    ]),
                    React.createElement('div', {
                        key: 'table',
                        className: 'bg-white rounded-lg shadow animate-pulse'
                    }, [1, 2, 3].map(i => 
                        React.createElement('div', {
                            key: i,
                            className: 'p-6 border-b border-gray-200'
                        }, [
                            React.createElement('div', {
                                key: 'line1',
                                className: 'h-4 bg-gray-200 rounded w-3/4 mb-2'
                            }),
                            React.createElement('div', {
                                key: 'line2',
                                className: 'h-4 bg-gray-200 rounded w-1/2'
                            })
                        ])
                    ))
                ]);
            }

            // Error State
            if (error) {
                return React.createElement('div', {
                    className: 'text-center py-12'
                }, [
                    React.createElement('div', {
                        key: 'icon',
                        className: 'mx-auto h-12 w-12 text-red-400 mb-4'
                    }, React.createElement('svg', {
                        fill: 'none',
                        stroke: 'currentColor',
                        viewBox: '0 0 24 24'
                    }, React.createElement('path', {
                        strokeLinecap: 'round',
                        strokeLinejoin: 'round',
                        strokeWidth: 2,
                        d: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                    }))),
                    React.createElement('h3', {
                        key: 'title',
                        className: 'text-lg font-medium text-gray-900 mb-2'
                    }, 'Error loading posts'),
                    React.createElement('p', {
                        key: 'message',
                        className: 'text-gray-600 mb-4'
                    }, error),
                    React.createElement('button', {
                        key: 'retry',
                        className: 'bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded',
                        onClick: fetchPosts
                    }, 'Try Again')
                ]);
            }

            return React.createElement('div', {
                className: 'space-y-6'
            }, [
                showCreateForm && React.createElement(PostForm, {
                    key: 'create-form',
                    onClose: () => setShowCreateForm(false),
                    onSave: () => { setShowCreateForm(false); fetchPosts(); }
                }),
                
                editingPost && React.createElement(PostForm, {
                    key: 'edit-form',
                    post: editingPost,
                    onClose: () => setEditingPost(null),
                    onSave: () => { setEditingPost(null); fetchPosts(); }
                }),

                // Professional Header (Matching Next.js)
                React.createElement('div', {
                    key: 'header',
                    className: 'flex justify-between items-center'
                }, [
                    React.createElement('div', { key: 'left' }, [
                        React.createElement('h1', {
                            key: 'title',
                            className: 'text-2xl font-bold text-gray-900'
                        }, 'Posts'),
                        React.createElement('p', {
                            key: 'subtitle',
                            className: 'text-gray-600'
                        }, 'Manage your blog posts and articles')
                    ]),
                    React.createElement('button', {
                        key: 'create-btn',
                        className: 'flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors duration-150',
                        onClick: () => setShowCreateForm(true)
                    }, [
                        PlusIcon,
                        React.createElement('span', { key: 'text' }, 'New Post')
                    ])
                ]),

                // Status Filter Buttons (Matching Next.js)
                React.createElement('div', {
                    key: 'filters',
                    className: 'flex space-x-2'
                }, ['all', 'published', 'draft', 'archived'].map(status => 
                    React.createElement('button', {
                        key: status,
                        className: 'px-4 py-2 text-sm font-medium rounded transition-colors duration-150 ' + 
                            (filter === status ? 
                                'bg-blue-600 text-white' : 
                                'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'),
                        onClick: () => setFilter(status)
                    }, status.charAt(0).toUpperCase() + status.slice(1))
                )),

                // Stats Card (Matching Next.js)
                pagination && React.createElement('div', {
                    key: 'stats',
                    className: 'grid grid-cols-1 md:grid-cols-3 gap-4'
                }, React.createElement('div', {
                    className: 'bg-white rounded-lg shadow'
                }, React.createElement('div', {
                    className: 'flex items-center p-6'
                }, [
                    React.createElement('div', {
                        key: 'content',
                        className: 'flex-1'
                    }, [
                        React.createElement('p', {
                            key: 'label',
                            className: 'text-sm font-medium text-gray-600'
                        }, 'Total Posts'),
                        React.createElement('p', {
                            key: 'value',
                            className: 'text-2xl font-bold text-gray-900'
                        }, pagination.total)
                    ]),
                    React.createElement('div', {
                        key: 'icon',
                        className: 'text-blue-500'
                    }, DocumentIcon)
                ]))),

                // Professional Table (Matching Next.js)
                React.createElement('div', {
                    key: 'table-container',
                    className: 'bg-white shadow rounded-lg'
                }, [
                    React.createElement('div', {
                        key: 'header',
                        className: 'px-6 py-4 border-b border-gray-200'
                    }, React.createElement('h3', {
                        className: 'text-lg font-medium text-gray-900'
                    }, 'All Posts')),
                    React.createElement('div', {
                        key: 'content',
                        className: 'overflow-x-auto'
                    }, posts.length > 0 ? 
                        React.createElement('table', {
                            className: 'min-w-full divide-y divide-gray-200'
                        }, [
                            React.createElement('thead', {
                                key: 'thead',
                                className: 'bg-gray-50'
                            }, React.createElement('tr', null, [
                                React.createElement('th', {
                                    key: 'title',
                                    className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                                }, 'Title'),
                                React.createElement('th', {
                                    key: 'author',
                                    className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                                }, 'Author'),
                                React.createElement('th', {
                                    key: 'status',
                                    className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                                }, 'Status'),
                                React.createElement('th', {
                                    key: 'views',
                                    className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                                }, 'Views'),
                                React.createElement('th', {
                                    key: 'date',
                                    className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                                }, 'Date'),
                                React.createElement('th', {
                                    key: 'actions',
                                    className: 'px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'
                                }, 'Actions')
                            ])),
                            React.createElement('tbody', {
                                key: 'tbody',
                                className: 'bg-white divide-y divide-gray-200'
                            }, posts.map(post => 
                                React.createElement('tr', {
                                    key: post.id,
                                    className: 'hover:bg-gray-50'
                                }, [
                                    React.createElement('td', {
                                        key: 'title',
                                        className: 'px-6 py-4 whitespace-nowrap'
                                    }, [
                                        React.createElement('div', {
                                            key: 'title',
                                            className: 'text-sm font-medium text-gray-900'
                                        }, truncateText(post.title, 50)),
                                        post.excerpt && React.createElement('div', {
                                            key: 'excerpt',
                                            className: 'text-sm text-gray-500'
                                        }, truncateText(post.excerpt, 80))
                                    ]),
                                    React.createElement('td', {
                                        key: 'author',
                                        className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-900'
                                    }, post.author_name || 'Unknown'),
                                    React.createElement('td', {
                                        key: 'status',
                                        className: 'px-6 py-4 whitespace-nowrap'
                                    }, React.createElement('span', {
                                        className: 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full ' + getStatusBadgeColor(post.status)
                                    }, post.status)),
                                    React.createElement('td', {
                                        key: 'views',
                                        className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-900'
                                    }, post.view_count || 0),
                                    React.createElement('td', {
                                        key: 'date',
                                        className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-500'
                                    }, formatDate(post.created_at)),
                                    React.createElement('td', {
                                        key: 'actions',
                                        className: 'px-6 py-4 whitespace-nowrap text-right text-sm font-medium'
                                    }, React.createElement('div', {
                                        className: 'flex justify-end space-x-2'
                                    }, [
                                        React.createElement('button', {
                                            key: 'edit',
                                            className: 'text-blue-600 hover:text-blue-900',
                                            onClick: () => setEditingPost(post)
                                        }, 'Edit'),
                                        React.createElement('button', {
                                            key: 'delete',
                                            className: 'text-red-600 hover:text-red-900 ml-2',
                                            onClick: () => deletePost(post.id)
                                        }, 'Delete')
                                    ]))
                                ])
                            ))
                        ]) : 
                        React.createElement('div', {
                            className: 'text-center py-12'
                        }, [
                            React.createElement('h3', {
                                key: 'title',
                                className: 'text-lg font-medium text-gray-900'
                            }, 'No posts found'),
                            React.createElement('p', {
                                key: 'subtitle',
                                className: 'text-gray-600 mt-2'
                            }, filter === 'all' ? 'Create your first post to get started' : 'No posts found with current filter'),
                            React.createElement('button', {
                                key: 'create',
                                className: 'mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded',
                                onClick: () => setShowCreateForm(true)
                            }, 'Create New Post')
                        ])
                    )
                ]),

                // Pagination (Basic version - can be enhanced later)
                pagination && pagination.pages > 1 && React.createElement('div', {
                    key: 'pagination',
                    className: 'flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-b-lg'
                }, [
                    React.createElement('div', {
                        key: 'info',
                        className: 'text-sm text-gray-700'
                    }, 'Page ' + currentPage + ' of ' + pagination.pages + ' (' + pagination.total + ' total)'),
                    React.createElement('div', {
                        key: 'buttons',
                        className: 'flex space-x-2'
                    }, [
                        React.createElement('button', {
                            key: 'prev',
                            className: 'px-3 py-1 text-sm border border-gray-300 rounded ' + 
                                (pagination.hasPrev ? 'text-gray-700 hover:bg-gray-50' : 'text-gray-400 cursor-not-allowed'),
                            disabled: !pagination.hasPrev,
                            onClick: () => pagination.hasPrev && setCurrentPage(currentPage - 1)
                        }, 'Previous'),
                        React.createElement('button', {
                            key: 'next',
                            className: 'px-3 py-1 text-sm border border-gray-300 rounded ' +
                                (pagination.hasNext ? 'text-gray-700 hover:bg-gray-50' : 'text-gray-400 cursor-not-allowed'),
                            disabled: !pagination.hasNext,
                            onClick: () => pagination.hasNext && setCurrentPage(currentPage + 1)
                        }, 'Next')
                    ])
                ])
            ]);
        }

        // Post Form Component
        function PostForm({ post, onClose, onSave }) {
            const [formData, setFormData] = useState({
                title: post?.title || '',
                slug: post?.slug || '',
                excerpt: post?.excerpt || '',
                content: post?.content || '',
                status: post?.status || 'draft',
                category_id: post?.category_id || '',
                is_featured: post?.is_featured || false
            });
            const [categories, setCategories] = useState([]);
            const [saving, setSaving] = useState(false);

            useEffect(() => {
                fetchCategories();
            }, []);

            const fetchCategories = async () => {
                try {
                    const response = await fetch('/api/categories');
                    const data = await response.json();
                    setCategories(data.data || []);
                } catch (error) {
                    console.error('Error fetching categories:', error);
                }
            };

            const generateSlug = (title) => {
                return title.toLowerCase()
                    .replace(/[^\w\s-]/g, '')
                    .replace(/\s+/g, '-')
                    .trim();
            };

            const handleSubmit = async (e) => {
                e.preventDefault();
                setSaving(true);

                try {
                    const token = localStorage.getItem('auth_token');
                    const url = post ? '/api/posts/' + post.id : '/api/posts';
                    const method = post ? 'PUT' : 'POST';

                    const response = await fetch(url, {
                        method,
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + token
                        },
                        body: JSON.stringify({
                            ...formData,
                            author_id: 1, // Current user ID
                            category_id: formData.category_id ? parseInt(formData.category_id) : null
                        })
                    });

                    const data = await response.json();

                    if (data.success) {
                        onSave();
                    } else {
                        alert(data.error || 'Failed to save post');
                    }
                } catch (error) {
                    console.error('Error saving post:', error);
                    alert('Failed to save post');
                } finally {
                    setSaving(false);
                }
            };

            return React.createElement('div', {
                className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'
            }, React.createElement('div', {
                className: 'bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto'
            }, [
                React.createElement('div', {
                    key: 'header',
                    className: 'flex justify-between items-center mb-4'
                }, [
                    React.createElement('h2', {
                        key: 'title',
                        className: 'text-lg font-bold'
                    }, post ? 'Edit Post' : 'Create New Post'),
                    React.createElement('button', {
                        key: 'close',
                        className: 'text-gray-500 hover:text-gray-700',
                        onClick: onClose
                    }, '×')
                ]),
                
                React.createElement('form', {
                    key: 'form',
                    onSubmit: handleSubmit,
                    className: 'space-y-4'
                }, [
                    React.createElement('div', { key: 'title-field' }, [
                        React.createElement('label', {
                            key: 'label',
                            className: 'block text-sm font-medium text-gray-700'
                        }, 'Title'),
                        React.createElement('input', {
                            key: 'input',
                            type: 'text',
                            required: true,
                            className: 'mt-1 block w-full border border-gray-300 rounded-md px-3 py-2',
                            value: formData.title,
                            onChange: (e) => {
                                const newTitle = e.target.value;
                                setFormData(prev => ({
                                    ...prev,
                                    title: newTitle,
                                    slug: generateSlug(newTitle)
                                }));
                            }
                        })
                    ]),
                    
                    React.createElement('div', { key: 'slug-field' }, [
                        React.createElement('label', {
                            key: 'label',
                            className: 'block text-sm font-medium text-gray-700'
                        }, 'Slug'),
                        React.createElement('input', {
                            key: 'input',
                            type: 'text',
                            required: true,
                            className: 'mt-1 block w-full border border-gray-300 rounded-md px-3 py-2',
                            value: formData.slug,
                            onChange: (e) => setFormData(prev => ({ ...prev, slug: e.target.value }))
                        })
                    ]),
                    
                    React.createElement('div', { key: 'excerpt-field' }, [
                        React.createElement('label', {
                            key: 'label',
                            className: 'block text-sm font-medium text-gray-700'
                        }, 'Excerpt'),
                        React.createElement('textarea', {
                            key: 'input',
                            className: 'mt-1 block w-full border border-gray-300 rounded-md px-3 py-2',
                            rows: 3,
                            value: formData.excerpt,
                            onChange: (e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))
                        })
                    ]),
                    
                    React.createElement('div', { key: 'content-field' }, [
                        React.createElement('label', {
                            key: 'label',
                            className: 'block text-sm font-medium text-gray-700'
                        }, 'Content'),
                        React.createElement('textarea', {
                            key: 'input',
                            className: 'mt-1 block w-full border border-gray-300 rounded-md px-3 py-2',
                            rows: 8,
                            value: formData.content,
                            onChange: (e) => setFormData(prev => ({ ...prev, content: e.target.value }))
                        })
                    ]),
                    
                    React.createElement('div', {
                        key: 'row',
                        className: 'grid grid-cols-2 gap-4'
                    }, [
                        React.createElement('div', { key: 'status-field' }, [
                            React.createElement('label', {
                                key: 'label',
                                className: 'block text-sm font-medium text-gray-700'
                            }, 'Status'),
                            React.createElement('select', {
                                key: 'input',
                                className: 'mt-1 block w-full border border-gray-300 rounded-md px-3 py-2',
                                value: formData.status,
                                onChange: (e) => setFormData(prev => ({ ...prev, status: e.target.value }))
                            }, [
                                React.createElement('option', { key: 'draft', value: 'draft' }, 'Draft'),
                                React.createElement('option', { key: 'published', value: 'published' }, 'Published'),
                                React.createElement('option', { key: 'archived', value: 'archived' }, 'Archived')
                            ])
                        ]),
                        
                        React.createElement('div', { key: 'category-field' }, [
                            React.createElement('label', {
                                key: 'label',
                                className: 'block text-sm font-medium text-gray-700'
                            }, 'Category'),
                            React.createElement('select', {
                                key: 'input',
                                className: 'mt-1 block w-full border border-gray-300 rounded-md px-3 py-2',
                                value: formData.category_id,
                                onChange: (e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))
                            }, [
                                React.createElement('option', { key: 'none', value: '' }, 'No Category'),
                                ...categories.map(cat => 
                                    React.createElement('option', { key: cat.id, value: cat.id }, cat.name)
                                )
                            ])
                        ])
                    ]),
                    
                    React.createElement('div', { key: 'featured-field' }, [
                        React.createElement('label', {
                            key: 'label',
                            className: 'flex items-center'
                        }, [
                            React.createElement('input', {
                                key: 'input',
                                type: 'checkbox',
                                className: 'mr-2',
                                checked: formData.is_featured,
                                onChange: (e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))
                            }),
                            React.createElement('span', {
                                key: 'text',
                                className: 'text-sm font-medium text-gray-700'
                            }, 'Featured Post')
                        ])
                    ]),
                    
                    React.createElement('div', {
                        key: 'actions',
                        className: 'flex justify-end space-x-4 pt-4'
                    }, [
                        React.createElement('button', {
                            key: 'cancel',
                            type: 'button',
                            className: 'px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded',
                            onClick: onClose
                        }, 'Cancel'),
                        React.createElement('button', {
                            key: 'save',
                            type: 'submit',
                            className: 'px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded',
                            disabled: saving
                        }, saving ? 'Saving...' : 'Save Post')
                    ])
                ])
            ]));
        }

        // Users Management Component (Professional - Matching Next.js)
        function UsersManagement() {
            const [users, setUsers] = useState([]);
            const [pagination, setPagination] = useState(null);
            const [loading, setLoading] = useState(true);
            const [error, setError] = useState(null);
            const [currentPage, setCurrentPage] = useState(1);
            const [showCreateForm, setShowCreateForm] = useState(false);
            const [editingUser, setEditingUser] = useState(null);

            useEffect(() => {
                fetchUsers();
            }, [currentPage]);

            const fetchUsers = async () => {
                try {
                    setLoading(true);
                    const token = localStorage.getItem('auth_token');
                    const response = await fetch('/api/users?page=' + currentPage + '&limit=10', {
                        headers: { 'Authorization': 'Bearer ' + token }
                    });
                    const data = await response.json();

                    if (data.success) {
                        setUsers(data.data || []);
                        setPagination(data.pagination || null);
                        setError(null);
                    } else {
                        setError(data.error || 'Failed to load users');
                    }
                } catch (error) {
                    console.error('Error fetching users:', error);
                    setError('Failed to load users');
                } finally {
                    setLoading(false);
                }
            };

            const handleDelete = async (id) => {
                if (!confirm('Are you sure you want to deactivate this user?')) return;

                try {
                    const token = localStorage.getItem('auth_token');
                    const response = await fetch('/api/users/' + id, {
                        method: 'DELETE',
                        headers: { 'Authorization': 'Bearer ' + token }
                    });
                    const data = await response.json();

                    if (data.success) {
                        fetchUsers();
                    } else {
                        alert(data.error || 'Failed to deactivate user');
                    }
                } catch (error) {
                    console.error('Error deleting user:', error);
                    alert('Failed to deactivate user');
                }
            };

            const formatDate = (dateString) => {
                return new Date(dateString).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
            };

            const getRoleBadgeColor = (role) => {
                switch (role) {
                    case 'admin': return 'bg-red-100 text-red-800';
                    case 'editor': return 'bg-blue-100 text-blue-800';
                    case 'author': return 'bg-green-100 text-green-800';
                    default: return 'bg-gray-100 text-gray-800';
                }
            };

            // Professional Loading State
            if (loading && currentPage === 1) {
                return React.createElement('div', {
                    className: 'space-y-6'
                }, [
                    React.createElement('div', {
                        key: 'header',
                        className: 'flex justify-between items-center'
                    }, [
                        React.createElement('div', { key: 'left' }, [
                            React.createElement('div', {
                                key: 'title',
                                className: 'h-8 bg-gray-200 rounded w-24 mb-2 animate-pulse'
                            }),
                            React.createElement('div', {
                                key: 'subtitle',
                                className: 'h-4 bg-gray-200 rounded w-48 animate-pulse'
                            })
                        ]),
                        React.createElement('div', {
                            key: 'button',
                            className: 'h-10 bg-gray-200 rounded w-24 animate-pulse'
                        })
                    ]),
                    React.createElement('div', {
                        key: 'table',
                        className: 'bg-white rounded-lg shadow animate-pulse'
                    }, [1, 2, 3].map(i => 
                        React.createElement('div', {
                            key: i,
                            className: 'p-6 border-b border-gray-200'
                        }, [
                            React.createElement('div', {
                                key: 'line1',
                                className: 'h-4 bg-gray-200 rounded w-3/4 mb-2'
                            }),
                            React.createElement('div', {
                                key: 'line2',
                                className: 'h-4 bg-gray-200 rounded w-1/2'
                            })
                        ])
                    ))
                ]);
            }

            // Error State
            if (error) {
                return React.createElement('div', {
                    className: 'text-center py-12'
                }, [
                    React.createElement('div', {
                        key: 'icon',
                        className: 'mx-auto h-12 w-12 text-red-400 mb-4'
                    }, React.createElement('svg', {
                        fill: 'none',
                        stroke: 'currentColor',
                        viewBox: '0 0 24 24'
                    }, React.createElement('path', {
                        strokeLinecap: 'round',
                        strokeLinejoin: 'round',
                        strokeWidth: 2,
                        d: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                    }))),
                    React.createElement('h3', {
                        key: 'title',
                        className: 'text-lg font-medium text-gray-900 mb-2'
                    }, 'Error loading users'),
                    React.createElement('p', {
                        key: 'message',
                        className: 'text-gray-600 mb-4'
                    }, error),
                    React.createElement('button', {
                        key: 'retry',
                        className: 'bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded',
                        onClick: fetchUsers
                    }, 'Try Again')
                ]);
            }

            return React.createElement('div', {
                className: 'space-y-6'
            }, [
                showCreateForm && React.createElement(UserForm, { 
                    key: 'create-form',
                    onClose: () => setShowCreateForm(false),
                    onSuccess: () => { setShowCreateForm(false); fetchUsers(); }
                }),
                editingUser && React.createElement(UserForm, { 
                    key: 'edit-form',
                    user: editingUser,
                    onClose: () => setEditingUser(null),
                    onSuccess: () => { setEditingUser(null); fetchUsers(); }
                }),

                // Professional Header (Matching Next.js)
                React.createElement('div', {
                    key: 'header',
                    className: 'flex justify-between items-center'
                }, [
                    React.createElement('div', { key: 'left' }, [
                        React.createElement('h1', {
                            key: 'title',
                            className: 'text-2xl font-bold text-gray-900'
                        }, 'Users'),
                        React.createElement('p', {
                            key: 'subtitle',
                            className: 'text-gray-600'
                        }, 'Manage user accounts and permissions')
                    ]),
                    React.createElement('button', {
                        key: 'create-btn',
                        className: 'flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors duration-150',
                        onClick: () => setShowCreateForm(true)
                    }, [
                        PlusIcon,
                        React.createElement('span', { key: 'text' }, 'New User')
                    ])
                ]),

                // Stats Card (Matching Next.js)
                pagination && React.createElement('div', {
                    key: 'stats',
                    className: 'grid grid-cols-1 md:grid-cols-3 gap-4'
                }, React.createElement('div', {
                    className: 'bg-white rounded-lg shadow'
                }, React.createElement('div', {
                    className: 'flex items-center p-6'
                }, [
                    React.createElement('div', {
                        key: 'content',
                        className: 'flex-1'
                    }, [
                        React.createElement('p', {
                            key: 'label',
                            className: 'text-sm font-medium text-gray-600'
                        }, 'Total Users'),
                        React.createElement('p', {
                            key: 'value',
                            className: 'text-2xl font-bold text-gray-900'
                        }, pagination.total)
                    ]),
                    React.createElement('div', {
                        key: 'icon',
                        className: 'text-orange-500'
                    }, UsersIcon)
                ]))),

                // Professional Table (Matching Next.js)
                React.createElement('div', {
                    key: 'table-container',
                    className: 'bg-white shadow rounded-lg'
                }, [
                    React.createElement('div', {
                        key: 'header',
                        className: 'px-6 py-4 border-b border-gray-200'
                    }, React.createElement('h3', {
                        className: 'text-lg font-medium text-gray-900'
                    }, 'All Users')),
                    React.createElement('div', {
                        key: 'content',
                        className: 'overflow-x-auto'
                    }, users.length > 0 ? 
                        React.createElement('table', {
                            className: 'min-w-full divide-y divide-gray-200'
                        }, [
                            React.createElement('thead', {
                                key: 'thead',
                                className: 'bg-gray-50'
                            }, React.createElement('tr', null, [
                                React.createElement('th', {
                                    key: 'user',
                                    className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                                }, 'User'),
                                React.createElement('th', {
                                    key: 'role',
                                    className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                                }, 'Role'),
                                React.createElement('th', {
                                    key: 'status',
                                    className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                                }, 'Status'),
                                React.createElement('th', {
                                    key: 'joined',
                                    className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                                }, 'Joined'),
                                React.createElement('th', {
                                    key: 'last-login',
                                    className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                                }, 'Last Login'),
                                React.createElement('th', {
                                    key: 'actions',
                                    className: 'px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'
                                }, 'Actions')
                            ])),
                            React.createElement('tbody', {
                                key: 'tbody',
                                className: 'bg-white divide-y divide-gray-200'
                            }, users.map(user => 
                                React.createElement('tr', {
                                    key: user.id,
                                    className: 'hover:bg-gray-50'
                                }, [
                                    React.createElement('td', {
                                        key: 'user',
                                        className: 'px-6 py-4 whitespace-nowrap'
                                    }, [
                                        React.createElement('div', {
                                            key: 'user-info',
                                            className: 'flex items-center'
                                        }, [
                                            React.createElement('div', {
                                                key: 'avatar',
                                                className: 'flex-shrink-0 h-10 w-10'
                                            }, user.avatar_url ? 
                                                React.createElement('img', {
                                                    className: 'h-10 w-10 rounded-full',
                                                    src: user.avatar_url,
                                                    alt: user.name
                                                }) :
                                                React.createElement('div', {
                                                    className: 'h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center'
                                                }, React.createElement('span', {
                                                    className: 'text-sm font-medium text-gray-700'
                                                }, user.name ? user.name.charAt(0).toUpperCase() : 'U'))
                                            ),
                                            React.createElement('div', {
                                                key: 'details',
                                                className: 'ml-4'
                                            }, [
                                                React.createElement('div', {
                                                    key: 'name',
                                                    className: 'text-sm font-medium text-gray-900'
                                                }, user.name),
                                                React.createElement('div', {
                                                    key: 'email',
                                                    className: 'text-sm text-gray-500'
                                                }, user.email)
                                            ])
                                        ])
                                    ]),
                                    React.createElement('td', {
                                        key: 'role',
                                        className: 'px-6 py-4 whitespace-nowrap'
                                    }, React.createElement('span', {
                                        className: 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full ' + getRoleBadgeColor(user.role)
                                    }, user.role)),
                                    React.createElement('td', {
                                        key: 'status',
                                        className: 'px-6 py-4 whitespace-nowrap'
                                    }, React.createElement('span', {
                                        className: 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full ' + 
                                            (user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')
                                    }, user.is_active ? 'Active' : 'Inactive')),
                                    React.createElement('td', {
                                        key: 'joined',
                                        className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-500'
                                    }, formatDate(user.created_at)),
                                    React.createElement('td', {
                                        key: 'last-login',
                                        className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-500'
                                    }, user.last_login ? formatDate(user.last_login) : 'Never'),
                                    React.createElement('td', {
                                        key: 'actions',
                                        className: 'px-6 py-4 whitespace-nowrap text-right text-sm font-medium'
                                    }, React.createElement('div', {
                                        className: 'flex justify-end space-x-2'
                                    }, [
                                        React.createElement('button', {
                                            key: 'edit',
                                            className: 'text-blue-600 hover:text-blue-900',
                                            onClick: () => setEditingUser(user)
                                        }, 'Edit'),
                                        React.createElement('button', {
                                            key: 'delete',
                                            className: 'text-red-600 hover:text-red-900 ml-2',
                                            onClick: () => handleDelete(user.id)
                                        }, 'Deactivate')
                                    ]))
                                ])
                            ))
                        ]) : 
                        React.createElement('div', {
                            className: 'text-center py-12'
                        }, [
                            React.createElement('h3', {
                                key: 'title',
                                className: 'text-lg font-medium text-gray-900'
                            }, 'No users found'),
                            React.createElement('p', {
                                key: 'subtitle',
                                className: 'text-gray-600 mt-2'
                            }, 'Start by creating your first user'),
                            React.createElement('button', {
                                key: 'create',
                                className: 'mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded',
                                onClick: () => setShowCreateForm(true)
                            }, 'Create New User')
                        ])
                    )
                ]),

                // Pagination (Matching Posts page)
                pagination && pagination.pages > 1 && React.createElement('div', {
                    key: 'pagination',
                    className: 'flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-b-lg'
                }, [
                    React.createElement('div', {
                        key: 'info',
                        className: 'text-sm text-gray-700'
                    }, 'Page ' + currentPage + ' of ' + pagination.pages + ' (' + pagination.total + ' total)'),
                    React.createElement('div', {
                        key: 'buttons',
                        className: 'flex space-x-2'
                    }, [
                        React.createElement('button', {
                            key: 'prev',
                            className: 'px-3 py-1 text-sm border border-gray-300 rounded ' + 
                                (pagination.hasPrev ? 'text-gray-700 hover:bg-gray-50' : 'text-gray-400 cursor-not-allowed'),
                            disabled: !pagination.hasPrev,
                            onClick: () => pagination.hasPrev && setCurrentPage(currentPage - 1)
                        }, 'Previous'),
                        React.createElement('button', {
                            key: 'next',
                            className: 'px-3 py-1 text-sm border border-gray-300 rounded ' +
                                (pagination.hasNext ? 'text-gray-700 hover:bg-gray-50' : 'text-gray-400 cursor-not-allowed'),
                            disabled: !pagination.hasNext,
                            onClick: () => pagination.hasNext && setCurrentPage(currentPage + 1)
                        }, 'Next')
                    ])
                ])
            ]);
        }

        // User Form Component
        function UserForm({ user, onClose, onSuccess }) {
            const [formData, setFormData] = useState({
                name: user?.name || '',
                email: user?.email || '',
                password: '',
                role: user?.role || 'author',
                avatar_url: user?.avatar_url || ''
            });
            const [loading, setLoading] = useState(false);
            const [error, setError] = useState(null);

            const handleSubmit = async (e) => {
                e.preventDefault();
                setLoading(true);
                setError(null);

                // Don't send empty password for updates
                const submitData = { ...formData };
                if (user && !submitData.password) {
                    delete submitData.password;
                }

                try {
                    const token = localStorage.getItem('auth_token');
                    const url = user ? '/api/users/' + user.id : '/api/users';
                    const method = user ? 'PUT' : 'POST';
                    
                    const response = await fetch(url, {
                        method,
                        headers: { 
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + token
                        },
                        body: JSON.stringify(submitData)
                    });
                    
                    const data = await response.json();

                    if (data.success) {
                        onSuccess();
                    } else {
                        setError(data.error || 'Failed to save user');
                    }
                } catch (err) {
                    console.error('Error saving user:', err);
                    setError('Failed to save user');
                } finally {
                    setLoading(false);
                }
            };

            return React.createElement('div', { className: 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50' }, [
                React.createElement('div', { key: 'modal', className: 'bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4' }, [
                    React.createElement('h3', { key: 'title', className: 'text-lg font-medium text-gray-900 mb-4' }, 
                        user ? 'Edit User' : 'Create New User'),
                    
                    error && React.createElement('div', { key: 'error', className: 'mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-800' }, error),
                    
                    React.createElement('form', { key: 'form', onSubmit: handleSubmit }, [
                        React.createElement('div', { key: 'name-field', className: 'mb-4' }, [
                            React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-2' }, 'Full Name'),
                            React.createElement('input', {
                                type: 'text',
                                required: true,
                                className: 'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500',
                                value: formData.name,
                                onChange: (e) => setFormData(prev => ({ ...prev, name: e.target.value }))
                            })
                        ]),
                        React.createElement('div', { key: 'email-field', className: 'mb-4' }, [
                            React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-2' }, 'Email'),
                            React.createElement('input', {
                                type: 'email',
                                required: true,
                                className: 'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500',
                                value: formData.email,
                                onChange: (e) => setFormData(prev => ({ ...prev, email: e.target.value }))
                            })
                        ]),
                        React.createElement('div', { key: 'password-field', className: 'mb-4' }, [
                            React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-2' }, 
                                user ? 'Password (leave blank to keep current)' : 'Password'),
                            React.createElement('input', {
                                type: 'password',
                                required: !user, // Only required for new users
                                className: 'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500',
                                value: formData.password,
                                onChange: (e) => setFormData(prev => ({ ...prev, password: e.target.value }))
                            })
                        ]),
                        React.createElement('div', { key: 'role-field', className: 'mb-4' }, [
                            React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-2' }, 'Role'),
                            React.createElement('select', {
                                required: true,
                                className: 'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500',
                                value: formData.role,
                                onChange: (e) => setFormData(prev => ({ ...prev, role: e.target.value }))
                            }, [
                                React.createElement('option', { key: 'author', value: 'author' }, 'Author'),
                                React.createElement('option', { key: 'editor', value: 'editor' }, 'Editor'),
                                React.createElement('option', { key: 'admin', value: 'admin' }, 'Admin')
                            ])
                        ]),
                        React.createElement('div', { key: 'avatar-field', className: 'mb-6' }, [
                            React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-2' }, 'Avatar URL (Optional)'),
                            React.createElement('input', {
                                type: 'url',
                                className: 'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500',
                                value: formData.avatar_url,
                                onChange: (e) => setFormData(prev => ({ ...prev, avatar_url: e.target.value }))
                            })
                        ]),
                        React.createElement('div', { key: 'buttons', className: 'flex justify-end space-x-3' }, [
                            React.createElement('button', {
                                type: 'button',
                                className: 'px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50',
                                onClick: onClose
                            }, 'Cancel'),
                            React.createElement('button', {
                                type: 'submit',
                                disabled: loading,
                                className: 'px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50',
                            }, loading ? 'Saving...' : (user ? 'Update User' : 'Create User'))
                        ])
                    ])
                ])
            ]);
        }

        // Categories Management Component (Professional - Matching Next.js)
        function CategoriesManagement() {
            const [categories, setCategories] = useState([]);
            const [loading, setLoading] = useState(true);
            const [error, setError] = useState(null);
            const [showCreateForm, setShowCreateForm] = useState(false);
            const [editingCategory, setEditingCategory] = useState(null);

            useEffect(() => {
                fetchCategories();
            }, []);

            const fetchCategories = async () => {
                try {
                    setLoading(true);
                    const response = await fetch('/api/categories?limit=100');
                    const data = await response.json();

                    if (data.success) {
                        setCategories(data.data || []);
                        setError(null);
                    } else {
                        setError(data.error || 'Failed to load categories');
                    }
                } catch (error) {
                    console.error('Error fetching categories:', error);
                    setError('Failed to load categories');
                } finally {
                    setLoading(false);
                }
            };

            const handleDelete = async (id) => {
                if (!confirm('Are you sure you want to delete this category? Posts in this category will be uncategorized.')) return;

                try {
                    const token = localStorage.getItem('auth_token');
                    const response = await fetch('/api/categories/' + id, {
                        method: 'DELETE',
                        headers: { 'Authorization': 'Bearer ' + token }
                    });
                    const data = await response.json();

                    if (data.success) {
                        fetchCategories();
                    } else {
                        alert(data.error || 'Failed to delete category');
                    }
                } catch (error) {
                    console.error('Error deleting category:', error);
                    alert('Failed to delete category');
                }
            };

            const formatDate = (dateString) => {
                return new Date(dateString).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
            };

            // Professional Loading State
            if (loading) {
                return React.createElement('div', {
                    className: 'space-y-6'
                }, [
                    React.createElement('div', {
                        key: 'header',
                        className: 'flex justify-between items-center'
                    }, [
                        React.createElement('div', { key: 'left' }, [
                            React.createElement('div', {
                                key: 'title',
                                className: 'h-8 bg-gray-200 rounded w-32 mb-2 animate-pulse'
                            }),
                            React.createElement('div', {
                                key: 'subtitle',
                                className: 'h-4 bg-gray-200 rounded w-48 animate-pulse'
                            })
                        ]),
                        React.createElement('div', {
                            key: 'button',
                            className: 'h-10 bg-gray-200 rounded w-32 animate-pulse'
                        })
                    ]),
                    React.createElement('div', {
                        key: 'grid',
                        className: 'grid gap-6 md:grid-cols-2 lg:grid-cols-3'
                    }, [1, 2, 3, 4, 5, 6].map(i => 
                        React.createElement('div', {
                            key: i,
                            className: 'bg-white rounded-lg shadow p-6 animate-pulse'
                        }, [
                            React.createElement('div', {
                                key: 'header',
                                className: 'flex items-center mb-3'
                            }, [
                                React.createElement('div', {
                                    key: 'color',
                                    className: 'w-4 h-4 rounded-full bg-gray-200 mr-3'
                                }),
                                React.createElement('div', {
                                    key: 'title',
                                    className: 'h-6 bg-gray-200 rounded w-24'
                                })
                            ]),
                            React.createElement('div', {
                                key: 'content',
                                className: 'space-y-2'
                            }, [
                                React.createElement('div', {
                                    key: 'line1',
                                    className: 'h-4 bg-gray-200 rounded w-full'
                                }),
                                React.createElement('div', {
                                    key: 'line2',
                                    className: 'h-4 bg-gray-200 rounded w-3/4'
                                }),
                                React.createElement('div', {
                                    key: 'line3',
                                    className: 'h-4 bg-gray-200 rounded w-1/2'
                                })
                            ])
                        ])
                    ))
                ]);
            }

            // Error State
            if (error) {
                return React.createElement('div', {
                    className: 'text-center py-12'
                }, [
                    React.createElement('div', {
                        key: 'icon',
                        className: 'mx-auto h-12 w-12 text-red-400 mb-4'
                    }, React.createElement('svg', {
                        fill: 'none',
                        stroke: 'currentColor',
                        viewBox: '0 0 24 24'
                    }, React.createElement('path', {
                        strokeLinecap: 'round',
                        strokeLinejoin: 'round',
                        strokeWidth: 2,
                        d: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                    }))),
                    React.createElement('h3', {
                        key: 'title',
                        className: 'text-lg font-medium text-gray-900 mb-2'
                    }, 'Error loading categories'),
                    React.createElement('p', {
                        key: 'message',
                        className: 'text-gray-600 mb-4'
                    }, error),
                    React.createElement('button', {
                        key: 'retry',
                        className: 'bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded',
                        onClick: fetchCategories
                    }, 'Try Again')
                ]);
            }

            return React.createElement('div', {
                className: 'space-y-6'
            }, [
                showCreateForm && React.createElement(CategoryForm, { 
                    key: 'create-form',
                    onClose: () => setShowCreateForm(false),
                    onSuccess: () => { setShowCreateForm(false); fetchCategories(); }
                }),
                editingCategory && React.createElement(CategoryForm, { 
                    key: 'edit-form',
                    category: editingCategory,
                    onClose: () => setEditingCategory(null),
                    onSuccess: () => { setEditingCategory(null); fetchCategories(); }
                }),

                // Professional Header (Matching Next.js)
                React.createElement('div', {
                    key: 'header',
                    className: 'flex justify-between items-center'
                }, [
                    React.createElement('div', { key: 'left' }, [
                        React.createElement('h1', {
                            key: 'title',
                            className: 'text-2xl font-bold text-gray-900'
                        }, 'Categories'),
                        React.createElement('p', {
                            key: 'subtitle',
                            className: 'text-gray-600'
                        }, 'Organize your content with categories')
                    ]),
                    React.createElement('button', {
                        key: 'create-btn',
                        className: 'flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors duration-150',
                        onClick: () => setShowCreateForm(true)
                    }, [
                        PlusIcon,
                        React.createElement('span', { key: 'text' }, 'New Category')
                    ])
                ]),

                // Stats Card
                React.createElement('div', {
                    key: 'stats',
                    className: 'grid grid-cols-1 md:grid-cols-3 gap-4'
                }, React.createElement('div', {
                    className: 'bg-white rounded-lg shadow'
                }, React.createElement('div', {
                    className: 'flex items-center p-6'
                }, [
                    React.createElement('div', {
                        key: 'content',
                        className: 'flex-1'
                    }, [
                        React.createElement('p', {
                            key: 'label',
                            className: 'text-sm font-medium text-gray-600'
                        }, 'Total Categories'),
                        React.createElement('p', {
                            key: 'value',
                            className: 'text-2xl font-bold text-gray-900'
                        }, categories.length)
                    ]),
                    React.createElement('div', {
                        key: 'icon',
                        className: 'text-green-500'
                    }, FolderIcon)
                ]))),

                // Professional Grid Layout (Enhanced)
                categories.length > 0 ? React.createElement('div', {
                    key: 'categories-grid',
                    className: 'grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                }, categories.map(category => 
                    React.createElement('div', {
                        key: category.id,
                        className: 'bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200 border border-gray-200'
                    }, [
                        React.createElement('div', {
                            key: 'content',
                            className: 'p-6'
                        }, [
                            React.createElement('div', {
                                key: 'header',
                                className: 'flex items-center mb-3'
                            }, [
                                React.createElement('div', {
                                    key: 'color',
                                    className: 'w-5 h-5 rounded-full mr-3 border border-gray-200',
                                    style: { backgroundColor: category.color || '#6B7280' }
                                }),
                                React.createElement('h3', {
                                    key: 'name',
                                    className: 'text-lg font-semibold text-gray-900 truncate'
                                }, category.name)
                            ]),
                            category.description && React.createElement('p', {
                                key: 'description',
                                className: 'text-gray-600 text-sm mb-4 line-clamp-2'
                            }, category.description),
                            React.createElement('div', {
                                key: 'meta',
                                className: 'flex items-center justify-between text-sm text-gray-500 mb-4'
                            }, [
                                React.createElement('span', {
                                    key: 'posts',
                                    className: 'flex items-center'
                                }, [
                                    React.createElement('svg', {
                                        key: 'icon',
                                        className: 'w-4 h-4 mr-1',
                                        fill: 'none',
                                        stroke: 'currentColor',
                                        viewBox: '0 0 24 24'
                                    }, React.createElement('path', {
                                        strokeLinecap: 'round',
                                        strokeLinejoin: 'round',
                                        strokeWidth: 2,
                                        d: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                                    })),
                                    React.createElement('span', { key: 'count' }, (category.post_count || 0) + ' posts')
                                ]),
                                React.createElement('span', {
                                    key: 'date',
                                    className: 'text-xs'
                                }, formatDate(category.created_at))
                            ]),
                            React.createElement('div', {
                                key: 'actions',
                                className: 'flex justify-between items-center pt-4 border-t border-gray-100'
                            }, [
                                React.createElement('div', {
                                    key: 'status',
                                    className: 'flex items-center'
                                }, [
                                    React.createElement('span', {
                                        key: 'dot',
                                        className: 'w-2 h-2 bg-green-400 rounded-full mr-2'
                                    }),
                                    React.createElement('span', {
                                        key: 'text',
                                        className: 'text-xs text-green-600 font-medium'
                                    }, 'Active')
                                ]),
                                React.createElement('div', {
                                    key: 'buttons',
                                    className: 'flex space-x-2'
                                }, [
                                    React.createElement('button', {
                                        key: 'edit',
                                        className: 'p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors duration-150',
                                        onClick: () => setEditingCategory(category),
                                        title: 'Edit category'
                                    }, PencilIcon),
                                    React.createElement('button', {
                                        key: 'delete',
                                        className: 'p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors duration-150',
                                        onClick: () => handleDelete(category.id),
                                        title: 'Delete category'
                                    }, TrashIcon)
                                ])
                            ])
                        ])
                    ])
                )) : React.createElement('div', {
                    key: 'empty-state',
                    className: 'text-center py-12 bg-white rounded-lg shadow'
                }, [
                    React.createElement('div', {
                        key: 'icon',
                        className: 'mx-auto h-12 w-12 text-gray-400 mb-4'
                    }, FolderIcon),
                    React.createElement('h3', {
                        key: 'title',
                        className: 'text-lg font-medium text-gray-900 mb-2'
                    }, 'No categories yet'),
                    React.createElement('p', {
                        key: 'subtitle',
                        className: 'text-gray-600 mb-6'
                    }, 'Start organizing your content by creating your first category'),
                    React.createElement('button', {
                        key: 'create',
                        className: 'bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded',
                        onClick: () => setShowCreateForm(true)
                    }, 'Create Your First Category')
                ])
            ]);
        }

        // Category Form Component
        function CategoryForm({ category, onClose, onSuccess }) {
            const [formData, setFormData] = useState({
                name: category?.name || '',
                description: category?.description || '',
                slug: category?.slug || '',
                color: category?.color || '#3B82F6'
            });
            const [loading, setLoading] = useState(false);
            const [error, setError] = useState(null);

            const generateSlug = (name) => {
                return name.toLowerCase()
                    .replace(/[^\w\s-]/g, '')
                    .replace(/\s+/g, '-')
                    .trim();
            };

            const handleNameChange = (e) => {
                const newName = e.target.value;
                setFormData(prev => ({ 
                    ...prev, 
                    name: newName,
                    slug: prev.slug || generateSlug(newName)
                }));
            };

            const handleSubmit = async (e) => {
                e.preventDefault();
                setLoading(true);
                setError(null);

                try {
                    const token = localStorage.getItem('auth_token');
                    const url = category ? '/api/categories/' + category.id : '/api/categories';
                    const method = category ? 'PUT' : 'POST';
                    
                    const response = await fetch(url, {
                        method,
                        headers: { 
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + token
                        },
                        body: JSON.stringify(formData)
                    });
                    
                    const data = await response.json();

                    if (data.success) {
                        onSuccess();
                    } else {
                        setError(data.error || 'Failed to save category');
                    }
                } catch (err) {
                    console.error('Error saving category:', err);
                    setError('Failed to save category');
                } finally {
                    setLoading(false);
                }
            };

            return React.createElement('div', { className: 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50' }, [
                React.createElement('div', { key: 'modal', className: 'bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4' }, [
                    React.createElement('h3', { key: 'title', className: 'text-lg font-medium text-gray-900 mb-4' }, 
                        category ? 'Edit Category' : 'Create New Category'),
                    
                    error && React.createElement('div', { key: 'error', className: 'mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-800' }, error),
                    
                    React.createElement('form', { key: 'form', onSubmit: handleSubmit }, [
                        React.createElement('div', { key: 'name-field', className: 'mb-4' }, [
                            React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-2' }, 'Name'),
                            React.createElement('input', {
                                type: 'text',
                                required: true,
                                className: 'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500',
                                value: formData.name,
                                onChange: handleNameChange
                            })
                        ]),
                        React.createElement('div', { key: 'slug-field', className: 'mb-4' }, [
                            React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-2' }, 'Slug'),
                            React.createElement('input', {
                                type: 'text',
                                required: true,
                                className: 'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500',
                                value: formData.slug,
                                onChange: (e) => setFormData(prev => ({ ...prev, slug: e.target.value }))
                            })
                        ]),
                        React.createElement('div', { key: 'desc-field', className: 'mb-4' }, [
                            React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-2' }, 'Description (Optional)'),
                            React.createElement('textarea', {
                                rows: 3,
                                className: 'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500',
                                value: formData.description,
                                onChange: (e) => setFormData(prev => ({ ...prev, description: e.target.value }))
                            })
                        ]),
                        React.createElement('div', { key: 'color-field', className: 'mb-6' }, [
                            React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-2' }, 'Color'),
                            React.createElement('input', {
                                type: 'color',
                                className: 'w-full h-10 border border-gray-300 rounded-md cursor-pointer',
                                value: formData.color,
                                onChange: (e) => setFormData(prev => ({ ...prev, color: e.target.value }))
                            })
                        ]),
                        React.createElement('div', { key: 'buttons', className: 'flex justify-end space-x-3' }, [
                            React.createElement('button', {
                                type: 'button',
                                className: 'px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50',
                                onClick: onClose
                            }, 'Cancel'),
                            React.createElement('button', {
                                type: 'submit',
                                disabled: loading,
                                className: 'px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50',
                            }, loading ? 'Saving...' : (category ? 'Update Category' : 'Create Category'))
                        ])
                    ])
                ])
            ]);
        }

        // Settings Management Component (Professional - Matching Next.js)
        function SettingsManagement() {
            const [settings, setSettings] = useState([]);
            const [formData, setFormData] = useState({});
            const [loading, setLoading] = useState(true);
            const [saving, setSaving] = useState(false);
            const [error, setError] = useState(null);
            const [success, setSuccess] = useState(null);

            useEffect(() => {
                fetchSettings();
            }, []);

            const fetchSettings = async () => {
                try {
                    setLoading(true);
                    const [settingsRes, objectRes] = await Promise.all([
                        fetch('/api/settings'),
                        fetch('/api/settings?asObject=true')
                    ]);
                    
                    const settingsData = await settingsRes.json();
                    const objectData = await objectRes.json();

                    if (settingsData.success) {
                        setSettings(settingsData.data || []);
                        if (objectData.success) {
                            setFormData(objectData.data || {});
                        }
                        setError(null);
                    } else {
                        setError(settingsData.error || 'Failed to load settings');
                    }
                } catch (error) {
                    console.error('Error fetching settings:', error);
                    setError('Failed to load settings');
                } finally {
                    setLoading(false);
                }
            };

            const handleInputChange = (key, value) => {
                setFormData(prev => ({
                    ...prev,
                    [key]: value
                }));
                setSuccess(null); // Clear success message when user makes changes
            };

            const handleSave = async () => {
                try {
                    setSaving(true);
                    setSuccess(null);
                    setError(null);

                    const token = localStorage.getItem('auth_token');
                    const response = await fetch('/api/settings', {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + token
                        },
                        body: JSON.stringify(formData)
                    });

                    const data = await response.json();

                    if (data.success) {
                        setSuccess('Settings saved successfully!');
                        fetchSettings(); // Refresh settings
                        // Clear success message after 3 seconds
                        setTimeout(() => setSuccess(null), 3000);
                    } else {
                        setError(data.error || 'Failed to save settings');
                    }
                } catch (error) {
                    console.error('Error saving settings:', error);
                    setError('Failed to save settings');
                } finally {
                    setSaving(false);
                }
            };

            const renderSettingInput = (setting) => {
                const value = formData[setting.key] || setting.value || '';
                
                switch (setting.type) {
                    case 'boolean':
                        return React.createElement('label', {
                            className: 'flex items-center cursor-pointer'
                        }, [
                            React.createElement('input', {
                                key: 'checkbox',
                                type: 'checkbox',
                                checked: value === 'true' || value === true,
                                onChange: (e) => handleInputChange(setting.key, e.target.checked ? 'true' : 'false'),
                                className: 'rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50'
                            }),
                            React.createElement('span', {
                                key: 'label',
                                className: 'ml-2 text-sm text-gray-700'
                            }, 'Enable')
                        ]);
                        
                    case 'textarea':
                        return React.createElement('textarea', {
                            value: value,
                            onChange: (e) => handleInputChange(setting.key, e.target.value),
                            placeholder: setting.description,
                            rows: 3,
                            className: 'block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50'
                        });
                        
                    case 'number':
                        return React.createElement('input', {
                            type: 'number',
                            value: value,
                            onChange: (e) => handleInputChange(setting.key, e.target.value),
                            placeholder: setting.description,
                            className: 'block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50'
                        });
                        
                    default: // text
                        return React.createElement('input', {
                            type: 'text',
                            value: value,
                            onChange: (e) => handleInputChange(setting.key, e.target.value),
                            placeholder: setting.description,
                            className: 'block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50'
                        });
                }
            };

            // Professional Loading State
            if (loading) {
                return React.createElement('div', {
                    className: 'space-y-6'
                }, [
                    React.createElement('div', {
                        key: 'header',
                        className: 'flex justify-between items-center'
                    }, [
                        React.createElement('div', { key: 'left' }, [
                            React.createElement('div', {
                                key: 'title',
                                className: 'h-8 bg-gray-200 rounded w-32 mb-2 animate-pulse'
                            }),
                            React.createElement('div', {
                                key: 'subtitle',
                                className: 'h-4 bg-gray-200 rounded w-48 animate-pulse'
                            })
                        ])
                    ]),
                    React.createElement('div', {
                        key: 'cards',
                        className: 'grid gap-6 md:grid-cols-2'
                    }, [1, 2, 3, 4].map(i => 
                        React.createElement('div', {
                            key: i,
                            className: 'bg-white rounded-lg shadow p-6 animate-pulse'
                        }, [
                            React.createElement('div', {
                                key: 'title',
                                className: 'h-6 bg-gray-200 rounded w-3/4 mb-4'
                            }),
                            React.createElement('div', {
                                key: 'content',
                                className: 'space-y-3'
                            }, [
                                React.createElement('div', {
                                    key: 'line1',
                                    className: 'h-4 bg-gray-200 rounded'
                                }),
                                React.createElement('div', {
                                    key: 'line2',
                                    className: 'h-10 bg-gray-200 rounded'
                                })
                            ])
                        ])
                    ))
                ]);
            }

            // Error State
            if (error) {
                return React.createElement('div', {
                    className: 'text-center py-12'
                }, [
                    React.createElement('div', {
                        key: 'icon',
                        className: 'mx-auto h-12 w-12 text-red-400 mb-4'
                    }, React.createElement('svg', {
                        fill: 'none',
                        stroke: 'currentColor',
                        viewBox: '0 0 24 24'
                    }, React.createElement('path', {
                        strokeLinecap: 'round',
                        strokeLinejoin: 'round',
                        strokeWidth: 2,
                        d: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                    }))),
                    React.createElement('h3', {
                        key: 'title',
                        className: 'text-lg font-medium text-gray-900 mb-2'
                    }, 'Error loading settings'),
                    React.createElement('p', {
                        key: 'message',
                        className: 'text-gray-600 mb-4'
                    }, error),
                    React.createElement('button', {
                        key: 'retry',
                        className: 'bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded',
                        onClick: fetchSettings
                    }, 'Try Again')
                ]);
            }

            // Group settings by category
            const groupedSettings = settings.reduce((groups, setting) => {
                const category = setting.category || 'General';
                if (!groups[category]) {
                    groups[category] = [];
                }
                groups[category].push(setting);
                return groups;
            }, {});

            return React.createElement('div', {
                className: 'space-y-6'
            }, [
                // Professional Header
                React.createElement('div', {
                    key: 'header',
                    className: 'flex justify-between items-center'
                }, [
                    React.createElement('div', { key: 'left' }, [
                        React.createElement('h1', {
                            key: 'title',
                            className: 'text-2xl font-bold text-gray-900'
                        }, 'Settings'),
                        React.createElement('p', {
                            key: 'subtitle',
                            className: 'text-gray-600'
                        }, 'Configure your CMS settings and preferences')
                    ]),
                    React.createElement('button', {
                        key: 'save-btn',
                        className: 'flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded transition-colors duration-150',
                        onClick: handleSave,
                        disabled: saving
                    }, [
                        saving ? 
                            React.createElement('div', {
                                key: 'spinner',
                                className: 'w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'
                            }) :
                            React.createElement('svg', {
                                key: 'check',
                                className: 'w-4 h-4',
                                fill: 'none',
                                stroke: 'currentColor',
                                viewBox: '0 0 24 24'
                            }, React.createElement('path', {
                                strokeLinecap: 'round',
                                strokeLinejoin: 'round',
                                strokeWidth: 2,
                                d: 'M5 13l4 4L19 7'
                            })),
                        React.createElement('span', { key: 'text' }, saving ? 'Saving...' : 'Save Changes')
                    ])
                ]),

                // Success/Error Messages
                (success || error) && React.createElement('div', {
                    key: 'messages',
                    className: 'space-y-2'
                }, [
                    success && React.createElement('div', {
                        key: 'success',
                        className: 'p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg'
                    }, success),
                    error && React.createElement('div', {
                        key: 'error',
                        className: 'p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg'
                    }, error)
                ]),

                // Settings Categories
                Object.keys(groupedSettings).length > 0 ? React.createElement('div', {
                    key: 'settings-grid',
                    className: 'grid gap-6 md:grid-cols-2'
                }, Object.keys(groupedSettings).map(category => 
                    React.createElement('div', {
                        key: category,
                        className: 'bg-white rounded-lg shadow border border-gray-200'
                    }, [
                        React.createElement('div', {
                            key: 'header',
                            className: 'px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg'
                        }, [
                            React.createElement('div', {
                                key: 'title-row',
                                className: 'flex items-center'
                            }, [
                                React.createElement('div', {
                                    key: 'icon',
                                    className: 'text-blue-500 mr-3'
                                }, CogIcon),
                                React.createElement('h3', {
                                    key: 'title',
                                    className: 'text-lg font-medium text-gray-900'
                                }, category)
                            ])
                        ]),
                        React.createElement('div', {
                            key: 'content',
                            className: 'p-6 space-y-6'
                        }, groupedSettings[category].map(setting => 
                            React.createElement('div', {
                                key: setting.key,
                                className: 'space-y-2'
                            }, [
                                React.createElement('div', {
                                    key: 'label-row',
                                    className: 'flex items-center justify-between'
                                }, [
                                    React.createElement('label', {
                                        key: 'label',
                                        className: 'text-sm font-medium text-gray-700'
                                    }, setting.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())),
                                    React.createElement('span', {
                                        key: 'type',
                                        className: 'px-2 py-1 text-xs rounded bg-gray-100 text-gray-600'
                                    }, setting.type)
                                ]),
                                setting.description && React.createElement('p', {
                                    key: 'description',
                                    className: 'text-sm text-gray-500'
                                }, setting.description),
                                React.createElement('div', {
                                    key: 'input',
                                    className: 'mt-1'
                                }, renderSettingInput(setting))
                            ])
                        ))
                    ])
                )) : React.createElement('div', {
                    key: 'empty-state',
                    className: 'text-center py-12 bg-white rounded-lg shadow'
                }, [
                    React.createElement('div', {
                        key: 'icon',
                        className: 'mx-auto h-12 w-12 text-gray-400 mb-4'
                    }, CogIcon),
                    React.createElement('h3', {
                        key: 'title',
                        className: 'text-lg font-medium text-gray-900 mb-2'
                    }, 'No settings configured'),
                    React.createElement('p', {
                        key: 'subtitle',
                        className: 'text-gray-600'
                    }, 'Settings will appear here once configured in the system')
                ])
            ]);
        }

        // Dashboard overview component
        function DashboardOverview() {
            const [stats, setStats] = useState(null);
            const [recentPosts, setRecentPosts] = useState([]);
            const [loading, setLoading] = useState(true);

            useEffect(() => {
                fetchDashboardData();
            }, []);

            const fetchDashboardData = async () => {
                try {
                    const token = localStorage.getItem('auth_token');
                    const headers = { 'Authorization': 'Bearer ' + token };
                    
                    // Fetch comprehensive stats like Next.js
                    const [postsRes, categoriesRes, usersRes, recentPostsRes] = await Promise.all([
                        fetch('/api/posts', { headers }),
                        fetch('/api/categories', { headers }),
                        fetch('/api/users', { headers }),
                        fetch('/api/posts?limit=5', { headers })
                    ]);

                    const posts = await postsRes.json();
                    const categories = await categoriesRes.json();
                    const users = await usersRes.json();
                    const recent = await recentPostsRes.json();

                    // Get published and draft counts
                    let publishedCount = 0;
                    let draftCount = 0;
                    if (posts.data) {
                        publishedCount = posts.data.filter(p => p.status === 'published').length;
                        draftCount = posts.data.filter(p => p.status === 'draft').length;
                    }

                    setStats({
                        totalPosts: posts.data?.length || 0,
                        publishedPosts: publishedCount,
                        draftPosts: draftCount,
                        archivedPosts: posts.data?.filter(p => p.status === 'archived').length || 0,
                        categories: categories.data?.length || 0,
                        users: users.data?.length || 0
                    });
                    
                    setRecentPosts(recent.data?.slice(0, 5) || []);
                } catch (error) {
                    console.error('Dashboard fetch error:', error);
                } finally {
                    setLoading(false);
                }
            };

            if (loading) {
                return React.createElement('div', {
                    className: 'space-y-6'
                }, React.createElement('div', {
                    className: 'animate-pulse grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'
                }, [1, 2, 3, 4].map(i => 
                    React.createElement('div', {
                        key: i,
                        className: 'bg-white rounded-lg shadow p-6'
                    }, [
                        React.createElement('div', {
                            key: 'title',
                            className: 'h-4 bg-gray-200 rounded w-20 mb-2'
                        }),
                        React.createElement('div', {
                            key: 'value',
                            className: 'h-8 bg-gray-200 rounded w-16'
                        })
                    ])
                )));
            }

            return React.createElement('div', {
                className: 'space-y-6'
            }, [
                // Quick Actions (matching Next.js)
                React.createElement('div', {
                    key: 'actions',
                    className: 'flex flex-wrap gap-4'
                }, [
                    React.createElement('button', {
                        key: 'new-post',
                        className: 'flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors duration-150',
                        onClick: () => {
                            const currentPage = document.querySelector('a[href="#"]:nth-child(2)');
                            if (currentPage) currentPage.click();
                        }
                    }, [
                        PlusIcon,
                        React.createElement('span', { key: 'text' }, 'New Post')
                    ]),
                    React.createElement('button', {
                        key: 'manage-cats',
                        className: 'flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors duration-150',
                        onClick: () => {
                            const categoriesTab = document.querySelector('a[href="#"]:nth-child(3)');
                            if (categoriesTab) categoriesTab.click();
                        }
                    }, [
                        FolderIcon,
                        React.createElement('span', { key: 'text' }, 'Manage Categories')
                    ])
                ]),

                // Main Stats Grid (matching Next.js)
                React.createElement('div', {
                    key: 'main-stats',
                    className: 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'
                }, [
                    React.createElement('div', {
                        key: 'total-posts',
                        className: 'bg-white rounded-lg shadow relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-150'
                    }, React.createElement('div', {
                        className: 'flex items-center justify-between p-6'
                    }, [
                        React.createElement('div', { key: 'text' }, [
                            React.createElement('p', {
                                key: 'label',
                                className: 'text-sm font-medium text-gray-600'
                            }, 'Total Posts'),
                            React.createElement('p', {
                                key: 'value',
                                className: 'text-3xl font-bold text-gray-900'
                            }, (stats?.totalPosts || 0).toLocaleString())
                        ]),
                        React.createElement('div', {
                            key: 'icon',
                            className: 'p-3 rounded-full bg-blue-500'
                        }, React.createElement('svg', {
                            className: 'h-6 w-6 text-white',
                            fill: 'none',
                            stroke: 'currentColor',
                            viewBox: '0 0 24 24'
                        }, React.createElement('path', {
                            strokeLinecap: 'round',
                            strokeLinejoin: 'round',
                            strokeWidth: 2,
                            d: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                        })))
                    ])),
                    React.createElement('div', {
                        key: 'categories',
                        className: 'bg-white rounded-lg shadow relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-150'
                    }, React.createElement('div', {
                        className: 'flex items-center justify-between p-6'
                    }, [
                        React.createElement('div', { key: 'text' }, [
                            React.createElement('p', {
                                key: 'label',
                                className: 'text-sm font-medium text-gray-600'
                            }, 'Categories'),
                            React.createElement('p', {
                                key: 'value',
                                className: 'text-3xl font-bold text-gray-900'
                            }, (stats?.categories || 0).toLocaleString())
                        ]),
                        React.createElement('div', {
                            key: 'icon',
                            className: 'p-3 rounded-full bg-green-500'
                        }, FolderIcon)
                    ])),
                    React.createElement('div', {
                        key: 'users',
                        className: 'bg-white rounded-lg shadow relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-150'
                    }, React.createElement('div', {
                        className: 'flex items-center justify-between p-6'
                    }, [
                        React.createElement('div', { key: 'text' }, [
                            React.createElement('p', {
                                key: 'label',
                                className: 'text-sm font-medium text-gray-600'
                            }, 'Users'),
                            React.createElement('p', {
                                key: 'value',
                                className: 'text-3xl font-bold text-gray-900'
                            }, (stats?.users || 0).toLocaleString())
                        ]),
                        React.createElement('div', {
                            key: 'icon',
                            className: 'p-3 rounded-full bg-orange-500'
                        }, UsersIcon)
                    ]))
                ]),

                // Detailed Post Stats (matching Next.js)
                React.createElement('div', {
                    key: 'post-stats',
                    className: 'grid grid-cols-1 gap-6 lg:grid-cols-3'
                }, [
                    React.createElement('div', {
                        key: 'published',
                        className: 'bg-white rounded-lg shadow'
                    }, React.createElement('div', {
                        className: 'flex items-center justify-between p-6'
                    }, [
                        React.createElement('div', { key: 'text' }, [
                            React.createElement('p', {
                                key: 'label',
                                className: 'text-sm font-medium text-gray-600'
                            }, 'Published Posts'),
                            React.createElement('p', {
                                key: 'value',
                                className: 'text-3xl font-bold text-gray-900'
                            }, (stats?.publishedPosts || 0).toLocaleString())
                        ]),
                        React.createElement('div', {
                            key: 'icon',
                            className: 'p-3 rounded-full bg-green-600'
                        }, DocumentIcon)
                    ])),
                    React.createElement('div', {
                        key: 'drafts',
                        className: 'bg-white rounded-lg shadow'
                    }, React.createElement('div', {
                        className: 'flex items-center justify-between p-6'
                    }, [
                        React.createElement('div', { key: 'text' }, [
                            React.createElement('p', {
                                key: 'label',
                                className: 'text-sm font-medium text-gray-600'
                            }, 'Draft Posts'),
                            React.createElement('p', {
                                key: 'value',
                                className: 'text-3xl font-bold text-gray-900'
                            }, (stats?.draftPosts || 0).toLocaleString())
                        ]),
                        React.createElement('div', {
                            key: 'icon',
                            className: 'p-3 rounded-full bg-yellow-600'
                        }, DocumentIcon)
                    ])),
                    React.createElement('div', {
                        key: 'archived',
                        className: 'bg-white rounded-lg shadow'
                    }, React.createElement('div', {
                        className: 'flex items-center justify-between p-6'
                    }, [
                        React.createElement('div', { key: 'text' }, [
                            React.createElement('p', {
                                key: 'label',
                                className: 'text-sm font-medium text-gray-600'
                            }, 'Archived Posts'),
                            React.createElement('p', {
                                key: 'value',
                                className: 'text-3xl font-bold text-gray-900'
                            }, (stats?.archivedPosts || 0).toLocaleString())
                        ]),
                        React.createElement('div', {
                            key: 'icon',
                            className: 'p-3 rounded-full bg-gray-600'
                        }, DocumentIcon)
                    ]))
                ]),

                // Recent Posts & System Status (matching Next.js)
                React.createElement('div', {
                    key: 'bottom-section',
                    className: 'grid grid-cols-1 lg:grid-cols-2 gap-6'
                }, [
                    // Recent Posts Card
                    React.createElement('div', {
                        key: 'recent-posts',
                        className: 'bg-white rounded-lg shadow'
                    }, [
                        React.createElement('div', {
                            key: 'header',
                            className: 'px-6 py-4 border-b border-gray-200'
                        }, React.createElement('h3', {
                            className: 'text-lg font-medium text-gray-900'
                        }, 'Recent Posts')),
                        React.createElement('div', {
                            key: 'content',
                            className: 'p-6'
                        }, [
                            React.createElement('div', {
                                key: 'posts',
                                className: 'space-y-4'
                            }, recentPosts.length > 0 ? recentPosts.map((post, index) => 
                                React.createElement('div', {
                                    key: post.id || index,
                                    className: 'flex items-center justify-between py-2 border-b border-gray-100 last:border-0'
                                }, [
                                    React.createElement('div', {
                                        key: 'info',
                                        className: 'flex-1'
                                    }, [
                                        React.createElement('h4', {
                                            key: 'title',
                                            className: 'text-sm font-medium text-gray-900 truncate'
                                        }, post.title),
                                        React.createElement('span', {
                                            key: 'status',
                                            className: 'text-xs px-2 py-1 rounded-full mt-1 inline-block ' + (
                                                post.status === 'published' ? 'bg-green-100 text-green-800' :
                                                post.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-gray-100 text-gray-800'
                                            )
                                        }, post.status)
                                    ]),
                                    React.createElement('div', {
                                        key: 'date',
                                        className: 'text-xs text-gray-500 ml-4'
                                    }, new Date(post.created_at).toLocaleDateString())
                                ])
                            ) : [
                                React.createElement('p', {
                                    key: 'empty',
                                    className: 'text-gray-500 text-sm'
                                }, 'No posts yet')
                            ])
                        ])
                    ]),

                    // System Status Card
                    React.createElement('div', {
                        key: 'system-status',
                        className: 'bg-white rounded-lg shadow'
                    }, [
                        React.createElement('div', {
                            key: 'header',
                            className: 'px-6 py-4 border-b border-gray-200'
                        }, React.createElement('h3', {
                            className: 'text-lg font-medium text-gray-900'
                        }, 'System Status')),
                        React.createElement('div', {
                            key: 'content',
                            className: 'p-6 space-y-4'
                        }, [
                            React.createElement('div', {
                                key: 'database',
                                className: 'flex items-center justify-between'
                            }, [
                                React.createElement('span', {
                                    key: 'label',
                                    className: 'text-sm text-gray-600'
                                }, 'Database (D1)'),
                                React.createElement('span', {
                                    key: 'status',
                                    className: 'text-sm font-medium text-green-600'
                                }, '✅ Connected')
                            ]),
                            React.createElement('div', {
                                key: 'api',
                                className: 'flex items-center justify-between'
                            }, [
                                React.createElement('span', {
                                    key: 'label',
                                    className: 'text-sm text-gray-600'
                                }, 'API Status'),
                                React.createElement('span', {
                                    key: 'status',
                                    className: 'text-sm font-medium text-green-600'
                                }, '✅ Operational')
                            ]),
                            React.createElement('div', {
                                key: 'deployment',
                                className: 'flex items-center justify-between'
                            }, [
                                React.createElement('span', {
                                    key: 'label',
                                    className: 'text-sm text-gray-600'
                                }, 'Platform'),
                                React.createElement('span', {
                                    key: 'status',
                                    className: 'text-sm font-medium text-blue-600'
                                }, '⚡ Cloudflare Workers')
                            ])
                        ])
                    ])
                ])
            ]);
        }

        // Tags Management Component
        function TagsManagement() {
            const [tags, setTags] = useState([]);
            const [loading, setLoading] = useState(true);
            const [error, setError] = useState(null);
            const [showCreateForm, setShowCreateForm] = useState(false);
            const [editingTag, setEditingTag] = useState(null);

            useEffect(() => {
                fetchTags();
            }, []);

            const fetchTags = async () => {
                try {
                    setLoading(true);
                    const response = await fetch('/api/tags?limit=100');
                    const data = await response.json();

                    if (data.success) {
                        setTags(data.data || []);
                        setError(null);
                    } else {
                        setError(data.error || 'Failed to load tags');
                    }
                } catch (error) {
                    console.error('Error fetching tags:', error);
                    setError('Failed to load tags');
                } finally {
                    setLoading(false);
                }
            };

            const deleteTag = async (id) => {
                if (!confirm('Are you sure you want to delete this tag?')) return;

                try {
                    const token = localStorage.getItem('auth_token');
                    const response = await fetch('/api/tags/' + id, {
                        method: 'DELETE',
                        headers: { 'Authorization': 'Bearer ' + token }
                    });
                    const data = await response.json();

                    if (data.success) {
                        fetchTags();
                    } else {
                        alert(data.error || 'Failed to delete tag');
                    }
                } catch (error) {
                    console.error('Error deleting tag:', error);
                    alert('Failed to delete tag');
                }
            };

            // Loading skeleton
            if (loading) {
                return React.createElement('div', { className: 'space-y-6' }, [
                    React.createElement('div', { key: 'header', className: 'flex justify-between items-center' }, [
                        React.createElement('div', { key: 'left', className: 'space-y-2' }, [
                            React.createElement('div', { className: 'h-8 bg-gray-200 rounded w-32 animate-pulse' }),
                            React.createElement('div', { className: 'h-4 bg-gray-200 rounded w-48 animate-pulse' })
                        ]),
                        React.createElement('div', { className: 'h-10 bg-gray-200 rounded w-24 animate-pulse' })
                    ]),
                    React.createElement('div', { key: 'grid', className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' },
                        Array.from({ length: 6 }).map((_, i) =>
                            React.createElement('div', { key: i, className: 'bg-white p-6 rounded-lg shadow animate-pulse' }, [
                                React.createElement('div', { className: 'h-6 bg-gray-200 rounded w-20 mb-2' }),
                                React.createElement('div', { className: 'h-4 bg-gray-200 rounded w-12 mb-4' }),
                                React.createElement('div', { className: 'h-4 bg-gray-200 rounded w-16' })
                            ])
                        )
                    )
                ]);
            }

            if (error) {
                return React.createElement('div', { className: 'space-y-6' }, [
                    React.createElement('div', { key: 'header', className: 'flex justify-between items-center' }, [
                        React.createElement('h1', { className: 'text-2xl font-bold text-gray-900' }, 'Tags')
                    ]),
                    React.createElement('div', { key: 'error', className: 'bg-red-50 border border-red-200 rounded-lg p-6' }, [
                        React.createElement('h3', { className: 'text-lg font-medium text-red-800 mb-2' }, 'Error loading tags'),
                        React.createElement('p', { className: 'text-red-600 mb-4' }, error),
                        React.createElement('button', {
                            className: 'bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded',
                            onClick: fetchTags
                        }, 'Try Again')
                    ])
                ]);
            }

            return React.createElement('div', { className: 'space-y-6' }, [
                showCreateForm && React.createElement(TagForm, { 
                    key: 'create-form',
                    onClose: () => setShowCreateForm(false),
                    onSuccess: () => { setShowCreateForm(false); fetchTags(); }
                }),
                editingTag && React.createElement(TagForm, { 
                    key: 'edit-form',
                    tag: editingTag,
                    onClose: () => setEditingTag(null),
                    onSuccess: () => { setEditingTag(null); fetchTags(); }
                }),

                // Header
                React.createElement('div', { key: 'header', className: 'flex justify-between items-center' }, [
                    React.createElement('div', { key: 'left' }, [
                        React.createElement('h1', { key: 'title', className: 'text-2xl font-bold text-gray-900 flex items-center gap-2' }, [
                            TagIcon,
                            'Tags'
                        ]),
                        React.createElement('p', { key: 'subtitle', className: 'text-gray-600' }, 'Manage content tags and organize your posts')
                    ]),
                    React.createElement('button', {
                        key: 'create-btn',
                        className: 'flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors duration-150',
                        onClick: () => setShowCreateForm(true)
                    }, [
                        PlusIcon,
                        React.createElement('span', { key: 'text' }, 'New Tag')
                    ])
                ]),

                // Stats card
                tags.length > 0 && React.createElement('div', { key: 'stats', className: 'bg-white rounded-lg shadow border border-gray-200' }, 
                    React.createElement('div', { className: 'flex items-center p-6' }, [
                        React.createElement('div', { key: 'content', className: 'flex-1' }, [
                            React.createElement('p', { key: 'label', className: 'text-sm font-medium text-gray-600' }, 'Total Tags'),
                            React.createElement('p', { key: 'value', className: 'text-2xl font-bold text-gray-900' }, tags.length)
                        ]),
                        React.createElement('div', { key: 'icon', className: 'text-blue-500' }, TagIcon)
                    ])
                ),

                // Tags grid
                React.createElement('div', { key: 'tags-container' },
                    tags.length > 0 ? 
                    React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' },
                        tags.map(tag => 
                            React.createElement('div', { 
                                key: tag.id, 
                                className: 'bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200 border border-gray-200' 
                            }, [
                                React.createElement('div', { className: 'px-6 py-5' }, [
                                    React.createElement('div', { key: 'header', className: 'flex items-center justify-between mb-4' }, [
                                        React.createElement('div', { key: 'info', className: 'flex items-center' }, [
                                            React.createElement('div', { 
                                                className: 'w-4 h-4 rounded-full mr-3',
                                                style: { backgroundColor: tag.color || '#3B82F6' }
                                            }),
                                            React.createElement('div', {}, [
                                                React.createElement('h3', { className: 'text-lg font-medium text-gray-900' }, tag.name),
                                                tag.description && React.createElement('p', { className: 'text-sm text-gray-500 mt-1' }, tag.description)
                                            ])
                                        ]),
                                        React.createElement('div', { key: 'actions', className: 'flex items-center space-x-2' }, [
                                            React.createElement('button', {
                                                className: 'text-gray-400 hover:text-blue-500 transition-colors',
                                                onClick: () => setEditingTag(tag),
                                                title: 'Edit tag'
                                            }, PencilIcon),
                                            React.createElement('button', {
                                                className: 'text-gray-400 hover:text-red-500 transition-colors',
                                                onClick: () => deleteTag(tag.id),
                                                title: 'Delete tag'
                                            }, TrashIcon)
                                        ])
                                    ]),
                                    React.createElement('div', { key: 'stats', className: 'text-sm text-gray-500' }, 
                                        (tag.post_count || 0) + ' posts')
                                ])
                            ])
                        )
                    ) :
                    // Empty state
                    React.createElement('div', { className: 'text-center py-12 bg-white rounded-lg shadow border border-gray-200' }, [
                        React.createElement('div', { key: 'icon', className: 'mx-auto h-12 w-12 text-gray-400 mb-4' }, TagIcon),
                        React.createElement('h3', { key: 'title', className: 'text-lg font-medium text-gray-900 mb-2' }, 'No tags'),
                        React.createElement('p', { key: 'description', className: 'text-gray-500 mb-6' }, 'Get started by creating your first tag.'),
                        React.createElement('button', {
                            key: 'create-btn',
                            className: 'inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700',
                            onClick: () => setShowCreateForm(true)
                        }, [
                            PlusIcon,
                            React.createElement('span', { className: 'ml-2' }, 'New Tag')
                        ])
                    ])
                )
            ]);
        }

        // Tag Form Component
        function TagForm({ tag, onClose, onSuccess }) {
            const [formData, setFormData] = useState({
                name: tag?.name || '',
                description: tag?.description || '',
                color: tag?.color || '#3B82F6'
            });
            const [loading, setLoading] = useState(false);
            const [error, setError] = useState(null);

            const handleSubmit = async (e) => {
                e.preventDefault();
                setLoading(true);
                setError(null);

                try {
                    const token = localStorage.getItem('auth_token');
                    const url = tag ? '/api/tags/' + tag.id : '/api/tags';
                    const method = tag ? 'PUT' : 'POST';
                    
                    const response = await fetch(url, {
                        method,
                        headers: { 
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + token
                        },
                        body: JSON.stringify(formData)
                    });
                    
                    const data = await response.json();

                    if (data.success) {
                        onSuccess();
                    } else {
                        setError(data.error || 'Failed to save tag');
                    }
                } catch (err) {
                    console.error('Error saving tag:', err);
                    setError('Failed to save tag');
                } finally {
                    setLoading(false);
                }
            };

            return React.createElement('div', { className: 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50' }, [
                React.createElement('div', { key: 'modal', className: 'bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4' }, [
                    React.createElement('h3', { key: 'title', className: 'text-lg font-medium text-gray-900 mb-4' }, 
                        tag ? 'Edit Tag' : 'Create New Tag'),
                    
                    error && React.createElement('div', { key: 'error', className: 'mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-800' }, error),
                    
                    React.createElement('form', { key: 'form', onSubmit: handleSubmit }, [
                        React.createElement('div', { key: 'name-field', className: 'mb-4' }, [
                            React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-2' }, 'Name'),
                            React.createElement('input', {
                                type: 'text',
                                required: true,
                                className: 'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500',
                                value: formData.name,
                                onChange: (e) => setFormData(prev => ({ ...prev, name: e.target.value }))
                            })
                        ]),
                        React.createElement('div', { key: 'desc-field', className: 'mb-4' }, [
                            React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-2' }, 'Description (Optional)'),
                            React.createElement('textarea', {
                                rows: 3,
                                className: 'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500',
                                value: formData.description,
                                onChange: (e) => setFormData(prev => ({ ...prev, description: e.target.value }))
                            })
                        ]),
                        React.createElement('div', { key: 'color-field', className: 'mb-6' }, [
                            React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-2' }, 'Color'),
                            React.createElement('input', {
                                type: 'color',
                                className: 'w-full h-10 border border-gray-300 rounded-md cursor-pointer',
                                value: formData.color,
                                onChange: (e) => setFormData(prev => ({ ...prev, color: e.target.value }))
                            })
                        ]),
                        React.createElement('div', { key: 'buttons', className: 'flex justify-end space-x-3' }, [
                            React.createElement('button', {
                                type: 'button',
                                className: 'px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50',
                                onClick: onClose
                            }, 'Cancel'),
                            React.createElement('button', {
                                type: 'submit',
                                disabled: loading,
                                className: 'px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50',
                            }, loading ? 'Saving...' : (tag ? 'Update Tag' : 'Create Tag'))
                        ])
                    ])
                ])
            ]);
        }

        // Setup Management Component
        function SetupManagement() {
            const [status, setStatus] = useState(null);
            const [loading, setLoading] = useState(true);
            const [actionLoading, setActionLoading] = useState(false);
            const [message, setMessage] = useState(null);

            useEffect(() => {
                checkDatabaseStatus();
            }, []);

            const checkDatabaseStatus = async () => {
                try {
                    setLoading(true);
                    const response = await fetch('/api/setup');
                    const data = await response.json();
                    
                    if (data.success) {
                        setStatus(data.data);
                        setMessage(null);
                    } else {
                        setMessage({ type: 'error', text: data.error || 'Failed to check database status' });
                    }
                } catch (error) {
                    console.error('Error checking database status:', error);
                    setMessage({ type: 'error', text: 'Failed to check database status' });
                } finally {
                    setLoading(false);
                }
            };

            const performAction = async (action) => {
                if (action === 'reset' && !confirm('Are you sure you want to reset the database? This will delete all data!')) {
                    return;
                }

                try {
                    setActionLoading(true);
                    setMessage(null);

                    const token = localStorage.getItem('auth_token');
                    const response = await fetch('/api/setup', {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + token
                        },
                        body: JSON.stringify({ action })
                    });

                    const data = await response.json();
                    
                    if (data.success) {
                        setMessage({ type: 'success', text: data.message || 'Operation completed successfully' });
                        checkDatabaseStatus(); // Refresh status
                    } else {
                        setMessage({ type: 'error', text: data.error || 'Operation failed' });
                    }
                } catch (error) {
                    console.error('Error performing action:', error);
                    setMessage({ type: 'error', text: 'Operation failed' });
                } finally {
                    setActionLoading(false);
                }
            };

            // Loading state
            if (loading) {
                return React.createElement('div', { className: 'space-y-6' }, [
                    React.createElement('div', { key: 'header', className: 'flex items-center space-x-3' }, [
                        React.createElement('div', { className: 'h-8 w-8 bg-gray-200 rounded animate-pulse' }),
                        React.createElement('div', { className: 'h-8 bg-gray-200 rounded w-32 animate-pulse' })
                    ]),
                    React.createElement('div', { key: 'card', className: 'bg-white shadow rounded-lg p-6' }, [
                        React.createElement('div', { className: 'h-6 bg-gray-200 rounded w-48 mb-4 animate-pulse' }),
                        React.createElement('div', { className: 'space-y-3' }, [
                            React.createElement('div', { className: 'h-4 bg-gray-200 rounded w-full animate-pulse' }),
                            React.createElement('div', { className: 'h-4 bg-gray-200 rounded w-3/4 animate-pulse' }),
                            React.createElement('div', { className: 'h-10 bg-gray-200 rounded w-32 animate-pulse mt-6' })
                        ])
                    ])
                ]);
            }

            return React.createElement('div', { className: 'space-y-6' }, [
                // Header
                React.createElement('div', { key: 'header' }, [
                    React.createElement('h1', { className: 'text-2xl font-bold text-gray-900 flex items-center gap-2' }, [
                        WrenchIcon,
                        'Setup & Maintenance'
                    ]),
                    React.createElement('p', { className: 'text-gray-600 mt-1' }, 'Database setup and system maintenance tools')
                ]),

                // Status Messages
                message && React.createElement('div', { 
                    key: 'message',
                    className: 'rounded-md p-4 ' + (message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200')
                }, [
                    React.createElement('div', { className: 'flex items-center' }, [
                        React.createElement('div', { className: 'flex-shrink-0' },
                            message.type === 'success' ? 
                            React.createElement('svg', { className: 'w-5 h-5 text-green-400', fill: 'currentColor', viewBox: '0 0 20 20' },
                                React.createElement('path', { fillRule: 'evenodd', d: 'M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z', clipRule: 'evenodd' })
                            ) :
                            React.createElement('svg', { className: 'w-5 h-5 text-red-400', fill: 'currentColor', viewBox: '0 0 20 20' },
                                React.createElement('path', { fillRule: 'evenodd', d: 'M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z', clipRule: 'evenodd' })
                            )
                        ),
                        React.createElement('div', { className: 'ml-3' }, React.createElement('p', { className: 'text-sm font-medium' }, message.text))
                    ])
                ]),

                // Database Status Card
                React.createElement('div', { key: 'status-card', className: 'bg-white shadow rounded-lg border border-gray-200' }, [
                    React.createElement('div', { className: 'px-6 py-4 border-b border-gray-200' }, [
                        React.createElement('h3', { className: 'text-lg font-medium text-gray-900' }, 'Database Status')
                    ]),
                    React.createElement('div', { className: 'p-6' }, 
                        status ? [
                            React.createElement('div', { key: 'status-info', className: 'space-y-4' }, [
                                React.createElement('div', { className: 'flex items-center justify-between' }, [
                                    React.createElement('span', { className: 'text-sm font-medium text-gray-500' }, 'Connection'),
                                    React.createElement('span', { 
                                        className: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ' + (status.connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')
                                    }, status.connected ? 'Connected' : 'Disconnected')
                                ]),
                                React.createElement('div', { className: 'flex items-center justify-between' }, [
                                    React.createElement('span', { className: 'text-sm font-medium text-gray-500' }, 'Initialized'),
                                    React.createElement('span', { 
                                        className: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ' + (status.initialized ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800')
                                    }, status.initialized ? 'Yes' : 'No')
                                ]),
                                status.message && React.createElement('div', { className: 'text-sm text-gray-600' }, status.message)
                            ]),
                            React.createElement('div', { key: 'actions', className: 'mt-6 flex flex-wrap gap-3' }, [
                                !status.initialized && React.createElement('button', {
                                    className: 'inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50',
                                    disabled: actionLoading,
                                    onClick: () => performAction('setup')
                                }, actionLoading ? 'Setting up...' : 'Setup Database'),
                                React.createElement('button', {
                                    className: 'inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50',
                                    onClick: checkDatabaseStatus
                                }, 'Refresh Status'),
                                React.createElement('button', {
                                    className: 'inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 disabled:opacity-50',
                                    disabled: actionLoading,
                                    onClick: () => performAction('reset')
                                }, actionLoading ? 'Resetting...' : 'Reset Database')
                            ])
                        ] : [
                            React.createElement('div', { key: 'loading', className: 'text-center py-4' }, 'Loading status...')
                        ]
                    )
                ])
            ]);
        }

        // Render the app
        ReactDOM.render(React.createElement(AdminApp), document.getElementById('admin-root'));
    </script>
</body>
</html>
`;

export async function handleAdminRoutes(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;

  try {
    // All admin routes serve the same SPA interface
    const content = `
      <div class="min-h-screen bg-gray-50">
        <!-- React app will be rendered here -->
      </div>
    `;

    return new Response(
      ADMIN_TEMPLATE
        .replace('{{title}}', getAdminPageTitle(path))
        .replace('{{content}}', content),
      {
        status: 200,
        headers: { 
          'Content-Type': 'text/html',
          ...corsHeaders 
        }
      }
    );

  } catch (error) {
    console.error('Admin route error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Admin interface error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
}

function getAdminPageTitle(path: string): string {
  if (path.includes('/posts')) return 'Posts';
  if (path.includes('/categories')) return 'Categories';
  if (path.includes('/tags')) return 'Tags';
  if (path.includes('/users')) return 'Users';
  if (path.includes('/settings')) return 'Settings';
  return 'Dashboard';
}