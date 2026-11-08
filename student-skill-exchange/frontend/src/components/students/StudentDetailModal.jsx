import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Star,
  CheckCircle2,
  Calendar,
  Monitor,
  MapPin,
  Sparkles,
  ArrowLeftRight,
  BookOpen,
  GraduationCap,
  Send,
  Award,
} from 'lucide-react';

export default function StudentDetailModal({
  isOpen,
  onClose,
  student,
  onOpenSendRequest,
}) {
  if (!isOpen || !student) return null;

  const match = student.match || {};
  const isReciprocal = match.isReciprocalMatch;

  return (
    <AnimatePresence>
      <div className="modal-overlay" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ duration: 0.2 }}
          className="modal-dialog"
          style={{ maxWidth: '640px' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="modal-close-btn"
            style={{ position: 'absolute', top: '1.25rem', right: '1.25rem' }}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>

          {/* Top Profile Banner */}
          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div style={{ width: '76px', height: '76px', flexShrink: 0 }}>
              {student.avatarUrl ? (
                <img
                  src={student.avatarUrl}
                  alt={student.fullName}
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '20px',
                    objectFit: 'cover',
                    border: '3px solid #ede9fe',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 700,
                  }}
                >
                  {student.initials || student.fullName?.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>

            <div style={{ flex: 1, minWidth: 0, paddingRight: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
                  {student.fullName}
                </h3>
                <span
                  style={{
                    fontSize: '0.75rem',
                    background: '#ede9fe',
                    color: '#6366f1',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '6px',
                    fontWeight: 700,
                  }}
                >
                  Verified Peer
                </span>
              </div>

              <div style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '0.25rem' }}>
                {student.department} • {student.academicYear}
              </div>

              <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <GraduationCap size={14} color="#6366f1" />
                <span>{student.collegeName}</span>
              </div>
            </div>
          </div>

          {/* Stats Badges Row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.75rem',
              background: '#f8fafc',
              padding: '0.85rem',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              marginBottom: '1.5rem',
              textAlign: 'center',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', color: '#d97706', fontWeight: 800, fontSize: '1.1rem' }}>
                <Star size={16} fill="#d97706" /> {student.rating.toFixed(1)}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>({student.reviewsCount || 20} reviews)</div>
            </div>
            <div style={{ borderLeft: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a' }}>
                {student.completedSessionsCount}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Swaps Completed</div>
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#16a34a' }}>
                100%
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Attendance Rate</div>
            </div>
          </div>

          {/* Reciprocal Match Analysis Card */}
          <div
            style={{
              background: isReciprocal
                ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(168, 85, 247, 0.12))'
                : '#f8fafc',
              border: `1px solid ${isReciprocal ? 'rgba(168, 85, 247, 0.35)' : '#e2e8f0'}`,
              borderRadius: '16px',
              padding: '1.1rem',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
              <Sparkles size={16} color="#6366f1" />
              <strong style={{ fontSize: '0.92rem', color: '#0f172a' }}>
                {isReciprocal
                  ? 'Reciprocal Skill Barter Opportunity!'
                  : 'Skill Compatibility Analysis'}
              </strong>
            </div>

            <div style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.5 }}>
              {isReciprocal ? (
                <>
                  You have a <strong>two-way match</strong>! {student.fullName.split(' ')[0]} can teach you{' '}
                  <span style={{ color: '#6366f1', fontWeight: 700 }}>
                    {match.matchedLearningSkills?.map((s) => (typeof s === 'string' ? s : s.name)).join(', ') || 'skills you want'}
                  </span>
                  , and wants to learn{' '}
                  <span style={{ color: '#16a34a', fontWeight: 700 }}>
                    {match.matchedTeachingSkills?.map((s) => (typeof s === 'string' ? s : s.name)).join(', ') || 'skills you teach'}
                  </span>{' '}
                  from you!
                </>
              ) : match.matchedLearningSkills?.length > 0 ? (
                <>
                  {student.fullName.split(' ')[0]} teaches{' '}
                  <span style={{ color: '#6366f1', fontWeight: 700 }}>
                    {match.matchedLearningSkills?.map((s) => (typeof s === 'string' ? s : s.name)).join(', ')}
                  </span>
                  , which matches your current learning goals!
                </>
              ) : (
                'Review skills below to propose a custom mutual peer session.'
              )}
            </div>
          </div>

          {/* Student Bio */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.82rem', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.04em', margin: '0 0 0.4rem 0' }}>
              About
            </h4>
            <p style={{ margin: 0, fontSize: '0.92rem', color: '#334155', lineHeight: 1.6 }}>
              {student.shortBio}
            </p>
          </div>

          {/* Location & Availability info */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '0.85rem',
              marginBottom: '1.5rem',
              fontSize: '0.84rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569' }}>
              <MapPin size={16} color="#6366f1" />
              <span>{student.location || 'Campus Main Campus'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569' }}>
              <Monitor size={16} color="#6366f1" />
              <span>{student.preferredLearningMode}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569' }}>
              <Calendar size={16} color="#8b5cf6" />
              <span>{student.availability}</span>
            </div>
          </div>

          {/* Full Skills Catalog: Teaching */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
              <CheckCircle2 size={15} color="#6366f1" />
              <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>Skills Offered to Teach:</strong>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
              {student.teachingSkills?.map((s) => (
                <span
                  key={s.name}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    backgroundColor: '#ede9fe',
                    color: '#6366f1',
                    border: '1px solid #c4b5fd',
                  }}
                >
                  {s.name} • <span style={{ opacity: 0.8 }}>{s.proficiency}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Full Skills Catalog: Learning */}
          <div style={{ marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
              <ArrowLeftRight size={15} color="#16a34a" />
              <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>Skills Seeking to Learn:</strong>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
              {student.learningSkills?.map((s) => (
                <span
                  key={s.name}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    backgroundColor: '#f0fdf4',
                    color: '#15803d',
                    border: '1px solid #bbf7d0',
                  }}
                >
                  {s.name} • <span style={{ opacity: 0.8 }}>{s.proficiency}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Bottom Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-action-cancel"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenSendRequest(student);
              }}
              className="btn-card-request"
              style={{ padding: '0.65rem 1.35rem' }}
            >
              <Send size={15} />
              Propose Skill Swap
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
