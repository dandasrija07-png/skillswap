/**
 * Session Model
 * Operations and business rules for the sessions table
 */

import { getMemoryStore } from '../config/db.js';
import * as creditModel from './creditModel.js';

export const calculateEndTime = (startTime, durationMinutes) => {
  const [h, m] = startTime.split(':').map(Number);
  const totalMins = h * 60 + m + Number(durationMinutes);
  const endH = Math.floor(totalMins / 60) % 24;
  const endM = totalMins % 60;
  return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}:00`;
};

export const checkConflict = (sessionDate, startTime, endTime, participantIds = [], excludeSessionId = null) => {
  const store = getMemoryStore();

  const toMinutes = (time) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };

  const newStartMin = toMinutes(startTime);
  const newEndMin = toMinutes(endTime);

  for (const session of store.sessions) {
    if (session.status === 'Cancelled' || session.status === 'Completed') continue;
    if (excludeSessionId && session.id === Number(excludeSessionId)) continue;
    if (session.session_date !== sessionDate) continue;

    const involved = participantIds.some(
      (pid) => pid === session.initiator_id || pid === session.partner_id
    );

    if (involved) {
      const existStartMin = toMinutes(session.start_time);
      const existEndMin = toMinutes(session.end_time);

      if (newStartMin < existEndMin && newEndMin > existStartMin) {
        return {
          hasConflict: true,
          conflictingSession: session,
          message: `Time overlap detected on ${sessionDate}: A session is already scheduled between ${session.start_time} and ${session.end_time}.`,
        };
      }
    }
  }

  return { hasConflict: false };
};

export const findById = async (id) => {
  const store = getMemoryStore();
  const session = store.sessions.find((s) => s.id === Number(id));
  if (!session) return null;

  const initiator = store.users.find((u) => u.id === session.initiator_id);
  const initiatorProfile = store.student_profiles.find((p) => p.user_id === session.initiator_id);
  const partner = store.users.find((u) => u.id === session.partner_id);
  const partnerProfile = store.student_profiles.find((p) => p.user_id === session.partner_id);
  const topicSkill = store.skills.find((s) => s.id === session.topic_skill_id);

  return {
    ...session,
    initiatorName: initiator?.full_name || '',
    initiatorCollege: initiatorProfile?.college_name || '',
    initiatorAvatar: initiatorProfile?.avatar_url || null,
    partnerName: partner?.full_name || '',
    partnerCollege: partnerProfile?.college_name || '',
    partnerAvatar: partnerProfile?.avatar_url || null,
    topicName: topicSkill?.name || 'Peer Learning',
  };
};

export const getByUserId = async (userId) => {
  const store = getMemoryStore();
  const uid = Number(userId);

  const userSessions = store.sessions.filter(
    (s) => s.initiator_id === uid || s.partner_id === uid
  );

  return Promise.all(userSessions.map((s) => findById(s.id)));
};

export const create = async ({
  exchangeRequestId = null,
  initiatorId,
  partnerId,
  topicSkillId,
  exchangeSkillId = null,
  sessionDate,
  startTime,
  durationMinutes = 60,
  mode = 'Online',
  locationOrLink,
  agendaNotes = '',
}) => {
  const store = getMemoryStore();

  if (Number(initiatorId) === Number(partnerId)) {
    throw new Error('You cannot schedule a session with yourself.');
  }

  // Check past date
  const targetTime = new Date(`${sessionDate}T${startTime}`);
  if (targetTime.getTime() < Date.now()) {
    throw new Error('Session date and time cannot be in the past.');
  }

  const endTime = calculateEndTime(startTime, durationMinutes);

  // Check double-booking conflict
  const conflict = checkConflict(sessionDate, startTime, endTime, [Number(initiatorId), Number(partnerId)]);
  if (conflict.hasConflict) {
    throw new Error(conflict.message);
  }

  const newId = store.sessions.length > 0 ? Math.max(...store.sessions.map((s) => s.id)) + 1 : 1;
  const newSession = {
    id: newId,
    exchange_request_id: exchangeRequestId ? Number(exchangeRequestId) : null,
    initiator_id: Number(initiatorId),
    partner_id: Number(partnerId),
    topic_skill_id: Number(topicSkillId),
    exchange_skill_id: exchangeSkillId ? Number(exchangeSkillId) : null,
    session_date: sessionDate,
    start_time: startTime.length === 5 ? `${startTime}:00` : startTime,
    end_time: endTime,
    duration_minutes: Number(durationMinutes),
    mode,
    location_or_link: locationOrLink || `https://meet.skillswap.edu/room/session-${newId}`,
    agenda_notes: agendaNotes,
    status: 'Upcoming',
    initiator_confirmed: 0,
    partner_confirmed: 0,
    credits_awarded: 0,
    cancelled_by: null,
    cancellation_reason: null,
    created_at: new Date(),
    updated_at: new Date(),
  };

  store.sessions.push(newSession);
  return findById(newId);
};

