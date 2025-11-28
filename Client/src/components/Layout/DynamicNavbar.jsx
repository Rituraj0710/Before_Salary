import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { 
  UserIcon, 
  ArrowRightOnRectangleIcon,
  ArrowRightIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const DynamicNavbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navItems, setNavItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [siteSettings, setSiteSettings] = useState({
    siteName: 'BeforeSalary',
    siteTagline: 'For Brighter Tomorrow',
    siteLogo: ''
  });
  // Use a ref to store mount time for cache-busting - this ensures logo refreshes on page load
  const mountTimeRef = useRef(Date.now());

  useEffect(() => {
    fetchNavSettings();
  }, []);

  const fetchNavSettings = async () => {
    try {
      setLoading(true);
      // Add cache-busting to the API request to ensure fresh data
      const response = await api.get(`/content/navigation?t=${Date.now()}`);
      if (response.data.success && response.data.data) {
        const data = response.data.data;
        // Format logo URL - convert relative paths to absolute URLs
        let logoUrl = data.siteLogo || '';
        if (logoUrl) {
          // If it's already a full URL (http/https), use it as is with cache-busting
          if (logoUrl.startsWith('http://') || logoUrl.startsWith('https://')) {
            // Add cache-busting parameter to prevent browser caching of old logo
            // Use mount time so it refreshes on page load but not on every render
            const separator = logoUrl.includes('?') ? '&' : '?';
            logoUrl = `${logoUrl}${separator}v=${mountTimeRef.current}`;
          } else if (logoUrl.startsWith('/')) {
            // If it's a relative path (starts with /), make it absolute
            const apiBaseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
            // Add cache-busting parameter to prevent browser caching of old logo
            logoUrl = `${apiBaseUrl}${logoUrl}?v=${mountTimeRef.current}`;
          }
        }
        setSiteSettings({
          siteName: data.siteName || 'BeforeSalary',
          siteTagline: data.siteTagline || 'For Brighter Tomorrow',
          siteLogo: logoUrl
        });
        
        // Get navigation items - ONLY use items from backend, no static defaults
        if (data.navigation && Array.isArray(data.navigation) && data.navigation.length > 0) {
          // Use navigation from admin settings, filter visible items
          const visibleItems = data.navigation
            .filter(item => item.isVisible !== false)
            .sort((a, b) => (a.order || 0) - (b.order || 0));
          
          // Only set navigation items if we have visible items from backend
          setNavItems(visibleItems);
        } else {
          // If no navigation from backend, show empty array (no static defaults)
          setNavItems([]);
        }
      } else {
        // If API response is not successful, show empty array
        setNavItems([]);
      }
    } catch (error) {
      console.error('Error fetching navigation:', error);
      // On error, show empty array - no static defaults
      setNavItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const publicNavItems = navItems.filter(item => item.isPublic !== false);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            {siteSettings.siteLogo && (
              <img
                src={siteSettings.siteLogo}
                alt={siteSettings.siteName || 'Site logo'}
                className="h-12 object-contain"
              />
            )}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {!loading && publicNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="text-gray-700 hover:text-orange-500 font-medium transition"
              >
                {item.label}
              </Link>
            ))}

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {user?.role === 'admin' && (
                  <Link
                    to="/admin/dashboard"
                    target="_blank"
                    className="text-gray-700 hover:text-blue-600 font-medium"
                  >
                    Admin
                  </Link>
                )}
                <Link
                  to="/dashboard"
                  className="flex items-center text-gray-700 hover:text-blue-600 font-medium"
                >
                  <UserIcon className="h-5 w-5 mr-1" />
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center text-gray-700 hover:text-blue-600 font-medium"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5 mr-1" />
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/applynow"
                className="bg-orange-500 text-white px-6 py-2.5 rounded-lg hover:bg-orange-600 transition font-semibold inline-flex items-center"
              >
                Apply Now
                <ArrowRightIcon className="ml-1 h-4 w-4" />
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-700"
          >
            {mobileMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && !loading && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 pt-2 pb-3 space-y-1">
            {publicNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <>
                {user?.role === 'admin' && (
                  <Link
                    to="/admin/dashboard"
                    target="_blank"
                    className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin
                  </Link>
                )}
                <Link
                  to="/dashboard"
                  className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/applynow"
                  className="block px-3 py-2 bg-orange-500 text-white rounded text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Apply Now
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default DynamicNavbar;

