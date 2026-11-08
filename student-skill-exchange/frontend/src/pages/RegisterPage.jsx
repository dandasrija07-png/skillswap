import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  School,
  GraduationCap,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Info,
} from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import Toast from '../components/common/Toast.jsx';
import { isValidEmail, getPasswordStrength } from '../services/authService.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  // Form input fields
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    academicYear: '',
    collegeName: '',
    agreeTerms: false,
  });

  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Interaction & status states
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [registrationSuccessData, setRegistrationSuccessData] = useState(null);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Departments list for university students
  const departments = [
    'Computer Science & Engineering',
    'Information Technology',
    'Artificial Intelligence & Data Science',
    'Electronics & Communication Engineering',
    'Electrical & Electronics Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Biotechnology & Bioinformatics',
    'Design & Human-Computer Interaction',
    'Business & Technology Management',
  ];

  // Academic years
  const academicYears = ['1st Year (Freshman)', '2nd Year (Sophomore)', '3rd Year (Junior)', '4th Year (Senior)', 'Postgraduate / Masters'];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear specific field error when student starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Validation function
  const validateForm = () => {
    const errors = {};

    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required.';
    } else if (formData.fullName.trim().length < 2) {
      errors.fullName = 'Name must be at least 2 characters.';
    }

    if (!formData.email.trim()) {
      errors.email = 'University email address is required.';
    } else if (!isValidEmail(formData.email)) {
      errors.email = 'Please provide a valid email format (e.g. name@college.edu).';
    }

    if (!formData.collegeName.trim()) {
      errors.collegeName = 'College / University name is required.';
    }

    if (!formData.department) {
      errors.department = 'Please select your academic department.';
    }

    if (!formData.academicYear) {
      errors.academicYear = 'Please select your current academic year.';
    }

    if (!formData.password) {
      errors.password = 'Password is required.';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters.';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Confirmation password is required.';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (!formData.agreeTerms) {
      errors.agreeTerms = 'You must agree to the Terms of Service & Honor Code.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (!validateForm()) {
      setToast({
        type: 'error',
        title: 'Form Validation Error',
        message: 'Please complete all required fields correctly before registering.',
      });
      return;
    }

    setIsSubmitting(true);
    setFieldErrors({});

    try {
      const response = await register(formData);
      setRegistrationSuccessData(response.user);
      setToast({
        type: 'success',
        title: 'Registration Successful!',
        message: 'Account created in MySQL database with 10 welcome credits!',
      });
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setToast({
        type: 'error',
        title: 'Registration Error',
        message: err.message || 'Unable to register student account.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Speed-fill demo student data
  const handleFillDemo = () => {
    setFormData({
      fullName: 'Vikramaditya Rao',
      email: 'vikram.rao@iitr.ac.in',
      password: 'StrongStudentPass#2026',
      confirmPassword: 'StrongStudentPass#2026',
      department: 'Computer Science & Engineering',
      academicYear: '3rd Year (Junior)',
      collegeName: 'IIT Roorkee',
      agreeTerms: true,
    });
    setFieldErrors({});
    setToast({
      type: 'info',
      title: 'Demo Student Profile Loaded',
      message: 'All fields pre-filled for rapid inspection and verification.',
    });
  };

  // Real-time password strength
  const passwordStrength = getPasswordStrength(formData.password);
  const passwordsMatch = formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;
  const passwordsMismatch = formData.confirmPassword && formData.password !== formData.confirmPassword;

  return (
    <div className="auth-page-wrapper">
      <Navbar />

      {/* Toast Notification Container */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Floating Ambient Background Blobs */}
      <div className="auth-ambient-orb auth-orb-1" />
      <div className="auth-ambient-orb auth-orb-2" />

      {/* Terms & Conditions Modal */}
      {showTermsModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(8px)',
          }}
          onClick={() => setShowTermsModal(false)}
        >
          <div
            style={{
              maxWidth: '520px',
              width: '100%',
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              padding: '2rem',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1rem', color: '#0f172a' }}>
              SkillSwap Student Honor Code &amp; Terms
            </h3>
            <div style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.6, maxHeight: '300px', overflowY: 'auto', marginBottom: '1.5rem', paddingRight: '0.5rem' }}>
              <p style={{ marginBottom: '0.75rem' }}>
                <strong>1. Mutual Respect &amp; Safety:</strong> All members must uphold professional and respectful
                conduct during 1:1 skill exchange sessions.
              </p>
              <p style={{ marginBottom: '0.75rem' }}>
                <strong>2. Free Knowledge Barter:</strong> SkillSwap is strictly non-monetary. Charging money or demanding
                cash payments for skill swaps violates community policy.
              </p>
              <p style={{ marginBottom: '0.75rem' }}>
                <strong>3. Academic Integrity:</strong> Skills exchanged must focus on tutoring, conceptual learning, and
                interview preparation. Solicitations for exam cheating or unauthorized assignment completion are strictly prohibited.
              </p>
              <p>
                <strong>4. Zero AI Guarantee:</strong> Learning is peer-to-peer between human university students.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowTermsModal(false)}
              className="btn-primary"
              style={{ width: '100%', padding: '0.75rem' }}
            >
              I Understand &amp; Agree
            </button>
          </div>
        </div>
      )}

      <main className="auth-main-container">
        <motion.div
          initial={{ opacity: 0, y: 25, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45 }}
          className="auth-card auth-card-register"
        >
          {/* Header */}
          <div className="auth-header">
            <div className="auth-logo-badge">
              <GraduationCap size={28} />
            </div>
            <h1 className="auth-title">
              Create Your <span className="gradient-text">Student Profile</span>
            </h1>
            <p className="auth-subtitle">
              Join the university peer barter network. Teach what you love, learn what you need.
            </p>
          </div>

          {/* Speed-Fill Demo Helper Box */}
          <div className="demo-speed-fill-box">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#4338ca', fontWeight: 600 }}>
              <Sparkles size={14} />
              <span>Speed-Fill Helper:</span>
            </div>
            <button type="button" onClick={handleFillDemo} className="demo-fill-btn">
              Auto-Fill Sample Student
            </button>
          </div>

          {registrationSuccessData ? (
            /* Registration Success Feedback */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ textAlign: 'center', padding: '1rem 0' }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#ecfdf5',
                  color: '#10b981',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                  boxShadow: '0 4px 15px rgba(16, 185, 129, 0.25)',
                }}
              >
                <CheckCircle2 size={38} />
              </div>

              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem', color: '#065f46' }}>
                Student Profile Registered!
              </h2>

              <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                Welcome to SkillSwap, <strong>{registrationSuccessData.fullName}</strong>! Your academic profile has been
                validated.
              </p>

              {/* Profile Summary Card */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--accent-lavender-border)',
                  borderRadius: '16px',
                  padding: '1.25rem',
                  textAlign: 'left',
                  marginBottom: '1.5rem',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.08)',
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', fontSize: '0.85rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Email:</span>
                    <strong>{registrationSuccessData.email}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Campus:</span>
                    <strong>{registrationSuccessData.collegeName}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Department:</span>
                    <strong>{registrationSuccessData.department}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Year:</span>
                    <strong>{registrationSuccessData.academicYear}</strong>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: '1rem',
                    paddingTop: '0.85rem',
                    borderTop: '1px solid #f1f5f9',
                    fontSize: '0.78rem',
                    color: 'var(--primary-dark)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <ShieldCheck size={16} color="#6366f1" />
                  <span>Frontend Validation Complete • MySQL Database sync activates in Phase 3</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Link to="/explore" className="btn-primary" style={{ width: '100%', padding: '0.85rem' }}>
                  <span>Explore Skills to Learn</span>
                  <ArrowRight size={16} />
                </Link>
                <Link to="/login" className="btn-secondary" style={{ width: '100%', padding: '0.8rem' }}>
                  Sign In to Your Account
                </Link>
              </div>
            </motion.div>
          ) : (
            /* Registration Form */
            <form onSubmit={handleRegisterSubmit} noValidate>
              {/* Row 1: Full Name & College Email */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                {/* Full Name */}
                <div className="auth-form-group">
                  <label className="auth-label" htmlFor="register-fullname">
                    <span>Full Name *</span>
                  </label>
                  <div className="auth-input-wrapper">
                    <User size={18} className="auth-input-icon" />
                    <input
                      id="register-fullname"
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="e.g. Vikramaditya Rao"
                      disabled={isSubmitting}
                      className={`auth-input ${fieldErrors.fullName ? 'has-error' : ''}`}
                      autoComplete="name"
                    />
                  </div>
                  {fieldErrors.fullName && (
                    <div className="auth-field-error">
                      <AlertCircle size={14} />
                      <span>{fieldErrors.fullName}</span>
                    </div>
                  )}
                </div>

                {/* College Email */}
                <div className="auth-form-group">
                  <label className="auth-label" htmlFor="register-email">
                    <span>College Email *</span>
                  </label>
                  <div className="auth-input-wrapper">
                    <Mail size={18} className="auth-input-icon" />
                    <input
                      id="register-email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="student@college.edu"
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
              </div>

              {/* Row 2: College Name */}
              <div className="auth-form-group">
                <label className="auth-label" htmlFor="register-college">
                  <span>College / University Name *</span>
                </label>
                <div className="auth-input-wrapper">
                  <School size={18} className="auth-input-icon" />
                  <input
                    id="register-college"
                    type="text"
                    name="collegeName"
                    value={formData.collegeName}
                    onChange={handleChange}
                    placeholder="e.g. Delhi Technological University, VIT, BITS Pilani"
                    disabled={isSubmitting}
                    className={`auth-input ${fieldErrors.collegeName ? 'has-error' : ''}`}
                  />
                </div>
                {fieldErrors.collegeName && (
                  <div className="auth-field-error">
                    <AlertCircle size={14} />
                    <span>{fieldErrors.collegeName}</span>
                  </div>
                )}
              </div>

              {/* Row 3: Department & Academic Year */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                {/* Department Dropdown */}
                <div className="auth-form-group">
                  <label className="auth-label" htmlFor="register-department">
                    <span>Department *</span>
                  </label>
                  <div className="auth-input-wrapper">
                    <GraduationCap size={18} className="auth-input-icon" />
                    <select
                      id="register-department"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      className={`auth-input ${fieldErrors.department ? 'has-error' : ''}`}
                      style={{ cursor: 'pointer' }}
                    >
                      <option value="">Select Department...</option>
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>
                  {fieldErrors.department && (
                    <div className="auth-field-error">
                      <AlertCircle size={14} />
                      <span>{fieldErrors.department}</span>
                    </div>
                  )}
                </div>

                {/* Academic Year Dropdown */}
                <div className="auth-form-group">
                  <label className="auth-label" htmlFor="register-year">
                    <span>Academic Year *</span>
                  </label>
                  <div className="auth-input-wrapper">
                    <Calendar size={18} className="auth-input-icon" />
                    <select
                      id="register-year"
                      name="academicYear"
                      value={formData.academicYear}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      className={`auth-input ${fieldErrors.academicYear ? 'has-error' : ''}`}
                      style={{ cursor: 'pointer' }}
                    >
                      <option value="">Select Academic Year...</option>
                      {academicYears.map((yr) => (
                        <option key={yr} value={yr}>
                          {yr}
                        </option>
                      ))}
                    </select>
                  </div>
                  {fieldErrors.academicYear && (
                    <div className="auth-field-error">
                      <AlertCircle size={14} />
                      <span>{fieldErrors.academicYear}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Row 4: Password & Confirm Password */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                {/* Password */}
                <div className="auth-form-group">
                  <label className="auth-label" htmlFor="register-password">
                    <span>Password *</span>
                  </label>
                  <div className="auth-input-wrapper">
                    <Lock size={18} className="auth-input-icon" />
                    <input
                      id="register-password"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Min. 8 characters"
                      disabled={isSubmitting}
                      className={`auth-input ${fieldErrors.password ? 'has-error' : ''}`}
                      autoComplete="new-password"
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

                  {/* Password Strength Meter */}
                  {formData.password && (
                    <div className="password-strength-container">
                      <div className="strength-bar-track">
                        <div
                          className="strength-bar-fill"
                          style={{
                            width: `${(passwordStrength.score / 4) * 100}%`,
                            backgroundColor: passwordStrength.color,
                          }}
                        />
                      </div>
                      <div className="strength-label-text" style={{ color: passwordStrength.color }}>
                        <span>Strength: {passwordStrength.label}</span>
                        <span>{formData.password.length} chars</span>
                      </div>
                    </div>
                  )}

                  {fieldErrors.password && (
                    <div className="auth-field-error">
                      <AlertCircle size={14} />
                      <span>{fieldErrors.password}</span>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="auth-form-group">
                  <label className="auth-label" htmlFor="register-confirm-password">
                    <span>Confirm Password *</span>
                  </label>
                  <div className="auth-input-wrapper">
                    <Lock size={18} className="auth-input-icon" />
                    <input
                      id="register-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Re-type password"
                      disabled={isSubmitting}
                      className={`auth-input ${fieldErrors.confirmPassword ? 'has-error' : ''}`}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="auth-password-toggle"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {/* Match Indicator */}
                  {passwordsMatch && (
                    <div style={{ fontSize: '0.74rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.35rem' }}>
                      <CheckCircle2 size={13} />
                      <span>Passwords match</span>
                    </div>
                  )}
                  {passwordsMismatch && (
                    <div style={{ fontSize: '0.74rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.35rem' }}>
                      <AlertCircle size={13} />
                      <span>Passwords do not match</span>
                    </div>
                  )}

                  {fieldErrors.confirmPassword && (
                    <div className="auth-field-error">
                      <AlertCircle size={14} />
                      <span>{fieldErrors.confirmPassword}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Terms and Conditions Checkbox */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="auth-checkbox-wrapper">
                  <input
                    type="checkbox"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="auth-checkbox"
                  />
                  <span className="auth-checkbox-label">
                    I agree to the{' '}
                    <button
                      type="button"
                      onClick={() => setShowTermsModal(true)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary)',
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: 0,
                        textDecoration: 'underline',
                      }}
                    >
                      SkillSwap Student Honor Code &amp; Terms
                    </button>
                    . I pledge to participate in respectful, non-monetary peer learning.
                  </span>
                </label>
                {fieldErrors.agreeTerms && (
                  <div className="auth-field-error">
                    <AlertCircle size={14} />
                    <span>{fieldErrors.agreeTerms}</span>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary"
                style={{ width: '100%', padding: '0.9rem', fontSize: '1rem' }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="spin" />
                    <span>Validating Profile...</span>
                  </>
                ) : (
                  <>
                    <span>Create Student Account</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              {/* Link to Login */}
              <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                Already registered with SkillSwap?{' '}
                <Link to="/login" style={{ fontWeight: 700, color: 'var(--primary)' }}>
                  Sign in here
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
