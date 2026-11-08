import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, RotateCcw, AlertCircle, Loader2 } from 'lucide-react';
import { rescheduleSession, calculateEndTime } from '../../services/sessionService.js';

export default function RescheduleSessionModal({
  isOpen,
  onClose,
  session,
  onSuccess,
}) {
  const todayStr = new Date().toISOString().split('T')[0];

  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [reason, setReason] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (session) {
      setNewDate(session.sessionDate || todayStr);
      setNewTime(session.startTime || '16:00');
      setDurationMinutes(session.durationMinutes || 60);
      setReason('');
      setError(null);
    }
  }, [session, isOpen]);

  if (!isOpen || !session) return null;

  const calculatedEnd = calculateEndTime(newTime, durationMinutes);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!newDate) {
      setError('Please select a new session date.');
      return;
    }
    if (!newTime) {
      setError('Please select a new start time.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await rescheduleSession({
        sessionId: session.id,
        newDate,
        newTime,
        durationMinutes,
        reason,
      });

      if (onSuccess) {
        onSuccess(res.session, res.message);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to reschedule session.');
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
          style={{ maxWidth: '520px' }}
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
                  color: '#6366f1',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  marginBottom: '0.25rem',
                }}
              >
                <RotateCcw size={14} /> Schedule Adjustment
              </span>
              <h3 className="modal-title">Reschedule Session</h3>
            </div>
            {!submitting && (
              <button
                type="button"
                onClick={onClose}
                className="modal-close-btn"
                aria-label="Close reschedule modal"
              >
                <X size={20} />
              </button>
            )}
          </div>

          <div
            style={{
              padding: '0.85rem 1rem',
              background: '#f8fafc',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              marginBottom: '1.25rem',
              fontSize: '0.88rem',
            }}
          >
            <div>
              <strong>Topic:</strong> {session.topic}
            </div>
            <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.2rem' }}>
              Current slot: {session.sessionDate} at {session.startTime} - {session.endTime}
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

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.85rem' }}>
              <div className="modal-form-group">
                <label className="modal-label" htmlFor="reschedule-date-picker">
                  New Date
                </label>
                <input
                  id="reschedule-date-picker"
                  type="date"
                  className="modal-input"
                  min={todayStr}
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  required
                />
              </div>

              <div className="modal-form-group">
                <label className="modal-label" htmlFor="reschedule-start-time">
                  New Start Time
                </label>
                <input
                  id="reschedule-start-time"
                  type="time"
                  className="modal-input"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="modal-form-group">
              <label className="modal-label" htmlFor="reschedule-duration">
                Duration
              </label>
              <select
                id="reschedule-duration"
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
                New Window: {newTime} to {calculatedEnd} ({durationMinutes} mins)
              </span>
            </div>

            <div className="modal-form-group">
              <label className="modal-label" htmlFor="reschedule-reason-text">
                Reason for Rescheduling (Optional)
              </label>
              <input
                id="reschedule-reason-text"
                type="text"
                className="modal-input"
                placeholder="e.g. Lab assignment clash or medical leave..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

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
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Checking Conflict & Updating...
                  </>
                ) : (
                  <>
                    <RotateCcw size={16} />
                    Confirm Reschedule
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

