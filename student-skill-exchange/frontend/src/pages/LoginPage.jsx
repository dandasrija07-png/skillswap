import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeftRight,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import Toast from '../components/common/Toast.jsx';
import ForgotPasswordModal from '../components/common/ForgotPasswordModal.jsx';
import { isValidEmail, getRememberedEmail } from '../services/authService.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Interaction & validation states
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [loginSuccessData, setLoginSuccessData] = useState(null);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  // Check if an email was previously remembered
  useEffect(() => {
    const saved = getRememberedEmail();
    if (saved) {
      setEmail(saved);
      setRememberMe(true);
    }
  }, []);

  // Validation function
  const validateForm = () => {
    const errors = {};
    if (!email.trim()) {
      errors.email = 'University email is required.';
    } else if (!isValidEmail(email)) {
      errors.email = 'Please enter a valid email format (e.g. name@college.edu).';
    }

    if (!password) {
      errors.password = 'Password is required.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    // Prevent duplicate submission
    if (isSubmitting) return;

    if (!validateForm()) {
      setToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please resolve the highlighted fields before submitting.',
      });
      return;
    }

    setIsSubmitting(true);
    setFieldErrors({});

    try {
      const response = await login({ email, password, rememberMe });
      setLoginSuccessData(response.user);
      setToast({
        type: 'success',
        title: 'Authentication Successful',
        message: response.message || 'Welcome back! Logged in with MySQL database.',
      });
      setTimeout(() => {
        if (response.user?.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }, 1000);
    } catch (err) {
      setToast({
        type: 'error',
        title: 'Login Failed',
        message: err.message || 'Invalid credentials or database connection issue.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemo = (demoType = 'aarav') => {
    if (demoType === 'aarav') {
      setEmail('aarav.sharma@dtu.ac.in');
      setPassword('Password@123');
    } else if (demoType === 'priya') {
      setEmail('priya.iyer@vit.ac.in');
      setPassword('Password@123');
    } else {
      setEmail('admin@skillswap.edu');
      setPassword('Password@123');
    }
    setFieldErrors({});
    setToast({
      type: 'info',
      title: 'Real Database Credentials Loaded',
      message: 'Authentic student email and password loaded from MySQL seed.',
    });
  };

  return (
    <div className="auth-page-wrapper">
      <Navbar />

      {/* Toast Notification Container */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Forgot Password Modal */}
      <ForgotPasswordModal isOpen={isForgotModalOpen} onClose={() => setIsForgotModalOpen(false)} />

      {/* Floating Ambient Background Blobs */}
      <div className="auth-ambient-orb auth-orb-1" />
      <div className="auth-ambient-orb auth-orb-2" />

      <main className="auth-main-container">
        <motion.div
          initial={{ opacity: 0, y: 25, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45 }}
          className="auth-card auth-card-login"
        >
          {/* Header */}
          <div className="auth-header">
            <div className="auth-logo-badge">
              <ArrowLeftRight size={28} />
            </div>
            <h1 className="auth-title">
              Sign In to <span className="gradient-text">SkillSwap</span>
            </h1>
            <p className="auth-subtitle">Connect with peers and resume your collaborative skill swaps.</p>
          </div>

          {/* Speed-Fill Testing Helper Box */}
          <div className="demo-speed-fill-box">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#4338ca', fontWeight: 600 }}>
              <Sparkles size={14} />
              <span>Speed-Fill Demo:</span>
            </div>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button
                type="button"
                onClick={() => handleFillDemo('aarav')}
                className="demo-fill-btn"
                title="Fill Aarav's Account"
              >
                Aarav (CSE)
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('ananya')}
                className="demo-fill-btn"
                title="Fill Ananya's Account"
              >
                Ananya (IT)
              </button>
            </div>
          </div>

          {loginSuccessData ? (
            /* Success Feedback Card */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ textAlign: 'center', padding: '1rem 0' }}
            >
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  backgroundColor: '#ecfdf5',
                  color: '#10b981',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                  boxShadow: '0 4px 15px rgba(16, 185, 129, 0.25)',
                }}
              >
                <CheckCircle2 size={36} />
              </div>

              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.4rem', color: '#065f46' }}>
                Welcome, {loginSuccessData.fullName}!
              </h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                Verified as <strong>{loginSuccessData.department}</strong> student at{' '}
                <strong>{loginSuccessData.collegeName}</strong>.
              </p>

              <div
                style={{
                  backgroundColor: 'rgba(237, 233, 254, 0.65)',
                  border: '1px solid var(--accent-lavender-border)',
                  borderRadius: '12px',
                  padding: '0.85rem 1rem',
                  fontSize: '0.8rem',
                  color: 'var(--primary-dark)',
                  marginBottom: '1.5rem',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, marginBottom: '0.2rem' }}>
                  <ShieldCheck size={15} color="#6366f1" /> Frontend Service Authentication
                </div>
                <div>Session active. Backend JWT token persistence hooks into MySQL in Phase 3.</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Link to="/dashboard" className="btn-primary" style={{ width: '100%', padding: '0.85rem' }}>
                  <span>Go to Student Dashboard</span>
                  <ArrowRight size={16} />
                </Link>
                <Link to="/explore" className="btn-secondary" style={{ width: '100%', padding: '0.75rem' }}>
                  <span>Browse Peer Skills Directory</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setLoginSuccessData(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    marginTop: '0.3rem',
                  }}
                >
                  Sign Out / Sign In as Another Student
                </button>
              </div>
            </motion.div>
          ) : (
            /* Standard Login Form */
            <form onSubmit={handleLoginSubmit} noValidate>
              {/* Email Input */}
              <div className="auth-form-group">
                <label className="auth-label" htmlFor="login-email">
                  <span>College Email Address</span>
                </label>
                <div className="auth-input-wrapper">
                  <Mail size={18} className="auth-input-icon" />
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' });
                    }}
                    placeholder="student.name@university.edu"
                    disabled={isSubmitting}
                    className={`auth-input ${fieldErrors.email ? 'has-error' : ''}`}
                    autoComplete="email"
                  />
                </div>
                {fieldErrors.email && (
                  <div className="auth-field-error">
                    <AlertCircle size={14} />
                    <span>{fieldErrors.email}</span>
                  </div>
                )}
              </div>

              {/* Password Input with Show/Hide */}
              <div className="auth-form-group">
                <div className="auth-label">
                  <label htmlFor="login-password">Password</label>
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary)',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="auth-input-wrapper">
                  <Lock size={18} className="auth-input-icon" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' });
                    }}
                    placeholder="Enter your account password"
                    disabled={isSubmitting}
                    className={`auth-input ${fieldErrors.password ? 'has-error' : ''}`}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="auth-password-toggle"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <div className="auth-field-error">
                    <AlertCircle size={14} />
                    <span>{fieldErrors.password}</span>
                  </div>
                )}
              </div>

              {/* Remember Me Checkbox */}
              <label className="auth-checkbox-wrapper">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isSubmitting}
                  className="auth-checkbox"
                />
                <span className="auth-checkbox-label">
                  Remember my college email on this browser
                  <span style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8' }}>
                    (Passwords are never saved in browser storage)
                  </span>
                </span>
              </label>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary"
                style={{ width: '100%', padding: '0.85rem', fontSize: '0.98rem' }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Account</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              {/* Navigation to Registration */}
              <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                Don't have a student profile yet?{' '}
                <Link to="/register" style={{ fontWeight: 700, color: 'var(--primary)' }}>
                  Create account here
                </Link>
              </div>
            </form>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
