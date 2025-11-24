import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { CheckCircleIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

const LoanDetail = () => {
  const { slug } = useParams();
  const { isAuthenticated } = useAuth();
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLoan();
  }, [slug]);

  const fetchLoan = async () => {
    try {
      const response = await api.get(`/loans/${slug}`);
      setLoan(response.data.data);
    } catch (error) {
      console.error('Error fetching loan:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Loan not found</h2>
          <Link to="/loans" className="text-blue-600 hover:text-blue-700">
            Back to Loans
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{loan.name}</h1>
          <p className="text-lg text-gray-600 mb-6">{loan.description}</p>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 p-6 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Interest Rate</p>
              <p className="text-3xl font-bold text-blue-600">
                {loan.interestRate?.min}% - {loan.interestRate?.max}%
              </p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Loan Amount</p>
              <p className="text-3xl font-bold text-green-600">
                ₹{loan.minLoanAmount?.toLocaleString()} - ₹{loan.maxLoanAmount?.toLocaleString()}
              </p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Tenure</p>
              <p className="text-3xl font-bold text-purple-600">
                {loan.minTenure} - {loan.maxTenure} months
              </p>
            </div>
          </div>

          <Link
            to="/eligibility"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition inline-flex items-center"
          >
            Apply Now
            <ArrowRightIcon className="ml-2 h-5 w-5" />
          </Link>
        </div>

        {/* Features */}
        {loan.features && loan.features.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Features & Benefits</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {loan.features.map((feature, index) => (
                <div key={index} className="flex items-start">
                  <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Eligibility */}
        {loan.eligibilityCriteria && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Eligibility Criteria</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-600 mb-2">
                  <strong>Age:</strong> {loan.eligibilityCriteria.minAge} - {loan.eligibilityCriteria.maxAge} years
                </p>
                <p className="text-gray-600 mb-2">
                  <strong>Minimum Income:</strong> ₹{loan.eligibilityCriteria.minIncome?.toLocaleString()} per month
                </p>
                <p className="text-gray-600 mb-2">
                  <strong>Credit Score:</strong> Minimum {loan.eligibilityCriteria.minCreditScore}
                </p>
              </div>
              <div>
                <p className="text-gray-600 mb-2">
                  <strong>Employment Type:</strong> {loan.eligibilityCriteria.employmentType?.join(', ')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Required Documents */}
        {loan.requiredDocuments && loan.requiredDocuments.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Required Documents</h2>
            <ul className="space-y-3">
              {loan.requiredDocuments.map((doc, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircleIcon className="h-5 w-5 text-blue-500 mr-3 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">{doc.name}</p>
                    {doc.description && (
                      <p className="text-gray-600 text-sm">{doc.description}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Repayment Options */}
        {loan.repaymentOptions && loan.repaymentOptions.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Repayment Options</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tenure</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Interest Rate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">EMI (Example)</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loan.repaymentOptions.map((option, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {option.tenure} months
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {option.interestRate}% p.a.
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ₹{option.emi?.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoanDetail;

