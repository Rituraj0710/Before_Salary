import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { 
  CurrencyDollarIcon, 
  BuildingOfficeIcon, 
  HomeIcon,
  TruckIcon,
  AcademicCapIcon,
  ArrowRightIcon,
  UserGroupIcon,
  BanknotesIcon,
  ClockIcon,
  TagIcon
} from '@heroicons/react/24/outline';

const LoansPage = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      const response = await api.get('/loans');
      const loansData = response.data.data || [];
      // Sort by order, then by name
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
      setLoading(false);
    }
  };

  const loanIcons = {
    Personal: CurrencyDollarIcon,
    Business: BuildingOfficeIcon,
    Home: HomeIcon,
    Vehicle: TruckIcon,
    Education: AcademicCapIcon
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title Section */}
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Find Your Perfect Loan Match
          </h1>
          <p className="text-gray-600 mt-2">Browse through our comprehensive loan options and find the one that fits your needs</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-600 mx-auto"></div>
          </div>
        ) : loans.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No loan products available at the moment.</p>
            <p className="text-gray-500 text-sm mt-2">Please check back later or contact us for more information.</p>
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
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition flex flex-col h-full"
                >
                  {/* Loan Image - Always show placeholder for consistent sizing */}
                  <div className="w-full h-48 bg-gray-200 overflow-hidden flex-shrink-0">
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
                        <IconComponent className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6 flex flex-col flex-grow">
                    {/* Icon and Type */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-orange-100 p-3 rounded-lg inline-block">
                        <IconComponent className="h-8 w-8 text-orange-600" />
                      </div>
                      {loan.type && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full flex items-center">
                          <TagIcon className="h-3 w-3 mr-1" />
                          {loan.type}
                        </span>
                      )}
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{loan.name}</h3>
                    
                    {/* Description */}
                    <p className="text-gray-600 mb-6 text-sm leading-relaxed line-clamp-3 flex-grow">{loan.description}</p>
                    
                    {/* Loan Details */}
                    <div className="space-y-3 mb-6 border-t border-gray-200 pt-4">
                      {/* Interest Rate */}
                      {loan.interestRate && (
                        <div className="flex items-center text-sm">
                          <BanknotesIcon className="h-5 w-5 text-orange-500 mr-2 flex-shrink-0" />
                          <span className="text-gray-700">
                            <span className="font-semibold">Interest Rate:</span>{' '}
                            {loan.interestRate.min}% - {loan.interestRate.max}%
                            {loan.interestRate.default && (
                              <span className="text-gray-500 ml-1">(Default: {loan.interestRate.default}%)</span>
                            )}
                          </span>
                        </div>
                      )}
                      
                      {/* Loan Amount Range */}
                      {(loan.minLoanAmount || loan.maxLoanAmount) && (
                        <div className="flex items-center text-sm">
                          <CurrencyDollarIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                          <span className="text-gray-700">
                            <span className="font-semibold">Loan Amount:</span>{' '}
                            ₹{loan.minLoanAmount?.toLocaleString() || '0'} - ₹{loan.maxLoanAmount?.toLocaleString() || '0'}
                          </span>
                        </div>
                      )}
                      
                      {/* Tenure Range */}
                      {(loan.minTenure || loan.maxTenure) && (
                        <div className="flex items-center text-sm">
                          <ClockIcon className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0" />
                          <span className="text-gray-700">
                            <span className="font-semibold">Tenure:</span>{' '}
                            {loan.minTenure || 0} - {loan.maxTenure || 0} months
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Apply Now Button */}
                    <Link
                      to={`/eligibility?loanId=${loan._id}`}
                      className="w-full border-2 border-blue-600 text-blue-600 px-4 py-2.5 rounded-lg font-semibold hover:bg-blue-50 transition inline-flex items-center justify-center mt-auto"
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
  );
};

export default LoansPage;

