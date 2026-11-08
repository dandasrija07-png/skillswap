import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeftRight,
  Clock,
  CheckCircle2,
  XCircle,
  Ban,
  Calendar,
  MessageSquare,
  Send,
  User,
} from 'lucide-react';

export default function RequestCard({
  request,
  type = 'received', // 'received' or 'sent'
  onAccept,
  onReject,
  onCancel,
  onOpenMessage,
  onScheduleSession,
}) {
  const isIncoming = type === 'received';
  const peerName = isIncoming ? request.senderName : request.receiverName;
  const peerCollege = isIncoming ? request.senderCollege : request.receiverCollege;
  const peerAvatar = isIncoming ? request.senderAvatar : request.receiverAvatar;
  const peerInitials = isIncoming ? request.senderInitials : request.receiverInitials;

  const status = request.status || 'Pending';

  const getStatusBadge = () => {
    switch (status) {
      case 'Accepted':
        return (
          <span className="status-pill accepted">
            <CheckCircle2 size={13} />
            Accepted
          </span>
        );
      case 'Rejected':
        return (
          <span className="status-pill rejected">
            <XCircle size={13} />
            Declined
          </span>
        );
      case 'Cancelled':
        return (
          <span className="status-pill cancelled">
            <Ban size={13} />
            Cancelled
          </span>
        );
      case 'Pending':
      default:
        return (
          <span className="status-pill pending">
            <Clock size={13} />
            Pending Response
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
      className="request-card"
    >
      {/* Header */}
      <div className="request-card-header">
        <div className="request-peer-info">
          {peerAvatar ? (
            <img src={peerAvatar} alt={peerName} className="request-avatar" />
          ) : (
            <div className="request-avatar-fallback">
              {peerInitials || peerName?.slice(0, 2).toUpperCase() || 'ST'}
            </div>
          )}

          <div className="request-peer-meta">
            <h4>{peerName}</h4>
            <p>{peerCollege}</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{request.createdAt}</span>
          {getStatusBadge()}
        </div>
      </div>

      {/* Visual Skill Swap Grid */}
      <div className="request-swap-box">
        <div className="swap-side">
          <span className="swap-side-label">
            {isIncoming ? `${peerName.split(' ')[0]} Offers:` : 'You Offer to Teach:'}
          </span>
          <span className="swap-skill-value" style={{ color: '#6366f1' }}>
            {request.offeredSkill}
          </span>
        </div>

        <div className="swap-icon-center" title="Mutual Barter">
          <ArrowLeftRight size={18} />
        </div>

        <div className="swap-side">
          <span className="swap-side-label">
            {isIncoming ? 'In Exchange For:' : `${peerName.split(' ')[0]} Teaches You:`}
          </span>
          <span className="swap-skill-value" style={{ color: '#10b981' }}>
            {request.requestedSkill}
          </span>
        </div>
      </div>

      {/* Personal Message & Schedule details */}
      <div className="request-details-body">
        {request.personalMessage && (
          <p className="request-message-quote">
            "{request.personalMessage}"
          </p>
        )}

        <div className="request-meta-row">
          <div className="request-meta-item">
            <Calendar size={14} color="#6366f1" />
            <span>Commitment: <strong>{request.proposedHours}</strong></span>
          </div>
          <div className="request-meta-item">
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              ID: {request.id} (Demo Data)
            </span>
          </div>
        </div>
      </div>

      {/* Footer / Action Buttons */}
      <div className="request-card-footer">
        {status === 'Pending' && isIncoming && (
          <>
            <button
              type="button"
              onClick={() => onReject(request)}
              className="btn-action-reject"
            >
              <XCircle size={15} />
              Decline Proposal
            </button>
            <button
              type="button"
              onClick={() => onAccept(request)}
              className="btn-action-accept"
            >
              <CheckCircle2 size={15} />
              Accept Skill Swap
            </button>
          </>
        )}

        {status === 'Pending' && !isIncoming && (
          <button
            type="button"
            onClick={() => onCancel(request)}
            className="btn-action-cancel"
          >
            <Ban size={15} />
            Withdraw Proposal
          </button>
        )}

        {status === 'Accepted' && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {onScheduleSession && (
              <button
                type="button"
                onClick={() => onScheduleSession(request)}
                className="btn-card-request"
                style={{
                  padding: '0.55rem 1.15rem',
                  fontSize: '0.85rem',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                }}
              >
                <Calendar size={15} />
                Schedule Session
              </button>
            )}
            <button
              type="button"
              onClick={() => onOpenMessage && onOpenMessage(request)}
              className="btn-card-profile"
              style={{ padding: '0.55rem 1.15rem', fontSize: '0.85rem' }}
            >
              <MessageSquare size={15} />
              Open Chat
            </button>
          </div>
        )}

        {(status === 'Rejected' || status === 'Cancelled') && (
          <div style={{ fontSize: '0.82rem', color: '#94a3b8', fontStyle: 'italic' }}>
            {status === 'Rejected'
              ? 'This proposal was declined.'
              : 'This proposal was withdrawn by the sender.'}
          </div>
        )}
      </div>
    </motion.div>
  );
}

