import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Layers, AlertCircle, Loader2, Plus, Sparkles, Check } from 'lucide-react';
import {
  SKILL_CATEGORIES,
  PROFICIENCY_LEVELS,
  addTeachingSkill,
  addLearningSkill,
} from '../../services/profileSkillService.js';

export default function AddSkillModal({ isOpen, onClose, skillType = 'teach', onSkillAdded }) {
  if (!isOpen) return null;

  const isTeaching = skillType === 'teach';

  const [formData, setFormData] = useState({
    name: '',
    category: SKILL_CATEGORIES[0],
    proficiency: 'Intermediate',
    description: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) {
      errs.name = 'Skill name is required.';
    } else if (formData.name.trim().length < 2) {
      errs.name = 'Skill name must be at least 2 characters.';
    }

    if (!formData.category) {
      errs.category = 'Please choose a category.';
    }

    if (!formData.proficiency) {
      errs.proficiency = 'Please choose a proficiency level.';
    }

    if (!formData.description.trim()) {
      errs.description = isTeaching
        ? 'Please describe what topics you can tutor or explain.'
        : 'Please describe what you want to master in this skill.';
    } else if (formData.description.trim().length < 10) {
      errs.description = 'Description must be at least 10 characters.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      let res;
      if (isTeaching) {
        res = await addTeachingSkill(formData);
      } else {
        res = await addLearningSkill(formData);
      }

      if (onSkillAdded) {
        onSkillAdded(res.skill, isTeaching);
      }
      onClose();
    } catch (err) {
      setErrors({ form: err.message || 'Error adding skill.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="profile-modal-overlay" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.2 }}
          className="profile-modal-card"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1.25rem',
              right: '1.25rem',
              background: 'none',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              padding: '0.4rem',
            }}
          >
            <X size={20} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: isTeaching
                  ? 'linear-gradient(135deg, #10b981, #059669)'
                  : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
              }}
            >
              <Plus size={20} />
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
              {isTeaching ? 'Add Skill You Can Teach' : 'Add Skill You Want to Learn'}
            </h2>
          </div>

          <p style={{ fontSize: '0.86rem', color: '#64748b', marginBottom: '1.5rem' }}>
            {isTeaching
              ? 'List your expertise so student peers can send barter exchange requests.'
              : 'Add your learning goal to get matched with campus mentors who can teach you.'}
          </p>

          {errors.form && (
            <div
              style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                padding: '0.65rem 0.9rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                marginBottom: '1rem',
              }}
            >
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Skill Name */}
            <div style={{ marginBottom: '1.1rem' }}>
              <label className="auth-label">Skill Name *</label>
              <div className="auth-input-wrapper">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. React.js, GraphQL, Figma UI, Python, Docker"
                  className={`auth-input ${errors.name ? 'has-error' : ''}`}
                  style={{ paddingLeft: '1rem' }}
                  autoFocus
                />
              </div>
              {errors.name && <div className="auth-field-error"><AlertCircle size={13} /> {errors.name}</div>}
            </div>

            {/* Category Dropdown (All 8 categories) */}
            <div style={{ marginBottom: '1.1rem' }}>
              <label className="auth-label">Skill Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="auth-input"
                style={{ paddingLeft: '1rem', cursor: 'pointer', backgroundColor: '#ffffff' }}
              >
                {SKILL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && <div className="auth-field-error"><AlertCircle size={13} /> {errors.category}</div>}
            </div>

            {/* Proficiency Level Selector */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label className="auth-label">
                <span>{isTeaching ? 'Your Proficiency Level *' : 'Target Proficiency Goal *'}</span>
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem' }}>
                {PROFICIENCY_LEVELS.map((level) => {
                  const isSelected = formData.proficiency === level;
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setFormData({ ...formData, proficiency: level })}
                      style={{
                        padding: '0.65rem 0.5rem',
                        borderRadius: '12px',
                        border: isSelected ? '2px solid #6366f1' : '1px solid #ddd6fe',
                        backgroundColor: isSelected ? '#f5f3ff' : '#ffffff',
                        color: isSelected ? '#4f46e5' : '#475569',
                        fontWeight: isSelected ? 700 : 500,
                        fontSize: '0.84rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.35rem',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {isSelected && <Check size={14} color="#6366f1" />}
                      <span>{level}</span>
                    </button>
                  );
                })}
              </div>
              {errors.proficiency && <div className="auth-field-error"><AlertCircle size={13} /> {errors.proficiency}</div>}
            </div>

            {/* Short Description */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="auth-label">
                <span>Short Description *</span>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Min. 10 characters</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder={
                  isTeaching
                    ? 'Outline the key topics, tools, or concepts you can walk a peer through...'
                    : 'Describe what problems, projects, or topics you want help mastering...'
                }
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  border: errors.description ? '1px solid #ef4444' : '1px solid #ddd6fe',
                  fontSize: '0.88rem',
                  fontFamily: 'inherit',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
              {errors.description && <div className="auth-field-error"><AlertCircle size={13} /> {errors.description}</div>}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="btn-secondary"
                style={{ padding: '0.65rem 1.25rem' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary"
                style={{
                  padding: '0.65rem 1.5rem',
                  background: isTeaching
                    ? 'linear-gradient(135deg, #10b981, #059669)'
                    : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="spin" />
                    <span>Adding Skill...</span>
                  </>
                ) : (
                  <span>Save Skill to Catalog</span>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

