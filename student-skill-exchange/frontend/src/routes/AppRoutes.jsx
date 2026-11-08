import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '../pages/LandingPage.jsx';
import ExploreSkillsPage from '../pages/ExploreSkillsPage.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import RegisterPage from '../pages/RegisterPage.jsx';
import DashboardPage from '../pages/DashboardPage.jsx';
import MyProfilePage from '../pages/MyProfilePage.jsx';
import MySkillsPage from '../pages/MySkillsPage.jsx';
import ExploreStudentsPage from '../pages/ExploreStudentsPage.jsx';
import StudentDetailPage from '../pages/StudentDetailPage.jsx';
import ExchangeRequestsPage from '../pages/ExchangeRequestsPage.jsx';
import MySessionsPage from '../pages/MySessionsPage.jsx';
import AdminDashboardPage from '../pages/AdminDashboardPage.jsx';
import ProtectedRoute from '../components/common/ProtectedRoute.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/explore" element={<ExploreSkillsPage />} />
      <Route path="/students" element={<ExploreStudentsPage />} />
      <Route path="/students/:id" element={<StudentDetailPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Student Pages */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <MyProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/skills"
        element={
          <ProtectedRoute>
            <MySkillsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/requests"
        element={
          <ProtectedRoute>
            <ExchangeRequestsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sessions"
        element={
          <ProtectedRoute>
            <MySessionsPage />
          </ProtectedRoute>
        }
      />

      {/* Protected Admin Portal */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
