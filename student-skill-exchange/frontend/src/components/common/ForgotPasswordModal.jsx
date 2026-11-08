import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, X, ArrowRight, AlertCircle, CheckCircle2, ShieldAlert, Sparkles, Loader2 } from 'lucide-react';
import { requestPasswordReset, isValidEmail } from '../../services/authService.js';

export default function ForgotPasswordModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please provide your university email address.');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email format (e.g. student@college.edu).');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await requestPasswordReset(email);
      setResult(res);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetModal = () => {
    setEmail('');
    setError('');
    setResult(null);
    onClose();
  };

  return (
    <AnimatePresence>
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
        onClick={handleResetModal}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.2 }}
          style={{
            width: '100%',
            maxWidth: '480px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            border: '1px solid rgba(221, 214, 254, 0.8)',
            padding: '2rem',
            boxShadow: '0 25px 50px -12px rgba(99, 102, 241, 0.25)',
            position: 'relative',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={handleResetModal}
            style={{
              position: 'absolute',
              top: '1.25rem',
              right: '1.25rem',
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.4rem',
              borderRadius: '8px',
            }}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                marginBottom: '0.75rem',
              }}
            >
              <Mail size={22} />
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
              Reset Your Password
            </h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              Enter your college email and we will simulate the password recovery link.
            </p>
          </div>

          {/* Honest Backend Status Notice */}
          <div
            style={{
              backgroundColor: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: '10px',
              padding: '0.75rem 1rem',
              marginBottom: '1.5rem',
              display: 'flex',
              gap: '0.65rem',
              fontSize: '0.8rem',
              color: '#92400e',
              lineHeight: 1.45,
            }}
          >
            <ShieldAlert size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Architecture Note:</strong> SMTP mail delivery is not yet configured in the backend. Currently,
              this form validates the student identity and triggers a simulated recovery event.
            </div>
          </div>

          {result ? (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  backgroundColor: '#ecfdf5',
                  color: '#10b981',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}
              >
                <CheckCircle2 size={28} />
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: '#065f46' }}>
                Reset Request Logged
              </h4>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                A password reset token would be dispatched to <strong>{email}</strong> once backend mail integration is
                active in Phase 3.
              </p>
              <button
                type="button"
                onClick={handleResetModal}
                className="btn-primary"
                style={{ width: '100%', padding: '0.75rem' }}
              >
                Return to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <div
                  style={{
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#b91c1c',
                    padding: '0.65rem 0.9rem',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    marginBottom: '1rem',
                  }}
                >
                  {error}
                </div>
              )}

              <div style={{ marginBottom: '1.5rem' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    marginBottom: '0.4rem',
                    color: 'var(--text-main)',
                  }}
                >
                  Registered Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    size={17}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '0.9rem',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)',
                    }}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="student.name@university.edu"
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem 0.75rem 2.6rem',
                      borderRadius: '10px',
                      border: '1px solid var(--accent-lavender-border)',
                      fontSize: '0.9rem',
                      outline: 'none',
                      fontFamily: 'inherit',
                      backgroundColor: '#ffffff',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={handleResetModal}
                  disabled={loading}
                  className="btn-secondary"
                  style={{ flex: 1, padding: '0.75rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                  style={{ flex: 1.5, padding: '0.75rem' }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="spin" />
                      <span>Validating...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Recovery Link</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

