/**
 * Centralized Axios API Client
 * Configures base URL, automatic JWT Bearer authorization,
 * standardized response extraction, and global token expiration handling.
 */

import axios from 'axios';

const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) ||
  (typeof process !== 'undefined' && process.env && process.env.VITE_API_URL) ||
  'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor: Attach JWT token if present in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('skillswap_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Extract data and handle global 401s (token expiry)
api.interceptors.response.use(
  (response) => {
    // If backend returns standard { status, message, data }, return it
    return response.data;
  },
  (error) => {
    const status = error.response ? error.response.status : null;
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Network communication error. Please check your connection.';

    // Token expired or invalid
    if (status === 401) {
      const currentToken = localStorage.getItem('skillswap_token');
      // If we had a token and got 401, session has expired
      if (currentToken) {
        localStorage.removeItem('skillswap_token');
        localStorage.removeItem('skillswap_user');
        window.dispatchEvent(new CustomEvent('skillswap:unauthorized', { detail: { message } }));
      }
    }

    const customError = new Error(message);
    customError.status = status;
    customError.data = error.response?.data || null;
    return Promise.reject(customError);
  }
);

export default api;
