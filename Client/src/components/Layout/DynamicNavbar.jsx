import { useState, useEffect } from 'react';
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
  const [siteSettings, setSiteSettings] = useState({
    siteName: 'BeforeSalary',
    siteTagline: 'For Brighter Tomorrow',
    siteLogo: ''
  });

  useEffect(() => {
    fetchNavSettings();
  }, []);

  const fetchNavSettings = async () => {
    try {
      const response = await api.get('/content/navigation');
      if (response.data.success && response.data.data) {
        const data = response.data.data;
        // Format logo URL - if it's a relative path, make it absolute
        let logoUrl = data.siteLogo || '';
        if (logoUrl && logoUrl.startsWith('/uploads/')) {
          const apiBaseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
          logoUrl = `${apiBaseUrl}${logoUrl}`;
        }
        setSiteSettings({
          siteName: data.siteName || 'BeforeSalary',
          siteTagline: data.siteTagline || 'For Brighter Tomorrow',
          siteLogo: logoUrl
        });
        
        // Get navigation items
        if (data.navigation && data.navigation.length > 0) {
          const visibleItems = data.navigation
            .filter(item => item.isVisible !== false)
            .sort((a, b) => (a.order || 0) - (b.order || 0));
          setNavItems(visibleItems);
        } else {
          // Default navigation if none set
          setNavItems([
            { label: 'Home', path: '/', isPublic: true },
            { label: 'About Us', path: '/about', isPublic: true },
            { label: 'Product', path: '/loans', isPublic: true },
            { label: 'FAQs', path: '/faq', isPublic: true },
            { label: 'Repay Loan', path: '/repay', isPublic: true },
            { label: 'Contact Us', path: '/contact', isPublic: true }
          ]);
        }
      }
    } catch (error) {
      console.error('Error fetching navigation:', error);
      // Use default navigation on error
      setNavItems([
        { label: 'Home', path: '/', isPublic: true },
        { label: 'About Us', path: '/about', isPublic: true },
        { label: 'Product', path: '/loans', isPublic: true },
        { label: 'FAQs', path: '/faq', isPublic: true },
        { label: 'Repay Loan', path: '/repay', isPublic: true },
        { label: 'Contact Us', path: '/contact', isPublic: true }
      ]);
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
          <Link to="/" className="flex flex-col items-start">
            {siteSettings.siteLogo ? (
              <img src={siteSettings.siteLogo} alt={siteSettings.siteName} className="h-12" />
            ) : (
              <>
                <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
                  {siteSettings.siteName}
                </span>
                <span className="text-xs text-gray-500 mt-0.5">{siteSettings.siteTagline}</span>
              </>
            )}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {publicNavItems.map((item) => (
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
                to="/eligibility"
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
      {mobileMenuOpen && (
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
                  to="/eligibility"
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

