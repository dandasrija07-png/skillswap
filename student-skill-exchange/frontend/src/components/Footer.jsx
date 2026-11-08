import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftRight, Heart, Code } from 'lucide-react';

export default function Footer() {
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="saas-footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                }}
              >
                <ArrowLeftRight size={20} />
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 800,
                  fontSize: '1.25rem',
                  color: '#ffffff',
                }}
              >
                Skill<span className="gradient-text">Swap</span>
              </span>
            </div>

            <p style={{ fontSize: '0.88rem', lineHeight: 1.6, color: '#94a3b8', marginBottom: '1.5rem', maxWidth: '340px' }}>
              A peer-to-peer student skill exchange ecosystem. Connect, teach, and master programming, design, and
              academics through direct collaborative barter.
            </p>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.4rem 0.8rem',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                fontSize: '0.78rem',
                color: '#cbd5e1',
              }}
            >
              <Code size={14} color="#818cf8" />
              <span>Full-Stack B.Tech CSE Capstone Project</span>
            </div>
          </div>

          {/* Platform Navigation */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.2rem' }}>Platform</h4>
            <Link to="/" onClick={handleScrollToTop} className="footer-link">
              Home
            </Link>
            <Link to="/explore" className="footer-link">
              Explore Skills
            </Link>
            <a href="/#how-it-works" className="footer-link">
              How It Works
            </a>
            <a href="/#categories" className="footer-link">
              Skill Categories
            </a>
            <a href="/#featured-students" className="footer-link">
              Featured Students
            </a>
          </div>

          {/* Student Community */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.2rem' }}>Community</h4>
            <a href="/#about" className="footer-link">
              About Project
            </a>
            <Link to="/explore" className="footer-link">
              Campus Directory
            </Link>
            <Link to="/register" className="footer-link">
              Join as Mentor
            </Link>
            <span className="footer-link" style={{ cursor: 'default' }}>
              Academic Integrity Policy
            </span>
            <span className="footer-link" style={{ cursor: 'default' }}>
              Student Safety Code
            </span>
          </div>

          {/* Tech Stack Details */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.2rem' }}>Architecture</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.82rem' }}>
              <span style={{ color: '#cbd5e1' }}>• React 19 &amp; Vite 6</span>
              <span style={{ color: '#cbd5e1' }}>• Framer Motion Transitions</span>
              <span style={{ color: '#cbd5e1' }}>• Node.js &amp; Express API</span>
              <span style={{ color: '#cbd5e1' }}>• MySQL Relational DB</span>
              <span style={{ color: '#cbd5e1' }}>• Socket.IO Real-Time Chat</span>
              <span style={{ color: '#a78bfa', fontWeight: 600, marginTop: '0.4rem' }}>Zero AI Intermediaries</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: '1px solid #1e293b',
            paddingTop: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.82rem',
          }}
        >
          <div>&copy; {new Date().getFullYear()} SkillSwap Platform. Built for University Student Collaboration.</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8' }}>
            <span>Designed with</span>
            <Heart size={14} fill="#ec4899" color="#ec4899" />
            <span>using React &amp; CSS3</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
