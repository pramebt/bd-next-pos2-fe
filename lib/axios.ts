// Axios instance with interceptor for authentication
import axios from 'axios';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const tokenKey = process.env.NEXT_PUBLIC_TOKEN_KEY || "token";

// Create axios instance
const axiosInstance = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token to headers
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(tokenKey);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        // Clear token and redirect to signin
        localStorage.removeItem(tokenKey);
        localStorage.removeItem('next_name');
        localStorage.removeItem('next_user_id');
        // Only redirect if not already on signin page
        if (window.location.pathname !== '/signin') {
          window.location.href = '/signin';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

