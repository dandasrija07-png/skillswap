import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeftRight,
  LayoutDashboard,
  UserCheck,
  Layers,
  Compass,
  CalendarClock,
  MessageSquare,
  TrendingUp,
  Coins,
  Star,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Sidebar({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  mobileOpen,
  setMobileOpen,
  studentProfile,
  requestsCount = 2,
  messagesCount = 3,
}) {
  const navigate = useNavigate();
  const { isAdmin, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'profile', label: 'My Profile', icon: <UserCheck size={20} /> },
    { id: 'skills', label: 'My Skills', icon: <Layers size={20} /> },
    { id: 'explore', label: 'Explore Students', icon: <Compass size={20} /> },
    { id: 'requests', label: 'Exchange Requests', icon: <ArrowLeftRight size={20} />, badge: requestsCount },
    { id: 'sessions', label: 'My Sessions', icon: <CalendarClock size={20} /> },
    { id: 'messages', label: 'Messages', icon: <MessageSquare size={20} />, badge: messagesCount },
    { id: 'progress', label: 'Learning Progress', icon: <TrendingUp size={20} /> },
    { id: 'credits', label: 'My Credits', icon: <Coins size={20} /> },
    { id: 'reviews', label: 'Reviews', icon: <Star size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin Portal', icon: <ShieldAlert size={20} /> }] : []),
  ];

  return (
    <aside
      className={`dashboard-sidebar ${isCollapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}
    >
      {/* Sidebar Header with Brand & Collapse Trigger */}
      <div className="sidebar-header">
        <Link to="/" className="sidebar-brand">
          <div className="sidebar-logo-icon">
            <ArrowLeftRight size={20} />
          </div>
          {!isCollapsed && (
            <div>
              <span style={{ fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.02em' }}>
                Skill<span className="gradient-text">Swap</span>
              </span>
              <span
                style={{
                  display: 'block',
                  fontSize: '0.65rem',
                  color: 'var(--text-muted)',
                  fontWeight: 600,
                  marginTop: '-3px',
                }}
              >
                STUDENT PORTAL
              </span>
            </div>
          )}
        </Link>

        {/* Desktop Collapse Toggle */}
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="sidebar-collapse-toggle"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav Items List */}
      <nav className="sidebar-nav-container">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (item.id === 'admin') {
                  navigate('/admin');
                  return;
                }
                setActiveTab(item.id);
                if (mobileOpen && setMobileOpen) setMobileOpen(false);
              }}
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              title={isCollapsed ? item.label : undefined}
            >
              <span className="sidebar-nav-icon">{item.icon}</span>
              {!isCollapsed && (
                <>
                  <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
                  {item.badge ? <span className="sidebar-badge">{item.badge}</span> : null}
                </>
              )}
            </button>
          );
        })}

        {/* Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          className="sidebar-nav-item"
          style={{ color: '#ef4444', marginTop: '0.5rem' }}
          title={isCollapsed ? 'Logout' : undefined}
        >
          <span className="sidebar-nav-icon">
            <LogOut size={20} color="#ef4444" />
          </span>
          {!isCollapsed && <span>Logout</span>}
        </button>
      </nav>

      {/* Sidebar Footer with Student Micro Card */}
      <div className="sidebar-footer">
        <div className="sidebar-profile-card">
          <div className="sidebar-avatar">
            {studentProfile?.initials || 'AS'}
          </div>
          {!isCollapsed && (
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  color: '#0f172a',
                }}
              >
                {studentProfile?.fullName || 'Aarav Sharma'}
              </div>
              <div
                style={{
                  fontSize: '0.74rem',
                  color: 'var(--primary)',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {studentProfile?.creditsBalance || 18} Learning Credits
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

