import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

const Login = () => {
  const [authMethod, setAuthMethod] = useState('smtp');
  const [selectedMethod, setSelectedMethod] = useState('smtp'); // For "both" option
  const [firebaseAuth, setFirebaseAuth] = useState(null);
  const [firebaseApp, setFirebaseApp] = useState(null);
  
  // SMTP Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // OTP Login State
  const [otpEmail, setOtpEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpStep, setOtpStep] = useState('email'); // 'email' or 'otp'
  
  const [loading, setLoading] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const { login, sendOTP, verifyOTP, loginWithFirebase } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;
    let hasFetched = false;
    let timeoutId;
    
    const fetchSettings = async () => {
      // Prevent multiple calls
      if (hasFetched) return;
      hasFetched = true;
      
      // Set a timeout to prevent infinite loading
      timeoutId = setTimeout(() => {
        if (isMounted) {
          setLoadingSettings(false);
          setAuthMethod('smtp');
          setSelectedMethod('smtp');
        }
      }, 5000); // 5 second timeout
      
      try {
        // Get auth settings from public endpoint with timeout
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000); // 3 second request timeout
        
        const settingsResponse = await api.get('/admin/auth-settings', {
          signal: controller.signal
        });
        
        clearTimeout(timeout);
        clearTimeout(timeoutId);
        
        if (isMounted && settingsResponse.data.success && settingsResponse.data.data) {
          const authSettings = settingsResponse.data.data;
          const method = authSettings.method || 'smtp';
          setAuthMethod(method);
          setSelectedMethod(method === 'both' ? 'smtp' : method);
          
          // Initialize Firebase if needed
          if ((method === 'firebase' || method === 'both') && authSettings.firebaseConfig?.apiKey) {
            try {
              const app = initializeApp(authSettings.firebaseConfig);
              const auth = getAuth(app);
              setFirebaseApp(app);
              setFirebaseAuth(auth);
            } catch (error) {
              console.error('Firebase initialization error:', error);
            }
          }
        }
      } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError' || error.code === 'ECONNABORTED') {
          console.warn('Auth settings request timed out, using defaults');
        } else {
          console.error('Error fetching auth settings:', error);
        }
        // Use default SMTP method if fetch fails
        if (isMounted) {
          setAuthMethod('smtp');
          setSelectedMethod('smtp');
        }
      } finally {
        if (isMounted) {
          setLoadingSettings(false);
        }
      }
    };
    
    fetchSettings();
    
    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const handleSMTPSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(email, password);
      setLoading(false);

      if (result.success) {
        const userData = result.user || JSON.parse(localStorage.getItem('user') || '{}');
        const from = location.state?.from || null;
        
        if (userData.role === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else {
          navigate(from || '/dashboard', { replace: true });
        }
      }
    } catch (error) {
      console.error('Login submit error:', error);
      setLoading(false);
    }
  };

  const handleOTPSend = async () => {
    if (!otpEmail) {
      return;
    }

    try {
      setLoading(true);
      const result = await sendOTP(otpEmail, null, 'login');
      setLoading(false);
      
      if (result.success) {
        setOtpSent(true);
        setOtpStep('otp');
      }
    } catch (error) {
      setLoading(false);
    }
  };

  const handleOTPVerify = async () => {
    if (!otp || otp.length !== 6) {
      return;
    }

    try {
      setLoading(true);
      const result = await verifyOTP(otpEmail, null, otp, 'login');
      setLoading(false);

      if (result.success) {
        const userData = result.data?.user || JSON.parse(localStorage.getItem('user') || '{}');
        const from = location.state?.from || null;
        
        if (userData.role === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else {
          navigate(from || '/dashboard', { replace: true });
        }
      }
    } catch (error) {
      setLoading(false);
    }
  };

  const handleFirebaseLogin = async () => {
    if (!firebaseAuth) {
      console.error('Firebase not initialized');
      return;
    }

    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(firebaseAuth, provider);
      const user = result.user;
      
      // Send Firebase token to backend
      const idToken = await user.getIdToken();
      const loginResult = await loginWithFirebase(idToken, user.email, user.displayName);
      setLoading(false);

      if (loginResult.success) {
        const userData = loginResult.user || JSON.parse(localStorage.getItem('user') || '{}');
        const from = location.state?.from || null;
        
        if (userData.role === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else {
          navigate(from || '/dashboard', { replace: true });
        }
      }
    } catch (error) {
      console.error('Firebase login error:', error);
      setLoading(false);
    }
  };

  const handleFirebaseEmailPassword = async (e) => {
    e.preventDefault();
    if (!firebaseAuth) {
      console.error('Firebase not initialized');
      return;
    }

    try {
      setLoading(true);
      const result = await signInWithEmailAndPassword(firebaseAuth, email, password);
      const user = result.user;
      
      // Send Firebase token to backend
      const idToken = await user.getIdToken();
      const loginResult = await loginWithFirebase(idToken, user.email, user.displayName);
      setLoading(false);

      if (loginResult.success) {
        const userData = loginResult.user || JSON.parse(localStorage.getItem('user') || '{}');
        const from = location.state?.from || null;
        
        if (userData.role === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else {
          navigate(from || '/dashboard', { replace: true });
        }
      }
    } catch (error) {
      console.error('Firebase login error:', error);
      setLoading(false);
    }
  };

  if (loadingSettings) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center" style={{ overflow: 'hidden', position: 'fixed', width: '100%', height: '100%', top: 0, left: 0 }}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Method Selection for "both" option */}
          {authMethod === 'both' && (
            <div className="mb-6">
              <div className="flex space-x-2 mb-4">
                <button
                  type="button"
                  onClick={() => setSelectedMethod('smtp')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
                    selectedMethod === 'smtp'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Email/Password
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMethod('firebase')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
                    selectedMethod === 'firebase'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Firebase
                </button>
              </div>
            </div>
          )}

          {/* SMTP Login Form */}
          {(authMethod === 'smtp' || (authMethod === 'both' && selectedMethod === 'smtp')) && (
            <form className="space-y-6" onSubmit={handleSMTPSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your password"
                  />
                </div>
                <div className="mt-2 text-right">
                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-blue-600 hover:text-blue-500"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </div>
            </form>
          )}

          {/* OTP Login Form */}
          {authMethod === 'otp' && (
            <div className="space-y-6">
              {otpStep === 'email' ? (
                <>
                  <div>
                    <label htmlFor="otp-email" className="block text-sm font-medium text-gray-700">
                      Email address
                    </label>
                    <div className="mt-1">
                      <input
                        id="otp-email"
                        name="otp-email"
                        type="email"
                        autoComplete="email"
                        required
                        value={otpEmail}
                        onChange={(e) => setOtpEmail(e.target.value)}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleOTPSend}
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {loading ? 'Sending OTP...' : 'Send OTP'}
                  </button>
                </>
              ) : (
                <>
                  <div>
                    <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                      Enter OTP sent to {otpEmail}
                    </label>
                    <div className="mt-1">
                      <input
                        id="otp"
                        name="otp"
                        type="text"
                        maxLength="6"
                        required
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-center text-2xl tracking-widest"
                        placeholder="000000"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleOTPVerify}
                    disabled={loading || otp.length !== 6}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {loading ? 'Verifying...' : 'Verify OTP'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpStep('email');
                      setOtp('');
                    }}
                    className="w-full text-sm text-blue-600 hover:text-blue-500"
                  >
                    Change email
                  </button>
                </>
              )}
            </div>
          )}

          {/* Firebase Login Form */}
          {(authMethod === 'firebase' || (authMethod === 'both' && selectedMethod === 'firebase')) && firebaseAuth && (
            <div className="space-y-6">
              <form onSubmit={handleFirebaseEmailPassword} className="space-y-6">
                <div>
                  <label htmlFor="firebase-email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <div className="mt-1">
                    <input
                      id="firebase-email"
                      name="firebase-email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="firebase-password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="mt-1">
                    <input
                      id="firebase-password"
                      name="firebase-password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your password"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? 'Signing in...' : 'Sign in with Firebase'}
                </button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleFirebaseLogin}
                disabled={loading}
                className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
