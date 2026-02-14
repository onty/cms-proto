'use client';

import React, { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Setting } from '@/types';
import {
  Cog6ToothIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

export default function SettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [formData, setFormData] = useState<{ [key: string]: any }>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/settings?asObject=true');
      const data = await response.json();

      if (data.success) {
        const settingsResponse = await fetch('/api/settings');
        const settingsData = await settingsResponse.json();
        
        if (settingsData.success) {
          setSettings(settingsData.data);
          setFormData(data.data);
        }
      } else {
        setError(data.error || 'Failed to load settings');
      }
    } catch (err) {
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const settingsToUpdate: { [key: string]: { value: any; type?: string; description?: string } } = {};
      
      settings.forEach(setting => {
        const currentValue = formData[setting.key];
        if (currentValue !== undefined) {
          settingsToUpdate[setting.key] = {
            value: currentValue,
            type: setting.type,
            description: setting.description
          };
        }
      });

      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings: settingsToUpdate }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Settings saved successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || 'Failed to save settings');
      }
    } catch (err) {
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const renderFormField = (setting: Setting) => {
    const value = formData[setting.key] ?? '';

    switch (setting.type) {
      case 'boolean':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              id={setting.key}
              checked={value === true || value === 'true'}
              onChange={(e) => handleInputChange(setting.key, e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor={setting.key} className="ml-2 text-sm text-gray-700">
              {setting.description || setting.key}
            </label>
          </div>
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleInputChange(setting.key, parseInt(e.target.value))}
            placeholder={`Enter ${setting.key}`}
          />
        );

      case 'json':
        return (
          <Textarea
            value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                handleInputChange(setting.key, parsed);
              } catch {
                handleInputChange(setting.key, e.target.value);
              }
            }}
            placeholder="Enter valid JSON"
            rows={4}
          />
        );

      default: // string
        if (setting.key.includes('description') || setting.key.includes('content')) {
          return (
            <Textarea
              value={value}
              onChange={(e) => handleInputChange(setting.key, e.target.value)}
              placeholder={`Enter ${setting.key}`}
              rows={3}
            />
          );
        }
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) => handleInputChange(setting.key, e.target.value)}
            placeholder={`Enter ${setting.key}`}
          />
        );
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          </div>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error && settings.length === 0) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchSettings}>Try Again</Button>
        </div>
      </AdminLayout>
    );
  }

  // Group settings by category
  const generalSettings = settings.filter(s => 
    s.key.includes('site_') || s.key.includes('admin_') || s.key.includes('app_')
  );
  const contentSettings = settings.filter(s => 
    s.key.includes('post') || s.key.includes('comment') || s.key.includes('featured')
  );
  const otherSettings = settings.filter(s => 
    !generalSettings.includes(s) && !contentSettings.includes(s)
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600">Configure your CMS preferences</p>
          </div>
          <Button 
            onClick={handleSave} 
            loading={saving}
            className="flex items-center gap-2"
          >
            <CheckIcon className="h-4 w-4" />
            Save Settings
          </Button>
        </div>

        {/* Messages */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md">
            {success}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent>
              <div className="flex items-center p-6">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Total Settings</p>
                  <p className="text-2xl font-bold text-gray-900">{settings.length}</p>
                </div>
                <Cog6ToothIcon className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="flex items-center p-6">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">General</p>
                  <p className="text-2xl font-bold text-gray-900">{generalSettings.length}</p>
                </div>
                <Cog6ToothIcon className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="flex items-center p-6">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Content</p>
                  <p className="text-2xl font-bold text-gray-900">{contentSettings.length}</p>
                </div>
                <Cog6ToothIcon className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings Forms */}
        <div className="space-y-6">
          {/* General Settings */}
          {generalSettings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {generalSettings.map((setting) => (
                    <div key={setting.key}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {setting.key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        <span className="text-xs text-gray-500 ml-2">
                          ({setting.type})
                        </span>
                      </label>
                      {renderFormField(setting)}
                      {setting.description && (
                        <p className="mt-1 text-sm text-gray-500">{setting.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Content Settings */}
          {contentSettings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Content Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {contentSettings.map((setting) => (
                    <div key={setting.key}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {setting.key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        <span className="text-xs text-gray-500 ml-2">
                          ({setting.type})
                        </span>
                      </label>
                      {renderFormField(setting)}
                      {setting.description && (
                        <p className="mt-1 text-sm text-gray-500">{setting.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Other Settings */}
          {otherSettings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Other Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {otherSettings.map((setting) => (
                    <div key={setting.key}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {setting.key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        <span className="text-xs text-gray-500 ml-2">
                          ({setting.type})
                        </span>
                      </label>
                      {renderFormField(setting)}
                      {setting.description && (
                        <p className="mt-1 text-sm text-gray-500">{setting.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Save Button (Bottom) */}
        <div className="flex justify-end">
          <Button 
            onClick={handleSave} 
            loading={saving}
            size="lg"
            className="flex items-center gap-2"
          >
            <CheckIcon className="h-5 w-5" />
            Save All Settings
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}