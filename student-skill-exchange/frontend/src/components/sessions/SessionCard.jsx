import React from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Coins,
  AlertTriangle,
  UserCheck,
} from 'lucide-react';

export default function SessionCard({
  session,
  currentUserId = 'student_aarav_01',
  onJoinMeeting,
  onOpenReschedule,
  onOpenCancel,
  onConfirmComplete,
  onBookNext,
}) {
  const isInitiator = session.initiatorId === currentUserId;
  const partnerName = isInitiator ? session.partnerName : session.initiatorName;
  const partnerCollege = isInitiator ? session.partnerCollege : session.initiatorCollege;
  const partnerAvatar = isInitiator ? session.partnerAvatar : session.initiatorAvatar;

  const confirmations = session.completionConfirmations || {
    initiatorConfirmed: false,
    partnerConfirmed: false,
    creditsAwarded: false,
  };

  const userHasConfirmed = isInitiator
    ? confirmations.initiatorConfirmed
    : confirmations.partnerConfirmed;

  const partnerHasConfirmed = isInitiator
    ? confirmations.partnerConfirmed
    : confirmations.initiatorConfirmed;

  const getStatusBadge = () => {
    switch (session.status) {
      case 'Completed':
        return (
          <span className="session-status-pill completed">
            <CheckCircle2 size={13} /> Completed
          </span>
        );
      case 'AwaitingConfirmation':
        return (
          <span className="session-status-pill awaiting">
            <Clock size={13} /> Awaiting Peer Confirmation
          </span>
        );
      case 'Cancelled':
        return (
          <span className="session-status-pill cancelled">
            <XCircle size={13} /> Cancelled
          </span>
        );
      case 'Upcoming':
      default:
        return (
          <span className="session-status-pill upcoming">
            <Calendar size={13} /> Scheduled
          </span>
        );
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="session-card"
    >
      {/* Top Header */}
      <div className="session-card-header">
        <div className="session-partner-info">
          {partnerAvatar ? (
            <img src={partnerAvatar} alt={partnerName} className="session-partner-avatar" />
          ) : (
            <div className="session-partner-fallback">
              {partnerName ? partnerName.slice(0, 2).toUpperCase() : 'ST'}
            </div>
          )}

          <div>
            <h3 className="session-topic-title">{session.topic}</h3>
            <p className="session-partner-meta">
              Partner: <strong>{partnerName}</strong> • {partnerCollege}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <span
            style={{
              fontSize: '0.75rem',
              padding: '0.25rem 0.65rem',
              borderRadius: '6px',
              backgroundColor: session.mode === 'Online' ? '#ede9fe' : '#f0fdf4',
              color: session.mode === 'Online' ? '#6366f1' : '#15803d',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            {session.mode === 'Online' ? <Video size={12} /> : <MapPin size={12} />}
            {session.mode}
          </span>
          {getStatusBadge()}
        </div>
      </div>

      {/* Details Box: Time, Duration & Location */}
      <div className="session-details-box">
        <div className="session-detail-item">
          <div className="session-detail-icon">
            <Calendar size={16} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>SESSION DATE</div>
            <div style={{ fontWeight: 700, color: '#0f172a' }}>{session.sessionDate}</div>
          </div>
        </div>

        <div className="session-detail-item">
          <div className="session-detail-icon">
            <Clock size={16} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>TIME & DURATION</div>
            <div style={{ fontWeight: 700, color: '#0f172a' }}>
              {session.startTime} - {session.endTime} ({session.durationMinutes} mins)
            </div>
          </div>
        </div>

        <div className="session-detail-item" style={{ gridColumn: 'span 2' }}>
          <div className="session-detail-icon">
            {session.mode === 'Online' ? <Video size={16} /> : <MapPin size={16} />}
          </div>
          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
              {session.mode === 'Online' ? 'VIRTUAL ROOM LINK' : 'CAMPUS LOCATION'}
            </div>
            <div
              style={{
                fontWeight: 600,
                color: session.mode === 'Online' ? '#6366f1' : '#0f172a',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              title={session.locationOrLink}
            >
              {session.locationOrLink}
            </div>
          </div>
        </div>
      </div>

      {/* Agenda Notes if present */}
      {session.agendaNotes && (
        <div
          style={{
            fontSize: '0.84rem',
            color: '#475569',
            background: '#ffffff',
            borderLeft: '3px solid #6366f1',
            padding: '0.6rem 0.85rem',
            borderRadius: '0 8px 8px 0',
            marginBottom: '1.25rem',
            lineHeight: 1.5,
          }}
        >
          <strong>Agenda:</strong> {session.agendaNotes}
        </div>
      )}

      {/* Dual Completion Tracker Box */}
      {session.status !== 'Cancelled' && (
        <div className="completion-tracker-box">
          <div className="completion-steps">
            <div className={`completion-step ${userHasConfirmed ? 'done' : 'pending'}`}>
              <CheckCircle2 size={15} color={userHasConfirmed ? '#15803d' : '#b45309'} />
              <span>You: {userHasConfirmed ? 'Confirmed' : 'Pending'}</span>
            </div>
            <span>•</span>
            <div className={`completion-step ${partnerHasConfirmed ? 'done' : 'pending'}`}>
              <CheckCircle2 size={15} color={partnerHasConfirmed ? '#15803d' : '#b45309'} />
              <span>{partnerName.split(' ')[0]}: {partnerHasConfirmed ? 'Confirmed' : 'Pending'}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: '#6366f1', fontWeight: 700 }}>
            <Coins size={14} color="#d97706" />
            <span>
              {confirmations.creditsAwarded
                ? '+1 Credit Awarded to Wallet'
                : '1 Credit Released on Both Confirmations'}
            </span>
          </div>
        </div>
      )}

      {/* Cancelled Notice */}
      {session.status === 'Cancelled' && session.cancellationReason && (
        <div
          style={{
            fontSize: '0.82rem',
            color: '#dc2626',
            backgroundColor: '#fef2f2',
            padding: '0.65rem 0.85rem',
            borderRadius: '10px',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
          }}
        >
          <AlertTriangle size={15} />
          <span>Cancellation reason: {session.cancellationReason}</span>
        </div>
      )}

      {/* Actions Footer */}
      <div className="session-card-footer">
        {/* Left Action: Join Online Meeting or View Map */}
        <div className="session-left-actions">
          {session.status !== 'Cancelled' && session.mode === 'Online' && (
            <button
              type="button"
              onClick={() => onJoinMeeting(session)}
              className="btn-join-room"
            >
              <Video size={15} />
              Join Virtual Study Room
            </button>
          )}

          {session.status === 'Completed' && onBookNext && (
            <button
              type="button"
              onClick={() => onBookNext(session)}
              className="btn-join-room"
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
            >
              <Calendar size={15} />
              Schedule Next Session
            </button>
          )}
        </div>

        {/* Right Actions: Completion, Reschedule, Cancel */}
        <div className="session-right-actions">
          {/* Completion Button */}
          {session.status === 'Upcoming' && (
            <button
              type="button"
              onClick={() => onConfirmComplete(session)}
              className="btn-mark-complete"
            >
              <CheckCircle2 size={15} />
              Mark Completed
            </button>
          )}

          {session.status === 'AwaitingConfirmation' && !userHasConfirmed && (
            <button
              type="button"
              onClick={() => onConfirmComplete(session)}
              className="btn-mark-complete"
              style={{ background: 'linear-gradient(135deg, #d97706, #b45309)' }}
            >
              <CheckCircle2 size={15} />
              Confirm Session Done
            </button>
          )}

          {/* Reschedule Button */}
          {(session.status === 'Upcoming' || session.status === 'AwaitingConfirmation') && (
            <button
              type="button"
              onClick={() => onOpenReschedule(session)}
              className="btn-reschedule"
            >
              <RotateCcw size={14} />
              Reschedule
            </button>
          )}

          {/* Cancel Button */}
          {session.status === 'Upcoming' && (
            <button
              type="button"
              onClick={() => onOpenCancel(session)}
              className="btn-cancel-session"
            >
              <XCircle size={14} />
              Cancel
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

