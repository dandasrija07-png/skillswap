import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Send,
  ArrowLeftRight,
  Clock,
  Sparkles,
  BookOpen,
  GraduationCap,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { sendExchangeRequest } from '../../services/exchangeRequestService.js';
import { getTeachingSkills, getProfileData } from '../../services/profileSkillService.js';

export default function SendRequestModal({
  isOpen,
  onClose,
  targetStudent,
  onSuccess,
  preselectedOfferedSkill = '',
  preselectedRequestedSkill = '',
}) {
  const [currentUser, setCurrentUser] = useState(null);
  const [myTeachingSkills, setMyTeachingSkills] = useState([]);
  const [offeredSkill, setOfferedSkill] = useState(preselectedOfferedSkill);
  const [requestedSkill, setRequestedSkill] = useState(preselectedRequestedSkill);
  const [proposedHours, setProposedHours] = useState('2 hrs / weekend');
  const [personalMessage, setPersonalMessage] = useState('');
  const [loadingUserSkills, setLoadingUserSkills] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Load current user profile & skills
  useEffect(() => {
    if (!isOpen) return;
    async function loadUserData() {
      try {
        setLoadingUserSkills(true);
        setError(null);
        const [profile, skills] = await Promise.all([
          getProfileData(),
          getTeachingSkills(),
        ]);
        setCurrentUser(profile);
        setMyTeachingSkills(skills);

        // Prepopulate offered skill if match exists or default to first skill
        if (!offeredSkill && skills.length > 0) {
          setOfferedSkill(skills[0].name);
        }

        // Prepopulate requested skill if not already set
        if (!requestedSkill && targetStudent?.teachingSkills?.length > 0) {
          setRequestedSkill(targetStudent.teachingSkills[0].name);
        }
      } catch (err) {
        console.error('Failed to load user data for exchange modal:', err);
      } finally {
        setLoadingUserSkills(false);
      }
    }
    loadUserData();
  }, [isOpen, targetStudent]);

  if (!isOpen || !targetStudent) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!offeredSkill) {
      setError('Please choose or enter a skill you will teach in return.');
      return;
    }
    if (!requestedSkill) {
      setError('Please choose the skill you wish to learn from this peer.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await sendExchangeRequest({
        senderId: currentUser?.id || 'student_aarav_01',
        senderName: currentUser?.fullName || 'Aarav Sharma',
        senderInitials: currentUser?.initials || 'AS',
        senderCollege: currentUser?.collegeName || 'Delhi Technological University',
        receiverId: targetStudent.id,
        receiverName: targetStudent.fullName,
        receiverInitials: targetStudent.initials,
        receiverCollege: targetStudent.collegeName,
        receiverAvatar: targetStudent.avatarUrl,
        offeredSkill,
        requestedSkill,
        proposedHours,
        personalMessage,
      });

      if (onSuccess) {
        onSuccess(res.request, res.message);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to send exchange proposal. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="modal-overlay" onClick={submitting ? undefined : onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ duration: 0.2 }}
          className="modal-dialog"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="modal-header">
            <div>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#6366f1',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  marginBottom: '0.25rem',
                }}
              >
                <Sparkles size={14} /> Bilateral Skill Exchange
              </span>
              <h3 className="modal-title">Propose Skill Swap</h3>
            </div>
            {!submitting && (
              <button
                type="button"
                onClick={onClose}
                className="modal-close-btn"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* Peer Preview Card */}
          <div className="recipient-preview-card">
            {targetStudent.avatarUrl ? (
              <img
                src={targetStudent.avatarUrl}
                alt={targetStudent.fullName}
                className="request-avatar"
              />
            ) : (
              <div className="request-avatar-fallback">
                {targetStudent.initials || targetStudent.fullName?.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>
                {targetStudent.fullName}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                {targetStudent.department} • {targetStudent.collegeName}
              </div>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                fontSize: '0.86rem',
                marginBottom: '1.25rem',
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <div>{error}</div>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Step 1: What you want to learn from them */}
            <div className="modal-form-group">
              <label className="modal-label" htmlFor="requested-skill-select">
                1. What do you want to learn from {targetStudent.fullName.split(' ')[0]}?
              </label>
              <select
                id="requested-skill-select"
                className="modal-select"
                value={requestedSkill}
                onChange={(e) => setRequestedSkill(e.target.value)}
                required
              >
                {targetStudent.teachingSkills?.map((s) => (
                  <option key={s.name} value={s.name}>
                    {s.name} ({s.proficiency || 'Proficient'})
                  </option>
                ))}
              </select>
            </div>

            {/* Visual Swap indicator */}
            <div style={{ display: 'flex', justifyContent: 'center', margin: '0.5rem 0' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#ede9fe',
                  color: '#6366f1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ArrowLeftRight size={16} />
              </div>
            </div>

            {/* Step 2: What you offer to teach */}
            <div className="modal-form-group">
              <label className="modal-label" htmlFor="offered-skill-select">
                2. What skill will you teach in return?
              </label>
              {loadingUserSkills ? (
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Loading your teaching skills...
                </div>
              ) : myTeachingSkills.length > 0 ? (
                <select
                  id="offered-skill-select"
                  className="modal-select"
                  value={offeredSkill}
                  onChange={(e) => setOfferedSkill(e.target.value)}
                  required
                >
                  {myTeachingSkills.map((s) => (
                    <option key={s.name} value={s.name}>
                      {s.name} ({s.proficiency || 'Intermediate'})
                    </option>
                  ))}
                </select>
              ) : (
                <div>
                  <input
                    type="text"
                    id="offered-skill-select"
                    className="modal-input"
                    placeholder="Enter the skill you can teach..."
                    value={offeredSkill}
                    onChange={(e) => setOfferedSkill(e.target.value)}
                    required
                  />
                  <small style={{ color: '#64748b', fontSize: '0.78rem', marginTop: '0.25rem', display: 'block' }}>
                    Tip: Add skills to "My Skills" to select them automatically in proposals.
                  </small>
                </div>
              )}
            </div>

            {/* Step 3: Proposed Schedule */}
            <div className="modal-form-group">
              <label className="modal-label" htmlFor="proposed-schedule-select">
                3. Proposed Schedule & Commitment
              </label>
              <select
                id="proposed-schedule-select"
                className="modal-select"
                value={proposedHours}
                onChange={(e) => setProposedHours(e.target.value)}
              >
                <option value="2 hrs / weekend">2 hrs / weekend (Saturday/Sunday)</option>
                <option value="1 hr / weekday">1 hr / weekday evening (Mon-Thu)</option>
                <option value="3 hrs / week">3 hrs / week (Split into 2 sessions)</option>
                <option value="Bi-weekly flex sessions">Bi-weekly flex sessions (Exam prep)</option>
                <option value="One-time intensive workshop">One-time intensive workshop (3 hrs)</option>
              </select>
            </div>

            {/* Step 4: Personal Message */}
            <div className="modal-form-group">
              <label className="modal-label" htmlFor="personal-message-text">
                4. Personal Note to {targetStudent.fullName.split(' ')[0]}
              </label>
              <textarea
                id="personal-message-text"
                className="modal-textarea"
                placeholder={`Hi ${targetStudent.fullName.split(' ')[0]}! I noticed you are interested in expanding your skills. I'd love to partner up and practice together...`}
                value={personalMessage}
                onChange={(e) => setPersonalMessage(e.target.value)}
                maxLength={400}
              />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.75rem',
                  color: '#94a3b8',
                  marginTop: '0.25rem',
                }}
              >
                <span>Be polite, introduce your goals, and suggest mutual times.</span>
                <span>{personalMessage.length}/400</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="modal-actions">
              <button
                type="button"
                onClick={onClose}
                className="btn-action-cancel"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-card-request"
                disabled={submitting}
                style={{ padding: '0.65rem 1.4rem', fontSize: '0.92rem' }}
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Sending Proposal...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Send Swap Proposal
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

