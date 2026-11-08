import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Calendar,
  Clock,
  Video,
  MapPin,
  Sparkles,
  BookOpen,
  ArrowLeftRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { scheduleSession, calculateEndTime } from '../../services/sessionService.js';
import { DEMO_STUDENTS } from '../../services/studentService.js';

export default function ScheduleSessionModal({
  isOpen,
  onClose,
  onSuccess,
  initialPartner = null,
  exchangeRequestId = null,
  preselectedTopic = '',
  preselectedExchangeSkill = '',
}) {
  const [partner, setPartner] = useState(initialPartner);
  const [topic, setTopic] = useState(preselectedTopic);
  const [exchangeSkill, setExchangeSkill] = useState(preselectedExchangeSkill);

  // Today in YYYY-MM-DD format for min date
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 24 * 3600 * 1000);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const [sessionDate, setSessionDate] = useState(tomorrowStr);
  const [startTime, setStartTime] = useState('16:00');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [mode, setMode] = useState('Online');
  const [locationOrLink, setLocationOrLink] = useState('');
  const [agendaNotes, setAgendaNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Pre-populate when initialPartner or props change
  useEffect(() => {
    if (initialPartner) {
      setPartner(initialPartner);
    } else if (DEMO_STUDENTS.length > 0) {
      setPartner(DEMO_STUDENTS[0]);
    }

    if (preselectedTopic) {
      setTopic(preselectedTopic);
    } else if (initialPartner?.teachingSkills?.[0]?.name) {
      setTopic(initialPartner.teachingSkills[0].name);
    }

    if (preselectedExchangeSkill) {
      setExchangeSkill(preselectedExchangeSkill);
    }
  }, [isOpen, initialPartner, preselectedTopic, preselectedExchangeSkill]);

  if (!isOpen) return null;

  const calculatedEnd = calculateEndTime(startTime, durationMinutes);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!partner) {
      setError('Please select a learning partner.');
      return;
    }
    if (!topic.trim()) {
      setError('Please provide a learning topic.');
      return;
    }
    if (!sessionDate) {
      setError('Please choose a session date.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await scheduleSession({
        partnerId: partner.id,
        partnerName: partner.fullName || partner.name,
        partnerCollege: partner.collegeName || partner.college,
        partnerAvatar: partner.avatarUrl || null,
        exchangeRequestId,
        topic: topic.trim(),
        exchangeSkill: exchangeSkill.trim() || 'Reciprocal Mentoring',
        sessionDate,
        startTime,
        durationMinutes,
        mode,
        locationOrLink,
        agendaNotes,
      });

      if (onSuccess) {
        onSuccess(res.session, res.message);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to schedule session.');
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
          style={{ maxWidth: '620px' }}
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
                <Calendar size={14} /> Peer Learning Calendar
              </span>
              <h3 className="modal-title">Schedule Learning Session</h3>
            </div>
            {!submitting && (
              <button
                type="button"
                onClick={onClose}
                className="modal-close-btn"
                aria-label="Close scheduling modal"
              >
                <X size={20} />
              </button>
            )}
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

          <form onSubmit={handleSubmit}>
            {/* 1. Partner Selection */}
            <div className="modal-form-group">
              <label className="modal-label">1. Learning Partner</label>
              {initialPartner ? (
                <div className="recipient-preview-card" style={{ marginBottom: 0 }}>
                  {initialPartner.avatarUrl ? (
                    <img
                      src={initialPartner.avatarUrl}
                      alt={initialPartner.fullName}
                      className="request-avatar"
                    />
                  ) : (
                    <div className="request-avatar-fallback">
                      {initialPartner.initials || initialPartner.fullName?.slice(0, 2).toUpperCase() || 'ST'}
                    </div>
                  )}
                  <div>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>
                      {initialPartner.fullName || initialPartner.name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      {initialPartner.department || 'B.Tech CSE'} • {initialPartner.collegeName || initialPartner.college}
                    </div>
                  </div>
                </div>
              ) : (
                <select
                  className="modal-select"
                  value={partner?.id || ''}
                  onChange={(e) => {
                    const found = DEMO_STUDENTS.find((s) => s.id === e.target.value);
                    setPartner(found);
                    if (found?.teachingSkills?.[0]?.name) {
                      setTopic(found.teachingSkills[0].name);
                    }
                  }}
                  required
                >
                  {DEMO_STUDENTS.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.fullName} — {st.department} ({st.collegeName})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* 2. Topic & Mutual Exchange */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="modal-form-group">
                <label className="modal-label" htmlFor="learning-topic-input">
                  2. Learning Focus / Topic
                </label>
                <input
                  id="learning-topic-input"
                  type="text"
                  className="modal-input"
                  placeholder="e.g. React Custom Hooks"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  required
                />
              </div>

              <div className="modal-form-group">
                <label className="modal-label" htmlFor="exchange-skill-input">
                  Complementary Skill Traded
                </label>
                <input
                  id="exchange-skill-input"
                  type="text"
                  className="modal-input"
                  placeholder="e.g. Figma Tokens or DSA"
                  value={exchangeSkill}
                  onChange={(e) => setExchangeSkill(e.target.value)}
                />
              </div>
            </div>

            {/* 3. Date, Time & Duration */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '0.85rem' }}>
              <div className="modal-form-group">
                <label className="modal-label" htmlFor="session-date-picker">
                  3. Date (No Past Dates)
                </label>
                <input
                  id="session-date-picker"
                  type="date"
                  className="modal-input"
                  min={todayStr}
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  required
                />
              </div>

              <div className="modal-form-group">
                <label className="modal-label" htmlFor="session-start-time">
                  Start Time
                </label>
                <input
                  id="session-start-time"
                  type="time"
                  className="modal-input"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>

              <div className="modal-form-group">
                <label className="modal-label" htmlFor="session-duration-select">
                  Duration
                </label>
                <select
                  id="session-duration-select"
                  className="modal-select"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10))}
                >
                  <option value={30}>30 mins</option>
                  <option value={45}>45 mins</option>
                  <option value={60}>60 mins (1 hr)</option>
                  <option value={90}>90 mins (1.5 hrs)</option>
                  <option value={120}>120 mins (2 hrs)</option>
                </select>
              </div>
            </div>

            {/* Calculated Slot Preview */}
            <div
              style={{
                fontSize: '0.8rem',
                color: '#6366f1',
                fontWeight: 600,
                marginTop: '-0.5rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <Clock size={13} />
              <span>
                Scheduled Window: {startTime} to {calculatedEnd} ({durationMinutes} mins)
              </span>
            </div>

            {/* 4. Session Mode (Online vs In-Person) */}
            <div className="modal-form-group">
              <label className="modal-label">4. Session Mode</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '0.75rem' }}>
                <button
                  type="button"
                  className={`view-toggle-btn ${mode === 'Online' ? 'active' : ''}`}
                  onClick={() => setMode('Online')}
                  style={{ justifyContent: 'center', padding: '0.7rem' }}
                >
                  <Video size={16} /> Online (Video Call & Code Share)
                </button>
                <button
                  type="button"
                  className={`view-toggle-btn ${mode === 'In-Person' ? 'active' : ''}`}
                  onClick={() => setMode('In-Person')}
                  style={{ justifyContent: 'center', padding: '0.7rem' }}
                >
                  <MapPin size={16} /> In-Person (Campus Meetup)
                </button>
              </div>

              {mode === 'Online' ? (
                <div>
                  <input
                    type="text"
                    className="modal-input"
                    placeholder="Enter Google Meet/Zoom link (or leave blank to auto-generate)"
                    value={locationOrLink}
                    onChange={(e) => setLocationOrLink(e.target.value)}
                  />
                  <small style={{ color: '#64748b', fontSize: '0.76rem', display: 'block', marginTop: '0.25rem' }}>
                    Leave blank to auto-create a SkillSwap virtual study room.
                  </small>
                </div>
              ) : (
                <div>
                  <input
                    type="text"
                    className="modal-input"
                    placeholder="e.g. Central Campus Library, 2nd Floor Study Pod 4"
                    value={locationOrLink}
                    onChange={(e) => setLocationOrLink(e.target.value)}
                    required
                  />
                  <small style={{ color: '#64748b', fontSize: '0.76rem', display: 'block', marginTop: '0.25rem' }}>
                    Specify safe public campus location accessible to both students.
                  </small>
                </div>
              )}
            </div>

            {/* 5. Agenda Notes */}
            <div className="modal-form-group">
              <label className="modal-label" htmlFor="agenda-notes-text">
                5. Session Objectives / Agenda (Optional)
              </label>
              <textarea
                id="agenda-notes-text"
                className="modal-textarea"
                rows={2}
                placeholder="Key concepts to cover, GitHub repo links, or preparation notes..."
                value={agendaNotes}
                onChange={(e) => setAgendaNotes(e.target.value)}
              />
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
                    Checking Availability & Scheduling...
                  </>
                ) : (
                  <>
                    <Calendar size={16} />
                    Confirm & Schedule Session
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

