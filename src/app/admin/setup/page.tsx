'use client';

import React, { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';

interface DatabaseStatus {
  connected: boolean;
  initialized: boolean;
  message: string;
}

export default function SetupPage() {
  const [status, setStatus] = useState<DatabaseStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showDangerZone, setShowDangerZone] = useState(false);

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
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to check database status' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to check database status' });
    } finally {
      setLoading(false);
    }
  };

  const performAction = async (action: 'setup' | 'reset') => {
    if (action === 'reset' && !confirm('Are you sure you want to reset the database? This will delete all data!')) {
      return;
    }

    try {
      setActionLoading(true);
      setMessage(null);

      const response = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        await checkDatabaseStatus();
      } else {
        setMessage({ type: 'error', text: data.error || 'Action failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to perform action' });
    } finally {
      setActionLoading(false);
    }
  };

  const StatusIndicator = ({ connected, initialized }: { connected: boolean; initialized: boolean }) => {
    if (!connected) {
      return (
        <div className="flex items-center gap-2 text-red-600">
          <ExclamationTriangleIcon className="h-5 w-5" />
          <span>Disconnected</span>
        </div>
      );
    }
    
    if (!initialized) {
      return (
        <div className="flex items-center gap-2 text-yellow-600">
          <ExclamationTriangleIcon className="h-5 w-5" />
          <span>Not Initialized</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 text-green-600">
        <CheckCircleIcon className="h-5 w-5" />
        <span>Ready</span>
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <WrenchScrewdriverIcon className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">System Setup</h1>
            <p className="text-gray-600">Configure and initialize your CMS database</p>
          </div>
        </div>

        {/* Messages */}
        {message && (
          <div className={`p-4 rounded-md ${
            message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Database Status */}
        <Card>
          <CardHeader>
            <CardTitle>Database Status</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ) : status ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Connection Status</span>
                  <StatusIndicator connected={status.connected} initialized={status.initialized} />
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-sm text-gray-600">{status.message}</p>
                </div>
                {status.connected && !status.initialized && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <h4 className="text-sm font-medium text-yellow-800 mb-2">Database Not Initialized</h4>
                    <p className="text-sm text-yellow-700 mb-3">
                      Your database is connected but hasn't been initialized yet. Click the button below to create the necessary tables and seed initial data.
                    </p>
                    <Button 
                      onClick={() => performAction('setup')}
                      loading={actionLoading}
                      className="w-full sm:w-auto"
                    >
                      Initialize Database
                    </Button>
                  </div>
                )}
                {status.connected && status.initialized && (
                  <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <h4 className="text-sm font-medium text-green-800 mb-2">Database Ready</h4>
                    <p className="text-sm text-green-700">
                      Your database is connected and initialized. Your CMS is ready to use!
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Failed to check database status</p>
                <Button 
                  variant="secondary" 
                  onClick={checkDatabaseStatus}
                  className="mt-4"
                >
                  Retry
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Database Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Database Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Update your database configuration in the <code className="bg-gray-100 px-1 py-0.5 rounded">.env.local</code> file:
              </p>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-md text-sm font-mono overflow-x-auto">
                <div>DATABASE_URL="mysql://username:password@localhost:3306/cms_prototype"</div>
                <div>DB_HOST=localhost</div>
                <div>DB_PORT=3306</div>
                <div>DB_USER=your_username</div>
                <div>DB_PASSWORD=your_password</div>
                <div>DB_NAME=cms_prototype</div>
              </div>
              <p className="text-xs text-gray-500">
                Make sure your MySQL server is running and the database exists before initializing.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <Button 
                  onClick={checkDatabaseStatus}
                  variant="secondary"
                  loading={loading}
                >
                  Refresh Status
                </Button>
                <Button 
                  onClick={() => performAction('setup')}
                  loading={actionLoading}
                  disabled={!status?.connected}
                >
                  {status?.initialized ? 'Reinitialize' : 'Initialize'} Database
                </Button>
              </div>
              
              {/* Danger Zone */}
              <div className="pt-6 border-t border-gray-200">
                <Button 
                  variant="ghost" 
                  onClick={() => setShowDangerZone(!showDangerZone)}
                  className="text-red-600 hover:text-red-700"
                >
                  {showDangerZone ? 'Hide' : 'Show'} Danger Zone
                </Button>
                
                {showDangerZone && (
                  <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
                    <h4 className="text-sm font-medium text-red-800 mb-2">Danger Zone</h4>
                    <p className="text-sm text-red-700 mb-4">
                      These actions are irreversible and will delete all your data.
                    </p>
                    <Button 
                      variant="danger"
                      onClick={() => performAction('reset')}
                      loading={actionLoading}
                      disabled={!status?.connected}
                    >
                      Reset Database
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}