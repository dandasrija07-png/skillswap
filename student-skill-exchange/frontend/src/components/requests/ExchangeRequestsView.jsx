import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Inbox,
  Send,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  AlertCircle,
  Filter,
} from 'lucide-react';
import RequestCard from './RequestCard.jsx';
import ConfirmDialog from '../common/ConfirmDialog.jsx';
import ScheduleSessionModal from '../sessions/ScheduleSessionModal.jsx';
import {
  getStudentRequests,
  acceptExchangeRequest,
  rejectExchangeRequest,
  cancelExchangeRequest,
} from '../../services/exchangeRequestService.js';

export default function ExchangeRequestsView({
  onTriggerToast,
  onNavigateToMessages,
}) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    sent: [],
    received: [],
    counts: { total: 0, pendingReceived: 0, pendingSent: 0, accepted: 0 },
  });

  // Active tab: 'received' or 'sent'
  const [activeTab, setActiveTab] = useState('received');
  // Status filter: 'All', 'Pending', 'Accepted', 'Rejected', 'Cancelled'
  const [statusFilter, setStatusFilter] = useState('All');

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    action: null, // 'accept', 'reject', 'cancel'
    request: null,
    title: '',
    message: '',
    confirmText: '',
    variant: 'primary',
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [scheduleTarget, setScheduleTarget] = useState(null);

  // Load requests
  const loadRequests = async () => {
    try {
      setLoading(true);
      const res = await getStudentRequests();
      setData(res);
    } catch (err) {
      console.error('Failed to load requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  // Filter requests based on tab and status
  const currentList = activeTab === 'received' ? data.received : data.sent;
  const filteredList = currentList.filter((req) => {
    if (statusFilter === 'All') return true;
    return req.status === statusFilter;
  });

  // Dialog Handlers
  const handleOpenAccept = (req) => {
    setConfirmDialog({
      isOpen: true,
      action: 'accept',
      request: req,
      title: 'Accept Skill Exchange Proposal?',
      message: `You are about to accept the proposal from ${req.senderName}. You will exchange "${req.offeredSkill}" for "${req.requestedSkill}". A shared session will be scheduled!`,
      confirmText: 'Accept Proposal',
      variant: 'success',
    });
  };

  const handleOpenReject = (req) => {
    setConfirmDialog({
      isOpen: true,
      action: 'reject',
      request: req,
      title: 'Decline Skill Exchange Proposal?',
      message: `Are you sure you want to decline this proposal from ${req.senderName}? You can still connect with other peers anytime.`,
      confirmText: 'Decline Proposal',
      variant: 'danger',
    });
  };

  const handleOpenCancel = (req) => {
    setConfirmDialog({
      isOpen: true,
      action: 'cancel',
      request: req,
      title: 'Withdraw Exchange Proposal?',
      message: `Are you sure you want to cancel your proposal to ${req.receiverName}?`,
      confirmText: 'Withdraw Request',
      variant: 'danger',
    });
  };

  // Perform confirmed action
  const handleConfirmAction = async () => {
    const { action, request } = confirmDialog;
    if (!action || !request) return;

    try {
      setActionLoading(true);

      if (action === 'accept') {
        const res = await acceptExchangeRequest(request.id);
        if (onTriggerToast) {
          onTriggerToast({
            type: 'success',
            title: 'Proposal Accepted!',
            message: res.message,
          });
        }
      } else if (action === 'reject') {
        const res = await rejectExchangeRequest(request.id);
        if (onTriggerToast) {
          onTriggerToast({
            type: 'info',
            title: 'Proposal Declined',
            message: res.message,
          });
        }
      } else if (action === 'cancel') {
        const res = await cancelExchangeRequest(request.id);
        if (onTriggerToast) {
          onTriggerToast({
            type: 'info',
            title: 'Proposal Withdrawn',
            message: res.message,
          });
        }
      }

      // Refresh list
      await loadRequests();
      setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
    } catch (err) {
      if (onTriggerToast) {
        onTriggerToast({
          type: 'error',
          title: 'Action Failed',
          message: err.message || 'Could not update request status.',
        });
      }
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      {/* Confirmation Dialog */}
      {/* Schedule Session Modal for Accepted Exchanges */}
      <ScheduleSessionModal
        isOpen={Boolean(scheduleTarget)}
        onClose={() => setScheduleTarget(null)}
        initialPartner={
          scheduleTarget
            ? {
                id: activeTab === 'received' ? scheduleTarget.senderId : scheduleTarget.receiverId,
                fullName: activeTab === 'received' ? scheduleTarget.senderName : scheduleTarget.receiverName,
                name: activeTab === 'received' ? scheduleTarget.senderName : scheduleTarget.receiverName,
                collegeName: activeTab === 'received' ? scheduleTarget.senderCollege : scheduleTarget.receiverCollege,
                avatarUrl: activeTab === 'received' ? scheduleTarget.senderAvatar : scheduleTarget.receiverAvatar,
              }
            : null
        }
        exchangeRequestId={scheduleTarget?.id}
        preselectedTopic={
          scheduleTarget
            ? (activeTab === 'received' ? scheduleTarget.offeredSkill : scheduleTarget.requestedSkill)
            : ''
        }
        preselectedExchangeSkill={
          scheduleTarget
            ? (activeTab === 'received' ? scheduleTarget.requestedSkill : scheduleTarget.offeredSkill)
            : ''
        }
        onSuccess={(newSess, msg) => {
          if (onTriggerToast) {
            onTriggerToast({
              type: 'success',
              title: 'Session Booked!',
              message: msg,
            });
          }
        }}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        variant={confirmDialog.variant}
        isLoading={actionLoading}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Summary Metrics Bar */}
      <div className="requests-metrics-grid">
        <div className="metric-card">
          <div className="metric-icon-box purple">
            <Layers size={24} />
          </div>
          <div className="metric-info">
            <h4>{data.counts.total}</h4>
            <p>Total Proposals</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box amber">
            <Inbox size={24} />
          </div>
          <div className="metric-info">
            <h4>{data.counts.pendingReceived}</h4>
            <p>Pending Review (Incoming)</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box indigo">
            <Send size={24} />
          </div>
          <div className="metric-info">
            <h4>{data.counts.pendingSent}</h4>
            <p>Pending Sent Proposals</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box green">
            <CheckCircle2 size={24} />
          </div>
          <div className="metric-info">
            <h4>{data.counts.accepted}</h4>
            <p>Active Swaps Accepted</p>
          </div>
        </div>
      </div>

      {/* Tabs and Status Filter Bar */}
      <div className="requests-tabs-row">
        {/* Left: Tab selection */}
        <div className="requests-tab-buttons">
          <button
            type="button"
            className={`requests-tab-btn ${activeTab === 'received' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('received');
              setStatusFilter('All');
            }}
          >
            <Inbox size={18} />
            <span>Received Proposals</span>
            <span className="tab-badge">{data.received.length}</span>
          </button>

          <button
            type="button"
            className={`requests-tab-btn ${activeTab === 'sent' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('sent');
              setStatusFilter('All');
            }}
          >
            <Send size={18} />
            <span>Sent Proposals</span>
            <span className="tab-badge">{data.sent.length}</span>
          </button>
        </div>

        {/* Right: Status Filters */}
        <div className="status-filters">
          {['All', 'Pending', 'Accepted', 'Rejected', 'Cancelled'].map((st) => (
            <button
              key={st}
              type="button"
              className={`status-filter-btn ${statusFilter === st ? 'active' : ''}`}
              onClick={() => setStatusFilter(st)}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Requests Content Body */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '2rem 0' }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                height: '140px',
                borderRadius: '16px',
                backgroundColor: '#ede9fe',
                opacity: 0.6,
                animation: 'skeletonPulse 1.5s infinite',
              }}
            />
          ))}
        </div>
      ) : filteredList.length > 0 ? (
        <div className="requests-list">
          <AnimatePresence>
            {filteredList.map((req) => (
              <RequestCard
                key={req.id}
                request={req}
                type={activeTab}
                onAccept={handleOpenAccept}
                onReject={handleOpenReject}
                onCancel={handleOpenCancel}
                onOpenMessage={onNavigateToMessages}
                onScheduleSession={(r) => setScheduleTarget(r)}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        /* Empty State */
        <div className="explore-empty-state">
          <div className="empty-icon-box">
            <Inbox size={28} />
          </div>
          <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
            No {statusFilter !== 'All' ? statusFilter.toLowerCase() : ''} proposals found
          </h4>
          <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
            {activeTab === 'received'
              ? 'When other students want to exchange skills with you, their proposals will appear here.'
              : 'You haven’t sent any proposals in this category yet. Explore campus peers to find a match!'}
          </p>
        </div>
      )}
    </div>
  );
}

