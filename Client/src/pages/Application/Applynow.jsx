import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const Applynow = () => {
  const navigate = useNavigate();
  const { sendOTP, verifyOTP, isClientVerified } = useAuth();

  const [otpStep, setOtpStep] = useState('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [devOtp, setDevOtp] = useState(null);
  const [loading, setLoading] = useState(false);

  // Check if user is already verified on email change or mount
  useEffect(() => {
    if (email && isClientVerified(email)) {
      toast.success('You are already verified!');
      navigate('/dashboard', { replace: true });
    }
  }, [email, isClientVerified, navigate]);

  useEffect(() => {
    setOtpStep('email');
    setEmail('');
    setOtp('');
    setOtpSent(false);
    setDevOtp(null);
  }, []);

  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpTimer]);

  const handleEmailChange = (e) => setEmail(e.target.value);

  const handleSendOTP = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    // Prevent sending OTP if already verified
    if (isClientVerified(email)) {
      toast.success('You are already verified!');
      navigate('/dashboard', { replace: true });
      return;
    }
    setLoading(true);
    try {
      const result = await sendOTP(email, null, 'application');
      if (result.success) {
        setOtpSent(true);
        setOtpStep('otp');
        setOtpTimer(60);
        if (result.data?.devOtp) {
          setDevOtp(result.data.devOtp);
          console.log('Development OTP:', result.data.devOtp);
        }
        toast.success('OTP sent to your email address.');
      } else {
        toast.error(result.message || 'Failed to send OTP');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }
    // Prevent verifying again if already verified
    if (isClientVerified(email)) {
      toast.success('You are already verified!');
      navigate('/dashboard', { replace: true });
      return;
    }
    try {
      const result = await verifyOTP(email, null, otp, 'application');
      if (result.success) {
        toast.success('Email address verified successfully!');
        navigate('/dashboard', { replace: true });
      } else {
        toast.error(result.message || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      toast.error(error.message || 'Invalid OTP. Please try again.');
    }
  };

  const handleResendOTP = async () => {
    await handleSendOTP();
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Apply Now</h2>
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
                disabled={loading}
              />
            </div>
            <div className="flex items-start">
              <input
                type="checkbox"
                id="terms"
                className="mt-1 mr-3"
                required
                disabled={loading}
              />
              <label htmlFor="terms" className="text-sm text-gray-600">
                By continuing, I agree to the Terms and Conditions and Privacy Policy and authorize receiving notifications via SMS, calls, and RCS
              </label>
            </div>
            <button
              onClick={handleSendOTP}
              className="w-full bg-orange-500 text-white px-6 py-4 rounded-lg font-bold text-lg hover:bg-orange-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></span>
                  Sending OTP...
                </span>
              ) : (
                <>
                  GET OTP <ArrowRightIcon className="ml-2 h-5 w-5" />
                </>
              )}
            </button>
          </div>
        )}
        {otpStep === 'otp' && (
          <div className="space-y-6">
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
  );
};

export default Applynow;
