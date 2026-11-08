import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowLeftRight, Sparkles } from 'lucide-react';
import ExchangeRequestsView from '../components/requests/ExchangeRequestsView.jsx';
import Toast from '../components/common/Toast.jsx';

export default function ExchangeRequestsPage() {
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);

  return (
    <div className="requests-page-container">
      {/* Toast notifications */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Header */}
      <div className="requests-header">
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
          <span style={{ fontSize: '0.8rem', color: '#6366f1', fontWeight: 600 }}>
            Live MySQL Exchange Ledger Active
          </span>
        </div>

        <div className="requests-badge">
          <ArrowLeftRight size={14} /> Bilateral Barter Proposals
        </div>
        <h1 className="requests-title">Exchange Request Management</h1>
        <p className="requests-subtitle">
          Review proposals from campus peers, manage your sent swap requests, and coordinate mutual learning sessions.
        </p>
      </div>

      {/* Main View */}
      <ExchangeRequestsView
        onTriggerToast={setToast}
        onNavigateToMessages={() => navigate('/dashboard')}
      />
    </div>
  );
}

