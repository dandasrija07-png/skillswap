import React from 'react';
import { motion } from 'framer-motion';
import { Star, ShieldCheck, Repeat, ArrowRight, MessageSquare, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function FeaturedStudents() {
  const navigate = useNavigate();

  const studentProfiles = [
    {
      id: 'demo-1',
      name: 'Aarav Sharma',
      initials: 'AS',
      role: 'B.Tech CSE • 3rd Year',
      campus: 'Delhi Technological University',
      rating: 4.9,
      reviewsCount: 18,
      completedSwaps: 14,
      teaching: ['React.js', 'TypeScript', 'Tailwind'],
      learning: ['DSA (Trees & DP)', 'C++'],
      avatarColor: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
      bio: 'Front-end enthusiast building modern web applications. Looking to strengthen my DSA problem-solving for placements.',
    },
    {
      id: 'demo-2',
      name: 'Ananya Iyer',
      initials: 'AI',
      role: 'Information Technology • 2nd Year',
      campus: 'Vellore Institute of Technology',
      rating: 5.0,
      reviewsCount: 24,
      completedSwaps: 20,
      teaching: ['Figma Design', 'UI/UX Principles', 'Wireframing'],
      learning: ['Node.js & Express', 'MongoDB'],
      avatarColor: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
      bio: 'Design nerd passionate about accessibility and clean micro-interactions. Want to learn how backend servers operate.',
    },
    {
      id: 'demo-3',
      name: 'Rohan Verma',
      initials: 'RV',
      role: 'Computer Engineering • 4th Year',
      campus: 'BITS Pilani',
      rating: 4.8,
      reviewsCount: 15,
      completedSwaps: 12,
      teaching: ['Python', 'System Design Basics', 'Docker'],
      learning: ['GraphQL', 'Next.js 14'],
      avatarColor: 'linear-gradient(135deg, #3b82f6, #6366f1)',
      bio: 'Senior student with internship experience. Happy to mentor juniors on clean code architecture in exchange for Next.js.',
    },
    {
      id: 'demo-4',
      name: 'Sneha Patel',
      initials: 'SP',
      role: 'Data Science & CSE • 3rd Year',
      campus: 'National Institute of Technology',
      rating: 4.9,
      reviewsCount: 22,
      completedSwaps: 17,
      teaching: ['C++ STL', 'Competitive Programming'],
      learning: ['Data Analytics', 'Pandas & SQL'],
      avatarColor: 'linear-gradient(135deg, #10b981, #06b6d4)',
      bio: 'Active Codeforces specialist (Candidate Master track). Ready to coach algorithmic logic for structured database querying.',
    },
  ];

  return (
    <section id="featured-students" style={{ padding: '6rem 1.5rem', maxWidth: '1240px', margin: '0 auto' }}>
      <div className="section-header">
        <span className="section-tag">Peer Community</span>
        <h2 className="section-title">
          Featured <span className="gradient-text">Student Mentors</span>
        </h2>
        <p className="section-subtitle">
          Connect with top-rated peers who are actively offering technical guidance and looking for complementary skills.
        </p>

        {/* Demo profiles notice */}
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
          <span>Fictional demo profiles displayed for interface showcase</span>
        </div>
      </div>

      <div className="students-grid">
        {studentProfiles.map((student, idx) => (
          <motion.div
            key={student.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: idx * 0.1 }}
            className="saas-card"
            style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
          >
            <div>
              {/* Header with Avatar & Details */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
                <div
                  className="student-avatar"
                  style={{ background: student.avatarColor, color: '#ffffff', textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}
                >
                  {student.initials}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>{student.name}</h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{student.role}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 500 }}>{student.campus}</div>
                </div>
              </div>

              {/* Rating & Swaps */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.45rem 0.75rem',
                  backgroundColor: 'rgba(245, 243, 255, 0.6)',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  fontSize: '0.8rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#b45309', fontWeight: 700 }}>
                  <Star size={14} fill="#f59e0b" color="#f59e0b" />
                  <span>{student.rating}</span>
                  <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>({student.reviewsCount})</span>
                </div>
                <div style={{ color: 'var(--text-dim)' }}>•</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--primary-dark)', fontWeight: 600 }}>
                  <Repeat size={13} />
                  <span>{student.completedSwaps} Swaps Done</span>
                </div>
              </div>

              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                "{student.bio}"
              </p>

              {/* Teaching Tags */}
              <div style={{ marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#065f46', display: 'block', marginBottom: '0.3rem' }}>
                  CAN TEACH:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {student.teaching.map((tSkill, tIdx) => (
                    <span key={tIdx} className="skill-tag tag-teaching">
                      {tSkill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Learning Tags */}
              <div style={{ marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#1e40af', display: 'block', marginBottom: '0.3rem' }}>
                  WANTS TO LEARN:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {student.learning.map((lSkill, lIdx) => (
                    <span key={lIdx} className="skill-tag tag-learning">
                      {lSkill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Action CTA */}
            <button
              type="button"
              onClick={() => navigate('/students')}
              className="btn-secondary"
              style={{ width: '100%', padding: '0.65rem 1rem', fontSize: '0.85rem' }}
            >
              <MessageSquare size={15} />
              <span>Request Skill Swap</span>
            </button>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

