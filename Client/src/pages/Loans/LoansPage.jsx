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
  BanknotesIcon
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
        {/* Title Section - Matching Image Design */}
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Find Your Perfect Loan Match
          </h1>
          <Link
            to="/loans"
            className="bg-orange-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-orange-600 transition inline-flex items-center"
          >
            View all
            <ArrowRightIcon className="ml-1 h-5 w-5" />
          </Link>
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
              return (
                <div
                  key={loan._id}
                  className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition"
                >
                  {/* Icon */}
                  <div className="mb-4">
                    <div className="bg-orange-100 p-3 rounded-lg inline-block">
                      <IconComponent className="h-8 w-8 text-orange-600" />
                    </div>
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{loan.name}</h3>
                  
                  {/* Description */}
                  <p className="text-gray-600 mb-6 text-sm leading-relaxed">{loan.description}</p>
                  
                  {/* Apply Now Button - Matching Image Style */}
                  <Link
                    to={`/eligibility?loanId=${loan._id}`}
                    className="w-full border-2 border-blue-600 text-blue-600 px-4 py-2.5 rounded-lg font-semibold hover:bg-blue-50 transition inline-flex items-center justify-center"
                  >
                    Apply Now
                    <ArrowRightIcon className="ml-1 h-4 w-4" />
                  </Link>
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

