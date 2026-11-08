import React from 'react';
import { motion } from 'framer-motion';
import {
  Star,
  CheckCircle2,
  Calendar,
  Monitor,
  ArrowLeftRight,
  User,
  Send,
  Sparkles,
} from 'lucide-react';

export default function StudentCard({
  student,
  onViewProfile,
  onSendRequest,
}) {
  const match = student.match || {};
  const isReciprocal = match.isReciprocalMatch;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      className={`student-card ${isReciprocal ? 'is-reciprocal' : ''}`}
    >
      {/* Reciprocal Banner Tag */}
      {isReciprocal && (
        <div className="reciprocal-badge-tag">
          <Sparkles size={12} />
          <span>100% Reciprocal Swap Match</span>
        </div>
      )}

      {/* Top Profile Header */}
      <div className="student-card-top">
        <div className="student-avatar-wrapper">
          {student.avatarUrl ? (
            <img
              src={student.avatarUrl}
              alt={student.fullName}
              className="student-avatar"
              loading="lazy"
            />
          ) : (
            <div className="student-avatar-fallback">
              {student.initials || student.fullName?.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>

        <div className="student-info-meta">
          <h3 className="student-card-name" title={student.fullName}>
            {student.fullName}
          </h3>
          <div className="student-card-college" title={student.collegeName}>
            {student.collegeName}
          </div>

          <div className="student-badges-row">
            <span className="student-dept-tag">
              {student.department} • {student.academicYear?.split(' ')[0] || 'UG'}
            </span>
            <span className="student-rating-pill" title={`${student.rating} / 5.0 rating`}>
              <Star size={13} fill="#d97706" color="#d97706" />
              <span>{student.rating.toFixed(1)}</span>
              <span style={{ color: '#92400e', fontWeight: 500 }}>
                ({student.completedSessionsCount} swaps)
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Short Bio */}
      <p className="student-card-bio" title={student.shortBio}>
        {student.shortBio}
      </p>

      {/* Skills They Can Teach */}
      <div className="card-skills-section">
        <div className="card-skills-heading">
          <CheckCircle2 size={13} color="#6366f1" />
          <span>Can Teach:</span>
        </div>
        <div className="card-skills-tags">
          {student.teachingSkills?.map((skill) => {
            const isMatched =
              match.matchedLearningSkillNames?.includes(skill.name) ||
              match.matchedLearningSkills?.some((s) => (typeof s === 'string' ? s === skill.name : s.name === skill.name));
            return (
              <span
                key={skill.name}
                className={`card-skill-tag ${isMatched ? 'matched' : ''}`}
                title={`${skill.category} • ${skill.proficiency}`}
              >
                {isMatched && <Sparkles size={11} color="#6366f1" />}
                {skill.name}
                <span style={{ fontSize: '0.68rem', opacity: 0.75 }}>
                  ({skill.proficiency?.slice(0, 3)})
                </span>
              </span>
            );
          })}
        </div>
      </div>

      {/* Skills They Want To Learn */}
      <div className="card-skills-section">
        <div className="card-skills-heading">
          <ArrowLeftRight size={13} color="#16a34a" />
          <span>Wants to Learn:</span>
        </div>
        <div className="card-skills-tags">
          {student.learningSkills?.map((skill) => {
            const isMatched =
              match.matchedTeachingSkillNames?.includes(skill.name) ||
              match.matchedTeachingSkills?.some((s) => (typeof s === 'string' ? s === skill.name : s.name === skill.name));
            return (
              <span
                key={skill.name}
                className={`card-skill-tag learning ${isMatched ? 'matched' : ''}`}
                title={`${skill.category} • ${skill.proficiency}`}
              >
                {isMatched && <Sparkles size={11} color="#16a34a" />}
                {skill.name}
              </span>
            );
          })}
        </div>
      </div>

      {/* Availability and Learning Mode Row */}
      <div className="student-availability-row">
        <div className="availability-item" title="Preferred Learning Mode">
          <Monitor size={13} color="#6366f1" />
          <span>{student.preferredLearningMode?.split(' ')[0] || 'Online'}</span>
        </div>
        <span>•</span>
        <div className="availability-item" title="Availability Schedule">
          <Calendar size={13} color="#8b5cf6" />
          <span>{student.availabilityType || 'Flexible'}</span>
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="student-card-actions">
        <button
          type="button"
          onClick={() => onViewProfile(student)}
          className="btn-card-profile"
        >
          <User size={15} />
          View Profile
        </button>
        <button
          type="button"
          onClick={() => onSendRequest(student)}
          className="btn-card-request"
        >
          <Send size={15} />
          Send Request
        </button>
      </div>
    </motion.div>
  );
}
