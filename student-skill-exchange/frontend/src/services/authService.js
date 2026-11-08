/**
 * Authentication Service
 * Connects frontend authentication forms to Express backend and MySQL database
 */

import api from './api.js';
import { disconnectSocket } from './socketService.js';

const REMEMBERED_EMAIL_KEY = 'skillswap_remembered_email';
const ACTIVE_SESSION_KEY = 'skillswap_demo_session';

/**
 * Validate standard email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(String(email).trim());
};

/**
 * Calculate password strength score (0 to 4)
 */
export const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: 'Empty', color: '#cbd5e1' };

  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  switch (score) {
    case 1:
      return { score: 1, label: 'Weak', color: '#ef4444' };
    case 2:
      return { score: 2, label: 'Fair', color: '#f59e0b' };
    case 3:
      return { score: 3, label: 'Good', color: '#6366f1' };
    case 4:
      return { score: 4, label: 'Strong', color: '#10b981' };
    default:
      return { score: 0, label: 'Too short', color: '#ef4444' };
  }
};

/**
 * Register a student via backend API
 */
export const registerStudent = async (formData) => {
  const { fullName, email, password, confirmPassword, department, academicYear, collegeName, agreeTerms } = formData;

  if (!fullName?.trim()) throw new Error('Full name is required.');
  if (!email?.trim() || !isValidEmail(email)) throw new Error('Please enter a valid university email address.');
  if (!password || password.length < 8) throw new Error('Password must be at least 8 characters long.');
  if (password !== confirmPassword) throw new Error('Passwords do not match.');
  if (!department) throw new Error('Please select your academic department.');
  if (!academicYear) throw new Error('Please select your academic year.');
  if (!collegeName?.trim()) throw new Error('College/University name is required.');
  if (!agreeTerms) throw new Error('You must accept the terms and conditions to register.');

  const res = await api.post('/auth/register', {
    fullName: fullName.trim(),
    email: email.trim().toLowerCase(),
    password,
    department: department.trim(),
    academicYear: academicYear.trim(),
    collegeName: collegeName.trim(),
  });

  const { user, token, profile } = res.data;

  // Persist session
  localStorage.setItem('skillswap_token', token);
  localStorage.setItem('skillswap_user', JSON.stringify(user));
  sessionStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(user));

  return {
    success: true,
    user,
    token,
    profile,
    message: res.message || 'Registration successful! Welcome to SkillSwap.',
  };
};

/**
 * Authenticate student via backend API
 */
export const loginStudent = async ({ email, password, rememberMe = false }) => {
  if (!email?.trim() || !isValidEmail(email)) {
    throw new Error('Please enter a valid email address.');
  }
  if (!password) {
    throw new Error('Password is required.');
  }

  const res = await api.post('/auth/login', {
    email: email.trim().toLowerCase(),
    password,
  });

  const { user, token } = res.data;

  // Store tokens
  localStorage.setItem('skillswap_token', token);
  localStorage.setItem('skillswap_user', JSON.stringify(user));
  sessionStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(user));

  if (rememberMe) {
    localStorage.setItem(REMEMBERED_EMAIL_KEY, email.trim().toLowerCase());
  } else {
    localStorage.removeItem(REMEMBERED_EMAIL_KEY);
  }

  return {
    success: true,
    user,
    token,
    message: res.message || 'Authentication successful! Welcome back.',
  };
};

/**
 * Request Password Reset
 */
export const requestPasswordReset = async (email) => {
  if (!email?.trim() || !isValidEmail(email)) {
    throw new Error('Please provide a valid registered email address.');
  }

  // Simulated email delivery acknowledgment
  return {
    success: true,
    backendConfigured: false,
    message: 'If an account exists with this email, reset instructions have been dispatched.',
  };
};

/**
 * Get Remembered Email
 */
export const getRememberedEmail = () => {
  try {
    return localStorage.getItem(REMEMBERED_EMAIL_KEY) || '';
  } catch {
    return '';
  }
};

/**
 * Get Active Session
 */
export const getActiveSession = () => {
  try {
    const data = localStorage.getItem('skillswap_user') || sessionStorage.getItem(ACTIVE_SESSION_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

/**
 * Clear Session
 */
export const logoutSession = () => {
  try {
    localStorage.removeItem('skillswap_token');
    localStorage.removeItem('skillswap_user');
    sessionStorage.removeItem(ACTIVE_SESSION_KEY);
    disconnectSocket();
  } catch (e) {
    console.warn('Logout error:', e);
  }
};
