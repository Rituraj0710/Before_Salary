import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // If data is FormData, remove Content-Type to let browser set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Track if we're already redirecting to prevent loops
let isRedirecting = false;

// Handle responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Prevent redirect loop - don't redirect if already on login/register page or already redirecting
      const currentPath = window.location.pathname;
      if (!isRedirecting && currentPath !== '/login' && currentPath !== '/register') {
        isRedirecting = true;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Use replace to prevent adding to history
        setTimeout(() => {
          window.location.replace('/login');
          toast.error('Session expired. Please login again.');
        }, 100);
      }
    }
    return Promise.reject(error);
  }
);

export default api;


