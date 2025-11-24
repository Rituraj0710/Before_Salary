import { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';

const LogoBranding = () => {
  const [settings, setSettings] = useState({
    siteName: 'BeforeSalary',
    siteTagline: 'For Brighter Tomorrow',
    siteLogo: '',
    favicon: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/admin/settings');
      if (response.data.success && response.data.data) {
        const logoUrl = response.data.data.siteLogo || '';
        setSettings({
          siteName: response.data.data.siteName || 'BeforeSalary',
          siteTagline: response.data.data.siteTagline || 'For Brighter Tomorrow',
          siteLogo: logoUrl,
          favicon: response.data.data.favicon || ''
        });
        // Set preview if logo URL exists - convert relative paths to full URLs
        if (logoUrl) {
          const apiBaseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
          const fullLogoUrl = logoUrl.startsWith('http') ? logoUrl : `${apiBaseUrl}${logoUrl}`;
          setLogoPreview(fullLogoUrl);
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.match('image.*')) {
        toast.error('Please select an image file');
        return;
      }
      // Validate file size (2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size must be less than 2MB');
        return;
      }
      setLogoFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = async () => {
    if (!logoFile) {
      toast.error('Please select a logo file');
      return;
    }

    try {
      setUploadingLogo(true);
      const formData = new FormData();
      formData.append('logo', logoFile);

      const response = await api.post('/admin/upload-logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        const logoUrl = response.data.data.logoUrl;
        // Store the relative path - it will be converted to full URL when displayed
        setSettings({ ...settings, siteLogo: logoUrl });
        // For preview, convert to full URL
        const apiBaseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
        const fullLogoUrl = logoUrl.startsWith('http') ? logoUrl : `${apiBaseUrl}${logoUrl}`;
        setLogoPreview(fullLogoUrl);
        setLogoFile(null);
        toast.success('Logo uploaded successfully');
        fetchSettings();
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error(error.response?.data?.message || 'Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const removeLogo = async () => {
    try {
      await api.put('/admin/settings', {
        ...settings,
        siteLogo: ''
      });
      setSettings({ ...settings, siteLogo: '' });
      setLogoPreview(null);
      setLogoFile(null);
      toast.success('Logo removed successfully');
    } catch (error) {
      toast.error('Failed to remove logo');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/admin/settings', {
        siteName: settings.siteName,
        siteTagline: settings.siteTagline,
        siteLogo: settings.siteLogo,
        favicon: settings.favicon
      });
      toast.success('Logo and branding updated successfully');
      await fetchSettings();
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Logo & Branding</h2>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Site Name *</label>
          <input
            type="text"
            required
            value={settings.siteName}
            onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="BeforeSalary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Site Tagline</label>
          <input
            type="text"
            value={settings.siteTagline}
            onChange={(e) => setSettings({ ...settings, siteTagline: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="For Brighter Tomorrow"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
          
          {/* File Upload Section */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Logo Image</label>
            <div className="flex items-center space-x-4">
              <label className="flex-1 cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoFileChange}
                  className="hidden"
                />
                <div className="flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 transition">
                  <PhotoIcon className="h-6 w-6 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">
                    {logoFile ? logoFile.name : 'Choose logo file (Max 2MB)'}
                  </span>
                </div>
              </label>
              {logoFile && (
                <button
                  type="button"
                  onClick={handleLogoUpload}
                  disabled={uploadingLogo}
                  className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50"
                >
                  {uploadingLogo ? 'Uploading...' : 'Upload'}
                </button>
              )}
            </div>
          </div>

          {/* Or use URL */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Or Enter Logo URL</label>
            <input
              type="url"
              value={settings.siteLogo}
              onChange={(e) => {
                setSettings({ ...settings, siteLogo: e.target.value });
                setLogoPreview(e.target.value);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="https://example.com/logo.png"
            />
          </div>

          {/* Logo Preview */}
          {(logoPreview || settings.siteLogo) && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg relative inline-block">
              <img 
                src={logoPreview || (settings.siteLogo.startsWith('http') 
                  ? settings.siteLogo 
                  : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${settings.siteLogo}`)} 
                alt="Logo preview" 
                className="h-20 object-contain max-w-xs" 
                onError={(e) => {
                  e.target.style.display = 'none';
                  toast.error('Failed to load logo image');
                }}
              />
              <button
                type="button"
                onClick={removeLogo}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                title="Remove logo"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Favicon URL</label>
          <input
            type="url"
            value={settings.favicon}
            onChange={(e) => setSettings({ ...settings, favicon: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="https://example.com/favicon.ico"
          />
          {settings.favicon && (
            <div className="mt-2">
              <img src={settings.favicon} alt="Favicon preview" className="h-8 w-8" />
            </div>
          )}
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LogoBranding;

