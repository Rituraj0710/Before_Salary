import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      // Check if response has success field or if it's a direct success response
      if (response.data.success === false) {
        toast.error(response.data.message || 'Login failed');
        return { success: false, message: response.data.message };
      }
      
      // Extract token and user data
      const { token, user: userData } = response.data;
      
      if (!token || !userData) {
        toast.error('Invalid response from server');
        return { success: false, message: 'Invalid response from server' };
      }
      
      // Store authentication data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
      toast.success('Login successful!');
      
      console.log('Login successful, user role:', userData.role);
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const register = async (name, email, phone, password) => {
    try {
      const response = await api.post('/auth/register', {
        name,
        email,
        phone,
        password,
      });
      const { token, user: userData } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
      toast.success('Registration successful!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
  };

  const sendOTP = async (email, phone, purpose = 'verification') => {
    try {
      const response = await api.post('/auth/send-otp', { email, phone, purpose });
      if (response.data.success) {
        toast.success('OTP sent successfully!');
        return { success: true, data: response.data };
      } else {
        toast.error(response.data.message || 'Failed to send OTP');
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send OTP';
      toast.error(message);
      return { success: false, message };
    }
  };

  const verifyOTP = async (email, phone, otp, purpose = 'verification') => {
    try {
      const response = await api.post('/auth/verify-otp', { email, phone, otp, purpose });
      
      // For application purpose, don't set auth state (user might not have account yet)
      if (purpose === 'application') {
        toast.success('OTP verified successfully!');
        return { success: true, data: response.data };
      }
      
      // For other purposes, set auth state
      const { token, user: userData } = response.data;
      if (token && userData) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
      }
      toast.success('OTP verified successfully!');
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Invalid OTP';
      toast.error(message);
      return { success: false, message };
    }
  };

  const loginWithFirebase = async (idToken, email, name) => {
    try {
      const response = await api.post('/auth/firebase-login', { idToken, email, name });
      
      if (response.data.success === false) {
        toast.error(response.data.message || 'Firebase login failed');
        return { success: false, message: response.data.message };
      }
      
      const { token, user: userData } = response.data;
      
      if (!token || !userData) {
        toast.error('Invalid response from server');
        return { success: false, message: 'Invalid response from server' };
      }
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
      toast.success('Login successful!');
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Firebase login error:', error);
      const message = error.response?.data?.message || 'Firebase login failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    sendOTP,
    verifyOTP,
    loginWithFirebase,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

