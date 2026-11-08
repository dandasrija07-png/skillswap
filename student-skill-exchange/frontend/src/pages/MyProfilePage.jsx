import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, LayoutDashboard, Sparkles } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import ProfileView from '../components/profile/ProfileView.jsx';
import Toast from '../components/common/Toast.jsx';
import { getProfileData } from '../services/profileSkillService.js';

export default function MyProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getProfileData();
        setProfile(data);
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
      <Navbar />

      <Toast toast={toast} onClose={() => setToast(null)} />

      <main style={{ flex: 1, maxWidth: '1100px', width: '100%', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        {/* Breadcrumb Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <Link
              to="/dashboard"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
                textDecoration: 'none',
              }}
            >
              <LayoutDashboard size={16} /> Back to Dashboard
            </Link>
          </div>

          <span className="badge badge-purple" style={{ fontSize: '0.75rem' }}>
            <Sparkles size={13} /> Simulation Mode
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
            Loading student profile...
          </div>
        ) : (
          <ProfileView
            profile={profile}
            onProfileUpdated={(updated) => setProfile(updated)}
            onTriggerToast={setToast}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}

