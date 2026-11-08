import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeftRight, Menu, X, Sparkles, User, ArrowRight, LogOut, Coins, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, profile, logout } = useAuth();

  const handleScrollTo = (elementId) => {
    setMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate(`/#${elementId}`);
      setTimeout(() => {
        const el = document.getElementById(elementId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(elementId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav className="navbar-sticky">
      <div className="nav-container">
        {/* Brand Logo */}
        <Link to="/" className="nav-brand">
          <div className="nav-logo-icon">
            <ArrowLeftRight size={22} strokeWidth={2.5} />
          </div>
          <div>
            <span style={{ letterSpacing: '-0.02em' }}>
              Skill<span className="gradient-text">Swap</span>
            </span>
            <span
              style={{
                display: 'block',
                fontSize: '0.68rem',
                color: 'var(--text-muted)',
                fontWeight: 600,
                marginTop: '-3px',
                letterSpacing: '0.04em',
              }}
            >
              STUDENT EXCHANGE
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <ul className="nav-links-desktop">
          <li>
            <button
              type="button"
              onClick={() => handleScrollTo('hero')}
              className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
              style={{ background: 'none', border: 'none', font: 'inherit' }}
            >
              Home
            </button>
          </li>
          <li>
            <Link
              to="/explore"
              className={`nav-link ${location.pathname === '/explore' ? 'active' : ''}`}
            >
              Explore Skills
            </Link>
          </li>
          <li>
            <Link
              to="/students"
              className={`nav-link ${location.pathname === '/students' ? 'active' : ''}`}
            >
              Explore Students
            </Link>
          </li>
          <li>
            <Link
              to="/sessions"
              className={`nav-link ${location.pathname === '/sessions' ? 'active' : ''}`}
            >
              My Sessions
            </Link>
          </li>
          <li>
            <Link
              to="/dashboard"
              className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
            >
              Dashboard
            </Link>
          </li>
          <li>
            <button
              type="button"
              onClick={() => handleScrollTo('how-it-works')}
              className="nav-link"
              style={{ background: 'none', border: 'none', font: 'inherit' }}
            >
              How It Works
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={() => handleScrollTo('about')}
              className="nav-link"
              style={{ background: 'none', border: 'none', font: 'inherit' }}
            >
              About
            </button>
          </li>
        </ul>

        {/* Desktop Action Buttons */}
        <div className="nav-actions-desktop">
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  background: 'rgba(99, 102, 241, 0.1)',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: '#4f46e5',
                }}
              >
                <Coins size={14} color="#6366f1" />
                <span>{profile?.credits_balance ?? 10} Credits</span>
              </div>
              <Link
                to="/dashboard"
                className="btn-primary"
                style={{ padding: '0.55rem 1.1rem', fontSize: '0.88rem' }}
              >
                <User size={15} />
                <span>{user?.fullName?.split(' ')[0] || 'Dashboard'}</span>
              </Link>
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="btn-secondary"
                  title="Admin Portal"
                  style={{ padding: '0.55rem 0.85rem', fontSize: '0.85rem', color: '#6366f1', borderColor: '#c7d2fe' }}
                >
                  <ShieldAlert size={15} color="#6366f1" />
                  <span>Admin</span>
                </Link>
              )}
              <button
                type="button"
                onClick={logout}
                className="btn-secondary"
                title="Logout"
                style={{ padding: '0.55rem 0.75rem', fontSize: '0.88rem' }}
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="btn-secondary"
                style={{ padding: '0.55rem 1.1rem', fontSize: '0.88rem' }}
              >
                <User size={15} />
                <span>Login</span>
              </Link>
              <Link
                to="/register"
                className="btn-primary"
                style={{ padding: '0.58rem 1.25rem', fontSize: '0.88rem' }}
              >
                <span>Get Started</span>
                <ArrowRight size={15} />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          className="nav-mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="mobile-menu-drawer"
          >
            <button
              type="button"
              onClick={() => handleScrollTo('hero')}
              className="nav-link"
              style={{ textAlign: 'left', background: 'none', border: 'none', font: 'inherit', padding: '0.5rem 0' }}
            >
              Home
            </button>
            <Link
              to="/explore"
              className="nav-link"
              onClick={() => setMobileMenuOpen(false)}
              style={{ padding: '0.5rem 0' }}
            >
              Explore Skills
            </Link>
            <Link
              to="/students"
              className="nav-link"
              onClick={() => setMobileMenuOpen(false)}
              style={{ padding: '0.5rem 0' }}
            >
              Explore Students
            </Link>
            <Link
              to="/sessions"
              className="nav-link"
              onClick={() => setMobileMenuOpen(false)}
              style={{ padding: '0.5rem 0' }}
            >
              My Sessions
            </Link>
            <Link
              to="/dashboard"
              className="nav-link"
              onClick={() => setMobileMenuOpen(false)}
              style={{ padding: '0.5rem 0' }}
            >
              Student Dashboard
            </Link>
            <button
              type="button"
              onClick={() => handleScrollTo('how-it-works')}
              className="nav-link"
              style={{ textAlign: 'left', background: 'none', border: 'none', font: 'inherit', padding: '0.5rem 0' }}
            >
              How It Works
            </button>
            <button
              type="button"
              onClick={() => handleScrollTo('about')}
              className="nav-link"
              style={{ textAlign: 'left', background: 'none', border: 'none', font: 'inherit', padding: '0.5rem 0' }}
            >
              About
            </button>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.75rem' }}>
              {isAuthenticated ? (
                <>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.5rem 0.75rem',
                      background: 'rgba(99, 102, 241, 0.08)',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                    }}
                  >
                    <span>{user?.fullName}</span>
                    <span style={{ color: '#4f46e5', fontWeight: 700 }}>{profile?.credits_balance ?? 10} Credits</span>
                  </div>
                  <Link
                    to="/dashboard"
                    className="btn-primary"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ width: '100%' }}
                  >
                    Go to Dashboard
                  </Link>
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="btn-secondary"
                      onClick={() => setMobileMenuOpen(false)}
                      style={{ width: '100%', color: '#6366f1', borderColor: '#c7d2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                    >
                      <ShieldAlert size={16} color="#6366f1" /> Admin Portal
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="btn-secondary"
                    style={{ width: '100%' }}
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="btn-secondary"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ width: '100%' }}
                  >
                    <User size={16} /> Login
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ width: '100%' }}
                  >
                    Get Started <ArrowRight size={16} />
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

