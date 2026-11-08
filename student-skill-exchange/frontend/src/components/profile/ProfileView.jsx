import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  School,
  GraduationCap,
  Calendar,
  MapPin,
  Clock,
  Laptop,
  Edit3,
  Star,
  Coins,
  Repeat,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import EditProfileModal from './EditProfileModal.jsx';

export default function ProfileView({ profile, onProfileUpdated, onTriggerToast }) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleProfileUpdated = (updatedProfile) => {
    if (onProfileUpdated) {
      onProfileUpdated(updatedProfile);
    }
    if (onTriggerToast) {
      onTriggerToast({
        type: 'success',
        title: 'Profile Updated',
        message: 'Your student profile information has been saved successfully.',
      });
    }
  };

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={profile}
        onProfileUpdated={handleProfileUpdated}
      />

      {/* Profile Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="profile-hero-card"
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.5rem',
          }}
        >
          {/* Avatar & Core Identity */}
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <div className="profile-avatar-wrapper">
              {profile?.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.fullName}
                  className="profile-avatar-img"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                className="profile-avatar-img"
                style={{ display: profile?.avatarUrl ? 'none' : 'flex' }}
              >
                {profile?.initials || 'AS'}
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="profile-avatar-edit-badge"
                title="Change Photo / Edit Profile"
                aria-label="Edit Profile"
              >
                <Edit3 size={14} />
              </button>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.25rem' }}>
                <h1 style={{ fontSize: '1.65rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                  {profile?.fullName || 'Aarav Sharma'}
                </h1>
                <span className="badge badge-purple" style={{ fontSize: '0.74rem' }}>
                  <ShieldCheck size={13} /> Verified Student
                </span>
              </div>

              <div style={{ fontSize: '0.92rem', color: '#475569', marginBottom: '0.35rem' }}>
                {profile?.department} • {profile?.academicYear}
              </div>

              <div style={{ fontSize: '0.86rem', color: 'var(--primary)', fontWeight: 600 }}>
                {profile?.collegeName}
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="btn-primary"
            style={{ padding: '0.65rem 1.35rem', fontSize: '0.88rem' }}
          >
            <Edit3 size={15} /> Edit Profile
          </button>
        </div>

        {/* Short Bio */}
        {profile?.shortBio && (
          <div
            style={{
              marginTop: '1.5rem',
              padding: '1.1rem 1.25rem',
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #ede9fe',
              fontSize: '0.9rem',
              color: '#334155',
              lineHeight: 1.6,
            }}
          >
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
              Student Biography
            </div>
            "{profile.shortBio}"
          </div>
        )}

        {/* Key Detail Grid */}
        <div className="profile-details-grid">
          {/* Email */}
          <div className="profile-detail-item">
            <div className="profile-detail-icon">
              <Mail size={18} />
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', display: 'block' }}>
                College Email
              </span>
              <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>{profile?.email}</strong>
            </div>
          </div>

          {/* Campus Location */}
          <div className="profile-detail-item">
            <div className="profile-detail-icon">
              <MapPin size={18} />
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', display: 'block' }}>
                Location / Campus
              </span>
              <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>{profile?.location}</strong>
            </div>
          </div>

          {/* Preferred Learning Mode */}
          <div className="profile-detail-item">
            <div className="profile-detail-icon">
              <Laptop size={18} />
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', display: 'block' }}>
                Preferred Learning Mode
              </span>
              <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>{profile?.preferredLearningMode}</strong>
            </div>
          </div>

          {/* Availability */}
          <div className="profile-detail-item">
            <div className="profile-detail-icon">
              <Clock size={18} />
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', display: 'block' }}>
                Availability Schedule
              </span>
              <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>{profile?.availability}</strong>
            </div>
          </div>
        </div>

        {/* Quick Stats Strip */}
        <div
          style={{
            marginTop: '1.75rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid #ede9fe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#6366f1' }}>
              {profile?.creditsBalance || 18}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Credits Balance</div>
          </div>

          <div style={{ height: '32px', width: '1px', backgroundColor: '#e2e8f0' }} />

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#10b981' }}>
              {profile?.completedSwapsCount || 14}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Completed Swaps</div>
          </div>

          <div style={{ height: '32px', width: '1px', backgroundColor: '#e2e8f0' }} />

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.2rem' }}>
              <span>{profile?.rating || 4.9}</span>
              <Star size={16} fill="#f59e0b" color="#f59e0b" />
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{profile?.reviewsCount || 18} Reviews</div>
          </div>

          <div style={{ height: '32px', width: '1px', backgroundColor: '#e2e8f0' }} />

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a' }}>
              {profile?.totalTeachingHours || 26}h
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Hours Taught</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

