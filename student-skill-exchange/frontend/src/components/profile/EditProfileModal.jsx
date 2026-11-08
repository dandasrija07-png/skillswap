import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  Mail,
  School,
  GraduationCap,
  Calendar,
  MapPin,
  Clock,
  Laptop,
  Image,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { updateProfileData, LEARNING_MODES } from '../../services/profileSkillService.js';

export default function EditProfileModal({ isOpen, onClose, profile, onProfileUpdated }) {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    fullName: profile?.fullName || '',
    email: profile?.email || '',
    collegeName: profile?.collegeName || '',
    department: profile?.department || '',
    academicYear: profile?.academicYear || '',
    shortBio: profile?.shortBio || '',
    location: profile?.location || '',
    preferredLearningMode: profile?.preferredLearningMode || LEARNING_MODES[0],
    availability: profile?.availability || '',
    avatarUrl: profile?.avatarUrl || '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Departments list
  const departments = [
    'Computer Science & Engineering',
    'Information Technology',
    'Artificial Intelligence & Data Science',
    'Electronics & Communication Engineering',
    'Electrical & Electronics Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Biotechnology & Bioinformatics',
    'Design & Human-Computer Interaction',
  ];

  // Academic years
  const academicYears = [
    '1st Year (Freshman)',
    '2nd Year (Sophomore)',
    '3rd Year (Junior)',
    '4th Year (Senior)',
    'Postgraduate / Masters',
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.fullName.trim()) errs.fullName = 'Full name is required.';
    if (!formData.email.trim()) errs.email = 'University email is required.';
    if (!formData.collegeName.trim()) errs.collegeName = 'College name is required.';
    if (!formData.department.trim()) errs.department = 'Department is required.';
    if (!formData.academicYear.trim()) errs.academicYear = 'Academic year is required.';
    if (!formData.location.trim()) errs.location = 'Campus location is required.';
    if (!formData.availability.trim()) errs.availability = 'Availability schedule is required.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const res = await updateProfileData(formData);
      if (onProfileUpdated) {
        onProfileUpdated(res.profile);
      }
      onClose();
    } catch (err) {
      setErrors({ form: err.message || 'Error updating profile.' });
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

          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.35rem', color: '#0f172a' }}>
            Edit Student Profile
          </h2>
          <p style={{ fontSize: '0.86rem', color: '#64748b', marginBottom: '1.5rem' }}>
            Update your academic details, availability, and barter preferences.
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
            {/* Full Name & Email */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label className="auth-label">Full Name *</label>
                <div className="auth-input-wrapper">
                  <User size={16} className="auth-input-icon" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`auth-input ${errors.fullName ? 'has-error' : ''}`}
                  />
                </div>
                {errors.fullName && <div className="auth-field-error"><AlertCircle size={13} /> {errors.fullName}</div>}
              </div>

              <div>
                <label className="auth-label">University Email *</label>
                <div className="auth-input-wrapper">
                  <Mail size={16} className="auth-input-icon" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`auth-input ${errors.email ? 'has-error' : ''}`}
                  />
                </div>
                {errors.email && <div className="auth-field-error"><AlertCircle size={13} /> {errors.email}</div>}
              </div>
            </div>

            {/* College Name */}
            <div style={{ marginBottom: '1rem' }}>
              <label className="auth-label">College / University Name *</label>
              <div className="auth-input-wrapper">
                <School size={16} className="auth-input-icon" />
                <input
                  type="text"
                  name="collegeName"
                  value={formData.collegeName}
                  onChange={handleChange}
                  className={`auth-input ${errors.collegeName ? 'has-error' : ''}`}
                />
              </div>
              {errors.collegeName && <div className="auth-field-error"><AlertCircle size={13} /> {errors.collegeName}</div>}
            </div>

            {/* Department & Academic Year */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label className="auth-label">Department *</label>
                <div className="auth-input-wrapper">
                  <GraduationCap size={16} className="auth-input-icon" />
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className={`auth-input ${errors.department ? 'has-error' : ''}`}
                    style={{ cursor: 'pointer' }}
                  >
                    {departments.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="auth-label">Academic Year *</label>
                <div className="auth-input-wrapper">
                  <Calendar size={16} className="auth-input-icon" />
                  <select
                    name="academicYear"
                    value={formData.academicYear}
                    onChange={handleChange}
                    className={`auth-input ${errors.academicYear ? 'has-error' : ''}`}
                    style={{ cursor: 'pointer' }}
                  >
                    {academicYears.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Location & Preferred Learning Mode */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label className="auth-label">Location / Campus *</label>
                <div className="auth-input-wrapper">
                  <MapPin size={16} className="auth-input-icon" />
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. North Campus • New Delhi"
                    className={`auth-input ${errors.location ? 'has-error' : ''}`}
                  />
                </div>
                {errors.location && <div className="auth-field-error"><AlertCircle size={13} /> {errors.location}</div>}
              </div>

              <div>
                <label className="auth-label">Preferred Learning Mode *</label>
                <div className="auth-input-wrapper">
                  <Laptop size={16} className="auth-input-icon" />
                  <select
                    name="preferredLearningMode"
                    value={formData.preferredLearningMode}
                    onChange={handleChange}
                    className="auth-input"
                    style={{ cursor: 'pointer' }}
                  >
                    {LEARNING_MODES.map((mode) => (
                      <option key={mode} value={mode}>
                        {mode}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Availability */}
            <div style={{ marginBottom: '1rem' }}>
              <label className="auth-label">Availability Schedule *</label>
              <div className="auth-input-wrapper">
                <Clock size={16} className="auth-input-icon" />
                <input
                  type="text"
                  name="availability"
                  value={formData.availability}
                  onChange={handleChange}
                  placeholder="e.g. Weekdays 6-9 PM &amp; Weekends"
                  className={`auth-input ${errors.availability ? 'has-error' : ''}`}
                />
              </div>
              {errors.availability && <div className="auth-field-error"><AlertCircle size={13} /> {errors.availability}</div>}
            </div>

            {/* Profile Photo URL */}
            <div style={{ marginBottom: '1rem' }}>
              <label className="auth-label">Profile Photo URL (Optional)</label>
              <div className="auth-input-wrapper">
                <Image size={16} className="auth-input-icon" />
                <input
                  type="url"
                  name="avatarUrl"
                  value={formData.avatarUrl}
                  onChange={handleChange}
                  placeholder="https://images.unsplash.com/..."
                  className="auth-input"
                />
              </div>
            </div>

            {/* Short Bio */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="auth-label">Short Bio (About your learning &amp; teaching passions)</label>
              <textarea
                name="shortBio"
                value={formData.shortBio}
                onChange={handleChange}
                rows={3}
                placeholder="Share your technical interests and what you look forward to exchanging with peers..."
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  border: '1px solid #ddd6fe',
                  fontSize: '0.88rem',
                  fontFamily: 'inherit',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
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
                style={{ padding: '0.65rem 1.5rem' }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <span>Save Profile</span>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

