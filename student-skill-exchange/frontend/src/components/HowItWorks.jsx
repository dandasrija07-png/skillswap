import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, SearchCheck, ArrowLeftRight, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      number: '01',
      icon: <UserPlus size={24} />,
      title: 'Create Your Student Profile',
      description:
        'Sign up with your university email. List the technical skills you are confident teaching, alongside the skills you are eager to learn.',
      highlight: 'Set your availability & college branch',
    },
    {
      number: '02',
      icon: <SearchCheck size={24} />,
      title: 'Find Your Mutual Match',
      description:
        'Our relational matching algorithm pairs you with students who want what you teach and offer what you need. Zero guesswork.',
      highlight: 'Review student ratings & exchange history',
    },
    {
      number: '03',
      icon: <ArrowLeftRight size={24} />,
      title: 'Exchange Knowledge in Real Time',
      description:
        'Accept exchange requests, coordinate via real-time Socket.IO chat, schedule learning sprints, and review each other after completion.',
      highlight: '1:1 Peer sessions with zero monetary cost',
    },
  ];

  return (
    <section
      id="how-it-works"
      style={{
        padding: '6rem 1.5rem',
        background: 'linear-gradient(180deg, rgba(248, 250, 252, 0) 0%, rgba(237, 233, 254, 0.45) 50%, rgba(248, 250, 252, 0) 100%)',
      }}
    >
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
        <div className="section-header">
          <span className="section-tag">Simple 3-Step Process</span>
          <h2 className="section-title">
            How <span className="gradient-text">SkillSwap Works</span>
          </h2>
          <p className="section-subtitle">
            No money, no subscriptions. A pure collaborative ecosystem designed specifically for engineering and
            university students.
          </p>
        </div>

        <div className="how-it-works-grid">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              className="saas-card"
              style={{ padding: '2.2rem 1.8rem', position: 'relative' }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.25rem',
                }}
              >
                <div className="step-number-badge">{step.number}</div>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent-lavender-subtle)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid var(--accent-lavender-border)',
                  }}
                >
                  {step.icon}
                </div>
              </div>

              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.75rem' }}>{step.title}</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                {step.description}
              </p>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.8rem',
                  color: 'var(--primary-dark)',
                  fontWeight: 600,
                  backgroundColor: 'rgba(237, 233, 254, 0.6)',
                  padding: '0.5rem 0.8rem',
                  borderRadius: '8px',
                }}
              >
                <CheckCircle2 size={15} color="#10b981" />
                <span>{step.highlight}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

