import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  HomeIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  PhotoIcon,
  Bars3Icon,
  XMarkIcon,
  CreditCardIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import Users from './Users';
import { Routes, Route } from 'react-router-dom';

const AdminLayout = ({ children, activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: HomeIcon },
    { id: 'users', name: 'Verified Users', icon: UserIcon },
    { id: 'loans', name: 'Loan Management', icon: CreditCardIcon },
    { id: 'categories', name: 'Loan Categories', icon: Cog6ToothIcon },
    { id: 'home-loan-cards', name: 'Home Loan Cards', icon: CreditCardIcon },
    { id: 'hero-banner', name: 'Hero Banner', icon: PhotoIcon },
    { id: 'logo', name: 'Logo & Branding', icon: PhotoIcon },
    { id: 'navigation', name: 'Navigation Menu', icon: Bars3Icon },
    { id: 'home-content', name: 'Home Content', icon: DocumentTextIcon },
    { id: 'authentication', name: 'Authentication', icon: Cog6ToothIcon },
    { id: 'faq', name: 'FAQ Management', icon: DocumentTextIcon },
    { id: 'settings', name: 'Site Settings', icon: Cog6ToothIcon },
    { id: 'content', name: 'Content Management', icon: DocumentTextIcon },

  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-gray-500 hover:text-gray-700 mr-4"
              >
                {sidebarOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
              <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                target="_blank"
                className="text-gray-600 hover:text-gray-900 text-sm font-medium"
              >
                <GlobeAltIcon className="h-5 w-5" />
              </Link>
              <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-600 hover:text-gray-900 text-sm font-medium"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="w-64 bg-white shadow-sm min-h-screen border-r border-gray-200">
            <nav className="p-4 space-y-2">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition ${
                      activeTab === tab.id
                        ? 'bg-orange-500 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <IconComponent className="h-5 w-5 mr-3" />
                    <span className="font-medium">{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 p-6">
          <Routes>
            <Route path="users" element={<Users />} />
          </Routes>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

