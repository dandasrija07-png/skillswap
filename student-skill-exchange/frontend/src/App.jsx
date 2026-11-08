import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import AppRoutes from './routes/AppRoutes.jsx';
import './styles/theme.css';
import './styles/index.css';
import './styles/landing.css';
import './styles/auth.css';
import './styles/dashboard.css';
import './styles/profile-skills.css';
import './styles/explore-students.css';
import './styles/exchange-requests.css';
import './styles/my-sessions.css';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
