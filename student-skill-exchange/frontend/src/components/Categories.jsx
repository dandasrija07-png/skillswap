import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Code2,
  Globe,
  Palette,
  MessageSquare,
  Binary,
  Languages,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export default function Categories() {
  const navigate = useNavigate();

  const categories = [
    {
      id: 'programming',
      name: 'Programming',
      icon: <Code2 size={26} />,
      count: '320+ Students',
      skills: ['Python', 'C++', 'Java', 'Rust', 'Go'],
      description: 'Master core systems programming, object-oriented concepts, and language syntax.',
    },
    {
      id: 'web-dev',
      name: 'Web Development',
      icon: <Globe size={26} />,
      count: '480+ Students',
      skills: ['React', 'Node.js', 'Express', 'Tailwind', 'REST APIs'],
      description: 'Build responsive modern frontends and scalable backend microservices.',
    },
    {
      id: 'design',
      name: 'Design',
      icon: <Palette size={26} />,
      count: '210+ Students',
      skills: ['Figma', 'UI/UX Principles', 'Wireframing', 'Prototyping'],
      description: 'Craft intuitive user interfaces, cohesive design systems, and delightful workflows.',
    },
    {
      id: 'communication',
      name: 'Communication',
      icon: <MessageSquare size={26} />,
      count: '190+ Students',
      skills: ['Placement Mock HR', 'Public Speaking', 'Technical Writing'],
      description: 'Hone soft skills, confidence, behavioral interview prep, and pitching ideas.',
    },
    {
      id: 'data-structures',
      name: 'Data Structures',
      icon: <Binary size={26} />,
      count: '540+ Students',
      skills: ['Graphs', 'Dynamic Programming', 'Trees', 'LeetCode Grind'],
      description: 'Crack algorithmic problem-solving for technical campus recruitment drives.',
    },
    {
      id: 'languages',
      name: 'Languages',
      icon: <Languages size={26} />,
      count: '160+ Students',
      skills: ['English Fluency', 'German', 'Japanese', 'Spanish'],
      description: 'Practice conversational speaking with native and fluent student peers.',
    },
  ];

  const handleCategoryClick = (categoryName) => {
    navigate(`/explore?category=${encodeURIComponent(categoryName)}`);
  };

  return (
    <section id="categories" style={{ padding: '6rem 1.5rem', maxWidth: '1240px', margin: '0 auto' }}>
      <div className="section-header">
        <span className="section-tag">Skill Directory</span>
        <h2 className="section-title">
          Explore Popular <span className="gradient-text">Skill Categories</span>
        </h2>
        <p className="section-subtitle">
          Discover a wide range of peer-taught subjects. Pick what you want to master or share your expertise with
          peers.
        </p>
      </div>

      <div className="categories-grid">
        {categories.map((cat, idx) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: idx * 0.08 }}
            whileHover={{ y: -5 }}
            onClick={() => handleCategoryClick(cat.name)}
            className="saas-card category-card"
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className="category-icon-wrapper">{cat.icon}</div>
                <span className="badge badge-purple" style={{ fontSize: '0.75rem' }}>
                  {cat.count}
                </span>
              </div>

              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 700 }}>{cat.name}</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                {cat.description}
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.5rem' }}>
                {cat.skills.map((skill, sIdx) => (
                  <span
                    key={sIdx}
                    style={{
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      padding: '0.2rem 0.55rem',
                      borderRadius: '6px',
                      background: 'rgba(237, 233, 254, 0.6)',
                      color: 'var(--secondary-dark)',
                      border: '1px solid rgba(221, 214, 254, 0.7)',
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: 'var(--primary)',
                fontWeight: 600,
                fontSize: '0.88rem',
                borderTop: '1px solid rgba(221, 214, 254, 0.4)',
                paddingTop: '0.85rem',
              }}
            >
              <span>Explore {cat.name}</span>
              <ArrowRight size={15} />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

