import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote, Info, CheckCircle2 } from 'lucide-react';

export default function Testimonials() {
  const testimonials = [
    {
      id: 1,
      quote:
        'I had zero confidence in Graphs and Dynamic Programming ahead of campus placements. I connected with a 4th-year senior who needed help building a full-stack portfolio in React. We traded 2 hours every weekend—I cracked my dream company offer!',
      name: 'Aditya Kashyap',
      branch: 'Computer Science, Year 4',
      college: 'IIIT Hyderabad',
      swap: 'Swapped React & Node.js for Advanced DSA',
      rating: 5,
    },
    {
      id: 2,
      quote:
        'Most student bootcamps charge ridiculous fees. On SkillSwap, I exchanged Figma UI prototyping with a classmate who taught me relational database schema design. Learning together 1-on-1 is 10x faster than passively watching YouTube tutorials.',
      name: 'Tanvi Deshmukh',
      branch: 'Information Science, Year 3',
      college: 'RV College of Engineering',
      swap: 'Swapped Figma & Design Systems for MySQL & Backend',
      rating: 5,
    },
    {
      id: 3,
      quote:
        'Teaching competitive coding to fellow students helped solidify my own fundamentals. SkillSwap made it effortless to find sincere peers who actually showed up on time and delivered value in return.',
      name: 'Kartik Nair',
      branch: 'Software Engineering, Year 3',
      college: 'NIT Trichy',
      swap: 'Swapped C++ Competitive Coding for Docker & DevOps',
      rating: 5,
    },
  ];

  return (
    <section id="testimonials" style={{ padding: '6rem 1.5rem', maxWidth: '1240px', margin: '0 auto' }}>
      <div className="section-header">
        <span className="section-tag">Student Stories</span>
        <h2 className="section-title">
          Loved by Students Across <span className="gradient-text">Campuses</span>
        </h2>
        <p className="section-subtitle">
          See how mutual peer learning accelerates placement readiness and technical mastery.
        </p>

        {/* Demo disclaimer badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.35rem 0.85rem',
            borderRadius: '9999px',
            backgroundColor: 'rgba(237, 233, 254, 0.7)',
            border: '1px solid var(--accent-lavender-border)',
            fontSize: '0.78rem',
            color: 'var(--primary-dark)',
            marginTop: '0.75rem',
          }}
        >
          <Info size={14} color="#6366f1" />
          <span>Sample student testimonials for platform demonstration</span>
        </div>
      </div>

      <div className="testimonials-grid">
        {testimonials.map((t, idx) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: idx * 0.1 }}
            className="saas-card"
            style={{
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
            }}
          >
            <div>
              {/* Star Rating & Quote Icon */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', gap: '0.2rem' }}>
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} size={16} fill="#f59e0b" color="#f59e0b" />
                  ))}
                </div>
                <div
                  style={{
                    color: 'var(--accent-lavender-border)',
                    background: 'var(--accent-lavender-subtle)',
                    borderRadius: '8px',
                    padding: '0.3rem',
                  }}
                >
                  <Quote size={20} color="#8b5cf6" />
                </div>
              </div>

              <p
                style={{
                  fontSize: '0.92rem',
                  color: '#334155',
                  lineHeight: 1.65,
                  marginBottom: '1.5rem',
                  fontStyle: 'italic',
                }}
              >
                "{t.quote}"
              </p>
            </div>

            <div>
              <div
                style={{
                  backgroundColor: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  color: '#065f46',
                  borderRadius: '6px',
                  padding: '0.35rem 0.65rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  marginBottom: '1rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <CheckCircle2 size={13} /> {t.swap}
              </div>

              <div style={{ borderTop: '1px solid rgba(221, 214, 254, 0.5)', paddingTop: '0.85rem' }}>
                <h4 style={{ fontSize: '0.98rem', fontWeight: 700, margin: 0 }}>{t.name}</h4>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{t.branch}</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--primary)', fontWeight: 600 }}>{t.college}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

