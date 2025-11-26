import { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { PhotoIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const HeroBannerEditor = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    heroBanner: {
      title: 'Get an instant personal loan in minutes',
      subtitle: 'BeforeSalary makes borrowing easy with fast approvals, fair terms, and convenient repayment plans',
      image: '',
      backgroundImage: '',
      backgroundColor: 'orange',
      ctaText: 'Start Now',
      ctaLink: '/apply',
      showGooglePlay: true,
      showWhatsApp: true,
      googlePlayLink: '',
      whatsappLink: '',
      isActive: true
    }
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/settings');
      if (response.data.data) {
        setSettings({
          heroBanner: {
            ...settings.heroBanner,
            ...response.data.data.heroBanner
          }
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setSettings({
      heroBanner: {
        ...settings.heroBanner,
        [field]: value
      }
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const currentSettings = await api.get('/admin/settings');
      const updatedSettings = {
        ...currentSettings.data.data,
        heroBanner: settings.heroBanner
      };
      
      await api.put('/admin/settings', updatedSettings);
      toast.success('Hero banner updated successfully!');
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
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Hero Banner Settings</h2>
        <p className="text-gray-600">Customize your homepage hero section</p>
      </div>

      <div className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hero Title *
          </label>
          <input
            type="text"
            value={settings.heroBanner.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            placeholder="Enter hero title"
          />
        </div>

        {/* Subtitle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hero Subtitle *
          </label>
          <textarea
            value={settings.heroBanner.subtitle}
            onChange={(e) => handleChange('subtitle', e.target.value)}
            rows="3"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            placeholder="Enter hero subtitle"
          />
        </div>

        {/* Background Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Background Color
          </label>
          <select
            value={settings.heroBanner.backgroundColor}
            onChange={(e) => handleChange('backgroundColor', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="orange">Orange</option>
            <option value="blue">Blue</option>
            <option value="gradient">Gradient (Orange to Blue)</option>
          </select>
        </div>

        {/* Background Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Background Image URL (Optional)
          </label>
          <input
            type="url"
            value={settings.heroBanner.backgroundImage}
            onChange={(e) => handleChange('backgroundImage', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            placeholder="https://example.com/image.jpg"
          />
          <p className="mt-1 text-sm text-gray-500">Leave empty to use solid color</p>
        </div>

        {/* Hero Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hero Image URL (Optional)
          </label>
          <input
            type="url"
            value={settings.heroBanner.image}
            onChange={(e) => handleChange('image', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            placeholder="https://example.com/hero-image.jpg"
          />
        </div>

        {/* CTA Button */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CTA Button Text *
            </label>
            <input
              type="text"
              value={settings.heroBanner.ctaText}
              onChange={(e) => handleChange('ctaText', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Start Now"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CTA Button Link *
            </label>
            <input
              type="text"
              value={settings.heroBanner.ctaLink}
              onChange={(e) => handleChange('ctaLink', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="/apply"
            />
          </div>
        </div>

        {/* App Download Buttons */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">App Download Buttons</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Show Google Play Button
                </label>
                <p className="text-xs text-gray-500">Display Google Play download button</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.heroBanner.showGooglePlay}
                  onChange={(e) => handleChange('showGooglePlay', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
              </label>
            </div>

            {settings.heroBanner.showGooglePlay && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Google Play Link
                </label>
                <input
                  type="url"
                  value={settings.heroBanner.googlePlayLink}
                  onChange={(e) => handleChange('googlePlayLink', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="https://play.google.com/store/apps/..."
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Show WhatsApp Button
                </label>
                <p className="text-xs text-gray-500">Display WhatsApp application button</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.heroBanner.showWhatsApp}
                  onChange={(e) => handleChange('showWhatsApp', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
              </label>
            </div>

            {settings.heroBanner.showWhatsApp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp Link
                </label>
                <input
                  type="url"
                  value={settings.heroBanner.whatsappLink}
                  onChange={(e) => handleChange('whatsappLink', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="https://wa.me/1234567890"
                />
              </div>
            )}
          </div>
        </div>

        {/* Active Toggle */}
        <div className="flex items-center justify-between border-t pt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Banner Active
            </label>
            <p className="text-xs text-gray-500">Show/hide hero banner on homepage</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.heroBanner.isActive}
              onChange={(e) => handleChange('isActive', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
          </label>
        </div>

        {/* Preview */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
          <div className={`rounded-lg p-8 text-white ${
            settings.heroBanner.backgroundColor === 'orange' ? 'bg-orange-500' :
            settings.heroBanner.backgroundColor === 'blue' ? 'bg-blue-600' :
            'bg-gradient-to-r from-orange-500 to-blue-600'
          }`} style={settings.heroBanner.backgroundImage ? {
            backgroundImage: `url(${settings.heroBanner.backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          } : {}}>
            <h2 className="text-3xl font-bold mb-4">{settings.heroBanner.title}</h2>
            <p className="text-lg mb-6 opacity-90">{settings.heroBanner.subtitle}</p>
            <button className="bg-white text-orange-500 px-6 py-2 rounded-lg font-semibold mb-4">
              {settings.heroBanner.ctaText}
            </button>
            {(settings.heroBanner.showGooglePlay || settings.heroBanner.showWhatsApp) && (
              <div className="flex gap-4 mt-4">
                {settings.heroBanner.showGooglePlay && (
                  <button className="bg-blue-900 text-white px-4 py-2 rounded-lg text-sm">
                    Google Play
                  </button>
                )}
                {settings.heroBanner.showWhatsApp && (
                  <button className="bg-blue-900 text-white px-4 py-2 rounded-lg text-sm">
                    WhatsApp
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-6 border-t">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroBannerEditor;



