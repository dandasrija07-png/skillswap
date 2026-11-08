import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Bell,
  Menu,
  X,
  User,
  Settings,
  LogOut,
  Sparkles,
  CheckCircle2,
  Calendar,
  ArrowLeftRight,
  ShieldAlert,
} from 'lucide-react';
import { logoutSession } from '../../services/authService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { markAllNotificationsRead, markNotificationRead } from '../../services/dashboardService.js';

export default function TopNavbar({
  studentProfile,
  searchQuery,
  setSearchQuery,
  notifications = [],
  setNotifications,
  mobileOpen,
  setMobileOpen,
  setActiveTab,
}) {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read && !n.read).length;

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      if (setNotifications) {
        setNotifications(notifications.map((n) => ({ ...n, is_read: 1, read: true })));
      }
    } catch (e) {
      console.warn('Mark read error:', e);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="dashboard-topbar">
      {/* Left: Mobile Toggle & Search Input */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, maxWidth: '520px' }}>
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="topbar-icon-btn topbar-mobile-menu-btn"
          id="mobile-drawer-btn"
          aria-label="Toggle navigation drawer"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <div className="topbar-search-wrapper">
          <Search size={16} className="auth-input-icon" style={{ left: '0.85rem' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search skills, sessions, or student peers..."
            className="topbar-search-input"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: '0.78rem',
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Right Actions */}
      <div className="topbar-actions">
        {/* Live Socket.IO Status Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.35rem 0.8rem',
            borderRadius: '9999px',
            backgroundColor: '#ecfdf5',
            border: '1px solid #a7f3d0',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: '#065f46',
          }}
          title="Socket.IO real-time notification & chat synchronization active"
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              boxShadow: '0 0 6px #10b981',
            }}
          />
          <span>Socket.IO Live</span>
        </div>

        {/* Notifications Dropdown Container */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            type="button"
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setProfileMenuOpen(false);
            }}
            className="topbar-icon-btn"
            aria-label="View notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && <span className="topbar-notification-badge">{unreadCount}</span>}
          </button>

          {notificationsOpen && (
            <div className="notifications-dropdown">
              <div className="notifications-header">
                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0f172a' }}>
                  Notifications ({unreadCount} new)
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              <ul className="notifications-list">
                {notifications.length === 0 ? (
                  <li style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                    No notifications right now.
                  </li>
                ) : (
                  notifications.map((n) => (
                    <li
                      key={n.id}
                      className={`notification-item ${!n.is_read && !n.read ? 'unread' : ''}`}
                      onClick={async () => {
                        try {
                          await markNotificationRead(n.id);
                          if (setNotifications) {
                            setNotifications((prev) =>
                              prev.map((item) =>
                                item.id === n.id ? { ...item, is_read: 1, read: true } : item
                              )
                            );
                          }
                        } catch (err) {
                          console.warn('Error marking notification read:', err);
                        }
                        if (n.type?.includes('request')) setActiveTab('requests');
                        else if (n.type?.includes('session')) setActiveTab('sessions');
                        else if (n.type?.includes('message')) setActiveTab('messages');
                        setNotificationsOpen(false);
                      }}
                    >
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: n.type?.includes('request') ? '#ede9fe' : n.type?.includes('session') ? '#e0e7ff' : '#ecfdf5',
                          color: n.type?.includes('request') ? '#7c3aed' : n.type?.includes('session') ? '#4f46e5' : '#059669',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {n.type?.includes('request') ? (
                          <ArrowLeftRight size={16} />
                        ) : n.type?.includes('session') ? (
                          <Calendar size={16} />
                        ) : (
                          <CheckCircle2 size={16} />
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.84rem', fontWeight: !n.is_read && !n.read ? 700 : 500, color: '#0f172a' }}>
                          {n.title}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4 }}>{n.message}</div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                          {n.created_at ? new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : n.time || 'Just now'}
                        </div>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Student Profile Dropdown */}
        <div style={{ position: 'relative' }} ref={profileRef}>
          <button
            type="button"
            onClick={() => {
              setProfileMenuOpen(!profileMenuOpen);
              setNotificationsOpen(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              background: '#ffffff',
              border: '1px solid #ddd6fe',
              padding: '0.35rem 0.65rem',
              borderRadius: '12px',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.82rem',
              }}
            >
              {studentProfile?.initials || 'AS'}
            </div>
            <div style={{ textAlign: 'left', display: 'none' }} className="topbar-user-info">
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
                {studentProfile?.fullName?.split(' ')[0] || 'Aarav'}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                {studentProfile?.creditsBalance || 18} Credits
              </div>
            </div>
          </button>

          {profileMenuOpen && (
            <div className="profile-dropdown-menu">
              <div style={{ padding: '0.75rem 0.9rem', borderBottom: '1px solid #f1f5f9', marginBottom: '0.35rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
                  {studentProfile?.fullName || 'Aarav Sharma'}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{studentProfile?.email}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 600, marginTop: '0.2rem' }}>
                  {studentProfile?.collegeName}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('profile');
                  setProfileMenuOpen(false);
                }}
                className="profile-dropdown-link"
              >
                <User size={16} /> My Profile
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('settings');
                  setProfileMenuOpen(false);
                }}
                className="profile-dropdown-link"
              >
                <Settings size={16} /> Account Settings
              </button>

              <Link
                to="/explore"
                className="profile-dropdown-link"
                onClick={() => setProfileMenuOpen(false)}
              >
                <Search size={16} /> Explore Skills
              </Link>

              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="profile-dropdown-link"
                  onClick={() => setProfileMenuOpen(false)}
                  style={{ color: '#6366f1', fontWeight: 600 }}
                >
                  <ShieldAlert size={16} color="#6366f1" /> Admin Portal
                </Link>
              )}

              <div style={{ borderTop: '1px solid #f1f5f9', margin: '0.35rem 0' }} />

              <button
                type="button"
                onClick={handleLogout}
                className="profile-dropdown-link"
                style={{ color: '#ef4444' }}
              >
                <LogOut size={16} color="#ef4444" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