export const reschedule = async ({ sessionId, newDate, newTime, durationMinutes, reason = '', userId }) => {
  const store = getMemoryStore();
  const session = store.sessions.find((s) => s.id === Number(sessionId));
  if (!session) throw new Error('Session not found.');

  // Ownership check
  if (session.initiator_id !== Number(userId) && session.partner_id !== Number(userId)) {
    throw new Error('Unauthorized: You are not a participant in this learning session.');
  }

  if (session.status === 'Completed' || session.status === 'Cancelled') {
    throw new Error(`Cannot reschedule a session that is already ${session.status.toLowerCase()}.`);
  }

  const duration = durationMinutes || session.duration_minutes;
  const newEndTime = calculateEndTime(newTime, duration);

  const conflict = checkConflict(newDate, newTime, newEndTime, [session.initiator_id, session.partner_id], session.id);
  if (conflict.hasConflict) {
    throw new Error(conflict.message);
  }

  session.session_date = newDate;
  session.start_time = newTime.length === 5 ? `${newTime}:00` : newTime;
  session.end_time = newEndTime;
  session.duration_minutes = Number(duration);
  session.status = 'Upcoming';
  session.updated_at = new Date();

  return findById(session.id);
};

export const cancel = async ({ sessionId, reason = '', userId }) => {
  const store = getMemoryStore();
  const session = store.sessions.find((s) => s.id === Number(sessionId));
  if (!session) throw new Error('Session not found.');

  if (session.initiator_id !== Number(userId) && session.partner_id !== Number(userId)) {
    throw new Error('Unauthorized: You cannot cancel a session you are not participating in.');
  }

  if (session.status === 'Completed') {
    throw new Error('Cannot cancel a session that is already completed.');
  }

  session.status = 'Cancelled';
  session.cancelled_by = Number(userId);
  session.cancellation_reason = reason;
  session.updated_at = new Date();

  return findById(session.id);
};

/**
 * Dual Completion Confirmation:
 * Both participants must confirm completion before credits are released!
 */
export const confirmCompletion = async (sessionId, userId) => {
  const store = getMemoryStore();
  const session = store.sessions.find((s) => s.id === Number(sessionId));
  if (!session) throw new Error('Session not found.');

  const isInitiator = session.initiator_id === Number(userId);
  const isPartner = session.partner_id === Number(userId);

  if (!isInitiator && !isPartner) {
    throw new Error('Unauthorized: Only registered participants can confirm session completion.');
  }

  if (session.status === 'Cancelled') {
    throw new Error('Cannot complete a cancelled session.');
  }

  if (isInitiator) session.initiator_confirmed = 1;
  if (isPartner) session.partner_confirmed = 1;

  let creditsAwarded = false;

  // Dual completion reached
  if (session.initiator_confirmed && session.partner_confirmed) {
    session.status = 'Completed';
    if (!session.credits_awarded) {
      session.credits_awarded = 1;
      creditsAwarded = true;

      // Award +1 credit to both participants via credit model (transaction-safe)
      const creditAmount = session.duration_minutes >= 90 ? 2 : 1;
      await creditModel.recordTransaction({
        userId: session.initiator_id,
        sessionId: session.id,
        type: 'session_completion',
        amount: creditAmount,
        description: `Completed peer session #${session.id}`,
      });
      await creditModel.recordTransaction({
        userId: session.partner_id,
        sessionId: session.id,
        type: 'session_completion',
        amount: creditAmount,
        description: `Completed peer session #${session.id}`,
      });
    }
  } else {
    session.status = 'AwaitingConfirmation';
  }

  session.updated_at = new Date();
  const enriched = await findById(session.id);

  return {
    session: enriched,
    isFullyCompleted: session.status === 'Completed',
    creditsAwarded,
  };
};

