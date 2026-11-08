/**
 * Authentication Context & Provider
 * Manages global user session, JWT persistence, profile hydration, and role-based state
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api.js';
import { initSocket, disconnectSocket } from '../services/socketService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('skillswap_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [profile, setProfile] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('skillswap_token'));
  const [loading, setLoading] = useState(true);

  // Hydrate user and profile on mount or token change
  const hydrateSession = useCallback(async () => {
    const currentToken = localStorage.getItem('skillswap_token');
    if (!currentToken) {
      setUser(null);
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get('/auth/me');
      if (res.data?.user) {
        setUser(res.data.user);
        setProfile(res.data.profile || null);
        localStorage.setItem('skillswap_user', JSON.stringify(res.data.user));
        initSocket(currentToken);
      }
    } catch (err) {
      console.warn('Session verification notice:', err.message);
      // If verification failed (401 / expired)
      setUser(null);
      setProfile(null);
      setToken(null);
      localStorage.removeItem('skillswap_token');
      localStorage.removeItem('skillswap_user');
      disconnectSocket();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    hydrateSession();

    // Listen for unauthorized events emitted by Axios interceptor
    const handleUnauthorized = () => {
      setUser(null);
      setProfile(null);
      setToken(null);
      disconnectSocket();
    };

    window.addEventListener('skillswap:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('skillswap:unauthorized', handleUnauthorized);
  }, [hydrateSession]);

  // Login handler
  const login = async ({ email, password, rememberMe = false }) => {
    const res = await api.post('/auth/login', { email, password });
    const { user: userData, token: jwtToken } = res.data;

    localStorage.setItem('skillswap_token', jwtToken);
    localStorage.setItem('skillswap_user', JSON.stringify(userData));

    if (rememberMe) {
      localStorage.setItem('skillswap_remembered_email', email);
    } else {
      localStorage.removeItem('skillswap_remembered_email');
    }

    setUser(userData);
    setToken(jwtToken);
    initSocket(jwtToken);

    // Fetch user profile immediately
    try {
      const profileRes = await api.get('/profile/me');
      setProfile(profileRes.data || null);
    } catch (e) {
      console.warn('Profile fetch notice:', e.message);
    }

    return { user: userData, token: jwtToken, message: res.message };
  };

  // Register handler
  const register = async (formData) => {
    const payload = {
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
      collegeName: formData.collegeName,
      department: formData.department,
      academicYear: formData.academicYear,
    };

    const res = await api.post('/auth/register', payload);
    const { user: userData, token: jwtToken, profile: profileData } = res.data;

    localStorage.setItem('skillswap_token', jwtToken);
    localStorage.setItem('skillswap_user', JSON.stringify(userData));

    setUser(userData);
    setToken(jwtToken);
    setProfile(profileData);
    initSocket(jwtToken);

    return { user: userData, token: jwtToken, profile: profileData, message: res.message };
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('skillswap_token');
    localStorage.removeItem('skillswap_user');
    setUser(null);
    setProfile(null);
    setToken(null);
    disconnectSocket();
  };

  // Refresh profile (e.g. after adding a skill or completing a session)
  const refreshProfile = async () => {
    try {
      const res = await api.get('/profile/me');
      if (res.data) {
        setProfile(res.data);
      }
      return res.data;
    } catch (err) {
      console.warn('Profile refresh error:', err.message);
      return null;
    }
  };

  // Update profile
  const updateProfile = async (updateFields) => {
    const res = await api.put('/profile/me', updateFields);
    if (res.data) {
      setProfile((prev) => ({ ...prev, ...res.data }));
    }
    return res.data;
  };

  const value = {
    user,
    profile,
    token,
    loading,
    isAuthenticated: Boolean(user && token),
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    refreshProfile,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

