import axios from 'axios';

// Create an axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Adding token to request:', config.url);
      console.log('Token starts with:', token.substring(0, 20) + '...');
    } else {
      console.warn('No auth token found for request:', config.url);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle specific error cases
    if (error.response) {
      // Authentication errors
      if (error.response.status === 401) {
        // Clear token if it's invalid
        localStorage.removeItem('auth_token');
      }
      
      // Server error with message
      if (error.response.data && error.response.data.error) {
        error.message = error.response.data.error;
      }
    } else if (error.request) {
      // Network errors
      error.message = 'Network error. Please check your connection.';
    }
    
    return Promise.reject(error);
  }
);

// Helper methods to handle the auth token
const apiService = {
  setAuthToken: (token) => {
    if (token) {
      console.log('Setting auth token in localStorage');
      localStorage.setItem('auth_token', token);
    } else {
      console.warn('Attempted to set null/undefined auth token');
    }
  },
  
  clearAuthToken: () => {
    console.log('Clearing auth token from localStorage');
    localStorage.removeItem('auth_token');
  },
  
  get: async (url, config = {}) => {
    return api.get(url, config);
  },
  
  post: async (url, data = {}, config = {}) => {
    return api.post(url, data, config);
  },
  
  put: async (url, data = {}, config = {}) => {
    return api.put(url, data, config);
  },
  
  delete: async (url, config = {}) => {
    return api.delete(url, config);
  }
};

export default apiService;