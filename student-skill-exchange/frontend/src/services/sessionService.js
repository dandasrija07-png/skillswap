/**
 * Session Scheduling & Management Service
 * Connected to Express backend & MySQL database
 */

import api from './api.js';

export const calculateEndTime = (startTime, durationMinutes) => {
  if (!startTime) return '11:00';
  const [h, m] = startTime.split(':').map(Number);
  const totalMins = (h || 0) * 60 + (m || 0) + Number(durationMinutes || 60);
  const endH = Math.floor(totalMins / 60) % 24;
  const endM = totalMins % 60;
  return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
};

export const SESSION_MODES = ['Online (Video Call)', 'In-Person (Campus Library / Lab)'];
export const DURATION_OPTIONS = [
  { value: 30, label: '30 Minutes' },
  { value: 45, label: '45 Minutes' },
  { value: 60, label: '60 Minutes (Standard)' },
  { value: 90, label: '90 Minutes (Deep Dive)' },
  { value: 120, label: '120 Minutes (Workshop)' },
];

export const normalizeSession = (s) => {
  if (!s) return null;
  const initiatorName = s.initiatorName || s.initiator_name || 'Initiator';
  const partnerName = s.partnerName || s.partner_name || 'Partner';

  return {
    id: s.id,
    exchangeRequestId: s.exchange_request_id || s.exchangeRequestId,
    initiatorId: s.initiator_id || s.initiatorId,
    initiatorName,
    initiatorCollege: s.initiatorCollege || s.initiator_college || '',
    initiatorAvatar: s.initiatorAvatar || s.initiator_avatar || null,
    partnerId: s.partner_id || s.partnerId,
    partnerName,
    partnerCollege: s.partnerCollege || s.partner_college || '',
    partnerAvatar: s.partnerAvatar || s.partner_avatar || null,
    topic: s.topicName || s.topic || 'Skill Exchange',
    topicSkillId: s.topic_skill_id || s.topicSkillId,
    sessionDate: s.session_date || s.sessionDate,
    startTime: s.start_time ? s.start_time.substring(0, 5) : s.startTime || '10:00',
    endTime: s.end_time ? s.end_time.substring(0, 5) : s.endTime || '11:00',
    durationMinutes: Number(s.duration_minutes || s.durationMinutes || 60),
    mode: s.mode || 'Online',
    locationOrLink: s.location_or_link || s.locationOrLink || 'https://meet.skillswap.edu',
    agendaNotes: s.agenda_notes || s.agendaNotes || '',
    status: s.status,
    initiatorConfirmed: Boolean(s.initiator_confirmed !== undefined ? s.initiator_confirmed : s.initiatorConfirmed),
    partnerConfirmed: Boolean(s.partner_confirmed !== undefined ? s.partner_confirmed : s.partnerConfirmed),
    creditsAwarded: Boolean(s.credits_awarded !== undefined ? s.credits_awarded : s.creditsAwarded),
    cancelledBy: s.cancelled_by || s.cancelledBy || null,
    cancellationReason: s.cancellation_reason || s.cancellationReason || null,
  };
};

/**
 * Get Student Sessions grouped by status for views
 */
export async function getStudentSessions() {
  try {
    const all = await getUserSessions();
    const upcoming = all.filter((s) => s.status === 'Upcoming');
    const awaiting = all.filter((s) => s.status === 'AwaitingConfirmation');
    const completed = all.filter((s) => s.status === 'Completed');
    const cancelled = all.filter((s) => s.status === 'Cancelled');

    let balance = 10;
    try {
      const creditRes = await api.get('/credits/balance');
      balance = creditRes.data?.balance ?? 10;
    } catch {}

    return {
      all,
      upcoming,
      awaiting,
      completed,
      cancelled,
      creditsBalance: balance,
      counts: {
        total: all.length,
        upcoming: upcoming.length,
        awaiting: awaiting.length,
        completed: completed.length,
        cancelled: cancelled.length,
      },
    };
  } catch (err) {
    console.error('[getStudentSessions Error]', err);
    return {
      all: [],
      upcoming: [],
      awaiting: [],
      completed: [],
      cancelled: [],
      creditsBalance: 10,
      counts: { total: 0, upcoming: 0, awaiting: 0, completed: 0, cancelled: 0 },
    };
  }
}

/**
 * Fetch all sessions for current student
 */
export async function getUserSessions(statusFilter = 'All') {
  try {
    const res = await api.get('/sessions');
    let list = (res.data || []).map(normalizeSession);

    if (statusFilter && statusFilter !== 'All') {
      list = list.filter((s) => s.status.toLowerCase() === statusFilter.toLowerCase());
    }

    return list;
  } catch (err) {
    console.error('[getUserSessions Error]', err);
    return [];
  }
}

/**
 * Get session details by ID
 */
export async function getSessionById(sessionId) {
  try {
    const res = await api.get(`/sessions/${sessionId}`);
    return normalizeSession(res.data);
  } catch (err) {
    console.error('[getSessionById Error]', err);
    return null;
  }
}

/**
 * Schedule a new session
 */
export async function scheduleSession(data) {
  const payload = {
    exchangeRequestId: data.exchangeRequestId || null,
    partnerId: data.partnerId,
    topicSkillId: data.topicSkillId || null,
    topic: data.topic,
    exchangeSkillId: data.exchangeSkillId || null,
    sessionDate: data.sessionDate,
    startTime: data.startTime,
    durationMinutes: data.durationMinutes || 60,
    mode: data.mode || 'Online',
    locationOrLink: data.locationOrLink || `https://meet.skillswap.edu/room/peer-session-${Date.now()}`,
    agendaNotes: data.agendaNotes || '',
  };

  const res = await api.post('/sessions', payload);
  return {
    success: true,
    session: normalizeSession(res.data),
    message: res.message || 'Learning session scheduled successfully in MySQL database!',
  };
}

/**
 * Reschedule an existing session
 */
export async function rescheduleSession(sessionId, { newDate, newTime, durationMinutes, reason }) {
  const res = await api.put(`/sessions/${sessionId}/reschedule`, {
    newDate,
    newTime,
    durationMinutes,
    reason,
  });

  return {
    success: true,
    session: normalizeSession(res.data),
    message: 'Session rescheduled successfully.',
  };
}

/**
 * Cancel a session
 */
export async function cancelSession(sessionId, reason = '') {
  const res = await api.put(`/sessions/${sessionId}/cancel`, { reason });
  return {
    success: true,
    session: normalizeSession(res.data),
    message: 'Session has been cancelled.',
  };
}

/**
 * Confirm session completion (Dual-Confirmation Protocol)
 */
export async function confirmSessionCompletion(sessionId) {
  const res = await api.put(`/sessions/${sessionId}/complete`);
  const data = res.data;

  return {
    success: true,
    session: normalizeSession(data.session),
    isFullyCompleted: data.isFullyCompleted,
    creditsAwarded: data.creditsAwarded,
    message: res.message,
  };
}
