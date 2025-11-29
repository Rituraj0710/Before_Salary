import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import {
  XMarkIcon,
  UserIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  DocumentArrowUpIcon,
  DocumentTextIcon,
  ArrowLeftIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const ApplicationDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplicationDetails();
  }, [id]);

  const fetchApplicationDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/applications/${id}`);
      if (response.data.success) {
        setApplication(response.data.data);
      } else {
        toast.error('Failed to load application details');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error fetching application details:', error);
      toast.error('Failed to load application details');
      navigate('/dashboard');
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Application not found</p>
          <Link
            to="/dashboard"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            Application Details - {application.applicationNumber || 'N/A'}
          </h1>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 space-y-6">
            {/* Application Status */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <span className={`mt-2 inline-flex items-center px-4 py-2 text-sm font-medium rounded-full ${getStatusColor(application.status)}`}>
                    {getStatusIcon(application.status)}
                    <span className="ml-2">{application.status || 'N/A'}</span>
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-500">Submitted On</p>
                  <p className="text-sm text-gray-900 mt-1">{formatDate(application.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* Dynamic Fields Data */}
            {application.dynamicFields && Object.keys(application.dynamicFields).length > 0 && (
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-4">
                  <DocumentTextIcon className="h-5 w-5 text-orange-500 mr-2" />
                  <h4 className="text-lg font-semibold text-gray-900">
                    Additional Form Data ({Object.keys(application.dynamicFields).length} fields)
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(application.dynamicFields).map(([key, value]) => {
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
                  <p className="text-sm text-gray-900">{application.personalInfo?.fullName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-sm text-gray-900">{application.personalInfo?.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p className="text-sm text-gray-900">{application.personalInfo?.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                  <p className="text-sm text-gray-900">{formatDate(application.personalInfo?.dateOfBirth)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Gender</p>
                  <p className="text-sm text-gray-900">{application.personalInfo?.gender || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">PAN</p>
                  <p className="text-sm text-gray-900">{application.personalInfo?.pan || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Aadhar</p>
                  <p className="text-sm text-gray-900">{application.personalInfo?.aadhar || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Marital Status</p>
                  <p className="text-sm text-gray-900">{application.personalInfo?.maritalStatus || 'N/A'}</p>
                </div>
                {application.personalInfo?.numberOfDependents !== undefined && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Number of Dependents</p>
                    <p className="text-sm text-gray-900">{application.personalInfo.numberOfDependents}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Address Information */}
            {(application.address?.current || application.address?.permanent) && (
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-4">
                  <MapPinIcon className="h-5 w-5 text-orange-500 mr-2" />
                  <h4 className="text-lg font-semibold text-gray-900">Address Information</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {application.address?.current && (
                    <div>
                      <h5 className="text-sm font-semibold text-gray-700 mb-2">Current Address</h5>
                      <div className="space-y-1 text-sm">
                        <p className="text-gray-900">{application.address.current.street || 'N/A'}</p>
                        <p className="text-gray-500">
                          {[
                            application.address.current.city,
                            application.address.current.state,
                            application.address.current.pincode
                          ].filter(Boolean).join(', ') || 'N/A'}
                        </p>
                        <p className="text-gray-500">{application.address.current.country || 'N/A'}</p>
                      </div>
                    </div>
                  )}
                  {application.address?.permanent && (
                    <div>
                      <h5 className="text-sm font-semibold text-gray-700 mb-2">Permanent Address</h5>
                      <div className="space-y-1 text-sm">
                        <p className="text-gray-900">{application.address.permanent.street || 'N/A'}</p>
                        <p className="text-gray-500">
                          {[
                            application.address.permanent.city,
                            application.address.permanent.state,
                            application.address.permanent.pincode
                          ].filter(Boolean).join(', ') || 'N/A'}
                        </p>
                        <p className="text-gray-500">{application.address.permanent.country || 'N/A'}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Employment Information */}
            {application.employmentInfo && (
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-4">
                  <BuildingOfficeIcon className="h-5 w-5 text-orange-500 mr-2" />
                  <h4 className="text-lg font-semibold text-gray-900">Employment Information</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Employment Type</p>
                    <p className="text-sm text-gray-900">{application.employmentInfo.employmentType || 'N/A'}</p>
                  </div>
                  {application.employmentInfo.companyName && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Company Name</p>
                      <p className="text-sm text-gray-900">{application.employmentInfo.companyName}</p>
                    </div>
                  )}
                  {application.employmentInfo.designation && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Designation</p>
                      <p className="text-sm text-gray-900">{application.employmentInfo.designation}</p>
                    </div>
                  )}
                  {application.employmentInfo.workExperience && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Work Experience</p>
                      <p className="text-sm text-gray-900">
                        {application.employmentInfo.workExperience} years
                      </p>
                    </div>
                  )}
                  {application.employmentInfo.monthlyIncome && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Monthly Income</p>
                      <p className="text-sm text-gray-900">
                        ₹{application.employmentInfo.monthlyIncome.toLocaleString()}
                      </p>
                    </div>
                  )}
                  {application.employmentInfo.businessType && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Business Type</p>
                      <p className="text-sm text-gray-900">{application.employmentInfo.businessType}</p>
                    </div>
                  )}
                  {application.employmentInfo.businessAge && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Business Age</p>
                      <p className="text-sm text-gray-900">
                        {application.employmentInfo.businessAge} years
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Loan Details */}
            {application.loanDetails && (
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-4">
                  <CurrencyDollarIcon className="h-5 w-5 text-orange-500 mr-2" />
                  <h4 className="text-lg font-semibold text-gray-900">Loan Details</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Loan Type</p>
                    <p className="text-sm text-gray-900">{application.loanId?.name || application.loanType || 'N/A'}</p>
                  </div>
                  {application.loanDetails.loanAmount && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Loan Amount</p>
                      <p className="text-sm text-gray-900">
                        ₹{application.loanDetails.loanAmount.toLocaleString()}
                      </p>
                    </div>
                  )}
                  {application.loanDetails.loanTenure && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Loan Tenure</p>
                      <p className="text-sm text-gray-900">{application.loanDetails.loanTenure} months</p>
                    </div>
                  )}
                  {application.loanDetails.interestRate && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Interest Rate</p>
                      <p className="text-sm text-gray-900">{application.loanDetails.interestRate}%</p>
                    </div>
                  )}
                  {application.loanDetails.emi && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">EMI</p>
                      <p className="text-sm text-gray-900">
                        ₹{application.loanDetails.emi.toLocaleString()}
                      </p>
                    </div>
                  )}
                  {application.loanDetails.purpose && (
                    <div className="md:col-span-2">
                      <p className="text-sm font-medium text-gray-500">Purpose</p>
                      <p className="text-sm text-gray-900">{application.loanDetails.purpose}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Documents */}
            {(!application.documents || application.documents.length === 0) ? (
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
                    Documents ({application.documents.length})
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {application.documents.map((doc, index) => {
                    const docUrl = getDocumentUrl(doc.url);
                    const isPdf = doc.name?.toLowerCase().endsWith('.pdf') || doc.url?.toLowerCase().includes('.pdf');
                    return (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">{doc.type}</p>
                            <p className="text-xs text-gray-500 mt-1 break-words">{doc.name}</p>
                          </div>
                          {doc.status && (
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ml-2 ${
                              doc.status === 'Verified' 
                                ? 'bg-green-100 text-green-800' 
                                : doc.status === 'Rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {doc.status}
                            </span>
                          )}
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
            {application.rejectionReason && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm font-medium text-red-800 mb-1">Rejection Reason</p>
                <p className="text-sm text-red-700">{application.rejectionReason}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetails;

