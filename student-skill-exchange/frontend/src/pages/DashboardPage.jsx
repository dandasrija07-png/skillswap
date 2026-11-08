import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  LayoutDashboard,
  UserCheck,
  Layers,
  Compass,
  ArrowLeftRight,
  CalendarClock,
  MessageSquare,
  TrendingUp,
  Coins,
  Star,
  Settings,
  Send,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Video,
  ShieldAlert,
  Users,
  Activity,
  UserX,
  FileCheck2,
} from 'lucide-react';
import Sidebar from '../components/dashboard/Sidebar.jsx';
import TopNavbar from '../components/dashboard/TopNavbar.jsx';
import OverviewTab from '../components/dashboard/OverviewTab.jsx';
import ProfileView from '../components/profile/ProfileView.jsx';
import SkillsView from '../components/skills/SkillsView.jsx';
import ExploreStudentsPage from './ExploreStudentsPage.jsx';
import ExchangeRequestsView from '../components/requests/ExchangeRequestsView.jsx';
import MySessionsView from '../components/sessions/MySessionsView.jsx';
import Toast from '../components/common/Toast.jsx';
import {
  getDashboardOverview,
  getConversations,
  getChatThread,
  sendChatMessage,
  markChatRead,
  getCreditHistory,
  getStudentReviews,
  getAdminStats,
  getAdminUsers,
  updateUserStatus,
  getAdminReports,
  resolveReport,
} from '../services/dashboardService.js';
import { getProfileData, getTeachingSkills, getLearningSkills } from '../services/profileSkillService.js';
import {
  onReceiveMessage,
  onNotificationReceived,
  sendMessage as emitSocketMessage,
  emitTyping,
  onPartnerTyping,
  onUserStatusChanged,
  onOnlineUsersList,
  checkOnlineStatus,
  onChatError,
} from '../services/socketService.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  // Navigation and layout state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Search and notifications
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);

  // Data states
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  // Editable lists for interactive state
  const [teachingSkills, setTeachingSkills] = useState([]);
  const [learningSkills, setLearningSkills] = useState([]);
  const [exchangeRequests, setExchangeRequests] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [creditHistory, setCreditHistory] = useState([]);
  const [peerReviews, setPeerReviews] = useState([]);

  // Admin states
  const [adminStats, setAdminStats] = useState(null);
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminReports, setAdminReports] = useState([]);

  // Chat & Presence states
  const [conversations, setConversations] = useState([]);
  const [partnerId, setPartnerId] = useState(2); // Priya Iyer by default
  const [activePartner, setActivePartner] = useState({
    partnerId: 2,
    name: 'Priya Iyer',
    department: 'Information Technology',
    collegeName: 'VIT Vellore',
    avatarUrl: '',
    lastMessage: 'Excited for our session!',
  });
  const [onlineUserMap, setOnlineUserMap] = useState({});
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');

  const typingTimeoutRef = useRef(null);
  const chatBottomRef = useRef(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (activeTab === 'messages' && chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isPartnerTyping, activeTab]);

  // Initial load
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [data, profile, tSkills, lSkills, txHistory, reviewsData, convList, thread] = await Promise.all([
          getDashboardOverview(),
          getProfileData(),
          getTeachingSkills(),
          getLearningSkills(),
          getCreditHistory().catch(() => []),
          getStudentReviews(user?.id || 1).catch(() => ({ reviews: [] })),
          getConversations().catch(() => []),
          getChatThread(2).catch(() => []),
        ]);

        setDashboardData({
          ...data,
          profile: { ...data.profile, ...profile },
        });
        setTeachingSkills(tSkills.length > 0 ? tSkills : data.teachingSkills);
        setLearningSkills(lSkills.length > 0 ? lSkills : data.learningSkills);
        setExchangeRequests(data.exchangeRequests);
        setUpcomingSessions(data.upcomingSessions);
        setNotifications(data.notifications);
        setCreditHistory(txHistory);
        setPeerReviews(reviewsData.reviews || []);

        // Setup conversations list
        let activeConvList = convList;
        if (!activeConvList || activeConvList.length === 0) {
          activeConvList = [
            {
              partnerId: 2,
              name: 'Priya Iyer',
              department: 'Information Technology',
              collegeName: 'Vellore Institute of Technology',
              lastMessage: 'Awesome! In return, I will walk you through Figma auto-layout and design tokens.',
              unreadCount: 0,
            },
            {
              partnerId: 3,
              name: 'Sneha Patel',
              department: 'Computer Science & Engineering',
              collegeName: 'NIT Trichy',
              lastMessage: 'Excited to practice graph traversal algorithms!',
              unreadCount: 0,
            },
            {
              partnerId: 4,
              name: 'Rohan Verma',
              department: 'Computer Science & Engineering',
              collegeName: 'BITS Pilani',
              lastMessage: 'Hey Aarav, trade weekend session Docker for TypeScript!',
              unreadCount: 0,
            },
          ];
        }
        setConversations(activeConvList);

        if (thread && thread.length > 0) {
          setChatMessages(
            thread.map((m) => ({
              id: m.id,
              sender: m.senderName || (m.sender_id === user?.id ? 'Me' : 'Priya Iyer'),
              text: m.message_text,
              time: m.created_at
                ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : 'Recent',
              isMe: m.isMe || m.sender_id === user?.id,
            }))
          );
        } else {
          setChatMessages([
            { id: 1, sender: 'Priya Iyer', text: 'Hey Aarav! Excited for our exchange session on React state management.', time: '10:30 AM', isMe: false },
            { id: 2, sender: 'Me', text: 'Hi Priya! Yes, I prepared a few real-world examples with custom hooks.', time: '10:35 AM', isMe: true },
          ]);
        }

        // If admin, load platform moderation data
        if (isAdmin) {
          const [stats, usersList, reportsList] = await Promise.all([
            getAdminStats().catch(() => null),
            getAdminUsers().catch(() => []),
            getAdminReports().catch(() => []),
          ]);
          setAdminStats(stats);
          setAdminUsers(usersList);
          setAdminReports(reportsList);
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();

    // Check initial online presence
    checkOnlineStatus([1, 2, 3, 4, 5, 6, 7], (res) => {
      if (res?.onlineStatus) {
        setOnlineUserMap((prev) => ({ ...prev, ...res.onlineStatus }));
      }
    });

    // Real-Time Socket.IO listeners
    const unsubPresence = onUserStatusChanged(({ userId, isOnline }) => {
      setOnlineUserMap((prev) => ({ ...prev, [userId]: isOnline }));
    });

    const unsubOnlineList = onOnlineUsersList((ids) => {
      const map = {};
      for (const id of ids) map[id] = true;
      setOnlineUserMap((prev) => ({ ...prev, ...map }));
    });

    const unsubTyping = onPartnerTyping(({ senderId, isTyping }) => {
      if (Number(senderId) === partnerId) {
        setIsPartnerTyping(Boolean(isTyping));
      }
    });

    const unsubChatError = onChatError((err) => {
      setToast({
        type: 'error',
        title: 'Chat Blocked',
        message: err.message || 'Permission denied.',
      });
    });

    const unsubMsg = onReceiveMessage((incoming) => {
      const incomingSenderId = Number(incoming.sender_id || incoming.senderId);
      const isCurrentThread = incomingSenderId === partnerId || Number(incoming.receiver_id || incoming.receiverId) === partnerId;

      if (isCurrentThread) {
        setChatMessages((prev) => [
          ...prev,
          {
            id: incoming.id || Date.now(),
            sender: incoming.senderName || 'Peer',
            text: incoming.message_text || incoming.text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMe: false,
          },
        ]);
      }

      setConversations((prev) =>
        prev.map((c) =>
          c.partnerId === incomingSenderId
            ? {
                ...c,
                lastMessage: incoming.message_text || incoming.text,
                lastMessageTime: new Date(),
                unreadCount: isCurrentThread ? 0 : (c.unreadCount || 0) + 1,
              }
            : c
        )
      );

      setToast({
        type: 'info',
        title: `Message from ${incoming.senderName || 'Peer'}`,
        message: incoming.message_text || incoming.text,
      });
    });

    const unsubNotif = onNotificationReceived((incoming) => {
      setNotifications((prev) => [incoming, ...prev]);
      setToast({
        type: 'info',
        title: incoming.title || 'New Notification',
        message: incoming.message,
      });
    });

    return () => {
      unsubPresence();
      unsubOnlineList();
      unsubTyping();
      unsubChatError();
      unsubMsg();
      unsubNotif();
    };
  }, [user?.id, isAdmin, partnerId]);

  // Handle switching active conversation partner
  const handleSelectPartner = async (partner) => {
    setPartnerId(partner.partnerId);
    setActivePartner(partner);
    setIsPartnerTyping(false);
    try {
      const thread = await getChatThread(partner.partnerId);
      setChatMessages(
        thread.map((m) => ({
          id: m.id,
          sender: m.senderName || (m.sender_id === user?.id ? 'Me' : partner.name),
          text: m.message_text,
          time: m.created_at
            ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : 'Recent',
          isMe: m.isMe || m.sender_id === user?.id,
        }))
      );
      await markChatRead(partner.partnerId);
      setConversations((prev) =>
        prev.map((c) => (c.partnerId === partner.partnerId ? { ...c, unreadCount: 0 } : c))
      );
    } catch (err) {
      console.error('Error switching partner:', err);
    }
  };

  // Handle input change and send typing event
  const handleInputChange = (e) => {
    setMessageInput(e.target.value);
    emitTyping(partnerId, true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      emitTyping(partnerId, false);
    }, 1500);
  };

  // Handle chat sending
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    emitTyping(partnerId, false);

    const text = messageInput.trim();
    setMessageInput('');

    const optimisticMsg = {
      id: Date.now(),
      sender: 'Me',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
    };

    setChatMessages((prev) => [...prev, optimisticMsg]);

    setConversations((prev) =>
      prev.map((c) =>
        c.partnerId === partnerId
          ? { ...c, lastMessage: text, lastMessageTime: new Date() }
          : c
      )
    );

    try {
      await sendChatMessage({ receiverId: partnerId, messageText: text });
      emitSocketMessage({ receiverId: partnerId, messageText: text });
    } catch (err) {
      console.error('Error sending message:', err);
      setToast({
        type: 'error',
        title: 'Message Failed',
        message: err.message || 'Unable to deliver message.',
      });
    }
  };

  // Admin Action: Toggle User Account Status
  const handleToggleUserStatus = async (userId, currentActive) => {
    try {
      await updateUserStatus(userId, !currentActive);
      setAdminUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_active: currentActive ? 0 : 1 } : u))
      );
      setToast({
        type: 'success',
        title: 'Account Status Updated',
        message: `User account #${userId} ${!currentActive ? 'activated' : 'suspended'} in MySQL.`,
      });
    } catch (err) {
      setToast({ type: 'error', title: 'Update Failed', message: err.message });
    }
  };

  // Admin Action: Resolve Report
  const handleResolveReport = async (reportId) => {
    try {
      await resolveReport(reportId, 'Reviewed and verified by platform administrator.');
      setAdminReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status: 'resolved' } : r))
      );
      setToast({
        type: 'success',
        title: 'Dispute Resolved',
        message: `Moderation report #${reportId} marked resolved in MySQL.`,
      });
    } catch (err) {
      setToast({ type: 'error', title: 'Action Failed', message: err.message });
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Toast Notification Container */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Left Collapsible Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        studentProfile={dashboardData?.profile}
        requestsCount={exchangeRequests.length}
        messagesCount={chatMessages.length > 0 ? 1 : 0}
      />

      {/* Main Content Area */}
      <div className="dashboard-main-content">
        {/* Top Navbar */}
        <TopNavbar
          studentProfile={dashboardData?.profile}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          notifications={notifications}
          setNotifications={setNotifications}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
          setActiveTab={setActiveTab}
        />

        {/* Scrollable Dashboard Body */}
        <main className="dashboard-scroll-body">
          {loading ? (
            /* Skeleton Loading State */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '2rem 0' }}>
              <div
                style={{
                  height: '140px',
                  borderRadius: '20px',
                  background: 'linear-gradient(90deg, #ede9fe 25%, #f5f3ff 50%, #ede9fe 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'skeletonPulse 1.5s infinite',
                }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    style={{
                      height: '100px',
                      borderRadius: '16px',
                      background: '#f1f5f9',
                      animation: 'skeletonPulse 1.5s infinite',
                    }}
                  />
                ))}
              </div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {/* TAB 1: DASHBOARD OVERVIEW */}
              {activeTab === 'dashboard' && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <OverviewTab
                    profile={dashboardData?.profile}
                    teachingSkills={teachingSkills}
                    setTeachingSkills={setTeachingSkills}
                    learningSkills={learningSkills}
                    setLearningSkills={setLearningSkills}
                    suggestedMatches={dashboardData?.suggestedMatches}
                    exchangeRequests={exchangeRequests}
                    setExchangeRequests={setExchangeRequests}
                    upcomingSessions={upcomingSessions}
                    activityLog={dashboardData?.activityLog}
                    weeklyChartData={dashboardData?.weeklyChartData}
                    onTriggerToast={setToast}
                    setActiveTab={setActiveTab}
                  />
                </motion.div>
              )}

              {/* TAB 2: MY PROFILE */}
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <ProfileView
                    profile={dashboardData?.profile}
                    onProfileUpdated={(updated) =>
                      setDashboardData((prev) => ({ ...prev, profile: updated }))
                    }
                    onTriggerToast={setToast}
                  />
                </motion.div>
              )}

              {/* TAB 3: MY SKILLS */}
              {activeTab === 'skills' && (
                <motion.div
                  key="skills"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <SkillsView
                    teachingSkills={teachingSkills}
                    setTeachingSkills={setTeachingSkills}
                    learningSkills={learningSkills}
                    setLearningSkills={setLearningSkills}
                    onTriggerToast={setToast}
                  />
                </motion.div>
              )}

              {/* TAB 4: EXPLORE STUDENTS */}
              {activeTab === 'explore' && (
                <motion.div
                  key="explore"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <ExploreStudentsPage embeddedInDashboard onTriggerToast={setToast} />
                </motion.div>
              )}

              {/* TAB 5: EXCHANGE REQUESTS */}
              {activeTab === 'requests' && (
                <motion.div
                  key="requests"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <ExchangeRequestsView
                    onTriggerToast={setToast}
                    onNavigateToMessages={() => setActiveTab('messages')}
                  />
                </motion.div>
              )}

              {/* TAB 6: MY SESSIONS */}
              {activeTab === 'sessions' && (
                <motion.div
                  key="sessions"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <MySessionsView
                    onTriggerToast={setToast}
                    onCreditUpdate={(newBalance) => {
                      setDashboardData((prev) =>
                        prev
                          ? {
                              ...prev,
                              profile: {
                                ...prev.profile,
                                creditsBalance: newBalance,
                              },
                            }
                          : prev
                      );
                    }}
                  />
                </motion.div>
              )}

              {/* TAB 7: MESSAGES */}
              {activeTab === 'messages' && (
                <motion.div
                  key="messages"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="dashboard-card"
                  style={{
                    display: 'flex',
                    height: '620px',
                    padding: 0,
                    overflow: 'hidden',
                    borderRadius: '16px',
                    border: '1px solid #ede9fe',
                    backgroundColor: '#ffffff',
                  }}
                >
                  {/* Left Column: Authorized Exchange Partner List */}
                  <div
                    style={{
                      width: '280px',
                      borderRight: '1px solid #ede9fe',
                      display: 'flex',
                      flexDirection: 'column',
                      background: '#faf5ff',
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        padding: '1rem',
                        borderBottom: '1px solid #ede9fe',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: '#f5f3ff',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#1e1b4b' }}>
                          Exchange Chats
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          Authorized peer partners
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.5rem',
                          borderRadius: '12px',
                          background: '#ede9fe',
                          color: '#6366f1',
                        }}
                      >
                        {conversations.length} Active
                      </span>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto' }}>
                      {conversations.length === 0 ? (
                        <div style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.82rem' }}>
                          No active peer exchanges yet. Accept a swap request to unlock messaging!
                        </div>
                      ) : (
                        conversations.map((c) => {
                          const isOnline = Boolean(onlineUserMap[c.partnerId]);
                          const isSelected = c.partnerId === partnerId;
                          return (
                            <div
                              key={c.partnerId}
                              onClick={() => handleSelectPartner(c)}
                              style={{
                                padding: '0.85rem 1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                cursor: 'pointer',
                                borderBottom: '1px solid #f1f5f9',
                                background: isSelected ? '#ede9fe' : 'transparent',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              <div style={{ position: 'relative', flexShrink: 0 }}>
                                <div
                                  className="sidebar-avatar"
                                  style={{
                                    width: '36px',
                                    height: '36px',
                                    fontSize: '0.82rem',
                                    fontWeight: 700,
                                    background: isSelected
                                      ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                                      : '#cbd5e1',
                                    color: '#ffffff',
                                  }}
                                >
                                  {c.name ? c.name.split(' ').map((n) => n[0]).slice(0, 2).join('') : 'ST'}
                                </div>
                                <span
                                  style={{
                                    position: 'absolute',
                                    bottom: '0px',
                                    right: '0px',
                                    width: '10px',
                                    height: '10px',
                                    borderRadius: '50%',
                                    backgroundColor: isOnline ? '#10b981' : '#94a3b8',
                                    border: '2px solid #ffffff',
                                  }}
                                  title={isOnline ? 'Online now' : 'Offline'}
                                />
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span
                                    style={{
                                      fontWeight: isSelected ? 800 : 600,
                                      fontSize: '0.85rem',
                                      color: '#0f172a',
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                    }}
                                  >
                                    {c.name}
                                  </span>
                                  {c.unreadCount > 0 && (
                                    <span
                                      style={{
                                        fontSize: '0.68rem',
                                        fontWeight: 800,
                                        padding: '0.1rem 0.45rem',
                                        borderRadius: '9999px',
                                        background: '#6366f1',
                                        color: '#ffffff',
                                      }}
                                    >
                                      {c.unreadCount}
                                    </span>
                                  )}
                                </div>
                                <div
                                  style={{
                                    fontSize: '0.74rem',
                                    color: '#64748b',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    marginTop: '2px',
                                  }}
                                >
                                  {c.lastMessage}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Right Column: Active Conversation Thread */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#ffffff', minWidth: 0 }}>
                    {/* Thread Header */}
                    <div
                      style={{
                        padding: '0.85rem 1.25rem',
                        borderBottom: '1px solid #ede9fe',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: '#faf5ff',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ position: 'relative' }}>
                          <div
                            className="sidebar-avatar"
                            style={{
                              width: '36px',
                              height: '36px',
                              fontSize: '0.82rem',
                              fontWeight: 700,
                              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                              color: '#ffffff',
                            }}
                          >
                            {activePartner.name
                              ? activePartner.name.split(' ').map((n) => n[0]).slice(0, 2).join('')
                              : 'PI'}
                          </div>
                          <span
                            style={{
                              position: 'absolute',
                              bottom: 0,
                              right: 0,
                              width: '10px',
                              height: '10px',
                              borderRadius: '50%',
                              backgroundColor: onlineUserMap[partnerId] ? '#10b981' : '#94a3b8',
                              border: '2px solid #ffffff',
                            }}
                          />
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a' }}>
                            {activePartner.name}
                          </div>
                          <div
                            style={{
                              fontSize: '0.72rem',
                              color: onlineUserMap[partnerId] ? '#10b981' : '#64748b',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                            }}
                          >
                            <span>
                              {onlineUserMap[partnerId]
                                ? '🟢 Connected via Socket.IO'
                                : '⚪ Offline (messages stored in MySQL)'}
                            </span>
                            <span>• {activePartner.collegeName || 'Campus Peer'}</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          type="button"
                          onClick={() => setActiveTab('sessions')}
                          className="btn-outline"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.76rem', borderRadius: '8px' }}
                        >
                          Book Session
                        </button>
                      </div>
                    </div>

                    {/* Message Thread History */}
                    <div
                      style={{
                        flex: 1,
                        padding: '1.25rem',
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                        background: '#fcfaff',
                      }}
                    >
                      {chatMessages.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#94a3b8', margin: 'auto' }}>
                          <MessageSquare size={36} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
                          <p style={{ fontSize: '0.88rem', fontWeight: 600 }}>No messages yet with {activePartner.name}.</p>
                          <span style={{ fontSize: '0.76rem', color: '#818cf8' }}>
                            Bilateral exchange authorization verified. Say hello to start collaborating!
                          </span>
                        </div>
                      ) : (
                        chatMessages.map((msg) => (
                          <div
                            key={msg.id}
                            style={{
                              alignSelf: msg.isMe ? 'flex-end' : 'flex-start',
                              maxWidth: '72%',
                              backgroundColor: msg.isMe ? '#6366f1' : '#ffffff',
                              color: msg.isMe ? '#ffffff' : '#0f172a',
                              padding: '0.75rem 1rem',
                              borderRadius: msg.isMe ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                              border: msg.isMe ? 'none' : '1px solid #ede9fe',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                              fontSize: '0.88rem',
                              lineHeight: 1.45,
                            }}
                          >
                            <div>{msg.text}</div>
                            <div
                              style={{
                                fontSize: '0.66rem',
                                opacity: 0.75,
                                textAlign: 'right',
                                marginTop: '0.25rem',
                              }}
                            >
                              {msg.time}
                            </div>
                          </div>
                        ))
                      )}

                      {/* Partner typing indicator */}
                      {isPartnerTyping && (
                        <div
                          style={{
                            alignSelf: 'flex-start',
                            backgroundColor: '#ffffff',
                            border: '1px solid #ede9fe',
                            padding: '0.45rem 0.85rem',
                            borderRadius: '14px 14px 14px 2px',
                            fontSize: '0.76rem',
                            color: '#6366f1',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                          }}
                        >
                          <span style={{ fontStyle: 'italic' }}>{activePartner.name} is typing...</span>
                        </div>
                      )}
                      <div ref={chatBottomRef} />
                    </div>

                    {/* Chat Input Bar */}
                    <form
                      onSubmit={handleSendMessage}
                      style={{
                        padding: '0.85rem 1.25rem',
                        borderTop: '1px solid #ede9fe',
                        display: 'flex',
                        gap: '0.65rem',
                        background: '#ffffff',
                      }}
                    >
                      <input
                        type="text"
                        value={messageInput}
                        onChange={handleInputChange}
                        placeholder={`Message ${activePartner.name}... (Press Enter to send)`}
                        style={{
                          flex: 1,
                          padding: '0.7rem 1rem',
                          borderRadius: '12px',
                          border: '1px solid #ddd6fe',
                          outline: 'none',
                          fontSize: '0.88rem',
                        }}
                      />
                      <button
                        type="submit"
                        disabled={!messageInput.trim()}
                        className="btn-primary"
                        style={{
                          padding: '0.7rem 1.25rem',
                          opacity: !messageInput.trim() ? 0.6 : 1,
                          cursor: !messageInput.trim() ? 'not-allowed' : 'pointer',
                        }}
                      >
                        <Send size={16} />
                      </button>
                    </form>
                  </div>
                </motion.div>
              )}

              {/* TAB 8: LEARNING PROGRESS */}
              {activeTab === 'progress' && (
                <motion.div
                  key="progress"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="dashboard-card"
                >
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem' }}>
                    Learning Progress &amp; Skill Mastery
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
                    {learningSkills.length === 0 ? (
                      <p style={{ color: '#64748b' }}>No learning skills registered yet. Add goals in My Skills tab!</p>
                    ) : (
                      learningSkills.map((item, idx) => (
                        <div key={idx} style={{ padding: '1.25rem', border: '1px solid #ede9fe', borderRadius: '14px', background: '#faf5ff' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <strong>{item.name}</strong>
                            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#6366f1' }}>{item.proficiency}</span>
                          </div>
                          <div className="profile-progress-bar">
                            <div
                              className="profile-progress-fill"
                              style={{ width: item.proficiency === 'Advanced' ? '90%' : item.proficiency === 'Intermediate' ? '60%' : '35%' }}
                            />
                          </div>
                          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Category: {item.category}</span>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}

              {/* TAB 9: MY CREDITS */}
              {activeTab === 'credits' && (
                <motion.div
                  key="credits"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="dashboard-card"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>Skill Barter Credit Wallet</h3>
                      <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '0.25rem 0 0' }}>
                        1 Credit = 1 Hour of 1:1 learning. Earn credits by teaching; spend them to learn.
                      </p>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#6366f1' }}>
                      {dashboardData?.profile?.creditsBalance ?? 10} <span style={{ fontSize: '1rem' }}>Credits</span>
                    </div>
                  </div>

                  <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.85rem' }}>Immutable Database Ledger</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {creditHistory.length === 0 ? (
                      <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>No credit transactions recorded yet.</p>
                    ) : (
                      creditHistory.map((tx) => (
                        <div
                          key={tx.id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '0.75rem 1rem',
                            borderRadius: '10px',
                            border: '1px solid #f1f5f9',
                            backgroundColor: '#ffffff',
                            fontSize: '0.86rem',
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 600 }}>{tx.description}</div>
                            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                              Type: {tx.transaction_type} • {tx.created_at ? new Date(tx.created_at).toLocaleDateString() : 'Recent'}
                            </span>
                          </div>
                          <span style={{ fontWeight: 800, color: tx.amount > 0 ? '#10b981' : '#6366f1' }}>
                            {tx.amount > 0 ? `+${tx.amount}` : tx.amount} Credits
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}

              {/* TAB 10: REVIEWS */}
              {activeTab === 'reviews' && (
                <motion.div
                  key="reviews"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="dashboard-card"
                >
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem' }}>
                    Peer Reviews Received ({peerReviews.length})
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {peerReviews.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#94a3b8' }}>
                        <Star size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
                        <p>No peer reviews submitted yet. Complete exchange sessions to receive ratings!</p>
                      </div>
                    ) : (
                      peerReviews.map((rev) => (
                        <div key={rev.id} style={{ padding: '1rem', borderRadius: '12px', border: '1px solid #ede9fe', background: '#faf5ff' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                            <strong>{rev.reviewerName || 'Student Peer'}</strong>
                            <span style={{ display: 'flex', gap: '2px' }}>
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={14}
                                  fill={i < rev.rating ? '#f59e0b' : 'none'}
                                  color={i < rev.rating ? '#f59e0b' : '#cbd5e1'}
                                />
                              ))}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#64748b', marginBottom: '0.5rem' }}>
                            {rev.reviewerCollege || 'Campus Peer'}
                          </div>
                          <p style={{ fontSize: '0.85rem', color: '#334155', margin: 0, fontStyle: 'italic' }}>
                            "{rev.feedback_comment || rev.feedbackComment || 'Great learning session!'}"
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}

              {/* TAB 11: SETTINGS */}
              {activeTab === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="dashboard-card"
                  style={{ maxWidth: '680px', margin: '0 auto' }}
                >
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem' }}>Account Preferences</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid #f1f5f9' }}>
                      <div>
                        <strong>Real-Time Socket Notifications</strong>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Receive instant push alerts when peer messages or proposes swap</div>
                      </div>
                      <input type="checkbox" defaultChecked className="auth-checkbox" />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid #f1f5f9' }}>
                      <div>
                        <strong>Availability Status</strong>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Show profile as "Open for Exchanges" in search results</div>
                      </div>
                      <input type="checkbox" defaultChecked className="auth-checkbox" />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 12: ADMIN MODERATION PORTAL */}
              {activeTab === 'admin' && isAdmin && (
                <motion.div
                  key="admin"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
                >
                  {/* Platform Stats Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                    <div className="dashboard-card" style={{ padding: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6366f1' }}>
                        <Users size={22} />
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981' }}>Active</span>
                      </div>
                      <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.5rem' }}>
                        {adminStats?.totalUsers || adminUsers.length}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Registered Students</div>
                    </div>

                    <div className="dashboard-card" style={{ padding: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ec4899' }}>
                        <ArrowLeftRight size={22} />
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6366f1' }}>Live Barters</span>
                      </div>
                      <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.5rem' }}>
                        {adminStats?.activeExchanges || 0}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Active Barter Proposals</div>
                    </div>

                    <div className="dashboard-card" style={{ padding: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981' }}>
                        <CalendarClock size={22} />
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981' }}>Sessions</span>
                      </div>
                      <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.5rem' }}>
                        {adminStats?.completedSessions || 0}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Completed Learning Sessions</div>
                    </div>

                    <div className="dashboard-card" style={{ padding: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f59e0b' }}>
                        <Coins size={22} />
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f59e0b' }}>Volume</span>
                      </div>
                      <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.5rem' }}>
                        {adminStats?.totalCreditsCirculating || 0}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Total Circulating Credits</div>
                    </div>
                  </div>

                  {/* Student Moderation Reports */}
                  <div className="dashboard-card">
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <ShieldAlert size={20} color="#ef4444" /> Student Moderation &amp; Dispute Reports
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      {adminReports.length === 0 ? (
                        <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No dispute reports pending review.</p>
                      ) : (
                        adminReports.map((rep) => (
                          <div
                            key={rep.id}
                            style={{
                              padding: '1rem',
                              border: '1px solid #fee2e2',
                              borderRadius: '12px',
                              background: '#fff5f5',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              flexWrap: 'wrap',
                              gap: '0.75rem',
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: 700, color: '#991b1b' }}>
                                Issue: {rep.reason} (Reporter: {rep.reporterName} &rarr; Target: {rep.reportedUserName})
                              </div>
                              <p style={{ fontSize: '0.84rem', color: '#7f1d1d', margin: '0.2rem 0' }}>{rep.description}</p>
                              <span style={{ fontSize: '0.72rem', color: '#b91c1c' }}>
                                Status: <strong>{rep.status}</strong>
                              </span>
                            </div>
                            {rep.status === 'pending' && (
                              <button
                                type="button"
                                onClick={() => handleResolveReport(rep.id)}
                                className="btn-primary"
                                style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', backgroundColor: '#10b981' }}
                              >
                                Mark Resolved
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Registered Users Table */}
                  <div className="dashboard-card">
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem' }}>Registered User Accounts ({adminUsers.length})</h3>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                        <thead>
                          <tr style={{ borderBottom: '2px solid #ede9fe', color: '#64748b' }}>
                            <th style={{ padding: '0.65rem' }}>ID</th>
                            <th style={{ padding: '0.65rem' }}>Student Name</th>
                            <th style={{ padding: '0.65rem' }}>Email</th>
                            <th style={{ padding: '0.65rem' }}>Role</th>
                            <th style={{ padding: '0.65rem' }}>Status</th>
                            <th style={{ padding: '0.65rem' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {adminUsers.map((u) => (
                            <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '0.65rem', fontWeight: 700 }}>#{u.id}</td>
                              <td style={{ padding: '0.65rem' }}>{u.full_name || u.fullName}</td>
                              <td style={{ padding: '0.65rem', color: '#64748b' }}>{u.email}</td>
                              <td style={{ padding: '0.65rem' }}>
                                <span
                                  style={{
                                    padding: '0.2rem 0.5rem',
                                    borderRadius: '6px',
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    backgroundColor: u.role === 'admin' ? '#fee2e2' : '#e0e7ff',
                                    color: u.role === 'admin' ? '#b91c1c' : '#4338ca',
                                  }}
                                >
                                  {u.role}
                                </span>
                              </td>
                              <td style={{ padding: '0.65rem' }}>
                                <span style={{ color: u.is_active ? '#10b981' : '#ef4444', fontWeight: 700 }}>
                                  {u.is_active ? 'Active' : 'Suspended'}
                                </span>
                              </td>
                              <td style={{ padding: '0.65rem' }}>
                                {u.role !== 'admin' && (
                                  <button
                                    type="button"
                                    onClick={() => handleToggleUserStatus(u.id, Boolean(u.is_active))}
                                    style={{
                                      padding: '0.35rem 0.65rem',
                                      borderRadius: '6px',
                                      border: '1px solid #cbd5e1',
                                      background: '#ffffff',
                                      cursor: 'pointer',
                                      fontSize: '0.75rem',
                                    }}
                                  >
                                    {u.is_active ? 'Suspend' : 'Activate'}
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </main>
      </div>
    </div>
  );
}
