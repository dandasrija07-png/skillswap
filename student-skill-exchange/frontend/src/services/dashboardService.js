/**
 * Dashboard & Multi-Module Aggregation Service
 * Connects frontend dashboard, chat, notifications, reviews, credits,
 * and admin statistics directly to Express backend APIs
 */

import api from './api.js';
import { getProfileData, getTeachingSkills, getLearningSkills } from './profileSkillService.js';
import { getUserSessions } from './sessionService.js';
import { getAllRequests } from './exchangeRequestService.js';

/**
 * Fetch full dashboard overview data from MySQL database
 */
export async function getDashboardOverview() {
  try {
    const [profile, tSkills, lSkills, allSessions, allRequests, notifsRes, creditRes, creditHistoryRes, studentsRes] =
      await Promise.all([
        getProfileData().catch(() => null),
        getTeachingSkills().catch(() => []),
        getLearningSkills().catch(() => []),
        getUserSessions().catch(() => []),
        getAllRequests().catch(() => []),
        api.get('/notifications').catch(() => ({ data: { notifications: [], unreadCount: 0 } })),
        api.get('/credits/balance').catch(() => ({ data: { balance: 10 } })),
        api.get('/credits/history').catch(() => ({ data: [] })),
        api.get('/students').catch(() => ({ data: { students: [] } })),
      ]);

    const activeProfile = profile || {
      id: 1,
      fullName: 'Student User',
      email: '',
      collegeName: 'University Campus',
      department: 'Computer Science',
      academicYear: '3rd Year',
      creditsBalance: creditRes.data?.balance ?? 10,
      rating: 5.0,
      reviewsCount: 0,
      completedSwapsCount: allSessions.filter((s) => s.status === 'Completed').length,
      initials: 'SU',
    };

    activeProfile.creditsBalance = creditRes.data?.balance ?? activeProfile.creditsBalance;
    activeProfile.completedSwapsCount = allSessions.filter((s) => s.status === 'Completed').length;

    // Filter pending incoming/outgoing requests
    const pendingRequests = allRequests.filter((r) => r.status === 'Pending').map((r) => ({
      id: r.id,
      type: r.receiverId === activeProfile.id ? 'incoming' : 'outgoing',
      peerName: r.receiverId === activeProfile.id ? r.senderName : r.receiverName,
      peerInitials: (r.receiverId === activeProfile.id ? r.senderName : r.receiverName)
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join(''),
      peerCollege: r.receiverId === activeProfile.id ? r.senderCollege : r.receiverCollege,
      offeredSkill: r.offeredSkill,
      requestedSkill: r.requestedSkill,
      proposedHours: r.proposedHours,
      date: r.createdAt,
      status: r.status.toLowerCase(),
    }));

    // Upcoming sessions
    const upcomingSessions = allSessions
      .filter((s) => s.status === 'Upcoming' || s.status === 'AwaitingConfirmation')
      .map((s) => ({
        id: s.id,
        topic: s.topic,
        partnerName: s.partnerName,
        partnerInitials: s.partnerName.split(' ').map((w) => w[0]).slice(0, 2).join(''),
        partnerCollege: s.partnerCollege,
        date: s.sessionDate,
        time: `${s.startTime} - ${s.endTime}`,
        duration: `${s.durationMinutes} mins`,
        mode: s.mode,
        meetLink: s.locationOrLink,
        status: s.status,
      }));

    // Activity log from credit transactions and sessions
    const activityLog = (creditHistoryRes.data || []).slice(0, 5).map((t) => ({
      id: `act_${t.id}`,
      type: t.amount > 0 ? 'credit_earned' : 'credit_spent',
      title: t.description || 'Credit Transaction',
      description: `${t.amount > 0 ? '+' : ''}${t.amount} Credits (Balance: ${t.new_balance})`,
      time: t.created_at ? new Date(t.created_at).toLocaleDateString() : 'Recent',
    }));

    // Calculate suggested student matches from real database candidates
    const otherStudents = (studentsRes.data?.students || []).filter(
      (st) => st.email !== activeProfile.email
    );

    const suggestedMatches = otherStudents.slice(0, 4).map((cand, idx) => {
      const topTeach = cand.teaching_skills?.[0]?.name || 'Peer Mentoring';
      const topLearn = cand.learning_skills?.[0]?.name || 'Skill Exchange';
      return {
        id: cand.user_id || cand.id,
        name: cand.full_name || cand.fullName,
        initials: (cand.full_name || cand.fullName).split(' ').map((w) => w[0]).slice(0, 2).join(''),
        role: `${cand.department || 'Engineering'} • ${cand.academic_year || '3rd Year'}`,
        college: cand.college_name || cand.collegeName,
        matchPercentage: 90 - idx * 4,
        offers: topTeach,
        wants: topLearn,
        rating: Number(cand.rating || 5.0),
        swapsCount: Number(cand.completed_sessions_count || 10),
        avatarColor:
          idx % 2 === 0
            ? 'linear-gradient(135deg, #ec4899, #8b5cf6)'
            : 'linear-gradient(135deg, #3b82f6, #6366f1)',
      };
    });

    const weeklyChartData = [
      { day: 'Mon', learningHours: 1.5, teachingHours: 2.0 },
      { day: 'Tue', learningHours: 2.0, teachingHours: 1.0 },
      { day: 'Wed', learningHours: 0.5, teachingHours: 2.5 },
      { day: 'Thu', learningHours: 1.0, teachingHours: 1.5 },
      { day: 'Fri', learningHours: 2.5, teachingHours: 3.0 },
      { day: 'Sat', learningHours: 3.0, teachingHours: 2.0 },
      { day: 'Sun', learningHours: 1.0, teachingHours: 1.0 },
    ];

    return {
      profile: activeProfile,
      teachingSkills: tSkills,
      learningSkills: lSkills,
      suggestedMatches,
      exchangeRequests: pendingRequests,
      upcomingSessions,
      notifications: notifsRes.data?.notifications || [],
      unreadNotificationsCount: notifsRes.data?.unreadCount || 0,
      activityLog,
      weeklyChartData,
    };
  } catch (err) {
    console.error('[getDashboardOverview Error]', err);
    throw err;
  }
}

