import React from 'react';
import { motion } from 'framer-motion';
import { Users, Repeat, School, Award, Info } from 'lucide-react';

export default function Stats() {
  const statsData = [
    {
      icon: <Users size={26} color="#6366f1" />,
      number: '2,400+',
      label: 'Active Students',
      subtext: 'Trading skills weekly',
    },
    {
      icon: <Repeat size={26} color="#8b5cf6" />,
      number: '1,850+',
      label: 'Skills Exchanged',
      subtext: 'Completed peer swaps',
    },
    {
      icon: <School size={26} color="#ec4899" />,
      number: '45+',
      label: 'Campus Communities',
      subtext: 'Engineering colleges',
    },
    {
      icon: <Award size={26} color="#10b981" />,
      number: '98.4%',
      label: 'Match Satisfaction',
      subtext: 'Positive peer feedback',
    },
  ];

  return (
    <section className="stats-strip">
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Metric Disclaimer Banner */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            marginBottom: '1.75rem',
            textAlign: 'center',
          }}
        >
          <Info size={14} color="#8b5cf6" />
          <span>
            <strong>Demo Notice:</strong> Metrics below represent illustrative platform targets until real database
            aggregation is activated in Phase 3.
          </span>
        </div>

        <div className="stats-grid">
          {statsData.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="stat-card"
            >
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.9)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 0.75rem auto',
                  boxShadow: '0 4px 10px rgba(99, 102, 241, 0.1)',
                }}
              >
                {stat.icon}
              </div>
              <div className="stat-number">{stat.number}</div>
              <div className="stat-label">{stat.label}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{stat.subtext}</div>
              <div className="stat-disclaimer">(Illustrative Target)</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

