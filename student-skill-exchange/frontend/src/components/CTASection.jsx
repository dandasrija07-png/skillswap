import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Search, ShieldCheck } from 'lucide-react';

export default function CTASection() {
  return (
    <section style={{ padding: '4rem 1.5rem 6rem', maxWidth: '1240px', margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="cta-banner"
      >
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '750px', margin: '0 auto' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.9rem',
              borderRadius: '9999px',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: '#ffffff',
              marginBottom: '1.25rem',
            }}
          >
            <Sparkles size={14} /> Join 2,400+ Engineering Peers Today
          </div>

          <h2
            style={{
              fontSize: 'clamp(2.1rem, 4.5vw, 3.2rem)',
              fontWeight: 800,
              lineHeight: 1.15,
              marginBottom: '1.25rem',
              letterSpacing: '-0.025em',
              color: '#ffffff',
            }}
          >
            Ready to Exchange Skills &amp; Level Up Together?
          </h2>

          <p
            style={{
              fontSize: '1.1rem',
              color: 'rgba(255, 255, 255, 0.9)',
              lineHeight: 1.6,
              marginBottom: '2.5rem',
            }}
          >
            Create your student profile in under 2 minutes. Match with peers who are ready to teach you today, and share
            your technical passions in return.
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <Link
              to="/register"
              className="btn-primary"
              style={{
                backgroundColor: '#ffffff',
                color: '#4f46e5',
                backgroundImage: 'none',
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)',
                padding: '0.85rem 2rem',
                fontSize: '1rem',
                fontWeight: 700,
              }}
            >
              <span>Get Started Free</span>
              <ArrowRight size={18} />
            </Link>

            <Link
              to="/explore"
              className="btn-secondary"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(10px)',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                color: '#ffffff',
                padding: '0.85rem 1.85rem',
                fontSize: '1rem',
              }}
            >
              <Search size={18} />
              <span>Browse Skill Directory</span>
            </Link>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1.5rem',
              marginTop: '2rem',
              fontSize: '0.8rem',
              color: 'rgba(255, 255, 255, 0.8)',
              flexWrap: 'wrap',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={16} /> 100% Free Peer Learning
            </span>
            <span>•</span>
            <span>No Credit Card Required</span>
            <span>•</span>
            <span>College Verified Community</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

