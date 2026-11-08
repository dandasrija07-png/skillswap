/**
 * Chat & Room Access Authorization Service
 * Enforces server-side permissions: chat and study rooms are restricted
 * strictly to authorized exchange participants and administrators.
 */

import { getMemoryStore } from '../config/db.js';

/**
 * Checks whether two students are authorized to exchange messages.
 * Authorized if:
 * 1. Either user is an admin.
 * 2. They have an exchange request between them (Pending or Accepted).
 * 3. They share a scheduled, awaiting, or completed session together.
 */
export const canUsersChat = async (userId1, userId2) => {
  const u1 = Number(userId1);
  const u2 = Number(userId2);

  if (u1 === u2) return false;

  const store = getMemoryStore();

  const user1 = store.users.find((u) => u.id === u1);
  const user2 = store.users.find((u) => u.id === u2);

  if (!user1 || !user2 || !user1.is_active || !user2.is_active) {
    return false;
  }

  // Administrators can communicate with any student for support/moderation
  if (user1.role === 'admin' || user2.role === 'admin') {
    return true;
  }

  // Check 1: Bilateral exchange request exists (Pending or Accepted)
  const hasExchange = store.exchange_requests.some(
    (r) =>
      ((r.sender_id === u1 && r.receiver_id === u2) ||
        (r.sender_id === u2 && r.receiver_id === u1)) &&
      (r.status === 'Accepted' || r.status === 'Pending')
  );

  if (hasExchange) return true;

  // Check 2: Shared session exists (Upcoming, AwaitingConfirmation, or Completed)
  const hasSession = store.sessions.some(
    (s) =>
      ((s.initiator_id === u1 && s.partner_id === u2) ||
        (s.initiator_id === u2 && s.partner_id === u1)) &&
      s.status !== 'Cancelled'
  );

  if (hasSession) return true;

  return false;
};

/**
 * Verifies whether a student is authorized to enter a session study room.
 */
export const canJoinStudyRoom = async (userId, sessionId) => {
  const store = getMemoryStore();
  const uid = Number(userId);
  const sid = Number(sessionId);

  const session = store.sessions.find((s) => s.id === sid);
  if (!session) return false;

  const user = store.users.find((u) => u.id === uid);
  if (user?.role === 'admin') return true;

  return session.initiator_id === uid || session.partner_id === uid;
};

