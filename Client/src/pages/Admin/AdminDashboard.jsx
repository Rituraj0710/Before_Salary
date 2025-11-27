import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { 
  DocumentCheckIcon, 
  UserIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ClockIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import AdminLayout from './AdminLayout';
import HeroBannerEditor from './HeroBannerEditor';
import LoanManagement from './LoanManagement';
import LogoBranding from './LogoBranding';
import NavigationManagement from './NavigationManagement';
import AuthenticationSettings from './AuthenticationSettings';
import HomeLoanCards from './HomeLoanCards';
import HomeContentSettings from './HomeContentSettings';
import FAQManagement from './FAQManagement';
import Categories from './Categories';

const AdminDashboard = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const hasFetchedRef = useRef(false);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    // Wait for auth to load
    if (authLoading) return;
    
    // Check if user is admin
    if (!isAuthenticated) {
      console.error('Access denied: Not authenticated');
      setLoading(false);
      return;
    }
    
    if (user?.role !== 'admin') {
      console.error('Access denied: Not an admin user. User role:', user?.role);
      setLoading(false);
      return;
    }
    
    // Only fetch dashboard data once when on dashboard tab
    if (activeTab === 'dashboard' && !hasFetchedRef.current && !isFetchingRef.current) {
      fetchDashboardData();
    }
  }, [authLoading, isAuthenticated, user?.role, activeTab]);

  const fetchDashboardData = async () => {
    // Prevent multiple simultaneous calls
    if (isFetchingRef.current) return;
    
    try {
      isFetchingRef.current = true;
      setLoading(true);
      const [statsRes, appsRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/applications')
      ]);
      setStats(statsRes.data.data);
      setApplications(appsRes.data.data || []);
      hasFetchedRef.current = true;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Don't show error toast if it's a 401 (will be handled by interceptor)
      if (error.response?.status !== 401) {
        toast.error('Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };

  const handleApprove = async (applicationId) => {
    try {
      await api.post(`/applications/${applicationId}/approve`);
      toast.success('Application approved successfully');
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve application');
    }
  };

  const handleReject = async (applicationId, reason) => {
    try {
      await api.post(`/applications/${applicationId}/reject`, { rejectionReason: reason });
      toast.success('Application rejected');
      fetchDashboardData();
      setSelectedApplication(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject application');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" style={{ overflow: 'hidden', position: 'fixed', width: '100%', height: '100%' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stats.stats.totalUsers}</p>
                </div>
                <UserIcon className="h-12 w-12 text-blue-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Applications</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stats.stats.totalApplications}</p>
                </div>
                <DocumentCheckIcon className="h-12 w-12 text-purple-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stats.stats.pendingApplications}</p>
                </div>
                <ClockIcon className="h-12 w-12 text-yellow-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stats.stats.approvedApplications}</p>
                </div>
                <CheckCircleIcon className="h-12 w-12 text-green-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stats.stats.rejectedApplications}</p>
                </div>
                <XCircleIcon className="h-12 w-12 text-red-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Loans</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stats.stats.totalLoans}</p>
                </div>
                <Cog6ToothIcon className="h-12 w-12 text-gray-500" />
              </div>
            </div>
          </div>
        )}

        {/* Applications Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Loan Applications</h2>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Application #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applicant</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loan Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {applications.map((app) => (
                    <tr key={app._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {app.applicationNumber || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {app.personalInfo?.fullName || app.userId?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {app.loanId?.name || app.loanType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ₹{app.loanDetails?.loanAmount?.toLocaleString() || '0'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs font-medium rounded-full ${getStatusColor(app.status)}`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedApplication(app)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            View
                          </button>
                          {app.status !== 'Approved' && app.status !== 'Rejected' && (
                            <>
                              <button
                                onClick={() => handleApprove(app._id)}
                                className="text-green-600 hover:text-green-700"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => {
                                  const reason = prompt('Enter rejection reason:');
                                  if (reason) handleReject(app._id, reason);
                                }}
                                className="text-red-600 hover:text-red-700"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        </>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        // Render the Users component directly here
        <Users />
      )}

      {/* Loan Management Tab */}
      {activeTab === 'loans' && (
        <LoanManagement />
      )}

      {/* User Form – Loan Detail Tab */}
      {activeTab === 'user-form-loan-detail' && (
        <UserFormLoanDetail />
      )}

      {/* Home Loan Cards Tab */}
      {activeTab === 'home-loan-cards' && (
        <HomeLoanCards />
      )}

      {/* Hero Banner Tab */}
      {activeTab === 'hero-banner' && (
        <HeroBannerEditor />
      )}

      {/* Logo & Branding Tab */}
      {activeTab === 'logo' && (
        <LogoBranding />
      )}

      {/* Navigation Management Tab */}
      {activeTab === 'navigation' && (
        <NavigationManagement />
      )}

      {/* Home Content Tab */}
      {activeTab === 'home-content' && (
        <HomeContentSettings />
      )}

      {/* Authentication Settings Tab */}
      {activeTab === 'authentication' && (
        <AuthenticationSettings />
      )}

      {/* FAQ Management Tab */}
      {activeTab === 'faq' && (
        <FAQManagement />
      )}

      {/* Loan Categories Tab */}
      {(activeTab === 'categories' || activeTab === 'loan-categories') && (
        <Categories />
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Site Settings</h2>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600">Site settings coming soon...</p>
          </div>
        </div>
      )}

      {/* Content Management Tab */}
      {activeTab === 'content' && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Content Management</h2>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600">Content management coming soon...</p>
          </div>
        </div>
      )}

      {/* Fallback for unknown tabs */}
      {!['dashboard','loans','home-loan-cards','hero-banner','logo','navigation','home-content','authentication','faq','settings','content','categories','loan-categories'].includes(activeTab) && (
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">No content for this section.</p>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;

