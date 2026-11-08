import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Sparkles } from 'lucide-react';
import MySessionsView from '../components/sessions/MySessionsView.jsx';
import Toast from '../components/common/Toast.jsx';

export default function MySessionsPage() {
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);

  return (
    <div className="sessions-page-container">
      {/* Toast Notification Container */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Header */}
      <div className="sessions-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="btn-card-profile"
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
          <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>
            Live MySQL Session &amp; Credit Engine
          </span>
        </div>

        <div className="sessions-badge">
          <Calendar size={14} /> Peer Learning Sessions
        </div>
        <h1 className="sessions-title">My Learning Sessions</h1>
        <p className="sessions-subtitle">
          Schedule, track, and complete your peer-to-peer exchange sessions. Both learners confirm
          completion to release exchange credits into your student wallet.
        </p>
      </div>

      {/* Main View */}
      <MySessionsView onTriggerToast={setToast} />
    </div>
  );
}

