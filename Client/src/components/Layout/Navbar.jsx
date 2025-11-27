import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  HomeIcon, 
  UserIcon, 
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ArrowRightIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useState } from 'react';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex flex-col items-start">
            <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
              BeforeSalary
            </span>
            <span className="text-xs text-gray-500 mt-0.5">For Brighter Tomorrow</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-orange-500 font-medium transition">
              Home
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-orange-500 font-medium transition">
              About Us
            </Link>
            <Link to="/loans" className="text-gray-700 hover:text-orange-500 font-medium transition">
              Loans
            </Link>
            <Link to="/faq" className="text-gray-700 hover:text-orange-500 font-medium transition">
              FAQs
            </Link>
            <Link to="/repay" className="text-gray-700 hover:text-orange-500 font-medium transition">
              Repay Loan
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-orange-500 font-medium transition">
              Contact Us
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {user?.role === 'admin' && (
                  <Link
                    to="/admin/dashboard"
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
            <Link
              to="/"
              className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/loans"
              className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
              onClick={() => setMobileMenuOpen(false)}
            >
              Loans
            </Link>
            <Link
              to="/about"
              className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
              onClick={() => setMobileMenuOpen(false)}
            >
              About Us
            </Link>
            <Link
              to="/how-it-works"
              className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
              onClick={() => setMobileMenuOpen(false)}
            >
              How It Works
            </Link>
            <Link
              to="/faq"
              className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
              onClick={() => setMobileMenuOpen(false)}
            >
              FAQ
            </Link>
            <Link
              to="/repay"
              className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
              onClick={() => setMobileMenuOpen(false)}
            >
              Repay Loan
            </Link>
            <Link
              to="/contact"
              className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact Us
            </Link>
            <Link
              to="/blog"
              className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
              onClick={() => setMobileMenuOpen(false)}
            >
              Blog
            </Link>
            {isAuthenticated ? (
              <>
                {user?.role === 'admin' && (
                  <Link
                    to="/admin/dashboard"
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
                  to="/register"
                  className="block px-3 py-2 bg-blue-600 text-white rounded text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

