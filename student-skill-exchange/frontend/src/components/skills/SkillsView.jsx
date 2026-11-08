import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers,
  Plus,
  Trash2,
  Award,
  TrendingUp,
  Search,
  Filter,
  CheckCircle2,
  Users,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import AddSkillModal from './AddSkillModal.jsx';
import {
  SKILL_CATEGORIES,
  removeTeachingSkill,
  removeLearningSkill,
} from '../../services/profileSkillService.js';

export default function SkillsView({
  teachingSkills = [],
  setTeachingSkills,
  learningSkills = [],
  setLearningSkills,
  onTriggerToast,
}) {
  const [activeSection, setActiveSection] = useState('both'); // 'both', 'teach', 'learn'
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSkillType, setModalSkillType] = useState('teach'); // 'teach' or 'learn'

  // Delete Teaching Skill
  const handleDeleteTeaching = async (skillId, skillName) => {
    try {
      const res = await removeTeachingSkill(skillId);
      if (setTeachingSkills) setTeachingSkills(res.skills);
      if (onTriggerToast) {
        onTriggerToast({
          type: 'info',
          title: 'Skill Removed',
          message: `Removed "${skillName}" from skills you can teach.`,
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Learning Skill
  const handleDeleteLearning = async (skillId, skillName) => {
    try {
      const res = await removeLearningSkill(skillId);
      if (setLearningSkills) setLearningSkills(res.skills);
      if (onTriggerToast) {
        onTriggerToast({
          type: 'info',
          title: 'Skill Goal Removed',
          message: `Removed "${skillName}" from your learning goals.`,
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Skill Added callback
  const handleSkillAdded = (newSkill, isTeaching) => {
    if (isTeaching && setTeachingSkills) {
      setTeachingSkills((prev) => [newSkill, ...prev]);
    } else if (!isTeaching && setLearningSkills) {
      setLearningSkills((prev) => [newSkill, ...prev]);
    }

    if (onTriggerToast) {
      onTriggerToast({
        type: 'success',
        title: 'Skill Saved to Catalog',
        message: `Successfully added "${newSkill.name}" (${newSkill.proficiency}) to your ${
          isTeaching ? 'teaching catalog' : 'learning goals'
        }.`,
      });
    }
  };

  // Filter skills by category
  const filterByCategory = (list) => {
    if (selectedCategory === 'All') return list;
    return list.filter((item) => item.category === selectedCategory);
  };

  const filteredTeaching = filterByCategory(teachingSkills);
  const filteredLearning = filterByCategory(learningSkills);

  // Helper for proficiency badge color class
  const getProficiencyClass = (level) => {
    const l = level?.toLowerCase();
    if (l === 'beginner') return 'proficiency-beginner';
    if (l === 'advanced') return 'proficiency-advanced';
    return 'proficiency-intermediate';
  };

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
      {/* Add Skill Modal */}
      <AddSkillModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        skillType={modalSkillType}
        onSkillAdded={handleSkillAdded}
      />

      {/* Top Banner / Actions Strip */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.75rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
            My Skills Catalog
          </h1>
          <p style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '0.25rem' }}>
            Manage the skills you can mentor fellow students in, alongside technical subjects you want to learn.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button
            type="button"
            onClick={() => {
              setModalSkillType('teach');
              setModalOpen(true);
            }}
            className="btn-primary"
            style={{
              padding: '0.65rem 1.25rem',
              fontSize: '0.88rem',
              background: 'linear-gradient(135deg, #10b981, #059669)',
            }}
          >
            <Plus size={16} /> Add Teaching Skill
          </button>

          <button
            type="button"
            onClick={() => {
              setModalSkillType('learn');
              setModalOpen(true);
            }}
            className="btn-primary"
            style={{ padding: '0.65rem 1.25rem', fontSize: '0.88rem' }}
          >
            <Plus size={16} /> Add Learning Goal
          </button>
        </div>
      </div>

      {/* Filter by Category Bar */}
      <div className="skill-category-filter-strip">
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginRight: '0.25rem' }}>
          Category:
        </span>
        <button
          type="button"
          onClick={() => setSelectedCategory('All')}
          className={`category-chip-btn ${selectedCategory === 'All' ? 'active' : ''}`}
        >
          All Categories
        </button>
        {SKILL_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`category-chip-btn ${selectedCategory === cat ? 'active' : ''}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* SECTION 1: SKILLS I CAN TEACH */}
      <div style={{ marginBottom: '3rem' }}>
        <div className="skills-section-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: '#ecfdf5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Award size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                Skills I Can Teach ({filteredTeaching.length})
              </h2>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Peers can find you in search results and request 1:1 sessions for these skills
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setModalSkillType('teach');
              setModalOpen(true);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#059669',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            <Plus size={15} /> Add Another
          </button>
        </div>

        {filteredTeaching.length === 0 ? (
          <div
            style={{
              padding: '2.5rem',
              textAlign: 'center',
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px dashed #cbd5e1',
              color: '#94a3b8',
            }}
          >
            No teaching skills match "{selectedCategory}". Click "+ Add Teaching Skill" to offer one!
          </div>
        ) : (
          <div className="skills-cards-grid">
            <AnimatePresence>
              {filteredTeaching.map((skill) => (
                <motion.div
                  key={skill.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="skill-card-modern"
                >
                  <div>
                    {/* Header */}
                    <div className="skill-card-header">
                      <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                          {skill.name}
                        </h3>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            color: '#6366f1',
                            display: 'block',
                            marginTop: '0.15rem',
                          }}
                        >
                          {skill.category}
                        </span>
                      </div>

                      <span className={`badge-proficiency ${getProficiencyClass(skill.proficiency)}`}>
                        {skill.proficiency}
                      </span>
                    </div>

                    {/* Description */}
                    <p
                      style={{
                        fontSize: '0.84rem',
                        color: '#475569',
                        lineHeight: 1.55,
                        margin: '0.75rem 0 1.25rem',
                        minHeight: '40px',
                      }}
                    >
                      {skill.description}
                    </p>
                  </div>

                  {/* Footer & Delete Action */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: '1px solid #f1f5f9',
                      paddingTop: '0.85rem',
                      fontSize: '0.76rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#065f46', fontWeight: 600 }}>
                      <Users size={14} />
                      <span>{skill.studentsInterested} peers interested</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteTeaching(skill.id, skill.name)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        padding: '0.3rem',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'color var(--transition-fast)',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
                      title="Delete skill"
                      aria-label={`Remove ${skill.name}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* SECTION 2: SKILLS I WANT TO LEARN */}
      <div>
        <div className="skills-section-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TrendingUp size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                Skills I Want to Learn ({filteredLearning.length})
              </h2>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                We pair these goals with campus peers who can teach you in exchange for your mentorship
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setModalSkillType('learn');
              setModalOpen(true);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            <Plus size={15} /> Add Goal
          </button>
        </div>

        {filteredLearning.length === 0 ? (
          <div
            style={{
              padding: '2.5rem',
              textAlign: 'center',
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px dashed #cbd5e1',
              color: '#94a3b8',
            }}
          >
            No learning goals match "{selectedCategory}". Click "+ Add Learning Goal" to add one!
          </div>
        ) : (
          <div className="skills-cards-grid">
            <AnimatePresence>
              {filteredLearning.map((skill) => (
                <motion.div
                  key={skill.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="skill-card-modern"
                >
                  <div>
                    {/* Header */}
                    <div className="skill-card-header">
                      <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                          {skill.name}
                        </h3>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            color: '#6366f1',
                            display: 'block',
                            marginTop: '0.15rem',
                          }}
                        >
                          {skill.category}
                        </span>
                      </div>

                      <span className={`badge-proficiency ${getProficiencyClass(skill.proficiency)}`}>
                        Target: {skill.proficiency}
                      </span>
                    </div>

                    {/* Description */}
                    <p
                      style={{
                        fontSize: '0.84rem',
                        color: '#475569',
                        lineHeight: 1.55,
                        margin: '0.75rem 0 1.25rem',
                        minHeight: '40px',
                      }}
                    >
                      {skill.description}
                    </p>
                  </div>

                  {/* Footer & Delete Action */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: '1px solid #f1f5f9',
                      paddingTop: '0.85rem',
                      fontSize: '0.76rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#1d4ed8', fontWeight: 600 }}>
                      <Users size={14} />
                      <span>{skill.availableMentors} mentors available</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteLearning(skill.id, skill.name)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        padding: '0.3rem',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'color var(--transition-fast)',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
                      title="Delete goal"
                      aria-label={`Remove ${skill.name}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

