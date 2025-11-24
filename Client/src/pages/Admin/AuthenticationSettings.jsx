import { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { KeyIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const AuthenticationSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    authentication: {
      method: 'smtp',
      firebaseConfig: {
        apiKey: '',
        authDomain: '',
        projectId: '',
        storageBucket: '',
        messagingSenderId: '',
        appId: ''
      }
    }
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/settings');
      if (response.data.success && response.data.data) {
        setSettings({
          authentication: {
            method: response.data.data.authentication?.method || 'smtp',
            firebaseConfig: {
              apiKey: response.data.data.authentication?.firebaseConfig?.apiKey || '',
              authDomain: response.data.data.authentication?.firebaseConfig?.authDomain || '',
              projectId: response.data.data.authentication?.firebaseConfig?.projectId || '',
              storageBucket: response.data.data.authentication?.firebaseConfig?.storageBucket || '',
              messagingSenderId: response.data.data.authentication?.firebaseConfig?.messagingSenderId || '',
              appId: response.data.data.authentication?.firebaseConfig?.appId || ''
            }
          }
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load authentication settings');
    } finally {
      setLoading(false);
    }
  };

  const handleMethodChange = (method) => {
    setSettings({
      authentication: {
        ...settings.authentication,
        method
      }
    });
  };

  const handleFirebaseConfigChange = (field, value) => {
    setSettings({
      authentication: {
        ...settings.authentication,
        firebaseConfig: {
          ...settings.authentication.firebaseConfig,
          [field]: value
        }
      }
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const currentSettings = await api.get('/admin/settings');
      const updatedSettings = {
        ...currentSettings.data.data,
        authentication: settings.authentication
      };
      
      await api.put('/admin/settings', updatedSettings);
      toast.success('Authentication settings updated successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(error.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Authentication Settings</h2>
      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Authentication Method Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            <KeyIcon className="h-5 w-5 inline mr-2" />
            Authentication Method
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleMethodChange('smtp')}
              className={`p-4 border-2 rounded-lg text-left transition ${
                settings.authentication.method === 'smtp'
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Email/Password (SMTP)</h3>
                  <p className="text-sm text-gray-600 mt-1">Traditional email and password login</p>
                </div>
                {settings.authentication.method === 'smtp' && (
                  <ShieldCheckIcon className="h-6 w-6 text-orange-500" />
                )}
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleMethodChange('otp')}
              className={`p-4 border-2 rounded-lg text-left transition ${
                settings.authentication.method === 'otp'
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">OTP Login</h3>
                  <p className="text-sm text-gray-600 mt-1">One-time password via email/SMS</p>
                </div>
                {settings.authentication.method === 'otp' && (
                  <ShieldCheckIcon className="h-6 w-6 text-orange-500" />
                )}
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleMethodChange('firebase')}
              className={`p-4 border-2 rounded-lg text-left transition ${
                settings.authentication.method === 'firebase'
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Firebase Authentication</h3>
                  <p className="text-sm text-gray-600 mt-1">Google Firebase authentication</p>
                </div>
                {settings.authentication.method === 'firebase' && (
                  <ShieldCheckIcon className="h-6 w-6 text-orange-500" />
                )}
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleMethodChange('both')}
              className={`p-4 border-2 rounded-lg text-left transition ${
                settings.authentication.method === 'both'
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Both Options</h3>
                  <p className="text-sm text-gray-600 mt-1">Allow users to choose SMTP or Firebase</p>
                </div>
                {settings.authentication.method === 'both' && (
                  <ShieldCheckIcon className="h-6 w-6 text-orange-500" />
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Firebase Configuration */}
        {(settings.authentication.method === 'firebase' || settings.authentication.method === 'both') && (
          <div className="border-t pt-6">
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Firebase Configuration
            </label>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                <input
                  type="text"
                  value={settings.authentication.firebaseConfig.apiKey}
                  onChange={(e) => handleFirebaseConfigChange('apiKey', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="AIza..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Auth Domain</label>
                <input
                  type="text"
                  value={settings.authentication.firebaseConfig.authDomain}
                  onChange={(e) => handleFirebaseConfigChange('authDomain', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="your-project.firebaseapp.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project ID</label>
                <input
                  type="text"
                  value={settings.authentication.firebaseConfig.projectId}
                  onChange={(e) => handleFirebaseConfigChange('projectId', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="your-project-id"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Storage Bucket</label>
                <input
                  type="text"
                  value={settings.authentication.firebaseConfig.storageBucket}
                  onChange={(e) => handleFirebaseConfigChange('storageBucket', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="your-project.appspot.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Messaging Sender ID</label>
                <input
                  type="text"
                  value={settings.authentication.firebaseConfig.messagingSenderId}
                  onChange={(e) => handleFirebaseConfigChange('messagingSenderId', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="123456789"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">App ID</label>
                <input
                  type="text"
                  value={settings.authentication.firebaseConfig.appId}
                  onChange={(e) => handleFirebaseConfigChange('appId', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="1:123456789:web:abc123"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              You can find these values in your Firebase project settings under "Your apps" → Web app config
            </p>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end pt-6 border-t">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthenticationSettings;


