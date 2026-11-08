import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Award,
  Coins,
  Repeat,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus,
  ArrowLeftRight,
  Star,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  Video,
} from 'lucide-react';
import LearningChart from './LearningChart.jsx';

export default function OverviewTab({
  profile,
  teachingSkills = [],
  setTeachingSkills,
  learningSkills = [],
  setLearningSkills,
  suggestedMatches = [],
  exchangeRequests = [],
  setExchangeRequests,
  upcomingSessions = [],
  activityLog = [],
  weeklyChartData = [],
  onTriggerToast,
  setActiveTab,
}) {
  // Modal state for adding a skill
  const [addSkillModalOpen, setAddSkillModalOpen] = useState(false);
  const [skillType, setSkillType] = useState('teach'); // 'teach' or 'learn'
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('Web Development');

  // Handle Accept incoming request
  const handleAcceptRequest = (reqId, peerName) => {
    if (setExchangeRequests) {
      setExchangeRequests((prev) => prev.filter((r) => r.id !== reqId));
    }
    if (onTriggerToast) {
      onTriggerToast({
        type: 'success',
        title: 'Exchange Request Accepted!',
        message: `You agreed to trade skills with ${peerName}. Scheduled learning session added to calendar.`,
      });
    }
  };

  // Handle Decline incoming request
  const handleDeclineRequest = (reqId, peerName) => {
    if (setExchangeRequests) {
      setExchangeRequests((prev) => prev.filter((r) => r.id !== reqId));
    }
    if (onTriggerToast) {
      onTriggerToast({
        type: 'info',
        title: 'Request Declined',
        message: `Exchange proposal from ${peerName} was declined.`,
      });
    }
  };

  // Handle Cancel outgoing request
  const handleCancelRequest = (reqId, peerName) => {
    if (setExchangeRequests) {
      setExchangeRequests((prev) => prev.filter((r) => r.id !== reqId));
    }
    if (onTriggerToast) {
      onTriggerToast({
        type: 'info',
        title: 'Request Cancelled',
        message: `Your skill exchange request to ${peerName} was withdrawn.`,
      });
    }
  };

  // Handle Send Swap Request to suggested peer
  const handleRequestSuggestedMatch = (match) => {
    if (onTriggerToast) {
      onTriggerToast({
        type: 'success',
        title: 'Swap Request Dispatched',
        message: `Simulated exchange proposal sent to ${match.name} (${match.offers} <-> ${match.wants}).`,
      });
    }
  };

  // Handle Adding Skill
  const handleAddSkillSubmit = (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    if (skillType === 'teach' && setTeachingSkills) {
      setTeachingSkills([
        ...teachingSkills,
        {
          id: `t_${Date.now()}`,
          name: newSkillName.trim(),
          level: 'Intermediate',
          studentsInterested: 1,
          category: newSkillCategory,
        },
      ]);
    } else if (skillType === 'learn' && setLearningSkills) {
      setLearningSkills([
        ...learningSkills,
        {
          id: `l_${Date.now()}`,
          name: newSkillName.trim(),
          priority: 'High',
          availableMentors: 3,
          category: newSkillCategory,
        },
      ]);
    }

    if (onTriggerToast) {
      onTriggerToast({
        type: 'success',
        title: 'Skill Added to Profile',
        message: `Added "${newSkillName}" to ${skillType === 'teach' ? 'teaching' : 'learning'} catalog.`,
      });
    }

    setNewSkillName('');
    setAddSkillModalOpen(false);
  };

  return (
    <div>
      {/* 1. Personalized Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="welcome-banner"
      >
        <div style={{ maxWidth: '640px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.3rem 0.8rem',
              borderRadius: '9999px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              fontSize: '0.78rem',
              fontWeight: 600,
              marginBottom: '0.85rem',
            }}
          >
            <Sparkles size={14} />
            <span>Campus Skill Exchange Active</span>
          </div>

          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '0.5rem', color: '#ffffff' }}>
            Welcome back, {profile?.fullName || 'Aarav'}! 👋
          </h1>
          <p style={{ fontSize: '0.92rem', color: 'rgba(255, 255, 255, 0.9)', lineHeight: 1.5 }}>
            You have <strong>{exchangeRequests.length} pending exchange requests</strong> and{' '}
            <strong>{upcomingSessions.length} upcoming 1:1 sessions</strong> this week at {profile?.collegeName}.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => {
              setSkillType('teach');
              setAddSkillModalOpen(true);
            }}
            className="btn-primary"
            style={{
              backgroundColor: '#ffffff',
              color: '#4f46e5',
              backgroundImage: 'none',
              padding: '0.65rem 1.2rem',
              fontSize: '0.86rem',
              fontWeight: 700,
            }}
          >
            <Plus size={16} /> Offer New Skill
          </button>
          <button
            type="button"
            onClick={() => {
              setSkillType('learn');
              setAddSkillModalOpen(true);
            }}
            className="btn-secondary"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              borderColor: 'rgba(255, 255, 255, 0.35)',
              padding: '0.65rem 1.2rem',
              fontSize: '0.86rem',
            }}
          >
            <Plus size={16} /> Request to Learn
          </button>
        </div>
      </motion.div>

      {/* 2. Key Metrics Row */}
      <div className="stats-cards-row">
        {/* Credit Balance Card */}
        <div className="dashboard-stat-card">
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
              Credit Balance
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', margin: '0.2rem 0' }}>
              {profile?.creditsBalance || 18}{' '}
              <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#6366f1' }}>Credits</span>
            </div>
            <div style={{ fontSize: '0.74rem', color: '#10b981', fontWeight: 600 }}>
              +3 earned from mentoring this week
            </div>
          </div>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: '#f5f3ff',
              color: '#7c3aed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Coins size={24} />
          </div>
        </div>

        {/* Completed Learning Sessions Card */}
        <div className="dashboard-stat-card">
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
              Completed Swaps
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', margin: '0.2rem 0' }}>
              {profile?.completedSwapsCount || 14}{' '}
              <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#64748b' }}>Sessions</span>
            </div>
            <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
              {profile?.totalTeachingHours || 26}h taught • {profile?.totalLearningHours || 21}h learned
            </div>
          </div>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Repeat size={24} />
          </div>
        </div>

        {/* Peer Rating Card */}
        <div className="dashboard-stat-card">
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
              Peer Rating
            </div>
            <div
              style={{
                fontSize: '1.85rem',
                fontWeight: 800,
                color: '#0f172a',
                margin: '0.2rem 0',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <span>{profile?.rating || 4.9}</span>
              <Star size={20} fill="#f59e0b" color="#f59e0b" />
            </div>
            <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
              Based on {profile?.reviewsCount || 18} peer reviews
            </div>
          </div>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: '#fffbeb',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Award size={24} />
          </div>
        </div>

        {/* Pending Requests Card */}
        <div className="dashboard-stat-card">
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
              Pending Requests
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', margin: '0.2rem 0' }}>
              {exchangeRequests.length}{' '}
              <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#6366f1' }}>Awaiting</span>
            </div>
            <div style={{ fontSize: '0.74rem', color: '#4f46e5', fontWeight: 600 }}>Action needed</div>
          </div>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: '#ede9fe',
              color: '#6366f1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ArrowLeftRight size={24} />
          </div>
        </div>
      </div>

      {/* 3. Two-Column Dashboard Content Layout */}
      <div className="dashboard-grid-2col">
        {/* LEFT COLUMN */}
        <div>
          {/* Profile Completion Card */}
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <div className="dashboard-card-title">
                <ShieldCheck size={18} color="#6366f1" />
                <span>Profile Completion</span>
              </div>
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#6366f1' }}>
                {profile?.profileCompletionPercentage || 85}%
              </span>
            </div>

            <div className="profile-progress-bar">
              <div
                className="profile-progress-fill"
                style={{ width: `${profile?.profileCompletionPercentage || 85}%` }}
              />
            </div>

            <div style={{ fontSize: '0.84rem', color: '#475569', marginTop: '0.65rem' }}>
              {profile?.missingProfileItems?.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#b45309' }}>
                  <AlertCircle size={14} />
                  <span>Pending: {item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Exchange Requests Card */}
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <div className="dashboard-card-title">
                <ArrowLeftRight size={18} color="#6366f1" />
                <span>Pending Exchange Requests ({exchangeRequests.length})</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('requests')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                View all
              </button>
            </div>

            {exchangeRequests.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.88rem' }}>
                No pending requests. Browse peers to initiate a swap!
              </div>
            ) : (
              exchangeRequests.map((req) => (
                <div
                  key={req.id}
                  style={{
                    padding: '1rem',
                    borderRadius: '12px',
                    border: '1px solid #ede9fe',
                    backgroundColor: req.type === 'incoming' ? '#fbfbfe' : '#ffffff',
                    marginBottom: '0.75rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.5rem',
                          borderRadius: '6px',
                          backgroundColor: req.type === 'incoming' ? '#ede9fe' : '#eff6ff',
                          color: req.type === 'incoming' ? '#6d28d9' : '#1d4ed8',
                        }}
                      >
                        {req.type === 'incoming' ? 'INCOMING PROPOSAL' : 'OUTGOING REQUEST'}
                      </span>
                      <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>{req.peerName}</strong>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{req.date}</span>
                  </div>

                  <div style={{ fontSize: '0.82rem', color: '#475569', marginBottom: '0.75rem' }}>
                    Offers: <strong style={{ color: '#065f46' }}>{req.offeredSkill}</strong> ➔ Wants:{' '}
                    <strong style={{ color: '#1e40af' }}>{req.requestedSkill}</strong>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    {req.type === 'incoming' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleDeclineRequest(req.id, req.peerName)}
                          className="btn-secondary"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                        >
                          Decline
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAcceptRequest(req.id, req.peerName)}
                          className="btn-primary"
                          style={{ padding: '0.35rem 0.9rem', fontSize: '0.78rem' }}
                        >
                          Accept Swap
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleCancelRequest(req.id, req.peerName)}
                        className="btn-secondary"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', color: '#ef4444' }}
                      >
                        Cancel Request
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Weekly Learning & Teaching Chart Card */}
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <div className="dashboard-card-title">
                <TrendingUp size={18} color="#6366f1" />
                <span>Learning vs. Teaching Hours (This Week)</span>
              </div>
            </div>

            <LearningChart data={weeklyChartData} />
          </div>

          {/* Suggested Student Matches Card */}
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <div className="dashboard-card-title">
                <Sparkles size={18} color="#6366f1" />
                <span>Suggested Student Matches</span>
              </div>
              <span className="badge badge-purple" style={{ fontSize: '0.72rem' }}>
                Algorithmic Barter Match
              </span>
            </div>

            {suggestedMatches.map((m) => (
              <div key={m.id} className="match-card">
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '0.5rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: m.avatarColor,
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                      }}
                    >
                      {m.initials}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.92rem', fontWeight: 700, margin: 0 }}>{m.name}</h4>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                        {m.role} • {m.college}
                      </div>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      color: '#059669',
                      backgroundColor: '#ecfdf5',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '9999px',
                      border: '1px solid #a7f3d0',
                    }}
                  >
                    {m.matchPercentage}% Match
                  </span>
                </div>

                <div
                  style={{
                    fontSize: '0.82rem',
                    color: '#334155',
                    marginBottom: '0.75rem',
                    backgroundColor: '#ffffff',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #f1f5f9',
                  }}
                >
                  <div>
                    Offers: <strong style={{ color: '#065f46' }}>{m.offers}</strong>
                  </div>
                  <div>
                    Wants: <strong style={{ color: '#1e40af' }}>{m.wants}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.78rem', color: '#b45309' }}>
                    <Star size={13} fill="#f59e0b" color="#f59e0b" />
                    <strong>{m.rating}</strong>
                    <span style={{ color: '#94a3b8' }}>({m.swapsCount} swaps)</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRequestSuggestedMatch(m)}
                    className="btn-primary"
                    style={{ padding: '0.35rem 0.85rem', fontSize: '0.78rem' }}
                  >
                    Request Swap
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div>
          {/* Upcoming Sessions Card */}
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <div className="dashboard-card-title">
                <Calendar size={18} color="#6366f1" />
                <span>Upcoming Sessions</span>
              </div>
              <span className="badge badge-purple" style={{ fontSize: '0.72rem' }}>
                {upcomingSessions.length} Confirmed
              </span>
            </div>

            {upcomingSessions.map((sess) => (
              <div key={sess.id} className="session-timeline-card">
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '0.35rem',
                  }}
                >
                  <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>{sess.topic}</strong>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      backgroundColor: '#ecfdf5',
                      color: '#065f46',
                      padding: '0.15rem 0.45rem',
                      borderRadius: '4px',
                    }}
                  >
                    {sess.status}
                  </span>
                </div>

                <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '0.5rem' }}>
                  With <strong>{sess.peerName}</strong> • {sess.dateTime}
                </div>

                <div style={{ fontSize: '0.75rem', color: '#475569', marginBottom: '0.75rem' }}>
                  Barter exchange: <em>{sess.exchangeFor}</em>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (onTriggerToast) {
                      onTriggerToast({
                        type: 'info',
                        title: 'Connecting to Live Room...',
                        message: `Launching Socket.IO real-time video/chat session with ${sess.peerName}.`,
                      });
                    }
                  }}
                  className="btn-secondary"
                  style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem' }}
                >
                  <Video size={14} color="#6366f1" />
                  <span>Join Live Peer Room</span>
                </button>
              </div>
            ))}
          </div>

          {/* Skills I Can Teach Card */}
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <div className="dashboard-card-title">
                <Award size={18} color="#10b981" />
                <span>Skills I Can Teach ({teachingSkills.length})</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSkillType('teach');
                  setAddSkillModalOpen(true);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Plus size={14} /> Add
              </button>
            </div>

            {teachingSkills.map((s) => (
              <div key={s.id} className="skill-item-pill">
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>{s.name}</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    {s.level} • {s.studentsInterested} students looking to learn
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    padding: '0.2rem 0.5rem',
                    borderRadius: '6px',
                    backgroundColor: '#ecfdf5',
                    color: '#065f46',
                  }}
                >
                  Mentoring
                </span>
              </div>
            ))}
          </div>

          {/* Skills I Want to Learn Card */}
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <div className="dashboard-card-title">
                <TrendingUp size={18} color="#6366f1" />
                <span>Skills I Want to Learn ({learningSkills.length})</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSkillType('learn');
                  setAddSkillModalOpen(true);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Plus size={14} /> Add
              </button>
            </div>

            {learningSkills.map((s) => (
              <div key={s.id} className="skill-item-pill">
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>{s.name}</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    Priority: {s.priority} • {s.availableMentors} mentors available
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    padding: '0.2rem 0.5rem',
                    borderRadius: '6px',
                    backgroundColor: '#eff6ff',
                    color: '#1e40af',
                  }}
                >
                  Learning Goal
                </span>
              </div>
            ))}
          </div>

          {/* 10. Recent Activity Log Card */}
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <div className="dashboard-card-title">
                <Clock size={18} color="#6366f1" />
                <span>Recent Activity</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              {activityLog.map((act) => (
                <div key={act.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#6366f1',
                      marginTop: '6px',
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>{act.title}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4 }}>{act.description}</div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.15rem' }}>
                      {act.timestamp} {act.creditChange ? `• ${act.creditChange}` : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Skill Modal */}
      {addSkillModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(8px)',
          }}
          onClick={() => setAddSkillModalOpen(false)}
        >
          <div
            style={{
              maxWidth: '440px',
              width: '100%',
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              padding: '2rem',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem', color: '#0f172a' }}>
              {skillType === 'teach' ? 'Add Skill You Can Teach' : 'Add Skill You Want to Learn'}
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>
              Update your barter catalog to get matched with complementary student peers.
            </p>

            <form onSubmit={handleAddSkillSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Skill Name
                </label>
                <input
                  type="text"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  placeholder="e.g. Next.js, Graph Theory, Figma UI"
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.9rem',
                    borderRadius: '10px',
                    border: '1px solid #ddd6fe',
                    outline: 'none',
                    fontSize: '0.9rem',
                  }}
                  autoFocus
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Category
                </label>
                <select
                  value={newSkillCategory}
                  onChange={(e) => setNewSkillCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.9rem',
                    borderRadius: '10px',
                    border: '1px solid #ddd6fe',
                    outline: 'none',
                    fontSize: '0.9rem',
                    backgroundColor: '#ffffff',
                  }}
                >
                  <option value="Programming">Programming</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Design">Design</option>
                  <option value="Data Structures">Data Structures</option>
                  <option value="Communication">Communication</option>
                  <option value="Languages">Languages</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setAddSkillModalOpen(false)}
                  className="btn-secondary"
                  style={{ flex: 1, padding: '0.7rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 1.5, padding: '0.7rem' }}
                >
                  Add to Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

