import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Search,
  CheckCircle2,
  Code,
  Palette,
  ArrowLeftRight,
  GraduationCap,
  Star,
  ShieldCheck,
} from 'lucide-react';

export default function Hero() {
  return (
    <section id="hero" className="hero-wrapper">
      {/* Floating Animated Gradient Blobs */}
      <div className="floating-shape shape-1" />
      <div className="floating-shape shape-2" />
      <div className="floating-shape shape-3" />

      <div className="hero-content">
        {/* Top Badge */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="hero-pill-badge"
        >
          <GraduationCap size={16} color="#6366f1" />
          <span>The University Peer-to-Peer Knowledge Barter Network</span>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="hero-title"
        >
          Share Your Skills. <br />
          <span className="gradient-text">Discover New Possibilities.</span>
        </motion.h1>

        {/* Subtitle Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="hero-subtitle"
        >
          Connect with fellow university students to trade real technical &amp; creative skills.
          Teach what you love—like React, Python, or UI Design—and learn what you need from verified peers.
          Completely free, collaborative, and zero AI intermediaries.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="hero-cta-group"
        >
          <Link to="/explore" className="btn-secondary" style={{ padding: '0.85rem 1.85rem', fontSize: '1rem' }}>
            <Search size={18} />
            <span>Explore Skills</span>
          </Link>

          <Link to="/register" className="btn-primary" style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}>
            <span>Get Started</span>
            <ArrowRight size={18} />
          </Link>
        </motion.div>

        {/* Live Interactive Skill Swap Demonstration Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="hero-match-preview"
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.25rem',
              borderBottom: '1px solid rgba(221, 214, 254, 0.6)',
              paddingBottom: '0.85rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                style={{
                  display: 'inline-block',
                  width: '9px',
                  height: '9px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  boxShadow: '0 0 8px #10b981',
                }}
              />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                Simulated Peer Match Engine
              </span>
            </div>
            <span className="badge badge-purple" style={{ fontSize: '0.75rem' }}>
              <ShieldCheck size={13} /> Verified Campus Student
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto 1fr',
              alignItems: 'center',
              gap: '1.2rem',
            }}
          >
            {/* Student A Side */}
            <div
              style={{
                background: 'rgba(245, 243, 255, 0.7)',
                padding: '1.2rem',
                borderRadius: '16px',
                border: '1px solid rgba(221, 214, 254, 0.6)',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #818cf8, #6366f1)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                  }}
                >
                  AS
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Aarav Sharma</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>CSE • 3rd Year</p>
                </div>
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#065f46', display: 'block' }}>
                  TEACHING:
                </span>
                <span className="skill-tag tag-teaching">React &amp; JavaScript</span>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#1e40af', display: 'block' }}>
                  WANTS TO LEARN:
                </span>
                <span className="skill-tag tag-learning">Figma &amp; UI/UX</span>
              </div>
            </div>

            {/* Middle Animated Swap Icon */}
            <motion.div
              animate={{ rotate: [0, 180, 360] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              className="swap-indicator-pill"
            >
              <ArrowLeftRight size={22} />
            </motion.div>

            {/* Student B Side */}
            <div
              style={{
                background: 'rgba(245, 243, 255, 0.7)',
                padding: '1.2rem',
                borderRadius: '16px',
                border: '1px solid rgba(221, 214, 254, 0.6)',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #c084fc, #8b5cf6)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                  }}
                >
                  PI
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Priya Iyer</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>IT • 2nd Year</p>
                </div>
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#065f46', display: 'block' }}>
                  TEACHING:
                </span>
                <span className="skill-tag tag-teaching">Figma &amp; UI/UX</span>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#1e40af', display: 'block' }}>
                  WANTS TO LEARN:
                </span>
                <span className="skill-tag tag-learning">React &amp; JavaScript</span>
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: '1.25rem',
              padding: '0.7rem',
              borderRadius: '10px',
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              color: '#065f46',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            <CheckCircle2 size={16} /> Perfect Complementary Match Found • 1:1 Direct Skill Exchange
          </div>
        </motion.div>
      </div>
    </section>
  );
}

