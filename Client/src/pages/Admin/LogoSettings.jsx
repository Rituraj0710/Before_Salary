import { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const LogoSettings = () => {
  const [currentLogo, setCurrentLogo] = useState('');
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/admin/settings');
      if (res.data?.success && res.data.data) {
        const logoUrl = res.data.data.siteLogo || '';
        setCurrentLogo(logoUrl);

        if (logoUrl) {
          // If it's a full URL use as-is, otherwise prefix with API base
          const apiBase =
            import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
          const fullUrl = logoUrl.startsWith('http') ? logoUrl : `${apiBase}${logoUrl}`;
          setLogoPreview(fullUrl);
        }
      }
    } catch (err) {
      console.error('Error fetching logo settings:', err);
      toast.error('Failed to load logo settings');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB');
      return;
    }

    setLogoFile(file);

    // Local preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!logoFile) {
      toast.error('Please choose a logo file first');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('logo', logoFile);

      const res = await api.post('/admin/upload-logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.success) {
        const uploadedUrl = res.data.data.logoUrl;
        setCurrentLogo(uploadedUrl);

        const apiBase =
          import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
        const fullUrl = uploadedUrl.startsWith('http') ? uploadedUrl : `${apiBase}${uploadedUrl}`;
        setLogoPreview(fullUrl);
        setLogoFile(null);
        toast.success('Logo updated successfully');
      } else {
        toast.error(res.data?.message || 'Failed to upload logo');
      }
    } catch (err) {
      console.error('Error uploading logo:', err);
      toast.error(err.response?.data?.message || 'Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    try {
      await api.put('/admin/settings', { siteLogo: '' });
      setCurrentLogo('');
      setLogoPreview(null);
      setLogoFile(null);
      toast.success('Logo removed');
    } catch (err) {
      console.error('Error removing logo:', err);
      toast.error('Failed to remove logo');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Logo Settings</h2>
      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Logo Image
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-700"
            />
            <button
              type="button"
              onClick={handleUpload}
              disabled={!logoFile || uploading}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </div>

        {(logoPreview || currentLogo) && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Logo Preview
            </label>
            <div className="flex items-center space-x-4">
              <img
                src={logoPreview}
                alt="Current logo"
                className="h-16 object-contain border rounded bg-white"
              />
              <button
                type="button"
                onClick={handleRemove}
                className="px-4 py-2 border border-red-500 text-red-600 rounded-lg hover:bg-red-50"
              >
                Remove Logo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogoSettings;


