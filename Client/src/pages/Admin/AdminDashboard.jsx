import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { 
  DocumentCheckIcon, 
  UserIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ClockIcon,
  Cog6ToothIcon,
  XMarkIcon,
  DocumentTextIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  DocumentArrowUpIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import AdminLayout from './AdminLayout';
import HeroBannerEditor from './HeroBannerEditor';
import LoanManagement from './LoanManagement';
import NavigationManagement from './NavigationManagement';
import LogoSettings from './LogoSettings';
import AuthenticationSettings from './AuthenticationSettings';
import FAQManagement from './FAQManagement';
import Categories from './Categories';
import UserFormLoanDetail from './UserFormLoanDetail';
// import VerifiedUsers from './VerifiedUsers';
import EligibilityManagement from './EligibilityManagement';

const AdminDashboard = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
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
      setShowDetailModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject application');
    }
  };

  const handleViewDetails = async (application) => {
    try {
      setLoadingDetails(true);
      // Fetch full application details from API to ensure we have all data
      const response = await api.get(`/applications/${application._id}`);
      if (response.data.success) {
        setSelectedApplication(response.data.data);
        setShowDetailModal(true);
      } else {
        toast.error('Failed to load application details');
        // Fallback to using the application object from list
        setSelectedApplication(application);
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error('Error fetching application details:', error);
      toast.error('Failed to load application details. Showing limited information.');
      // Fallback to using the application object from list
      setSelectedApplication(application);
      setShowDetailModal(true);
    } finally {
      setLoadingDetails(false);
    }
  };

  const getDocumentUrl = (url) => {
    if (!url) return null;
    const apiBaseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    return url.startsWith('http') ? url : `${apiBaseUrl}${url}`;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Under Review':
        return 'bg-blue-100 text-blue-800';
      case 'Documents Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Submitted':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-48">Actions</th>
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
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleViewDetails(app)}
                            className="px-3 py-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md font-medium transition-colors"
                          >
                            View
                          </button>
                          {app.status !== 'Approved' && app.status !== 'Rejected' && (
                            <>
                              <button
                                onClick={() => handleApprove(app._id)}
                                className="px-3 py-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md font-medium transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => {
                                  const reason = prompt('Enter rejection reason:');
                                  if (reason) handleReject(app._id, reason);
                                }}
                                className="px-3 py-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md font-medium transition-colors"
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

      {/* Verified Users Tab
      {activeTab === 'verified-users' && (
        <VerifiedUsers />
      )} */}

      {/* Loan Management Tab */}
      {activeTab === 'loans' && (
        <LoanManagement />
      )}

      {/* User Form – Loan Detail Tab */}
      {activeTab === 'user-form-loan-detail' && (
        <UserFormLoanDetail />
      )}

      {/* Hero Banner Tab */}
      {activeTab === 'hero-banner' && (
        <HeroBannerEditor />
      )}

      {/* Logo Settings Tab */}
      {activeTab === 'logo-settings' && (
        <LogoSettings />
      )}

      {/* Navigation Management Tab */}
      {activeTab === 'navigation' && (
        <NavigationManagement />
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

      {/* Eligibility Management Tab */}
      {activeTab === 'eligibility' && (
        <EligibilityManagement />
      )}

      {/* Fallback for unknown tabs */}
      {![
        'dashboard',
        'verified-users',
        'loans',
        'user-form-loan-detail',
        'hero-banner',
        'logo-settings',
        'navigation',
        'authentication',
        'faq',
        'categories',
        'loan-categories',
        'eligibility'
      ].includes(activeTab) && (
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">No content for this section.</p>
        </div>
      )}

      {/* Application Detail Modal */}
      {showDetailModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
              <h3 className="text-xl font-bold text-gray-900">
                Application Details - {selectedApplication.applicationNumber || 'N/A'}
              </h3>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedApplication(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Application Status */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <span className={`mt-1 inline-block px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedApplication.status)}`}>
                      {selectedApplication.status || 'N/A'}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-500">Submitted On</p>
                    <p className="text-sm text-gray-900">{formatDate(selectedApplication.createdAt)}</p>
                  </div>
                </div>
              </div>

              {/* Dynamic Fields Data */}
              {selectedApplication.dynamicFields && Object.keys(selectedApplication.dynamicFields).length > 0 && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-4">
                    <DocumentTextIcon className="h-5 w-5 text-orange-500 mr-2" />
                    <h4 className="text-lg font-semibold text-gray-900">
                      Additional Form Data ({Object.keys(selectedApplication.dynamicFields).length} fields)
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(selectedApplication.dynamicFields).map(([key, value]) => {
                      let displayValue = value;
                      let isFileUrl = false;
                      
                      if (typeof value === 'object' && value !== null) {
                        if (Array.isArray(value) && value.length > 0 && value[0]?.url) {
                          displayValue = `${value.length} file(s)`;
                          isFileUrl = true;
                        } else {
                          displayValue = JSON.stringify(value, null, 2);
                        }
                      } else if (typeof value === 'string' && (value.startsWith('/uploads/') || value.startsWith('http'))) {
                        isFileUrl = true;
                      }
                      
                      return (
                        <div key={key} className="border border-gray-100 rounded p-3 bg-white">
                          <p className="text-sm font-medium text-gray-500 mb-1">{key}</p>
                          {isFileUrl ? (
                            <div className="space-y-1">
                              {Array.isArray(value) ? (
                                value.map((file, idx) => (
                                  <a
                                    key={idx}
                                    href={getDocumentUrl(file.url || file)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block text-sm text-orange-600 hover:text-orange-800 underline"
                                  >
                                    {file.name || `File ${idx + 1}`}
                                  </a>
                                ))
                              ) : (
                                <a
                                  href={getDocumentUrl(value)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-orange-600 hover:text-orange-800 underline"
                                >
                                  View File
                                </a>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-900 break-words whitespace-pre-wrap">
                              {String(displayValue)}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Personal Information */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-4">
                  <UserIcon className="h-5 w-5 text-orange-500 mr-2" />
                  <h4 className="text-lg font-semibold text-gray-900">Personal Information</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Full Name</p>
                    <p className="text-sm text-gray-900">{selectedApplication.personalInfo?.fullName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-sm text-gray-900">{selectedApplication.personalInfo?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Phone</p>
                    <p className="text-sm text-gray-900">{selectedApplication.personalInfo?.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                    <p className="text-sm text-gray-900">{formatDate(selectedApplication.personalInfo?.dateOfBirth)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Gender</p>
                    <p className="text-sm text-gray-900">{selectedApplication.personalInfo?.gender || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">PAN</p>
                    <p className="text-sm text-gray-900">{selectedApplication.personalInfo?.pan || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Aadhar</p>
                    <p className="text-sm text-gray-900">{selectedApplication.personalInfo?.aadhar || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Marital Status</p>
                    <p className="text-sm text-gray-900">{selectedApplication.personalInfo?.maritalStatus || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              {(selectedApplication.address?.current || selectedApplication.address?.permanent) && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-4">
                    <MapPinIcon className="h-5 w-5 text-orange-500 mr-2" />
                    <h4 className="text-lg font-semibold text-gray-900">Address Information</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {selectedApplication.address?.current && (
                      <div>
                        <h5 className="text-sm font-semibold text-gray-700 mb-2">Current Address</h5>
                        <div className="space-y-1 text-sm">
                          <p className="text-gray-900">{selectedApplication.address.current.street || 'N/A'}</p>
                          <p className="text-gray-500">
                            {[
                              selectedApplication.address.current.city,
                              selectedApplication.address.current.state,
                              selectedApplication.address.current.pincode
                            ].filter(Boolean).join(', ') || 'N/A'}
                          </p>
                          <p className="text-gray-500">{selectedApplication.address.current.country || 'N/A'}</p>
                        </div>
                      </div>
                    )}
                    {selectedApplication.address?.permanent && (
                      <div>
                        <h5 className="text-sm font-semibold text-gray-700 mb-2">Permanent Address</h5>
                        <div className="space-y-1 text-sm">
                          <p className="text-gray-900">{selectedApplication.address.permanent.street || 'N/A'}</p>
                          <p className="text-gray-500">
                            {[
                              selectedApplication.address.permanent.city,
                              selectedApplication.address.permanent.state,
                              selectedApplication.address.permanent.pincode
                            ].filter(Boolean).join(', ') || 'N/A'}
                          </p>
                          <p className="text-gray-500">{selectedApplication.address.permanent.country || 'N/A'}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Employment Information */}
              {selectedApplication.employmentInfo && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-4">
                    <BuildingOfficeIcon className="h-5 w-5 text-orange-500 mr-2" />
                    <h4 className="text-lg font-semibold text-gray-900">Employment Information</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Employment Type</p>
                      <p className="text-sm text-gray-900">{selectedApplication.employmentInfo.employmentType || 'N/A'}</p>
                    </div>
                    {selectedApplication.employmentInfo.companyName && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Company Name</p>
                        <p className="text-sm text-gray-900">{selectedApplication.employmentInfo.companyName}</p>
                      </div>
                    )}
                    {selectedApplication.employmentInfo.designation && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Designation</p>
                        <p className="text-sm text-gray-900">{selectedApplication.employmentInfo.designation}</p>
                      </div>
                    )}
                    {selectedApplication.employmentInfo.workExperience && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Work Experience</p>
                        <p className="text-sm text-gray-900">{selectedApplication.employmentInfo.workExperience} years</p>
                      </div>
                    )}
                    {selectedApplication.employmentInfo.monthlyIncome && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Monthly Income</p>
                        <p className="text-sm text-gray-900">
                          ₹{selectedApplication.employmentInfo.monthlyIncome.toLocaleString()}
                        </p>
                      </div>
                    )}
                    {selectedApplication.employmentInfo.businessType && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Business Type</p>
                        <p className="text-sm text-gray-900">{selectedApplication.employmentInfo.businessType}</p>
                      </div>
                    )}
                    {selectedApplication.employmentInfo.businessAge && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Business Age</p>
                        <p className="text-sm text-gray-900">{selectedApplication.employmentInfo.businessAge} years</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Loan Details */}
              {selectedApplication.loanDetails && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-4">
                    <CurrencyDollarIcon className="h-5 w-5 text-orange-500 mr-2" />
                    <h4 className="text-lg font-semibold text-gray-900">Loan Details</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Loan Type</p>
                      <p className="text-sm text-gray-900">{selectedApplication.loanId?.name || selectedApplication.loanType || 'N/A'}</p>
                    </div>
                    {selectedApplication.loanDetails.loanAmount && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Loan Amount</p>
                        <p className="text-sm text-gray-900">
                          ₹{selectedApplication.loanDetails.loanAmount.toLocaleString()}
                        </p>
                      </div>
                    )}
                    {selectedApplication.loanDetails.loanTenure && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Loan Tenure</p>
                        <p className="text-sm text-gray-900">{selectedApplication.loanDetails.loanTenure} months</p>
                      </div>
                    )}
                    {selectedApplication.loanDetails.interestRate && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Interest Rate</p>
                        <p className="text-sm text-gray-900">{selectedApplication.loanDetails.interestRate}%</p>
                      </div>
                    )}
                    {selectedApplication.loanDetails.emi && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">EMI</p>
                        <p className="text-sm text-gray-900">
                          ₹{selectedApplication.loanDetails.emi.toLocaleString()}
                        </p>
                      </div>
                    )}
                    {selectedApplication.loanDetails.purpose && (
                      <div className="md:col-span-2">
                        <p className="text-sm font-medium text-gray-500">Purpose</p>
                        <p className="text-sm text-gray-900">{selectedApplication.loanDetails.purpose}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Documents */}
              {(!selectedApplication.documents || selectedApplication.documents.length === 0) ? (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-4">
                    <DocumentArrowUpIcon className="h-5 w-5 text-orange-500 mr-2" />
                    <h4 className="text-lg font-semibold text-gray-900">Documents</h4>
                  </div>
                  <p className="text-sm text-gray-500 text-center py-4">No documents uploaded for this application.</p>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-4">
                    <DocumentArrowUpIcon className="h-5 w-5 text-orange-500 mr-2" />
                    <h4 className="text-lg font-semibold text-gray-900">
                      Documents ({selectedApplication.documents.length})
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedApplication.documents.map((doc, index) => {
                      const docUrl = getDocumentUrl(doc.url);
                      const isPdf = doc.name?.toLowerCase().endsWith('.pdf') || doc.url?.toLowerCase().includes('.pdf');
                      return (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-gray-900">{doc.type}</p>
                              <p className="text-xs text-gray-500 mt-1 break-words">{doc.name}</p>
                            </div>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ml-2 ${
                              doc.status === 'Verified' 
                                ? 'bg-green-100 text-green-800' 
                                : doc.status === 'Rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {doc.status || 'Pending'}
                            </span>
                          </div>
                          {docUrl ? (
                            <div className="flex gap-2">
                              <a
                                href={docUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 text-center px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors"
                              >
                                {isPdf ? 'View PDF' : 'View Document'}
                              </a>
                              <a
                                href={docUrl}
                                download
                                className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors"
                                title="Download"
                              >
                                ⬇
                              </a>
                            </div>
                          ) : (
                            <p className="text-xs text-red-500">Document URL not available</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Rejection Reason */}
              {selectedApplication.rejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-red-800 mb-1">Rejection Reason</p>
                  <p className="text-sm text-red-700">{selectedApplication.rejectionReason}</p>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              {selectedApplication.status !== 'Approved' && selectedApplication.status !== 'Rejected' && (
                <>
                  <button
                    onClick={() => {
                      const reason = prompt('Enter rejection reason:');
                      if (reason) {
                        handleReject(selectedApplication._id, reason);
                      }
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(selectedApplication._id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Approve
                  </button>
                </>
              )}
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedApplication(null);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;