import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Star,
  CheckCircle2,
  Calendar,
  Monitor,
  MapPin,
  Sparkles,
  ArrowLeftRight,
  GraduationCap,
  Send,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import SendRequestModal from '../components/requests/SendRequestModal.jsx';
import Toast from '../components/common/Toast.jsx';
import { getStudentById } from '../services/studentService.js';

export default function StudentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    async function fetchDetail() {
      try {
        setLoading(true);
        setError(null);
        const res = await getStudentById(id);
        setStudent(res);
      } catch (err) {
        console.error('Error fetching student details:', err);
        setError(err.message || 'Student not found.');
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="explore-container" style={{ textAlign: 'center', padding: '5rem 0' }}>
        <Loader2 size={36} className="animate-spin" color="#6366f1" style={{ margin: '0 auto 1rem' }} />
        <p style={{ color: '#64748b' }}>Loading peer profile...</p>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="explore-container" style={{ padding: '3rem 1.5rem' }}>
        <button
          type="button"
          onClick={() => navigate('/students')}
          className="btn-card-profile"
          style={{ marginBottom: '2rem' }}
        >
          <ArrowLeft size={16} />
          Back to Student Directory
        </button>
        <div className="explore-empty-state">
          <AlertCircle size={36} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
          <h3>Peer Profile Not Found</h3>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>{error}</p>
          <button
            type="button"
            onClick={() => navigate('/students')}
            className="btn-card-request"
            style={{ margin: '0 auto' }}
          >
            Explore Other Peers
          </button>
        </div>
      </div>
    );
  }

  const match = student.match || {};
  const isReciprocal = match.isReciprocalMatch;

  return (
    <div className="explore-container">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Send Request Modal */}
      <SendRequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        targetStudent={student}
        onSuccess={(newReq, msg) => {
          setToast({
            type: 'success',
            title: 'Proposal Dispatched!',
            message: msg || `Your proposal has been delivered to ${student.fullName}.`,
          });
        }}
      />

      {/* Navigation Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <button
          type="button"
          onClick={() => navigate('/students')}
          className="btn-card-profile"
          style={{ padding: '0.5rem 1rem' }}
        >
          <ArrowLeft size={16} />
          Back to Student Directory
        </button>

        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
          Simulated Student Profile (B.Tech CSE Demo Data)
        </span>
      </div>

      {/* Main Student Card Layout */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '24px',
          border: '1px solid #ede9fe',
          boxShadow: '0 10px 30px -5px rgba(99, 102, 241, 0.08)',
          padding: '2.5rem',
          maxWidth: '900px',
          margin: '0 auto',
        }}
      >
        {/* Top Header */}
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: '2rem' }}>
          <div style={{ width: '90px', height: '90px', flexShrink: 0 }}>
            {student.avatarUrl ? (
              <img
                src={student.avatarUrl}
                alt={student.fullName}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '24px',
                  objectFit: 'cover',
                  border: '3px solid #ede9fe',
                }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '24px',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  fontWeight: 800,
                }}
              >
                {student.initials || student.fullName?.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>

          <div style={{ flex: 1, minWidth: '260px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <h1 style={{ margin: 0, fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>
                {student.fullName}
              </h1>
              {isReciprocal && (
                <span
                  style={{
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.3rem 0.75rem',
                    borderRadius: '9999px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <Sparkles size={12} />
                  100% Reciprocal Swap Match
                </span>
              )}
            </div>

            <div style={{ fontSize: '1rem', color: '#64748b', marginTop: '0.35rem' }}>
              {student.department} • {student.academicYear}
            </div>

            <div style={{ fontSize: '0.9rem', color: '#475569', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <GraduationCap size={16} color="#6366f1" />
              <span>{student.collegeName}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsRequestModalOpen(true)}
            className="btn-card-request"
            style={{ padding: '0.75rem 1.6rem', fontSize: '0.95rem' }}
          >
            <Send size={16} />
            Propose Skill Swap
          </button>
        </div>

        {/* Stats Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            background: '#f8fafc',
            padding: '1.25rem',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            marginBottom: '2rem',
            textAlign: 'center',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', color: '#d97706', fontWeight: 800, fontSize: '1.35rem' }}>
              <Star size={20} fill="#d97706" /> {student.rating.toFixed(1)}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#64748b' }}>({student.reviewsCount || 20} peer ratings)</div>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.35rem', color: '#0f172a' }}>
              {student.completedSessionsCount}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#64748b' }}>Swaps Completed</div>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.35rem', color: '#6366f1' }}>
              {student.availabilityType}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#64748b' }}>{student.availability}</div>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.35rem', color: '#16a34a' }}>
              {student.preferredLearningMode?.split(' ')[0]}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#64748b' }}>Preferred Learning Mode</div>
          </div>
        </div>

        {/* Bio */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
            About {student.fullName.split(' ')[0]}
          </h3>
          <p style={{ fontSize: '0.96rem', color: '#334155', lineHeight: 1.6, margin: 0 }}>
            {student.shortBio}
          </p>
        </div>

        {/* Reciprocal Matching Card */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(168, 85, 247, 0.12))',
            border: '1px solid rgba(168, 85, 247, 0.35)',
            borderRadius: '18px',
            padding: '1.5rem',
            marginBottom: '2rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Sparkles size={18} color="#6366f1" />
            <strong style={{ fontSize: '1rem', color: '#0f172a' }}>
              Deterministic Rule Match Analysis
            </strong>
          </div>
          <div style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.6 }}>
            {isReciprocal ? (
              <p style={{ margin: 0 }}>
                This is an <strong>ideal mutual exchange match</strong>! {student.fullName.split(' ')[0]} teaches{' '}
                <span style={{ color: '#6366f1', fontWeight: 700 }}>
                  {match.matchedLearningSkills?.map((s) => (typeof s === 'string' ? s : s.name)).join(', ')}
                </span>{' '}
                (which you want to learn), and wants to learn{' '}
                <span style={{ color: '#16a34a', fontWeight: 700 }}>
                  {match.matchedTeachingSkills?.map((s) => (typeof s === 'string' ? s : s.name)).join(', ')}
                </span>{' '}
                (which you have offered to teach).
              </p>
            ) : match.matchedLearningSkills?.length > 0 ? (
              <p style={{ margin: 0 }}>
                {student.fullName.split(' ')[0]} teaches{' '}
                <span style={{ color: '#6366f1', fontWeight: 700 }}>
                  {match.matchedLearningSkills?.map((s) => (typeof s === 'string' ? s : s.name)).join(', ')}
                </span>
                , which matches your wishlist. Send an exchange proposal with your offered skills to initiate a swap!
              </p>
            ) : (
              <p style={{ margin: 0 }}>
                Explore their catalog below to propose a customized skill exchange tailored to your course curriculum.
              </p>
            )}
          </div>
        </div>

        {/* Skills Catalogs: 2 Columns */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
          {/* Can Teach */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
              <CheckCircle2 size={18} color="#6366f1" />
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                Skills Offered to Teach
              </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {student.teachingSkills?.map((s) => (
                <div
                  key={s.name}
                  style={{
                    padding: '0.85rem 1rem',
                    background: '#ede9fe',
                    borderRadius: '12px',
                    border: '1px solid #c4b5fd',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#4338ca' }}>
                      {s.name}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#6b21a8' }}>{s.category}</div>
                  </div>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      background: '#ffffff',
                      color: '#6366f1',
                      padding: '0.2rem 0.55rem',
                      borderRadius: '6px',
                    }}
                  >
                    {s.proficiency}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Wants to Learn */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
              <ArrowLeftRight size={18} color="#16a34a" />
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                Skills Seeking to Learn
              </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {student.learningSkills?.map((s) => (
                <div
                  key={s.name}
                  style={{
                    padding: '0.85rem 1rem',
                    background: '#f0fdf4',
                    borderRadius: '12px',
                    border: '1px solid #bbf7d0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#15803d' }}>
                      {s.name}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#166534' }}>{s.category}</div>
                  </div>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      background: '#ffffff',
                      color: '#16a34a',
                      padding: '0.2rem 0.55rem',
                      borderRadius: '6px',
                    }}
                  >
                    {s.proficiency}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div style={{ textAlign: 'center', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
          <button
            type="button"
            onClick={() => setIsRequestModalOpen(true)}
            className="btn-card-request"
            style={{ padding: '0.85rem 2rem', fontSize: '1rem', margin: '0 auto' }}
          >
            <Send size={18} />
            Propose Skill Swap With {student.fullName.split(' ')[0]}
          </button>
        </div>
      </div>
    </div>
  );
}