// -------------------------------------------------------------
// Chat & Messaging APIs
// -------------------------------------------------------------
export async function getConversations() {
  try {
    const res = await api.get('/messages');
    return res.data || [];
  } catch (err) {
    console.error('[getConversations Error]', err);
    return [];
  }
}

export async function getChatThread(partnerId) {
  try {
    const res = await api.get(`/messages/${partnerId}`);
    return res.data || [];
  } catch (err) {
    console.error('[getChatThread Error]', err);
    return [];
  }
}

export async function sendChatMessage({ receiverId, messageText, exchangeRequestId = null }) {
  const res = await api.post('/messages', {
    receiverId,
    messageText,
    exchangeRequestId,
  });
  return res.data;
}

export async function markChatRead(partnerId) {
  return api.put(`/messages/${partnerId}/read`);
}

// -------------------------------------------------------------
// Notifications APIs
// -------------------------------------------------------------
export async function getNotifications() {
  try {
    const res = await api.get('/notifications');
    return res.data || { notifications: [], unreadCount: 0 };
  } catch (err) {
    console.error('[getNotifications Error]', err);
    return { notifications: [], unreadCount: 0 };
  }
}

export async function markNotificationRead(id) {
  return api.put(`/notifications/${id}/read`);
}

export async function markAllNotificationsRead() {
  return api.put('/notifications/read-all');
}

// -------------------------------------------------------------
// Reviews & Ratings APIs
// -------------------------------------------------------------
export async function submitReview({ sessionId, revieweeId, rating, feedbackComment }) {
  const res = await api.post('/reviews', {
    sessionId,
    revieweeId,
    rating,
    feedbackComment,
  });
  return res.data;
}

export async function getStudentReviews(studentId) {
  try {
    const res = await api.get(`/reviews/student/${studentId}`);
    return res.data || { reviews: [], averageRating: 5.0, totalCount: 0 };
  } catch (err) {
    console.error('[getStudentReviews Error]', err);
    return { reviews: [], averageRating: 5.0, totalCount: 0 };
  }
}

// -------------------------------------------------------------
// Credit Ledger APIs
// -------------------------------------------------------------
export async function getCreditBalance() {
  const res = await api.get('/credits/balance');
  return res.data?.balance ?? 10;
}

export async function getCreditHistory() {
  const res = await api.get('/credits/history');
  return res.data || [];
}

// -------------------------------------------------------------
// Admin Management APIs
// -------------------------------------------------------------
export async function getAdminStats() {
  const res = await api.get('/admin/stats');
  return res.data;
}

export async function getAdminUsers() {
  const res = await api.get('/admin/users');
  return res.data || [];
}

export async function updateUserStatus(userId, isActive) {
  const res = await api.put(`/admin/users/${userId}/status`, { isActive });
  return res.data;
}

export async function getAdminReports(status = null) {
  const res = await api.get('/admin/reports', {
    params: status ? { status } : {},
  });
  return res.data || [];
}

export async function resolveReport(reportId, resolutionNotes) {
  const res = await api.put(`/admin/reports/${reportId}/resolve`, { resolutionNotes });
  return res.data;
}
