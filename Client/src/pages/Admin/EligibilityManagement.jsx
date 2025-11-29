import { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { 
  EyeIcon,
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

const EligibilityManagement = () => {
  const [eligibilities, setEligibilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEligibility, setSelectedEligibility] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchEligibilities();
  }, []);

  const fetchEligibilities = async () => {
    try {
      setLoading(true);
      const response = await api.get('/eligibility');
      console.log('Fetched eligibilities:', response.data);
      const eligibilities = response.data.data || [];
      console.log('Setting eligibilities:', eligibilities.length, 'records');
      setEligibilities(eligibilities);
    } catch (error) {
      toast.error('Failed to fetch eligibility submissions');
      console.error('Error fetching eligibilities:', error);
      console.error('Error response:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, showConfirm = true) => {
    if (showConfirm) {
      const confirmed = window.confirm('Are you sure you want to approve this eligibility?');
      if (!confirmed) return;
    }
    
    try {
      console.log('Approving eligibility:', id);
      const response = await api.put(`/eligibility/${id}/approve`);
      
      console.log('Approve response:', response.data);
      
      if (response.data && response.data.success) {
        toast.success('Eligibility approved successfully');
        
        // Update the local state immediately for instant UI feedback
        setEligibilities(prevEligibilities => 
          prevEligibilities.map(elig => 
            elig._id === id 
              ? { ...elig, status: 'approved' }
              : elig
          )
        );
        
        // Close modal if this eligibility is selected
        if (selectedEligibility?._id === id) {
          setSelectedEligibility({ ...selectedEligibility, status: 'approved' });
        }
        
        // Refresh the list to ensure consistency
        fetchEligibilities();
      } else {
        const errorMsg = response.data?.message || 'Failed to approve eligibility';
        console.error('Approve failed:', errorMsg);
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error('Approve error:', error);
      console.error('Error response:', error.response?.data);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to approve eligibility';
      toast.error(errorMsg);
    }
  };

  const handleReject = async (id, reason = null) => {
    const rejectionReasonToUse = reason || rejectionReason;
    
    if (!rejectionReasonToUse || !rejectionReasonToUse.trim()) {
      // If no reason provided and not in modal, open modal for rejection
      if (!showDetailModal) {
        const eligibility = eligibilities.find(e => e._id === id);
        if (eligibility) {
          setSelectedEligibility(eligibility);
          setShowDetailModal(true);
          setRejectionReason('');
        }
        toast.error('Please provide a rejection reason');
        return;
      }
      toast.error('Please provide a rejection reason');
      return;
    }

    const confirmed = window.confirm('Are you sure you want to reject this eligibility?');
    if (!confirmed) return;

    try {
      const response = await api.put(`/eligibility/${id}/reject`, { rejectionReason: rejectionReasonToUse });
      if (response.data.success) {
        toast.success('Eligibility rejected successfully');
        setRejectionReason('');
        fetchEligibilities();
        if (selectedEligibility?._id === id) {
          setShowDetailModal(false);
          setSelectedEligibility(null);
        }
      } else {
        toast.error(response.data.message || 'Failed to reject eligibility');
      }
    } catch (error) {
      console.error('Reject error:', error);
      console.error('Error response:', error.response);
      toast.error(error.response?.data?.message || error.message || 'Failed to reject eligibility');
    }
  };

  const handleQuickReject = (eligibility) => {
    const reason = window.prompt('Please provide a reason for rejection:');
    if (reason && reason.trim()) {
      handleReject(eligibility._id, reason.trim());
    }
  };

  const handleViewDetails = (eligibility) => {
    setSelectedEligibility(eligibility);
    setShowDetailModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Eligibility Management</h2>
      </div>

      {eligibilities.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <ClockIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No eligibility submissions found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loan Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employment Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monthly Income
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {eligibilities.map((eligibility) => (
                  <tr key={eligibility._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {eligibility.name || 'N/A'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {eligibility.email || eligibility.personalEmail || 'N/A'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {eligibility.loanId?.name || 'N/A'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {eligibility.employmentType || 'N/A'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₹{eligibility.netMonthlyIncome?.toLocaleString() || '0'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 w-fit ${getStatusColor(eligibility.status)}`}>
                        {getStatusIcon(eligibility.status)}
                        {eligibility.status?.toUpperCase() || 'PENDING'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(eligibility.createdAt)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetails(eligibility)}
                          className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 flex items-center gap-1.5 transition-colors"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                          <span className="text-xs font-medium">View</span>
                        </button>
                        {eligibility.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(eligibility._id)}
                              className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 flex items-center gap-1.5 transition-colors"
                              title="Approve Eligibility"
                            >
                              <CheckCircleIcon className="h-4 w-4" />
                              <span className="text-xs font-medium">Approve</span>
                            </button>
                            <button
                              onClick={() => handleQuickReject(eligibility)}
                              className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 flex items-center gap-1.5 transition-colors"
                              title="Reject Eligibility"
                            >
                              <XCircleIcon className="h-4 w-4" />
                              <span className="text-xs font-medium">Reject</span>
                            </button>
                          </>
                        )}
                        {eligibility.status === 'approved' && (
                          <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-50 rounded">
                            Approved
                          </span>
                        )}
                        {eligibility.status === 'rejected' && (
                          <span className="px-2 py-1 text-xs font-medium text-red-700 bg-red-50 rounded">
                            Rejected
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedEligibility && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">
                Eligibility Details - {selectedEligibility.name || 'N/A'}
              </h3>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedEligibility(null);
                  setRejectionReason('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <span className={`mt-1 inline-block px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedEligibility.status)}`}>
                      {selectedEligibility.status?.toUpperCase() || 'PENDING'}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-500">Submitted On</p>
                    <p className="text-sm text-gray-900">{formatDate(selectedEligibility.createdAt)}</p>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-4">
                  <UserIcon className="h-5 w-5 text-orange-500 mr-2" />
                  <h4 className="text-lg font-semibold text-gray-900">Personal Information</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Full Name</p>
                    <p className="text-sm text-gray-900">{selectedEligibility.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-sm text-gray-900">{selectedEligibility.email || selectedEligibility.personalEmail || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Personal Email</p>
                    <p className="text-sm text-gray-900">{selectedEligibility.personalEmail || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">PAN Card</p>
                    <p className="text-sm text-gray-900">{selectedEligibility.pancard || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                    <p className="text-sm text-gray-900">{formatDate(selectedEligibility.dob)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Gender</p>
                    <p className="text-sm text-gray-900">{selectedEligibility.gender || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Employment Information */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-4">
                  <BuildingOfficeIcon className="h-5 w-5 text-orange-500 mr-2" />
                  <h4 className="text-lg font-semibold text-gray-900">Employment Information</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Employment Type</p>
                    <p className="text-sm text-gray-900">{selectedEligibility.employmentType || 'N/A'}</p>
                  </div>
                  {selectedEligibility.companyName && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Company Name</p>
                      <p className="text-sm text-gray-900">{selectedEligibility.companyName}</p>
                    </div>
                  )}
                  {selectedEligibility.nextSalaryDate && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Next Salary Date</p>
                      <p className="text-sm text-gray-900">{formatDate(selectedEligibility.nextSalaryDate)}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-500">Net Monthly Income</p>
                    <p className="text-sm text-gray-900">
                      ₹{selectedEligibility.netMonthlyIncome?.toLocaleString() || '0'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-4">
                  <MapPinIcon className="h-5 w-5 text-orange-500 mr-2" />
                  <h4 className="text-lg font-semibold text-gray-900">Address Information</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Pin Code</p>
                    <p className="text-sm text-gray-900">{selectedEligibility.pinCode || 'N/A'}</p>
                  </div>
                  {selectedEligibility.state && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">State</p>
                      <p className="text-sm text-gray-900">{selectedEligibility.state}</p>
                    </div>
                  )}
                  {selectedEligibility.city && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">City</p>
                      <p className="text-sm text-gray-900">{selectedEligibility.city}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Loan Information */}
              {selectedEligibility.loanId && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-4">
                    <CurrencyDollarIcon className="h-5 w-5 text-orange-500 mr-2" />
                    <h4 className="text-lg font-semibold text-gray-900">Loan Information</h4>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Loan Type</p>
                    <p className="text-sm text-gray-900">{selectedEligibility.loanId?.name || 'N/A'}</p>
                  </div>
                </div>
              )}

              {/* Rejection Reason */}
              {selectedEligibility.status === 'rejected' && selectedEligibility.rejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-red-800 mb-1">Rejection Reason</p>
                  <p className="text-sm text-red-700">{selectedEligibility.rejectionReason}</p>
                </div>
              )}

              {/* Action Buttons */}
              {selectedEligibility.status === 'pending' && (
                <div className="border-t border-gray-200 pt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rejection Reason (required if rejecting) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      rows="3"
                      placeholder="Enter reason for rejection (required when rejecting)..."
                    />
                    <p className="text-xs text-gray-500 mt-1">This reason will be shown to the applicant if rejected.</p>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => handleApprove(selectedEligibility._id, true)}
                      className="px-6 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2 font-medium transition-colors shadow-sm hover:shadow"
                    >
                      <CheckCircleIcon className="h-5 w-5" />
                      Approve Eligibility
                    </button>
                    <button
                      onClick={() => handleReject(selectedEligibility._id)}
                      disabled={!rejectionReason.trim()}
                      className="px-6 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2 font-medium transition-colors shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <XCircleIcon className="h-5 w-5" />
                      Reject Eligibility
                    </button>
                  </div>
                </div>
              )}
              
              {/* Show action buttons for approved/rejected status */}
              {(selectedEligibility.status === 'approved' || selectedEligibility.status === 'rejected') && (
                <div className="border-t border-gray-200 pt-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">
                      This eligibility has been {selectedEligibility.status === 'approved' ? 'approved' : 'rejected'}.
                      {selectedEligibility.status === 'rejected' && selectedEligibility.rejectionReason && (
                        <span className="block mt-2 text-gray-800 font-medium">
                          Reason: {selectedEligibility.rejectionReason}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EligibilityManagement;

