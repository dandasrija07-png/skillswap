import React from 'react';
import { motion } from 'framer-motion';
import {
  Coins,
  ShieldCheck,
  Radio,
  Award,
  CalendarCheck,
  HeartHandshake,
  Cpu,
  GraduationCap,
} from 'lucide-react';

export default function WhyChooseUs() {
  const reasons = [
    {
      icon: <Coins size={24} />,
      title: '100% Free Peer Learning',
      description:
        'Zero course fees or subscription paywalls. Learn top-tier programming and engineering skills through genuine mutual barter.',
    },
    {
      icon: <ShieldCheck size={24} />,
      title: 'University Verified Students',
      description:
        'Every profile is tied to a student identity, fostering a safe, respectful, and supportive academic community.',
    },
    {
      icon: <Radio size={24} />,
      title: 'Real-Time Direct Chat',
      description:
        'Coordinate sessions instantly with built-in Socket.IO messaging. Share resource links, code snippets, and meeting times.',
    },
    {
      icon: <Award size={24} />,
      title: 'Peer Reviews & Badges',
      description:
        'Earn credibility stars and swap completion badges on your profile to showcase collaborative leadership on your resume.',
    },
    {
      icon: <CalendarCheck size={24} />,
      title: 'Structured Learning Goals',
      description:
        'Set bilateral swap objectives—such as "Master Dynamic Programming in 3 weeks while tutoring CSS Grid"—to stay accountable.',
    },
    {
      icon: <Cpu size={24} />,
      title: 'Zero AI Generated Hallucinations',
      description:
        'Built with traditional deterministic JavaScript and MySQL logic. You interact directly with actual human student brains.',
    },
  ];

  return (
    <section
      id="about"
      style={{
        padding: '6rem 1.5rem',
        background: 'linear-gradient(180deg, rgba(248, 250, 252, 0) 0%, rgba(237, 233, 254, 0.35) 100%)',
      }}
    >
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
        <div className="section-header">
          <span className="section-tag">Value Proposition</span>
          <h2 className="section-title">
            Why Choose <span className="gradient-text">SkillSwap?</span>
          </h2>
          <p className="section-subtitle">
            Engineered specifically to solve the isolation and exorbitant expenses students face while trying to level up
            practical skills.
          </p>
        </div>

        <div className="features-grid">
          {reasons.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: idx * 0.08 }}
              className="saas-card"
              style={{ padding: '1.85rem' }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--accent-lavender)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                {item.icon}
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.65rem' }}>{item.title}</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

