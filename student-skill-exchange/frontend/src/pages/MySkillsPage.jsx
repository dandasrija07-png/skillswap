import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, LayoutDashboard, Sparkles } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import SkillsView from '../components/skills/SkillsView.jsx';
import Toast from '../components/common/Toast.jsx';
import { getTeachingSkills, getLearningSkills } from '../services/profileSkillService.js';

export default function MySkillsPage() {
  const [teachingSkills, setTeachingSkills] = useState([]);
  const [learningSkills, setLearningSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [t, l] = await Promise.all([getTeachingSkills(), getLearningSkills()]);
        setTeachingSkills(t);
        setLearningSkills(l);
      } catch (err) {
        console.error('Error loading skills:', err);
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

      <main style={{ flex: 1, maxWidth: '1240px', width: '100%', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
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
            Loading skills catalog...
          </div>
        ) : (
          <SkillsView
            teachingSkills={teachingSkills}
            setTeachingSkills={setTeachingSkills}
            learningSkills={learningSkills}
            setLearningSkills={setLearningSkills}
            onTriggerToast={setToast}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}

