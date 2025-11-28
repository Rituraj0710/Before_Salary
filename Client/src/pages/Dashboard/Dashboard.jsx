import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { 
  DocumentCheckIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ArrowRightIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  HomeIcon,
  TruckIcon,
  AcademicCapIcon,
  BanknotesIcon,
  TagIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingLoans, setLoadingLoans] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to OTP verification if user is not verified
    if (user && user.verified === false) {
      navigate('/verify-otp', { replace: true, state: { redirectTo: '/eligibility' } });
      return;
    }
    fetchApplications();
    fetchLoans();
    // eslint-disable-next-line
  }, [user]);

  const fetchApplications = async () => {
    try {
      const response = await api.get('/user/applications');
      setApplications(response.data.data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLoans = async () => {
    try {
      const response = await api.get('/loans');
      const loansData = response.data.data || [];
      // Sort by order, then by name, and filter active loans
      const sortedLoans = loansData
        .filter(loan => loan.isActive !== false)
        .sort((a, b) => {
          if (a.order !== b.order) {
            return (a.order || 0) - (b.order || 0);
          }
          return (a.name || '').localeCompare(b.name || '');
        });
      setLoans(sortedLoans);
    } catch (error) {
      console.error('Error fetching loans:', error);
    } finally {
      setLoadingLoans(false);
    }
  };

  const loanIcons = {
    Personal: CurrencyDollarIcon,
    Business: BuildingOfficeIcon,
    Home: HomeIcon,
    Vehicle: TruckIcon,
    Education: AcademicCapIcon
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'Rejected':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Welcome back, {user?.name}!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{applications.length}</p>
              </div>
              <DocumentCheckIcon className="h-12 w-12 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {applications.filter(app => ['Submitted', 'Under Review', 'Documents Pending'].includes(app.status)).length}
                </p>
              </div>
              <ClockIcon className="h-12 w-12 text-yellow-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {applications.filter(app => app.status === 'Approved').length}
                </p>
              </div>
              <CheckCircleIcon className="h-12 w-12 text-green-500" />
            </div>
          </div>
        </div>

        {/* Available Loans Section */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Available Loans</h2>
            <p className="text-sm text-gray-600 mt-1">Browse and apply for loans directly from your dashboard</p>
          </div>
          <div className="p-6">
            {loadingLoans ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : loans.length === 0 ? (
              <div className="text-center py-8">
                <CurrencyDollarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No loans available at the moment.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loans.map((loan) => {
                  const IconComponent = loanIcons[loan.type] || CurrencyDollarIcon;
                  const apiBaseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
                  const imageUrl = loan.image 
                    ? (loan.image.startsWith('http') ? loan.image : `${apiBaseUrl}${loan.image}`)
                    : null;
                  
                  return (
                    <div
                      key={loan._id}
                      className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition flex flex-col h-full"
                    >
                      {/* Loan Image - Always show placeholder for consistent sizing */}
                      <div className="w-full h-32 bg-gray-200 overflow-hidden flex-shrink-0">
                        {imageUrl ? (
                          <img 
                            src={imageUrl} 
                            alt={loan.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <IconComponent className="h-12 w-12 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      <div className="p-4 flex flex-col flex-grow">
                        {/* Icon and Type */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="bg-orange-100 p-2 rounded-lg">
                            <IconComponent className="h-6 w-6 text-orange-600" />
                          </div>
                          {loan.type && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                              {loan.type}
                            </span>
                          )}
                        </div>
                        
                        {/* Title */}
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{loan.name}</h3>
                        
                        {/* Description */}
                        <p className="text-gray-600 mb-4 text-sm line-clamp-2 flex-grow">{loan.description}</p>
                        
                        {/* Loan Details */}
                        <div className="space-y-2 mb-4 text-xs">
                          {loan.interestRate && (
                            <div className="flex items-center text-gray-700">
                              <BanknotesIcon className="h-4 w-4 text-orange-500 mr-1" />
                              <span>
                                {loan.interestRate.min}% - {loan.interestRate.max}% interest
                              </span>
                            </div>
                          )}
                          {(loan.minLoanAmount || loan.maxLoanAmount) && (
                            <div className="flex items-center text-gray-700">
                              <CurrencyDollarIcon className="h-4 w-4 text-green-500 mr-1" />
                              <span>
                                ₹{loan.minLoanAmount?.toLocaleString() || '0'} - ₹{loan.maxLoanAmount?.toLocaleString() || '0'}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {/* Apply Button */}
                        <Link
                          to={`/apply?loanId=${loan._id}`}
                          className="w-full bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-600 transition inline-flex items-center justify-center text-sm mt-auto"
                        >
                          Apply Now
                          <ArrowRightIcon className="ml-1 h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* My Applications Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">My Applications</h2>
            <Link
              to="/loans"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition inline-flex items-center"
            >
              Browse All Loans
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Link>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-8">
                <DocumentCheckIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">You haven't applied for any loans yet.</p>
                <Link
                  to="/eligibility"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Apply for your first loan →
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Application #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Loan Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {applications.map((app) => (
                      <tr key={app._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {app.applicationNumber || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {app.loanId?.name || app.loanType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ₹{app.loanDetails?.loanAmount?.toLocaleString() || '0'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex items-center text-xs font-medium rounded-full ${getStatusColor(app.status)}`}>
                            {getStatusIcon(app.status)}
                            <span className="ml-1">{app.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(app.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                          <Link to={`/dashboard/applications/${app._id}`} className="hover:text-blue-700">
                            View Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

