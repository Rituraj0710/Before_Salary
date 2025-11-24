import { useState, useEffect } from 'react';
import { 
  CreditCardIcon, 
  BanknotesIcon,
  ShieldCheckIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const RepayLoan = () => {
  const { isAuthenticated, user } = useAuth();
  const [formData, setFormData] = useState({
    loanId: '',
    amount: '',
    paymentMethod: 'online',
    accountNumber: '',
    ifscCode: '',
    upiId: ''
  });
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserLoans();
    }
  }, [isAuthenticated]);

  const fetchUserLoans = async () => {
    try {
      const response = await api.get('/applications/my-applications');
      const approvedLoans = (response.data.data || []).filter(
        app => app.status === 'approved'
      );
      setLoans(approvedLoans);
    } catch (error) {
      console.error('Error fetching loans:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Implement repayment API endpoint
      await api.post('/repay', formData);
      toast.success('Payment initiated successfully!');
      setFormData({
        loanId: '',
        amount: '',
        paymentMethod: 'online',
        accountNumber: '',
        ifscCode: '',
        upiId: ''
      });
    } catch (error) {
      toast.error('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Repay Your Loan</h1>
          <p className="text-lg text-gray-600">
            Make secure and hassle-free loan repayments online
          </p>
        </div>

        {/* Warning Banner */}
        <div className="bg-blue-900 text-white rounded-lg p-6 mb-8">
          <div className="flex items-start">
            <InformationCircleIcon className="h-6 w-6 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-2">Beware of fraud!</p>
              <p className="text-sm">
                Always use our secure Repayment Website Link for loan payments. Do not make direct bank payments. 
                BeforeSalary is not responsible for payments made to other accounts.
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Payment Form */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Details</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isAuthenticated && loans.length > 0 && (
                <div>
                  <label htmlFor="loanId" className="block text-sm font-medium text-gray-700 mb-1">
                    Select Loan *
                  </label>
                  <select
                    id="loanId"
                    name="loanId"
                    required
                    value={formData.loanId}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">Select a loan</option>
                    {loans.map((loan) => (
                      <option key={loan._id} value={loan._id}>
                        {loan.loanId?.name || 'Loan'} - ₹{loan.loanDetails?.amount?.toLocaleString() || 'N/A'}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                  Repayment Amount (₹) *
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  required
                  min="1"
                  value={formData.amount}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter amount"
                />
              </div>

              <div>
                <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method *
                </label>
                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  required
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="online">Online Payment (UPI/Card/Net Banking)</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="upi">UPI</option>
                </select>
              </div>

              {formData.paymentMethod === 'bank' && (
                <>
                  <div>
                    <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Account Number *
                    </label>
                    <input
                      type="text"
                      id="accountNumber"
                      name="accountNumber"
                      required={formData.paymentMethod === 'bank'}
                      value={formData.accountNumber}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Enter account number"
                    />
                  </div>
                  <div>
                    <label htmlFor="ifscCode" className="block text-sm font-medium text-gray-700 mb-1">
                      IFSC Code *
                    </label>
                    <input
                      type="text"
                      id="ifscCode"
                      name="ifscCode"
                      required={formData.paymentMethod === 'bank'}
                      value={formData.ifscCode}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Enter IFSC code"
                    />
                  </div>
                </>
              )}

              {formData.paymentMethod === 'upi' && (
                <div>
                  <label htmlFor="upiId" className="block text-sm font-medium text-gray-700 mb-1">
                    UPI ID *
                  </label>
                  <input
                    type="text"
                    id="upiId"
                    name="upiId"
                    required={formData.paymentMethod === 'upi'}
                    value={formData.upiId}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="yourname@upi"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Proceed to Payment'}
              </button>
            </form>
          </div>

          {/* Information Panel */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-4">
                <ShieldCheckIcon className="h-8 w-8 text-green-600 mr-3" />
                <h3 className="text-xl font-bold text-gray-900">Secure Payment</h3>
              </div>
              <p className="text-gray-600">
                All transactions are encrypted and secure. We use industry-standard security measures to protect your financial information.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-4">
                <CreditCardIcon className="h-8 w-8 text-blue-600 mr-3" />
                <h3 className="text-xl font-bold text-gray-900">Payment Methods</h3>
              </div>
              <ul className="space-y-2 text-gray-600">
                <li>• Credit/Debit Cards</li>
                <li>• Net Banking</li>
                <li>• UPI (Google Pay, PhonePe, etc.)</li>
                <li>• Bank Transfer</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-4">
                <BanknotesIcon className="h-8 w-8 text-orange-600 mr-3" />
                <h3 className="text-xl font-bold text-gray-900">Payment Tips</h3>
              </div>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li>• Pay on time to avoid late fees</li>
                <li>• Set up auto-pay for convenience</li>
                <li>• Keep your payment confirmation for records</li>
                <li>• Contact support if you face any issues</li>
              </ul>
            </div>

            {!isAuthenticated && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                <p className="text-orange-800 text-sm">
                  <strong>Note:</strong> To view your active loans, please{' '}
                  <a href="/login" className="underline font-semibold">login</a> to your account.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepayLoan;


