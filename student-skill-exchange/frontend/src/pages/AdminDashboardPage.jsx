/**
 * Admin Dashboard Page
 * SkillSwap Platform Governance, Student Moderation & Analytics Portal
 * Access strictly restricted to administrators (role: 'admin')
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Users,
  UserCheck,
  UserX,
  ArrowLeftRight,
  CalendarCheck,
  Clock,
  Layers,
  Coins,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Download,
  LogOut,
  RefreshCw,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  BarChart3,
  X,
  Sparkles,
} from 'lucide-react';
import {
  getAdminStats,
  getAdminUsers,
  updateUserStatus,
  moderateUserProfile,
  getAdminSkills,
  createAdminSkill,
  updateAdminSkill,
  deleteAdminSkill,
  getAdminReports,
  resolveAdminReport,
  dismissAdminReport,
  getPlatformActivity,
  getUsageAnalyticsReport,
} from '../services/adminService.js';
import { useAuth } from '../context/AuthContext.jsx';
import Toast from '../components/common/Toast.jsx';
import '../styles/admin.css';

const SKILL_CATEGORIES = [
  'Programming',
  'Web Development',
  'Mobile Development',
  'Database',
  'Design',
  'Communication',
  'Languages',
  'Other',
];

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Active Tab
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'students' | 'skills' | 'reports' | 'activity' | 'usage'

  // Global states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState(null);

  // Data states
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [skillsList, setSkillsList] = useState([]);
  const [reportsList, setReportsList] = useState([]);
  const [activityList, setActivityList] = useState([]);
  const [usageReport, setUsageReport] = useState(null);

  // Filters & Search
  const [userSearch, setUserSearch] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('all');
  const [skillCategoryFilter, setSkillCategoryFilter] = useState('All');
  const [skillSearch, setSkillSearch] = useState('');
  const [reportStatusFilter, setReportStatusFilter] = useState('all');

  // Pagination for Students
  const [currentPage, setCurrentPage] = useState(1);
  const USERS_PER_PAGE = 6;

  // Modals state
  const [suspendModal, setSuspendModal] = useState({ open: false, user: null, reason: '' });
  const [resolveModal, setResolveModal] = useState({ open: false, report: null, notes: '' });
  const [skillModal, setSkillModal] = useState({ open: false, isEditing: false, skillId: null, name: '', category: 'Programming', description: '' });
  const [moderateModal, setModerateModal] = useState({ open: false, user: null, shortBio: '', resetBio: false });

  // Initial load
  useEffect(() => {
    loadAllAdminData();
  }, []);

  const loadAllAdminData = async () => {
    try {
      setRefreshing(true);
      const [statsData, usersData, skillsData, reportsData, activityData, usageData] =
        await Promise.all([
          getAdminStats().catch(() => null),
          getAdminUsers().catch(() => []),
          getAdminSkills().catch(() => []),
          getAdminReports().catch(() => []),
          getPlatformActivity().catch(() => []),
          getUsageAnalyticsReport().catch(() => null),
        ]);

      setStats(statsData);
      setUsersList(usersData);
      setSkillsList(skillsData);
      setReportsList(reportsData);
      setActivityList(activityData);
      setUsageReport(usageData);
    } catch (err) {
      console.error('Error loading admin portal data:', err);
      setToast({ type: 'error', title: 'Data Load Error', message: err.message });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // 1. Account Suspension / Reactivation
  const handleConfirmStatusToggle = async () => {
    if (!suspendModal.user) return;
    const targetUser = suspendModal.user;
    const newStatus = targetUser.is_active === 1 ? false : true;

    try {
      await updateUserStatus(targetUser.id, newStatus, suspendModal.reason);
      setUsersList((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, is_active: newStatus ? 1 : 0 } : u))
      );
      setToast({
        type: 'success',
        title: newStatus ? 'Account Reactivated' : 'Account Suspended',
        message: `Student account #${targetUser.id} (${targetUser.full_name}) ${newStatus ? 'reactivated' : 'suspended'} in MySQL.`,
      });
      setSuspendModal({ open: false, user: null, reason: '' });
      // Refresh stats
      const updatedStats = await getAdminStats();
      setStats(updatedStats);
    } catch (err) {
      setToast({ type: 'error', title: 'Action Failed', message: err.message });
    }
  };

  // 2. Profile Content Moderation
  const handleConfirmModerateBio = async () => {
    if (!moderateModal.user) return;
    try {
      await moderateUserProfile(moderateModal.user.id, {
        shortBio: moderateModal.shortBio,
        resetBio: moderateModal.resetBio,
      });
      setUsersList((prev) =>
        prev.map((u) =>
          u.id === moderateModal.user.id
            ? {
                ...u,
                profile: {
                  ...u.profile,
                  short_bio: moderateModal.resetBio
                    ? 'Bio reset by moderator for content standards review.'
                    : moderateModal.shortBio,
                },
              }
            : u
        )
      );
      setToast({
        type: 'success',
        title: 'Profile Content Moderated',
        message: `Bio updated for student #${moderateModal.user.id}.`,
      });
      setModerateModal({ open: false, user: null, shortBio: '', resetBio: false });
    } catch (err) {
      setToast({ type: 'error', title: 'Moderation Failed', message: err.message });
    }
  };

  // 3. Skill Catalog Management
  const handleSaveSkill = async (e) => {
    e.preventDefault();
    if (!skillModal.name.trim()) return;

    try {
      if (skillModal.isEditing) {
        const updated = await updateAdminSkill(skillModal.skillId, {
          name: skillModal.name.trim(),
          category: skillModal.category,
          description: skillModal.description.trim(),
        });
        setSkillsList((prev) =>
          prev.map((s) => (s.id === skillModal.skillId ? { ...s, ...updated } : s))
        );
        setToast({ type: 'success', title: 'Skill Updated', message: `Catalog entry "${updated.name}" updated.` });
      } else {
        const created = await createAdminSkill({
          name: skillModal.name.trim(),
          category: skillModal.category,
          description: skillModal.description.trim(),
        });
        setSkillsList((prev) => [created, ...prev]);
        setToast({ type: 'success', title: 'Skill Added', message: `"${created.name}" registered in platform catalog.` });
      }
      setSkillModal({ open: false, isEditing: false, skillId: null, name: '', category: 'Programming', description: '' });
      const updatedStats = await getAdminStats();
      setStats(updatedStats);
    } catch (err) {
      setToast({ type: 'error', title: 'Skill Operation Failed', message: err.message });
    }
  };

  const handleDeleteSkill = async (skillId, skillName) => {
    if (!window.confirm(`Are you sure you want to remove "${skillName}" from the platform catalog?`)) {
      return;
    }
    try {
      await deleteAdminSkill(skillId);
      setSkillsList((prev) => prev.filter((s) => s.id !== skillId));
      setToast({ type: 'success', title: 'Skill Deleted', message: `"${skillName}" removed from catalog.` });
      const updatedStats = await getAdminStats();
      setStats(updatedStats);
    } catch (err) {
      setToast({ type: 'error', title: 'Delete Blocked', message: err.message });
    }
  };

  // 4. Report Resolution & Dismissal
  const handleConfirmResolveReport = async () => {
    if (!resolveModal.report) return;
    try {
      await resolveAdminReport(resolveModal.report.id, resolveModal.notes || 'Resolved by administrator.');
      setReportsList((prev) =>
        prev.map((r) =>
          r.id === resolveModal.report.id
            ? { ...r, status: 'resolved', resolution_notes: resolveModal.notes }
            : r
        )
      );
      setToast({
        type: 'success',
        title: 'Dispute Resolved',
        message: `Moderation report #${resolveModal.report.id} marked as resolved in MySQL.`,
      });
      setResolveModal({ open: false, report: null, notes: '' });
      const updatedStats = await getAdminStats();
      setStats(updatedStats);
    } catch (err) {
      setToast({ type: 'error', title: 'Action Failed', message: err.message });
    }
  };

  const handleDismissReport = async (reportId) => {
    try {
      await dismissAdminReport(reportId, 'Dismissed as non-violating false alarm by admin.');
      setReportsList((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status: 'dismissed' } : r))
      );
      setToast({
        type: 'info',
        title: 'Report Dismissed',
        message: `Report #${reportId} closed without violation.`,
      });
    } catch (err) {
      setToast({ type: 'error', title: 'Action Failed', message: err.message });
    }
  };

  // Export Usage Analytics to JSON or CSV
  const handleExportJSON = () => {
    if (!usageReport) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(usageReport, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `skillswap-usage-report-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Filtered Students
  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.full_name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.collegeName?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.department?.toLowerCase().includes(userSearch.toLowerCase());

    const matchesStatus =
      userStatusFilter === 'all'
        ? true
        : userStatusFilter === 'active'
        ? u.is_active === 1
        : u.is_active === 0;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE) || 1;
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * USERS_PER_PAGE,
    currentPage * USERS_PER_PAGE
  );

  // Filtered Skills
  const filteredSkills = skillsList.filter((s) => {
    const matchesCat = skillCategoryFilter === 'All' || s.category === skillCategoryFilter;
    const matchesSearch =
      s.name.toLowerCase().includes(skillSearch.toLowerCase()) ||
      s.description.toLowerCase().includes(skillSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Filtered Reports
  const filteredReports = reportsList.filter((r) => {
    if (reportStatusFilter === 'all') return true;
    return r.status === reportStatusFilter;
  });

  return (
    <div className="admin-layout">
      {/* Toast notifications */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Main Admin View Container */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Admin Navigation Bar */}
        <header className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
              }}
            >
              <ShieldAlert size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>
                SkillSwap Operations &amp; Administration
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="admin-brand-badge">
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                  Live MySQL Admin Connected
                </span>
                <span>• Operator: {user?.fullName || 'Platform Admin'}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={loadAllAdminData}
              disabled={refreshing}
              className="btn-outline"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.85rem', fontSize: '0.82rem' }}
              title="Refresh database records"
            >
              <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn-outline"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.85rem', fontSize: '0.82rem' }}
              title="Open Student Dashboard"
            >
              <ExternalLink size={14} />
              <span>Student View</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="btn-outline"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.85rem', fontSize: '0.82rem', borderColor: '#fecdd3', color: '#e11d48' }}
              title="Log out of admin session"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Tab Switcher Header */}
        <div style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '0 1.75rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
            {[
              { id: 'overview', label: 'Platform Overview', icon: BarChart3 },
              { id: 'students', label: `Student Accounts (${usersList.length})`, icon: Users },
              { id: 'skills', label: `Skill Categories (${skillsList.length})`, icon: Layers },
              { id: 'reports', label: `Dispute Reports (${reportsList.filter((r) => r.status === 'pending').length} New)`, icon: ShieldAlert },
              { id: 'activity', label: 'Audit Timeline', icon: Clock },
              { id: 'usage', label: 'Usage Reports', icon: FileText },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '0.9rem 1.1rem',
                    border: 'none',
                    borderBottom: isActive ? '3px solid #6366f1' : '3px solid transparent',
                    background: 'none',
                    color: isActive ? '#4f46e5' : '#64748b',
                    fontWeight: isActive ? 800 : 600,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Admin Scroll Body */}
        <main style={{ flex: 1, padding: '1.75rem', overflowY: 'auto' }}>
          <AnimatePresence mode="wait">
            {/* TAB 1: OVERVIEW & ANALYTICS */}
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {/* 6 Key Performance Metric Cards */}
                <div className="admin-stats-grid">
                  <div className="admin-stat-card indigo">
                    <div className="admin-stat-icon-wrap">
                      <Users size={22} />
                    </div>
                    <div className="admin-stat-number">{stats?.totalStudents ?? usersList.length}</div>
                    <div className="admin-stat-label">Total Registered Students</div>
                    <div style={{ fontSize: '0.74rem', color: '#6366f1', marginTop: '0.25rem', fontWeight: 700 }}>
                      From accredited universities
                    </div>
                  </div>

                  <div className="admin-stat-card emerald">
                    <div className="admin-stat-icon-wrap emerald">
                      <UserCheck size={22} />
                    </div>
                    <div className="admin-stat-number">{stats?.activeStudents ?? usersList.filter((u) => u.is_active).length}</div>
                    <div className="admin-stat-label">Active Active Students</div>
                    <div style={{ fontSize: '0.74rem', color: '#059669', marginTop: '0.25rem', fontWeight: 700 }}>
                      {stats?.totalStudents > 0
                        ? `${Math.round(((stats.activeStudents || 1) / stats.totalStudents) * 100)}% active participation`
                        : '100% verified'}
                    </div>
                  </div>

                  <div className="admin-stat-card">
                    <div className="admin-stat-icon-wrap">
                      <ArrowLeftRight size={22} />
                    </div>
                    <div className="admin-stat-number">{stats?.totalRequests ?? 0}</div>
                    <div className="admin-stat-label">Total Exchange Requests</div>
                    <div style={{ fontSize: '0.74rem', color: '#4f46e5', marginTop: '0.25rem', fontWeight: 700 }}>
                      {stats?.activeExchanges ?? 0} Accepted Barters
                    </div>
                  </div>

                  <div className="admin-stat-card amber">
                    <div className="admin-stat-icon-wrap amber">
                      <Clock size={22} />
                    </div>
                    <div className="admin-stat-number">{stats?.pendingRequests ?? 0}</div>
                    <div className="admin-stat-label">Pending Exchange Proposals</div>
                    <div style={{ fontSize: '0.74rem', color: '#d97706', marginTop: '0.25rem', fontWeight: 700 }}>
                      Awaiting receiver student action
                    </div>
                  </div>

                  <div className="admin-stat-card emerald">
                    <div className="admin-stat-icon-wrap emerald">
                      <CalendarCheck size={22} />
                    </div>
                    <div className="admin-stat-number">{stats?.completedSessions ?? 0}</div>
                    <div className="admin-stat-label">Completed Learning Sessions</div>
                    <div style={{ fontSize: '0.74rem', color: '#059669', marginTop: '0.25rem', fontWeight: 700 }}>
                      Dual-confirmed peer sessions
                    </div>
                  </div>

                  <div className="admin-stat-card rose">
                    <div className="admin-stat-icon-wrap rose">
                      <ShieldAlert size={22} />
                    </div>
                    <div className="admin-stat-number">{stats?.pendingReports ?? 0}</div>
                    <div className="admin-stat-label">Reported Profiles &amp; Disputes</div>
                    <div style={{ fontSize: '0.74rem', color: '#e11d48', marginTop: '0.25rem', fontWeight: 700 }}>
                      {stats?.reportedProfiles ?? 0} distinct student profiles reported
                    </div>
                  </div>
                </div>

                {/* Interactive SVG Charts Grid */}
                <div className="admin-charts-grid">
                  {/* Chart 1: Platform Activity Trends */}
                  <div className="admin-card">
                    <div className="admin-card-header">
                      <div>
                        <h3 className="admin-card-title">
                          <TrendingUp size={20} color="#6366f1" /> Learning &amp; Exchange Growth Trends
                        </h3>
                        <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                          Monthly volume of proposed barter requests vs. completed 1:1 sessions
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '0.85rem', fontSize: '0.75rem', fontWeight: 700 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#6366f1' }}>
                          <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#6366f1' }} />
                          Requests
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#10b981' }}>
                          <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#10b981' }} />
                          Sessions
                        </span>
                      </div>
                    </div>

                    {/* Animated Responsive Bar Chart */}
                    <div style={{ height: '220px', display: 'flex', alignItems: 'flex-end', gap: '1.25rem', padding: '1rem 0' }}>
                      {(stats?.activityTrends || []).map((item, idx) => (
                        <div
                          key={idx}
                          style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.5rem',
                            height: '100%',
                            justifyContent: 'flex-end',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', width: '100%', justifyContent: 'center' }}>
                            {/* Bar: Requests */}
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${Math.min(item.requests * 3.5, 160)}px` }}
                              transition={{ duration: 0.6, delay: idx * 0.08 }}
                              style={{
                                width: '18px',
                                background: 'linear-gradient(180deg, #818cf8, #6366f1)',
                                borderRadius: '4px 4px 0 0',
                              }}
                              title={`${item.month}: ${item.requests} Exchange Requests`}
                            />
                            {/* Bar: Completed Sessions */}
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${Math.min(item.completedSessions * 3.5, 160)}px` }}
                              transition={{ duration: 0.6, delay: idx * 0.08 + 0.05 }}
                              style={{
                                width: '18px',
                                background: 'linear-gradient(180deg, #34d399, #10b981)',
                                borderRadius: '4px 4px 0 0',
                              }}
                              title={`${item.month}: ${item.completedSessions} Completed Sessions`}
                            />
                          </div>
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b' }}>
                            {item.month}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Chart 2: Category Breakdown */}
                  <div className="admin-card">
                    <div className="admin-card-header">
                      <div>
                        <h3 className="admin-card-title">
                          <Layers size={20} color="#ec4899" /> Skill Category Density
                        </h3>
                        <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                          Distribution across curriculum domains
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      {(stats?.categoryBreakdown || []).map((cat, idx) => {
                        const total = stats?.totalSkills || 12;
                        const pct = Math.round((cat.count / total) * 100);
                        return (
                          <div key={idx}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.25rem' }}>
                              <span style={{ fontWeight: 600 }}>{cat.category}</span>
                              <span style={{ fontWeight: 800, color: '#6366f1' }}>{cat.count} ({pct}%)</span>
                            </div>
                            <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.8 }}
                                style={{
                                  height: '100%',
                                  background:
                                    idx % 3 === 0
                                      ? 'linear-gradient(90deg, #6366f1, #8b5cf6)'
                                      : idx % 3 === 1
                                      ? 'linear-gradient(90deg, #ec4899, #f43f5e)'
                                      : 'linear-gradient(90deg, #10b981, #059669)',
                                  borderRadius: '4px',
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Secondary Status Banner */}
                <div
                  style={{
                    background: 'linear-gradient(135deg, #ede9fe, #e0e7ff)',
                    border: '1px solid #c7d2fe',
                    borderRadius: '16px',
                    padding: '1.25rem 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#6366f1', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Coins size={22} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.98rem', color: '#1e1b4b' }}>
                        Platform Credit Circulation: {stats?.totalCreditsCirculating ?? 0} Credits
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#4338ca' }}>
                        1 Credit = 1 Hour of 1:1 learning. Zero inflation; 100% peer barter backed.
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab('usage')}
                    className="btn-primary"
                    style={{ padding: '0.6rem 1.2rem', fontSize: '0.82rem' }}
                  >
                    View Usage Analytics Report
                  </button>
                </div>
              </motion.div>
            )}

            {/* TAB 2: STUDENT ACCOUNTS MANAGEMENT */}
            {activeTab === 'students' && (
              <motion.div
                key="students"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="admin-card"
              >
                <div className="admin-card-header">
                  <div>
                    <h3 className="admin-card-title">
                      <Users size={20} color="#6366f1" /> Student Account Governance
                    </h3>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                      View, moderate, suspend, or reactivate university student accounts
                    </p>
                  </div>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#6366f1', background: '#ede9fe', padding: '0.25rem 0.65rem', borderRadius: '12px' }}>
                    {filteredUsers.length} Students Filtered
                  </span>
                </div>

                {/* Filter Controls */}
                <div className="admin-filters-bar">
                  <div className="admin-search-wrapper">
                    <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type="text"
                      value={userSearch}
                      onChange={(e) => {
                        setUserSearch(e.target.value);
                        setCurrentPage(1);
                      }}
                      placeholder="Search by student name, college, or email..."
                      className="admin-search-input"
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '0.65rem' }}>
                    <select
                      value={userStatusFilter}
                      onChange={(e) => {
                        setUserStatusFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="admin-filter-select"
                    >
                      <option value="all">All Statuses</option>
                      <option value="active">Active Accounts Only</option>
                      <option value="suspended">Suspended Accounts Only</option>
                    </select>
                  </div>
                </div>

                {/* Students Data Table */}
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Student Details</th>
                        <th>College &amp; Department</th>
                        <th>Academic Year</th>
                        <th>Credits</th>
                        <th>Completed Swaps</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedUsers.length === 0 ? (
                        <tr>
                          <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
                            No student accounts match the filter criteria.
                          </td>
                        </tr>
                      ) : (
                        paginatedUsers.map((st) => (
                          <tr key={st.id}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                <div
                                  className="sidebar-avatar"
                                  style={{
                                    width: '34px',
                                    height: '34px',
                                    fontSize: '0.8rem',
                                    fontWeight: 700,
                                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                    color: '#ffffff',
                                  }}
                                >
                                  {st.full_name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                                </div>
                                <div>
                                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{st.full_name}</div>
                                  <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{st.email}</div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div style={{ fontWeight: 600 }}>{st.collegeName}</div>
                              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{st.department}</div>
                            </td>
                            <td style={{ fontSize: '0.82rem' }}>{st.academicYear}</td>
                            <td>
                              <span style={{ fontWeight: 800, color: '#6366f1' }}>{st.creditsBalance}</span>
                            </td>
                            <td>
                              <span style={{ fontWeight: 700, color: '#059669' }}>{st.completedSessionsCount}</span>
                            </td>
                            <td>
                              <span className={`status-pill ${st.is_active ? 'active' : 'suspended'}`}>
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: st.is_active ? '#10b981' : '#f43f5e' }} />
                                {st.is_active ? 'Active' : 'Suspended'}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '0.4rem' }}>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSuspendModal({
                                      open: true,
                                      user: st,
                                      reason: '',
                                    })
                                  }
                                  className="btn-outline"
                                  style={{
                                    padding: '0.35rem 0.65rem',
                                    fontSize: '0.75rem',
                                    borderRadius: '8px',
                                    color: st.is_active ? '#e11d48' : '#059669',
                                    borderColor: st.is_active ? '#fecdd3' : '#a7f3d0',
                                  }}
                                >
                                  {st.is_active ? 'Suspend' : 'Reactivate'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setModerateModal({
                                      open: true,
                                      user: st,
                                      shortBio: st.profile?.short_bio || '',
                                      resetBio: false,
                                    })
                                  }
                                  className="btn-outline"
                                  style={{
                                    padding: '0.35rem 0.65rem',
                                    fontSize: '0.75rem',
                                    borderRadius: '8px',
                                  }}
                                  title="Moderate student bio / profile text"
                                >
                                  Bio
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="admin-pagination">
                  <div>
                    Showing {(currentPage - 1) * USERS_PER_PAGE + 1} to{' '}
                    {Math.min(currentPage * USERS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length} students
                  </div>
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      className="admin-pagination-btn"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setCurrentPage(i + 1)}
                        className="admin-pagination-btn"
                        style={{
                          backgroundColor: currentPage === i + 1 ? '#6366f1' : '#ffffff',
                          color: currentPage === i + 1 ? '#ffffff' : '#334155',
                          borderColor: currentPage === i + 1 ? '#6366f1' : '#cbd5e1',
                        }}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      type="button"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                      className="admin-pagination-btn"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 3: SKILL CATEGORIES & CATALOG MANAGEMENT */}
            {activeTab === 'skills' && (
              <motion.div
                key="skills"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="admin-card"
              >
                <div className="admin-card-header">
                  <div>
                    <h3 className="admin-card-title">
                      <Layers size={20} color="#6366f1" /> Platform Skill Catalog &amp; Category Governance
                    </h3>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                      Add, update, and manage official skills available for peer barter matching
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setSkillModal({
                        open: true,
                        isEditing: false,
                        skillId: null,
                        name: '',
                        category: 'Programming',
                        description: '',
                      })
                    }
                    className="btn-primary"
                    style={{ padding: '0.55rem 1rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <Plus size={16} />
                    <span>Add New Skill</span>
                  </button>
                </div>

                {/* Category Pills & Search */}
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                  {['All', ...SKILL_CATEGORIES].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSkillCategoryFilter(cat)}
                      style={{
                        padding: '0.4rem 0.85rem',
                        borderRadius: '9999px',
                        border: '1px solid',
                        borderColor: skillCategoryFilter === cat ? '#6366f1' : '#e2e8f0',
                        background: skillCategoryFilter === cat ? '#6366f1' : '#ffffff',
                        color: skillCategoryFilter === cat ? '#ffffff' : '#475569',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Skills Table */}
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Skill Name</th>
                        <th>Domain Category</th>
                        <th>Description</th>
                        <th>Student Mentors</th>
                        <th>Student Learners</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSkills.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                            No skills in this category.
                          </td>
                        </tr>
                      ) : (
                        filteredSkills.map((sk) => (
                          <tr key={sk.id}>
                            <td style={{ fontWeight: 700, color: '#0f172a' }}>{sk.name}</td>
                            <td>
                              <span
                                style={{
                                  display: 'inline-block',
                                  padding: '0.2rem 0.6rem',
                                  borderRadius: '6px',
                                  backgroundColor: '#ede9fe',
                                  color: '#6366f1',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                }}
                              >
                                {sk.category}
                              </span>
                            </td>
                            <td style={{ fontSize: '0.82rem', color: '#64748b', maxWidth: '300px' }}>
                              {sk.description}
                            </td>
                            <td>
                              <span style={{ fontWeight: 800, color: '#10b981' }}>{sk.teachingCount || 0}</span>
                            </td>
                            <td>
                              <span style={{ fontWeight: 800, color: '#6366f1' }}>{sk.learningCount || 0}</span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '0.35rem' }}>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSkillModal({
                                      open: true,
                                      isEditing: true,
                                      skillId: sk.id,
                                      name: sk.name,
                                      category: sk.category,
                                      description: sk.description,
                                    })
                                  }
                                  className="btn-outline"
                                  style={{ padding: '0.3rem 0.55rem', borderRadius: '6px' }}
                                  title="Edit skill"
                                >
                                  <Edit2 size={13} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSkill(sk.id, sk.name)}
                                  className="btn-outline"
                                  style={{ padding: '0.3rem 0.55rem', borderRadius: '6px', color: '#e11d48', borderColor: '#fecdd3' }}
                                  title="Delete skill"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* TAB 4: DISPUTE & CONTENT MODERATION REPORTS */}
            {activeTab === 'reports' && (
              <motion.div
                key="reports"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="admin-card"
              >
                <div className="admin-card-header">
                  <div>
                    <h3 className="admin-card-title">
                      <ShieldAlert size={20} color="#e11d48" /> Student Dispute &amp; Content Moderation
                    </h3>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                      Review reported students, solve barter mismatches, and enforce community standards
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    {['all', 'pending', 'resolved', 'dismissed'].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setReportStatusFilter(st)}
                        style={{
                          padding: '0.35rem 0.75rem',
                          borderRadius: '8px',
                          border: '1px solid',
                          borderColor: reportStatusFilter === st ? '#6366f1' : '#e2e8f0',
                          background: reportStatusFilter === st ? '#ede9fe' : '#ffffff',
                          color: reportStatusFilter === st ? '#4f46e5' : '#64748b',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          textTransform: 'capitalize',
                        }}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {filteredReports.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
                      <CheckCircle2 size={36} style={{ margin: '0 auto 0.5rem', color: '#10b981' }} />
                      <p style={{ fontSize: '0.92rem', fontWeight: 600 }}>All dispute reports handled!</p>
                      <span style={{ fontSize: '0.78rem' }}>No disputes matching the selected status filter.</span>
                    </div>
                  ) : (
                    filteredReports.map((rep) => (
                      <div
                        key={rep.id}
                        style={{
                          padding: '1.25rem',
                          border: '1px solid #fee2e2',
                          borderRadius: '14px',
                          background: rep.status === 'pending' ? '#fffbfa' : '#ffffff',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span className={`status-pill ${rep.status}`}>
                                {rep.status}
                              </span>
                              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#e11d48', background: '#ffe4e6', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                                Reason: {rep.reason}
                              </span>
                              <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                                Filed: {rep.created_at ? new Date(rep.created_at).toLocaleDateString() : 'Recent'}
                              </span>
                            </div>
                            <div style={{ marginTop: '0.5rem', fontSize: '0.86rem', color: '#0f172a' }}>
                              <strong>Reporter:</strong> {rep.reporterName || `Student #${rep.reporter_id}`} ({rep.reporterEmail})
                              &nbsp;→&nbsp;
                              <strong>Reported:</strong> {rep.reportedUserName || `Student #${rep.reported_user_id}`} ({rep.reportedUserEmail})
                            </div>
                            <p style={{ margin: '0.5rem 0 0', fontSize: '0.84rem', color: '#334155', lineHeight: 1.45, fontStyle: 'italic' }}>
                              "{rep.description}"
                            </p>
                            {rep.resolution_notes && (
                              <div style={{ marginTop: '0.5rem', fontSize: '0.78rem', color: '#059669', background: '#ecfdf5', padding: '0.4rem 0.65rem', borderRadius: '6px' }}>
                                <strong>Resolution Notes:</strong> {rep.resolution_notes}
                              </div>
                            )}
                          </div>

                          {rep.status === 'pending' && (
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                              <button
                                type="button"
                                onClick={() => setResolveModal({ open: true, report: rep, notes: '' })}
                                className="btn-primary"
                                style={{ padding: '0.4rem 0.85rem', fontSize: '0.76rem' }}
                              >
                                Resolve Dispute
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDismissReport(rep.id)}
                                className="btn-outline"
                                style={{ padding: '0.4rem 0.85rem', fontSize: '0.76rem' }}
                              >
                                Dismiss
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB 5: PLATFORM AUDIT TIMELINE */}
            {activeTab === 'activity' && (
              <motion.div
                key="activity"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="admin-card"
              >
                <div className="admin-card-header">
                  <div>
                    <h3 className="admin-card-title">
                      <Clock size={20} color="#6366f1" /> Platform Audit Activity Timeline
                    </h3>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                      Real-time chronological ledger of registrations, sessions, credits, and dispute resolutions
                    </p>
                  </div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6366f1' }}>
                    {activityList.length} Recent Events Logged
                  </span>
                </div>

                <div className="admin-timeline">
                  {activityList.length === 0 ? (
                    <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No recent audit activity records found.</p>
                  ) : (
                    activityList.map((item) => (
                      <div key={item.id} className="admin-timeline-item">
                        <div className="admin-timeline-icon">
                          {item.type === 'session' ? (
                            <CalendarCheck size={18} />
                          ) : item.type === 'credit_transaction' ? (
                            <Coins size={18} />
                          ) : item.type === 'exchange_request' ? (
                            <ArrowLeftRight size={18} />
                          ) : (
                            <ShieldAlert size={18} />
                          )}
                        </div>
                        <div className="admin-timeline-content">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>{item.title}</strong>
                            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                              {item.timestamp ? new Date(item.timestamp).toLocaleString() : 'Recent'}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '0.2rem' }}>
                            {item.description}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB 6: USAGE REPORTS & EXPORT */}
            {activeTab === 'usage' && (
              <motion.div
                key="usage"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="admin-card"
              >
                <div className="admin-card-header">
                  <div>
                    <h3 className="admin-card-title">
                      <FileText size={20} color="#6366f1" /> Official Platform Usage &amp; Analytics Report
                    </h3>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                      Generated live from production MySQL schema tables
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleExportJSON}
                    className="btn-primary"
                    style={{ padding: '0.55rem 1rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <Download size={15} />
                    <span>Export JSON Report</span>
                  </button>
                </div>

                {usageReport ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Summary KPI Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                      <div style={{ padding: '1rem', background: '#faf5ff', border: '1px solid #ede9fe', borderRadius: '12px' }}>
                        <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>Total Students</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#6366f1' }}>{usageReport.summary?.totalStudents}</div>
                      </div>
                      <div style={{ padding: '1rem', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '12px' }}>
                        <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>Completed Sessions</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#059669' }}>{usageReport.summary?.completedSessions}</div>
                      </div>
                      <div style={{ padding: '1rem', background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '12px' }}>
                        <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>Completion Success Rate</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#4f46e5' }}>{usageReport.summary?.completionRate}</div>
                      </div>
                      <div style={{ padding: '1rem', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px' }}>
                        <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>Circulating Barter Credits</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#d97706' }}>{usageReport.summary?.totalCirculatingCredits}</div>
                      </div>
                    </div>

                    {/* Top In-Demand Skills Table */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                      <div style={{ border: '1px solid #ede9fe', borderRadius: '12px', padding: '1rem' }}>
                        <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.92rem', fontWeight: 800, color: '#059669' }}>
                          Top 5 Skills Taught by Mentors
                        </h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {(usageReport.topTaughtSkills || []).map((sk, idx) => (
                            <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
                              <span>{idx + 1}. {sk.name}</span>
                              <strong style={{ color: '#059669' }}>{sk.count} tutors</strong>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div style={{ border: '1px solid #ede9fe', borderRadius: '12px', padding: '1rem' }}>
                        <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.92rem', fontWeight: 800, color: '#6366f1' }}>
                          Top 5 Skills Wanted by Learners
                        </h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {(usageReport.topWantedSkills || []).map((sk, idx) => (
                            <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
                              <span>{idx + 1}. {sk.name}</span>
                              <strong style={{ color: '#6366f1' }}>{sk.count} learners</strong>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Department Distribution */}
                    <div>
                      <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.92rem', fontWeight: 800 }}>
                        Student Enrollment by Engineering Department
                      </h4>
                      <div className="admin-table-container">
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>Department / Faculty</th>
                              <th>Enrolled Students</th>
                              <th>Platform Share</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(usageReport.departmentDistribution || []).map((dept, idx) => {
                              const share = Math.round((dept.studentCount / (usageReport.summary?.totalStudents || 1)) * 100);
                              return (
                                <tr key={idx}>
                                  <td style={{ fontWeight: 600 }}>{dept.department}</td>
                                  <td>{dept.studentCount} students</td>
                                  <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                      <div style={{ width: '80px', height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                                        <div style={{ width: `${share}%`, height: '100%', background: '#6366f1' }} />
                                      </div>
                                      <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{share}%</span>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p style={{ color: '#94a3b8' }}>Loading usage metrics report...</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* MODAL 1: SUSPEND / REACTIVATE ACCOUNT */}
      {suspendModal.open && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-box">
            <div className="admin-modal-header">
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: suspendModal.user?.is_active ? '#e11d48' : '#059669' }}>
                {suspendModal.user?.is_active ? 'Suspend Student Account' : 'Reactivate Student Account'}
              </h3>
              <button
                type="button"
                onClick={() => setSuspendModal({ open: false, user: null, reason: '' })}
                className="admin-modal-close-btn"
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.5 }}>
              You are about to {suspendModal.user?.is_active ? 'suspend' : 'reactivate'} the account of{' '}
              <strong>{suspendModal.user?.full_name}</strong> ({suspendModal.user?.email}).
              {suspendModal.user?.is_active
                ? ' Suspended students are blocked from logging in, booking sessions, and sending messages.'
                : ' Reactivating will restore full platform barter and exchange capabilities.'}
            </p>

            <div style={{ marginTop: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                Moderation Reason / Action Notes
              </label>
              <textarea
                rows={3}
                value={suspendModal.reason}
                onChange={(e) => setSuspendModal({ ...suspendModal, reason: e.target.value })}
                placeholder="Enter audit note (e.g. Terms of Service dispute review)..."
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  outline: 'none',
                  fontSize: '0.85rem',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', marginTop: '1.25rem' }}>
              <button
                type="button"
                onClick={() => setSuspendModal({ open: false, user: null, reason: '' })}
                className="btn-outline"
                style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmStatusToggle}
                className="btn-primary"
                style={{
                  padding: '0.6rem 1.25rem',
                  fontSize: '0.85rem',
                  backgroundColor: suspendModal.user?.is_active ? '#e11d48' : '#059669',
                }}
              >
                Confirm {suspendModal.user?.is_active ? 'Suspension' : 'Reactivation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: RESOLVE DISPUTE REPORT */}
      {resolveModal.open && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-box">
            <div className="admin-modal-header">
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#4f46e5' }}>
                Resolve Dispute Report #{resolveModal.report?.id}
              </h3>
              <button
                type="button"
                onClick={() => setResolveModal({ open: false, report: null, notes: '' })}
                className="admin-modal-close-btn"
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#475569' }}>
              Document the resolution actions taken between {resolveModal.report?.reporterName} and{' '}
              {resolveModal.report?.reportedUserName}.
            </p>

            <div style={{ marginTop: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                Resolution Outcome &amp; Notes
              </label>
              <textarea
                rows={3}
                value={resolveModal.notes}
                onChange={(e) => setResolveModal({ ...resolveModal, notes: e.target.value })}
                placeholder="e.g. Mutual compromise reached; curriculum scope clarified; credits re-balanced..."
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  outline: 'none',
                  fontSize: '0.85rem',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', marginTop: '1.25rem' }}>
              <button
                type="button"
                onClick={() => setResolveModal({ open: false, report: null, notes: '' })}
                className="btn-outline"
                style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmResolveReport}
                className="btn-primary"
                style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem' }}
              >
                Mark Resolved
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD / EDIT SKILL */}
      {skillModal.open && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-box">
            <div className="admin-modal-header">
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                {skillModal.isEditing ? 'Edit Catalog Skill' : 'Add New Catalog Skill'}
              </h3>
              <button
                type="button"
                onClick={() => setSkillModal({ open: false, isEditing: false, skillId: null, name: '', category: 'Programming', description: '' })}
                className="admin-modal-close-btn"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveSkill} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Skill Name
                </label>
                <input
                  type="text"
                  required
                  value={skillModal.name}
                  onChange={(e) => setSkillModal({ ...skillModal, name: e.target.value })}
                  placeholder="e.g. Next.js 15 App Router"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Skill Category
                </label>
                <select
                  value={skillModal.category}
                  onChange={(e) => setSkillModal({ ...skillModal, category: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    backgroundColor: '#ffffff',
                  }}
                >
                  {SKILL_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Description &amp; Syllabus Overview
                </label>
                <textarea
                  rows={3}
                  value={skillModal.description}
                  onChange={(e) => setSkillModal({ ...skillModal, description: e.target.value })}
                  placeholder="Short summary of what students will learn or teach in this skill..."
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', marginTop: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setSkillModal({ open: false, isEditing: false, skillId: null, name: '', category: 'Programming', description: '' })}
                  className="btn-outline"
                  style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem' }}
                >
                  {skillModal.isEditing ? 'Save Changes' : 'Create Skill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: MODERATE STUDENT BIO */}
      {moderateModal.open && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-box">
            <div className="admin-modal-header">
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                Moderate Student Profile: {moderateModal.user?.full_name}
              </h3>
              <button
                type="button"
                onClick={() => setModerateModal({ open: false, user: null, shortBio: '', resetBio: false })}
                className="admin-modal-close-btn"
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.84rem', color: '#475569' }}>
              Edit or reset the student's public bio to ensure compliance with university community standards.
            </p>

            <div style={{ marginTop: '0.75rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                Profile Short Bio Text
              </label>
              <textarea
                rows={3}
                value={moderateModal.shortBio}
                onChange={(e) => setModerateModal({ ...moderateModal, shortBio: e.target.value, resetBio: false })}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem',
                }}
              />
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem', fontSize: '0.82rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={moderateModal.resetBio}
                onChange={(e) => setModerateModal({ ...moderateModal, resetBio: e.target.checked })}
              />
              <span style={{ fontWeight: 600, color: '#e11d48' }}>
                Reset to default moderation standard bio
              </span>
            </label>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', marginTop: '1.25rem' }}>
              <button
                type="button"
                onClick={() => setModerateModal({ open: false, user: null, shortBio: '', resetBio: false })}
                className="btn-outline"
                style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmModerateBio}
                className="btn-primary"
                style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem' }}
              >
                Apply Moderation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

