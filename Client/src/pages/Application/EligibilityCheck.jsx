import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CalendarIcon, DevicePhoneMobileIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const EligibilityCheck = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Eligibility Form State
  const [formData, setFormData] = useState({
    pancard: '',
    dob: '',
    gender: 'MALE',
    personalEmail: '',
    employmentType: 'SALARIED',
    companyName: '',
    nextSalaryDate: '',
    netMonthlyIncome: '',
    pinCode: '',
    state: '',
    city: ''
  });

  const [errors, setErrors] = useState({});

  // Pre-fill form if coming from loan detail page
  useEffect(() => {
    if (location.state?.eligibilityData) {
      setFormData(location.state.eligibilityData);
    }
    // Always require fresh email verification - don't auto-verify from sessionStorage
    // Clear any old verification data to ensure fresh verification each time
    sessionStorage.removeItem('emailVerified');
    
    // Reset to email input step
    setOtpStep('email');
    setEmail('');
    setOtp('');
    setOtpSent(false);
    setVerifiedEmail('');
    setDevOtp(null);
  }, [location.pathname]); // Only reset when pathname changes, not on every location change

  // OTP Timer
  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpTimer]);

  // Handle Email Input
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  // Send OTP
  const handleSendOTP = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      const result = await sendOTP(email, null, 'application');
      if (result.success) {
        setOtpSent(true);
        setOtpStep('otp');
        setOtpTimer(60); // 60 seconds timer
        // Store dev OTP if available (development mode only)
        if (result.data?.devOtp) {
          setDevOtp(result.data.devOtp);
          console.log('Development OTP:', result.data.devOtp);
        }
        toast.success('OTP sent to your email address. Check your inbox or server console for OTP (development mode)');
      } else {
        toast.error(result.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('OTP send error:', error);
      toast.error(error.message || 'Failed to send OTP. Please try again.');
    }
  };

  // Verify OTP
  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      const result = await verifyOTP(email, null, otp, 'application');
      if (result.success) {
        setOtpStep('verified');
        setVerifiedEmail(email);
        // Don't store in sessionStorage - require fresh verification each time
        toast.success('Email address verified successfully!');
      } else {
        toast.error(result.message || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error('OTP verify error:', error);
      toast.error(error.message || 'Invalid OTP. Please try again.');
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    await handleSendOTP();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.pancard.trim()) {
      newErrors.pancard = 'Pancard is required';
    } else if (formData.pancard.length !== 10) {
      newErrors.pancard = 'Pancard must be 10 characters';
    }
    
    if (!formData.dob.trim()) {
      newErrors.dob = 'Date of Birth is required';
    }
    
    if (!formData.personalEmail.trim()) {
      newErrors.personalEmail = 'Personal Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.personalEmail)) {
      newErrors.personalEmail = 'Invalid email format';
    }
    
    if (formData.employmentType === 'SALARIED') {
      if (!formData.companyName.trim()) {
        newErrors.companyName = 'Company Name is required';
      }
      if (!formData.nextSalaryDate.trim()) {
        newErrors.nextSalaryDate = 'Next Salary Date is required';
      }
    }
    
    if (!formData.netMonthlyIncome.trim()) {
      newErrors.netMonthlyIncome = 'Net Monthly Income is required';
    } else if (isNaN(formData.netMonthlyIncome) || parseFloat(formData.netMonthlyIncome) < 0) {
      newErrors.netMonthlyIncome = 'Invalid income amount';
    }
    
    if (!formData.pinCode.trim()) {
      newErrors.pinCode = 'Pin Code is required';
    } else if (!/^\d{6}$/.test(formData.pinCode)) {
      newErrors.pinCode = 'Pin Code must be 6 digits';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fill all required fields correctly');
      return;
    }

    try {
      // Submit eligibility data to database
      const eligibilityData = {
        email: verifiedEmail || email,
        loanId: loanId || null,
        pancard: formData.pancard,
        dob: formData.dob,
        gender: formData.gender,
        personalEmail: formData.personalEmail,
        employmentType: formData.employmentType,
        companyName: formData.companyName || null,
        nextSalaryDate: formData.nextSalaryDate || null,
        netMonthlyIncome: formData.netMonthlyIncome,
        pinCode: formData.pinCode,
        state: formData.state || null,
        city: formData.city || null
      };

      const response = await api.post('/eligibility', eligibilityData);
      
      if (response.data.success) {
        toast.success('Eligibility check submitted successfully!');
        
        // Store eligibility data temporarily for application form
        sessionStorage.setItem('eligibilityData', JSON.stringify(formData));
        sessionStorage.removeItem('emailVerified');
        
        // If loanId is present, navigate to loan detail page
        if (loanId) {
          try {
            const allLoansResponse = await api.get('/loans');
            const loan = allLoansResponse.data.data?.find(l => l._id === loanId);
            if (loan?.slug) {
              navigate(`/loans/${loan.slug}`);
            } else if (loan) {
              navigate(`/loans/${loanId}`);
            } else {
              toast.error('Loan not found');
            }
          } catch (error) {
            console.error('Error fetching loan:', error);
            toast.error('Error loading loan details');
          }
        } else {
          // If no loanId, navigate to full application form
          navigate('/apply', { state: { eligibilityData: formData } });
        }
      } else {
        toast.error(response.data.message || 'Failed to submit eligibility check');
      }
    } catch (error) {
      console.error('Error submitting eligibility:', error);
      toast.error(error.response?.data?.message || 'Failed to submit eligibility check. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month} / ${day} / ${year}`;
  };

  // Only show the eligibility form (no OTP/email step)
  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Single Orange Container with Two Columns Inside */}
        <div className="bg-orange-500 rounded-2xl shadow-2xl overflow-hidden">
          {/* Title */}
          <div className="px-8 pt-8 pb-6">
            <h2 className="text-4xl font-bold text-white">CHECK YOUR ELIGIBILITY</h2>
          </div>

          {/* Form Container - Two Columns */}
          <form onSubmit={handleSubmit} className="px-8 pb-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Pancard */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Pancard<span className="text-red-200">*</span>
                  </label>
                  <input
                    type="text"
                    name="pancard"
                    value={formData.pancard}
                    onChange={handleChange}
                    placeholder="ENTER YOUR PANCARD*"
                    maxLength="10"
                    className={`w-full px-4 py-3 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white font-medium ${
                      errors.pancard ? 'border-2 border-red-300' : ''
                    }`}
                    style={{ textTransform: 'uppercase' }}
                  />
                  {errors.pancard && (
                    <p className="text-red-200 text-xs mt-1">{errors.pancard}</p>
                  )}
                </div>

                {/* DOB */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    DOB<span className="text-red-200">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-white font-medium pr-10 ${
                        errors.dob ? 'border-2 border-red-300' : ''
                      }`}
                    />
                    <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none" />
                  </div>
                  {formData.dob && (
                    <p className="text-white/90 text-sm mt-1 font-medium">{formatDate(formData.dob)}</p>
                  )}
                  {errors.dob && (
                    <p className="text-red-200 text-xs mt-1">{errors.dob}</p>
                  )}
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Gender<span className="text-red-200">*</span>
                  </label>
                  <div className="flex gap-3">
                    <label className="flex-1 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value="MALE"
                        checked={formData.gender === 'MALE'}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className={`px-4 py-3 rounded-lg text-center font-bold text-sm transition-all ${
                        formData.gender === 'MALE'
                          ? 'bg-white text-orange-500 shadow-lg'
                          : 'bg-white/20 text-white hover:bg-white/30 border border-white/30'
                      }`}>
                        MALE
                      </div>
                    </label>
                    <label className="flex-1 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value="FEMALE"
                        checked={formData.gender === 'FEMALE'}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className={`px-4 py-3 rounded-lg text-center font-bold text-sm transition-all ${
                        formData.gender === 'FEMALE'
                          ? 'bg-white text-orange-500 shadow-lg'
                          : 'bg-white/20 text-white hover:bg-white/30 border border-white/30'
                      }`}>
                        FEMALE
                      </div>
                    </label>
                  </div>
                </div>

                {/* Personal Email */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Personal Email<span className="text-red-200">*</span>
                  </label>
                  <input
                    type="email"
                    name="personalEmail"
                    value={formData.personalEmail}
                    onChange={handleChange}
                    placeholder="ENTER YOUR PERSONAL EMAIL ID*"
                    className={`w-full px-4 py-3 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white font-medium ${
                      errors.personalEmail ? 'border-2 border-red-300' : ''
                    }`}
                  />
                  {errors.personalEmail && (
                    <p className="text-red-200 text-xs mt-1">{errors.personalEmail}</p>
                  )}
                </div>

                {/* Employment Type */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Employment Type<span className="text-red-200">*</span>
                  </label>
                  <div className="flex gap-3">
                    <label className="flex-1 cursor-pointer">
                      <input
                        type="radio"
                        name="employmentType"
                        value="SALARIED"
                        checked={formData.employmentType === 'SALARIED'}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className={`px-4 py-3 rounded-lg text-center font-bold text-sm transition-all ${
                        formData.employmentType === 'SALARIED'
                          ? 'bg-white text-orange-500 shadow-lg'
                          : 'bg-white/20 text-white hover:bg-white/30 border border-white/30'
                      }`}>
                        SALARIED
                      </div>
                    </label>
                    <label className="flex-1 cursor-pointer">
                      <input
                        type="radio"
                        name="employmentType"
                        value="SELF EMPLOYED"
                        checked={formData.employmentType === 'SELF EMPLOYED'}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className={`px-4 py-3 rounded-lg text-center font-bold text-sm transition-all ${
                        formData.employmentType === 'SELF EMPLOYED'
                          ? 'bg-white text-orange-500 shadow-lg'
                          : 'bg-white/20 text-white hover:bg-white/30 border border-white/30'
                      }`}>
                        SELF EMPLOYED
                      </div>
                    </label>
                  </div>
                </div>

                {/* Continue Button */}
                <button
                  type="submit"
                  className="w-full bg-blue-900 text-white px-6 py-4 rounded-lg font-bold text-lg hover:bg-blue-800 transition-all shadow-lg hover:shadow-xl mt-6"
                >
                  CONTINUE
                </button>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Company Name (only for SALARIED) */}
                {formData.employmentType === 'SALARIED' && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">
                        Company Name<span className="text-red-200">*</span>
                      </label>
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        placeholder="ENTER YOUR COMPANY NAME*"
                        className={`w-full px-4 py-3 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white font-medium ${
                          errors.companyName ? 'border-2 border-red-300' : ''
                        }`}
                      />
                      {errors.companyName && (
                        <p className="text-red-200 text-xs mt-1">{errors.companyName}</p>
                      )}
                    </div>

                    {/* Next Salary Date */}
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">
                        Next Salary Date<span className="text-red-200">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          name="nextSalaryDate"
                          value={formData.nextSalaryDate}
                          onChange={handleChange}
                          className={`w-full px-4 py-3 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-white font-medium pr-10 ${
                            errors.nextSalaryDate ? 'border-2 border-red-300' : ''
                          }`}
                        />
                        <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none" />
                      </div>
                      {formData.nextSalaryDate && (
                        <p className="text-white/90 text-sm mt-1 font-medium">{formatDate(formData.nextSalaryDate)}</p>
                      )}
                      {errors.nextSalaryDate && (
                        <p className="text-red-200 text-xs mt-1">{errors.nextSalaryDate}</p>
                      )}
                    </div>
                  </>
                )}

                {/* Net Monthly Income */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Net Monthly Income<span className="text-red-200">*</span>
                  </label>
                  <input
                    type="number"
                    name="netMonthlyIncome"
                    value={formData.netMonthlyIncome}
                    onChange={handleChange}
                    placeholder="ENTER YOUR NET MONTHLY INCOME*"
                    min="0"
                    className={`w-full px-4 py-3 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white font-medium ${
                      errors.netMonthlyIncome ? 'border-2 border-red-300' : ''
                    }`}
                  />
                  {errors.netMonthlyIncome && (
                    <p className="text-red-200 text-xs mt-1">{errors.netMonthlyIncome}</p>
                  )}
                </div>

                {/* Pin Code */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Pin Code<span className="text-red-200">*</span>
                  </label>
                  <input
                    type="text"
                    name="pinCode"
                    value={formData.pinCode}
                    onChange={handleChange}
                    placeholder="ENTER PIN CODE*"
                    maxLength="6"
                    pattern="[0-9]{6}"
                    className={`w-full px-4 py-3 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white font-medium ${
                      errors.pinCode ? 'border-2 border-red-300' : ''
                    }`}
                  />
                  {errors.pinCode && (
                    <p className="text-red-200 text-xs mt-1">{errors.pinCode}</p>
                  )}
                </div>

                {/* State */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="STATE"
                    className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white font-medium"
                  />
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="CITY"
                    className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white font-medium"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer Warning - Dark Blue Bar */}
        <div className="mt-6 bg-blue-900 text-white px-6 py-4 rounded-lg">
          <p className="text-sm text-center">
            <span className="font-semibold">Beware of fraud!</span> Always use our secure Repayment Website Link for loan payments. Do not make direct bank payments. BeforeSalary is not responsible for payments made to other accounts.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EligibilityCheck;
