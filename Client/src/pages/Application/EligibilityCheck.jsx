import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CalendarIcon, DevicePhoneMobileIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const EligibilityCheck = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sendOTP, verifyOTP } = useAuth();
  
  // OTP Verification State
  const [otpStep, setOtpStep] = useState('email'); // 'email', 'otp', 'verified'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const [devOtp, setDevOtp] = useState(null);

  // Eligibility Form State (shown after OTP verification)
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Store eligibility data temporarily (only for this navigation)
      // Clear email verification so user must verify again for new applications
      sessionStorage.removeItem('emailVerified');
      
      // Navigate to full application form
      navigate('/apply', { state: { eligibilityData: formData } });
      toast.success('Eligibility check completed!');
    } else {
      toast.error('Please fill all required fields correctly');
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

  // OTP Verification Page (First Step)
  if (otpStep !== 'verified') {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Section - Orange Background with Mobile Mockup */}
            <div className="bg-orange-500 rounded-2xl p-8 lg:p-12 text-white">
              {/* Mobile Phone Mockup */}
              <div className="mb-8 flex justify-center">
                <div className="bg-white rounded-3xl shadow-2xl p-4 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                  <div className="bg-gray-900 rounded-2xl overflow-hidden">
                    <div className="bg-white h-[500px] rounded-t-2xl p-4 space-y-4 overflow-y-auto">
                      {/* Phone Header */}
                      <div className="flex justify-between items-center mb-4">
                        <div className="w-6 h-6">
                          <div className="w-full h-0.5 bg-gray-400 mb-1"></div>
                          <div className="w-full h-0.5 bg-gray-400 mb-1"></div>
                          <div className="w-full h-0.5 bg-gray-400"></div>
                        </div>
                        <span className="text-xs font-semibold text-gray-800">BeforeSalary</span>
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        </div>
                      </div>

                      {/* Apply Now Card */}
                      <Link to="/eligibility" className="bg-orange-500 rounded-xl p-4 text-white hover:bg-orange-600 transition block">
                        <div className="flex items-center justify-between font-bold">
                          <span>Apply Now</span>
                          <ArrowRightIcon className="h-5 w-5" />
                        </div>
                      </Link>

                      {/* Easy Personal Loan */}
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">Easy Personal Loan</h3>
                          <p className="text-xs text-gray-500">Your financial Partner anytime anywhere</p>
                        </div>
                        <div className="relative w-16 h-16">
                          <svg className="transform -rotate-90 w-16 h-16">
                            <circle cx="32" cy="32" r="28" stroke="#E5E7EB" strokeWidth="4" fill="none" />
                            <circle cx="32" cy="32" r="28" stroke="#F97316" strokeWidth="4" fill="none" 
                              strokeDasharray={`${2 * Math.PI * 28 * 0.1} ${2 * Math.PI * 28 * 0.9}`} />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-bold text-orange-500">10%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* App Download Section */}
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4">Download BeforeSalary App</h3>
                <p className="text-white/90 mb-6">
                  Your dreams deserve more than just planning—they deserve action. Apply for a quick loan today and take the first step toward making them real.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 transition inline-flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.96-3.24-1.44-1.56-.62-2.46-1.06-2.46-1.95 0-.9.9-1.34 2.46-1.96 1.16-.47 2.15-.93 3.24-1.44 1.03-.47 2.1-.54 3.08.4l.97 1c.52.51.51 1.28.01 1.77-.34.33-.78.6-1.22.83-.8.43-1.61.87-2.42 1.29l.02.03c.11.07.22.13.34.2 1.09.58 2.46.96 2.46 1.95 0 .89-1.37 1.37-2.46 1.95-.12.07-.23.13-.34.2l-.02.03c.81.42 1.62.86 2.42 1.29.44.23.88.5 1.22.83.5.49.51 1.26.01 1.77l-.97 1zm-1.15-5.58c.13.05.27.09.41.14.17.06.35.11.53.17.18.06.36.1.54.14.18.03.35.06.52.07.35.02.68 0 1.02-.02.17-.02.34-.04.51-.07.18-.04.36-.08.54-.14.18-.06.36-.11.53-.17.14-.05.28-.09.41-.14l.03-.01c1.27-.46 2.35-1.05 3.22-1.76.87-.7 1.54-1.5 2.01-2.39.47-.89.71-1.82.71-2.79 0-.97-.24-1.9-.71-2.79-.47-.89-1.14-1.69-2.01-2.39-.87-.71-1.95-1.3-3.22-1.76l-.03-.01c-.13-.05-.27-.09-.41-.14-.17-.06-.35-.11-.53-.17-.18-.06-.36-.1-.54-.14-.17-.03-.34-.06-.51-.07-.34-.02-.67 0-1.02.02-.17.02-.34.04-.51.07-.18.04-.36.08-.54.14-.18.06-.36.11-.53.17-.14.05-.28.09-.41.14l-.03.01c-1.27.46-2.35 1.05-3.22 1.76-.87.7-1.54 1.5-2.01 2.39-.47.89-.71 1.82-.71 2.79 0 .97.24 1.9.71 2.79.47.89 1.14 1.69 2.01 2.39.87.71 1.95 1.3 3.22 1.76l.03.01zm-5.9 0c.13.05.27.09.41.14.17.06.35.11.53.17.18.06.36.1.54.14.18.03.35.06.52.07.35.02.68 0 1.02-.02.17-.02.34-.04.51-.07.18-.04.36-.08.54-.14.18-.06.36-.11.53-.17.14-.05.28-.09.41-.14l.03-.01c1.27-.46 2.35-1.05 3.22-1.76.87-.7 1.54-1.5 2.01-2.39.47-.89.71-1.82.71-2.79 0-.97-.24-1.9-.71-2.79-.47-.89-1.14-1.69-2.01-2.39-.87-.71-1.95-1.3-3.22-1.76l-.03-.01c-.13-.05-.27-.09-.41-.14-.17-.06-.35-.11-.53-.17-.18-.06-.36-.1-.54-.14-.17-.03-.34-.06-.51-.07-.34-.02-.67 0-1.02.02-.17.02-.34.04-.51.07-.18.04-.36.08-.54.14-.18.06-.36.11-.53.17-.14.05-.28.09-.41.14l-.03.01c-1.27.46-2.35 1.05-3.22 1.76-.87.7-1.54 1.5-2.01 2.39-.47.89-.71 1.82-.71 2.79 0 .97.24 1.9.71 2.79.47.89 1.14 1.69 2.01 2.39.87.71 1.95 1.3 3.22 1.76l.03.01z"/>
                    </svg>
                    APPLY ON Google Play
                  </a>
                  <a
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition inline-flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                    APPLY VIA App Store
                  </a>
                </div>
              </div>
            </div>

            {/* Right Section - White Background with Apply Now Form */}
            <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">Apply Now</h2>
              
              {otpStep === 'email' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Enter Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={handleEmailChange}
                      placeholder="Enter your Email Address"
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-orange-500 focus:outline-none text-lg"
                    />
                  </div>

                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="terms"
                      className="mt-1 mr-3"
                      required
                    />
                    <label htmlFor="terms" className="text-sm text-gray-600">
                      By continuing, I agree to the Terms and Conditions and Privacy Policy and authorize receiving notifications via SMS, calls, and RCS
                    </label>
                  </div>

                  <button
                    onClick={handleSendOTP}
                    className="w-full bg-orange-500 text-white px-6 py-4 rounded-lg font-bold text-lg hover:bg-orange-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center"
                  >
                    GET OTP <ArrowRightIcon className="ml-2 h-5 w-5" />
                  </button>
                </div>
              )}

              {otpStep === 'otp' && (
                <div className="space-y-6">
                  {/* Development OTP Display - Only show if provided by backend (email may have failed) */}
                  {devOtp && (
                    <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
                      <p className="text-xs text-yellow-800 font-semibold mb-1">⚠️ Email may not be configured:</p>
                      <p className="text-lg font-bold text-yellow-900">Your OTP: {devOtp}</p>
                      <p className="text-xs text-yellow-700 mt-1">
                        <strong>Please check your email inbox first!</strong>
                        <br />
                        If you didn't receive the email, the OTP is shown above for testing.
                        <br />
                        <strong>To receive OTP via Gmail:</strong> Configure EMAIL_USER and EMAIL_PASS (App Password) in Server/.env file
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Enter OTP sent to {email}
                    </label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Enter 6-digit OTP"
                      maxLength="6"
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-orange-500 focus:outline-none text-lg text-center tracking-widest"
                    />
                  </div>

                  <button
                    onClick={handleVerifyOTP}
                    className="w-full bg-orange-500 text-white px-6 py-4 rounded-lg font-bold text-lg hover:bg-orange-600 transition-all shadow-lg hover:shadow-xl"
                  >
                    VERIFY OTP
                  </button>

                  {otpTimer > 0 ? (
                    <p className="text-center text-sm text-gray-600">
                      Resend OTP in {otpTimer} seconds
                    </p>
                  ) : (
                    <button
                      onClick={handleResendOTP}
                      className="w-full text-orange-500 font-semibold hover:text-orange-600 transition"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Feature Cards Section */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <DevicePhoneMobileIcon className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Money in mins via Pre-Approved loans</h3>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <DevicePhoneMobileIcon className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Instant sanction and disbursal</h3>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <DevicePhoneMobileIcon className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Contact-less processes</h3>
            </div>
          </div>

          {/* Footer Section */}
          <div className="mt-12 grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="font-bold text-gray-900 mb-2">Short Term Loan</h3>
              <p className="text-sm text-gray-600">
                A short-term loan is a swiftly disbursed financial option designed for urgent needs. It involves a brief repayment period.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="font-bold text-gray-900 mb-2">Personal Loan</h3>
              <p className="text-sm text-gray-600">
                A personal loan is a versatile financial solution tailored to alleviate unplanned expenses. It offers fixed rates, and regular repayments.
              </p>
            </div>
          </div>

          {/* Footer Warning */}
          <div className="mt-6 bg-blue-900 text-white px-6 py-4 rounded-lg">
            <p className="text-sm text-center">
              <span className="font-semibold">Beware of fraud!</span> Always use our secure Repayment Website Link for loan payments. Do not make direct bank payments. BeforeSalary is not responsible for payments made to other accounts.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Eligibility Form (Shown after OTP verification)
  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Single Orange Container with Two Columns Inside */}
        <div className="bg-orange-500 rounded-2xl shadow-2xl overflow-hidden">
          {/* Title */}
          <div className="px-8 pt-8 pb-6">
            <h2 className="text-4xl font-bold text-white">CHECK YOUR ELIGIBILITY</h2>
            <p className="text-white/90 mt-2">Verified Email: {verifiedEmail}</p>
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
