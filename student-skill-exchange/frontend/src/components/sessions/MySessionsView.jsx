import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  Video,
  Layers,
  Coins,
  List,
  CalendarDays,
  AlertTriangle,
} from 'lucide-react';
import SessionCard from './SessionCard.jsx';
import ScheduleSessionModal from './ScheduleSessionModal.jsx';
import RescheduleSessionModal from './RescheduleSessionModal.jsx';
import SessionCalendarView from './SessionCalendarView.jsx';
import ConfirmDialog from '../common/ConfirmDialog.jsx';
import {
  getStudentSessions,
  confirmSessionCompletion,
  cancelSession,
} from '../../services/sessionService.js';

export default function MySessionsView({
  onTriggerToast,
  onCreditUpdate,
  prefilledPartner = null,
  prefilledExchangeId = null,
}) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    all: [],
    upcoming: [],
    awaiting: [],
    completed: [],
    cancelled: [],
    creditsBalance: 18,
    counts: { total: 0, upcoming: 0, awaiting: 0, completed: 0, cancelled: 0 },
  });

  // Filter tab: 'All', 'Upcoming', 'AwaitingConfirmation', 'Completed', 'Cancelled'
  const [activeTab, setActiveTab] = useState('All');
  // View mode: 'list' or 'calendar'
  const [viewMode, setViewMode] = useState('list');

  // Modals state
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [rescheduleSessionTarget, setRescheduleSessionTarget] = useState(null);

  // Dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    action: null, // 'complete' or 'cancel'
    session: null,
    title: '',
    message: '',
    confirmText: '',
    variant: 'primary',
  });
  const [dialogLoading, setDialogLoading] = useState(false);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const res = await getStudentSessions();
      setData(res);
      if (onCreditUpdate) {
        onCreditUpdate(res.creditsBalance);
      }
    } catch (err) {
      console.error('Failed to load student sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  // Filtered sessions
  const getFilteredSessions = () => {
    if (activeTab === 'All') return data.all;
    if (activeTab === 'Upcoming') return data.upcoming;
    if (activeTab === 'AwaitingConfirmation') return data.awaiting;
    if (activeTab === 'Completed') return data.completed;
    if (activeTab === 'Cancelled') return data.cancelled;
    return data.all;
  };

  const filteredSessions = getFilteredSessions();

  // Completion Dialog Handler
  const handleOpenComplete = (sess) => {
    setConfirmDialog({
      isOpen: true,
      action: 'complete',
      session: sess,
      title: 'Confirm Session Completion?',
      message: `Have you finished your learning session on "${sess.topic}" with ${sess.partnerName}? Both students must confirm completion before exchange credits are awarded to your wallet.`,
      confirmText: 'Confirm Completion',
      variant: 'success',
    });
  };

  // Cancel Dialog Handler
  const handleOpenCancel = (sess) => {
    setConfirmDialog({
      isOpen: true,
      action: 'cancel',
      session: sess,
      title: 'Cancel Learning Session?',
      message: `Are you sure you want to cancel the session with ${sess.partnerName} scheduled for ${sess.sessionDate} at ${sess.startTime}?`,
      confirmText: 'Cancel Session',
      variant: 'danger',
    });
  };

  // Perform dialog action
  const handleConfirmAction = async () => {
    const { action, session } = confirmDialog;
    if (!action || !session) return;

    try {
      setDialogLoading(true);

      if (action === 'complete') {
        const res = await confirmSessionCompletion(session.id);
        if (onTriggerToast) {
          onTriggerToast({
            type: res.isFullyCompleted ? 'success' : 'info',
            title: res.isFullyCompleted ? 'Session Complete & Credits Awarded!' : 'Confirmation Logged',
            message: res.message,
          });
        }
      } else if (action === 'cancel') {
        const res = await cancelSession({
          sessionId: session.id,
          reason: 'Student cancelled via dashboard',
        });
        if (onTriggerToast) {
          onTriggerToast({
            type: 'info',
            title: 'Session Cancelled',
            message: res.message,
          });
        }
      }

      await loadSessions();
      setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
    } catch (err) {
      if (onTriggerToast) {
        onTriggerToast({
          type: 'error',
          title: 'Action Error',
          message: err.message || 'Could not update session.',
        });
      }
    } finally {
      setDialogLoading(false);
    }
  };

  const handleJoinMeeting = (sess) => {
    if (sess.locationOrLink && sess.locationOrLink.startsWith('http')) {
      window.open(sess.locationOrLink, '_blank', 'noopener,noreferrer');
    } else {
      if (onTriggerToast) {
        onTriggerToast({
          type: 'info',
          title: 'Virtual Room Simulated',
          message: `Opening room: ${sess.locationOrLink}. Socket.IO WebRTC activates in real-time phase.`,
        });
      }
    }
  };

  return (
    <div>
      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        variant={confirmDialog.variant}
        isLoading={dialogLoading}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Schedule Modal */}
      <ScheduleSessionModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        initialPartner={prefilledPartner}
        exchangeRequestId={prefilledExchangeId}
        onSuccess={(newSess, msg) => {
          loadSessions();
          if (onTriggerToast) {
            onTriggerToast({
              type: 'success',
              title: 'Session Booked!',
              message: msg,
            });
          }
        }}
      />

      {/* Reschedule Modal */}
      <RescheduleSessionModal
        isOpen={Boolean(rescheduleSessionTarget)}
        onClose={() => setRescheduleSessionTarget(null)}
        session={rescheduleSessionTarget}
        onSuccess={(updated, msg) => {
          loadSessions();
          if (onTriggerToast) {
            onTriggerToast({
              type: 'success',
              title: 'Session Rescheduled',
              message: msg,
            });
          }
        }}
      />

      {/* Top Summary Metrics */}
      <div className="sessions-metrics-grid">
        <div className="session-metric-card">
          <div className="session-metric-icon indigo">
            <Layers size={24} />
          </div>
          <div className="session-metric-info">
            <h4>{data.counts.total}</h4>
            <p>Total Booked Sessions</p>
          </div>
        </div>

        <div className="session-metric-card">
          <div className="session-metric-icon amber">
            <Clock size={24} />
          </div>
          <div className="session-metric-info">
            <h4>{data.counts.upcoming + data.counts.awaiting}</h4>
            <p>Upcoming &amp; In-Review</p>
          </div>
        </div>

        <div className="session-metric-card">
          <div className="session-metric-icon green">
            <CheckCircle2 size={24} />
          </div>
          <div className="session-metric-info">
            <h4>{data.counts.completed}</h4>
            <p>Completed Learning Swaps</p>
          </div>
        </div>

        <div className="session-metric-card">
          <div className="session-metric-icon purple">
            <Coins size={24} />
          </div>
          <div className="session-metric-info">
            <h4>{data.creditsBalance}</h4>
            <p>Available Learning Credits</p>
          </div>
        </div>
      </div>

      {/* Controls Bar: Filter Tabs & Actions */}
      <div className="sessions-controls-bar">
        {/* Filter Tabs */}
        <div className="sessions-filter-tabs">
          <button
            type="button"
            className={`session-tab-btn ${activeTab === 'All' ? 'active' : ''}`}
            onClick={() => setActiveTab('All')}
          >
            <span>All</span>
            <span className="session-badge-count">{data.counts.total}</span>
          </button>

          <button
            type="button"
            className={`session-tab-btn ${activeTab === 'Upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('Upcoming')}
          >
            <Calendar size={14} />
            <span>Upcoming</span>
            <span className="session-badge-count">{data.counts.upcoming}</span>
          </button>

          <button
            type="button"
            className={`session-tab-btn ${activeTab === 'AwaitingConfirmation' ? 'active' : ''}`}
            onClick={() => setActiveTab('AwaitingConfirmation')}
          >
            <Clock size={14} />
            <span>Awaiting Confirmation</span>
            <span className="session-badge-count">{data.counts.awaiting}</span>
          </button>

          <button
            type="button"
            className={`session-tab-btn ${activeTab === 'Completed' ? 'active' : ''}`}
            onClick={() => setActiveTab('Completed')}
          >
            <CheckCircle2 size={14} />
            <span>Completed</span>
            <span className="session-badge-count">{data.counts.completed}</span>
          </button>

          <button
            type="button"
            className={`session-tab-btn ${activeTab === 'Cancelled' ? 'active' : ''}`}
            onClick={() => setActiveTab('Cancelled')}
          >
            <XCircle size={14} />
            <span>Cancelled</span>
            <span className="session-badge-count">{data.counts.cancelled}</span>
          </button>
        </div>

        {/* Right Action Group: View Toggle + Book Session CTA */}
        <div className="sessions-action-group">
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <button
              type="button"
              className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <List size={16} />
              <span>List</span>
            </button>
            <button
              type="button"
              className={`view-toggle-btn ${viewMode === 'calendar' ? 'active' : ''}`}
              onClick={() => setViewMode('calendar')}
              title="Calendar View"
            >
              <CalendarDays size={16} />
              <span>Calendar</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsScheduleOpen(true)}
            className="btn-book-session"
          >
            <Plus size={16} />
            Schedule Session
          </button>
        </div>
      </div>

      {/* Main Content Body */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '2rem 0' }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                height: '160px',
                borderRadius: '20px',
                backgroundColor: '#ede9fe',
                opacity: 0.6,
                animation: 'skeletonPulse 1.5s infinite',
              }}
            />
          ))}
        </div>
      ) : viewMode === 'calendar' ? (
        /* Calendar View */
        <SessionCalendarView
          sessions={data.all}
          onSelectSession={(sess) => {
            // Find and switch to list view for this session
            setActiveTab('All');
            setViewMode('list');
          }}
        />
      ) : filteredSessions.length > 0 ? (
        /* List View */
        <div className="sessions-list-grid">
          <AnimatePresence>
            {filteredSessions.map((sess) => (
              <SessionCard
                key={sess.id}
                session={sess}
                onJoinMeeting={handleJoinMeeting}
                onOpenReschedule={(s) => setRescheduleSessionTarget(s)}
                onOpenCancel={handleOpenCancel}
                onConfirmComplete={handleOpenComplete}
                onBookNext={() => setIsScheduleOpen(true)}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        /* Empty State */
        <div className="explore-empty-state">
          <div className="empty-icon-box">
            <Calendar size={32} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
            No {activeTab !== 'All' ? activeTab.toLowerCase() : ''} sessions found
          </h3>
          <p style={{ fontSize: '0.9rem', color: '#64748b', margin: '0 0 1.5rem 0' }}>
            {activeTab === 'Upcoming'
              ? 'You have no pending upcoming sessions. Accept an exchange proposal or schedule a new session with a campus peer!'
              : 'Keep exchanging skills to build up your session history and credit balance.'}
          </p>
          <button
            type="button"
            onClick={() => setIsScheduleOpen(true)}
            className="btn-card-request"
            style={{ margin: '0 auto' }}
          >
            <Plus size={16} />
            Schedule a New Session
          </button>
        </div>
      )}
    </div>
  );
}

