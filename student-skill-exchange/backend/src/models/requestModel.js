/**
 * Exchange Request Model
 * Manages exchange_requests table operations and validation rules
 */

import { getMemoryStore } from '../config/db.js';

export const findById = async (id) => {
  const store = getMemoryStore();
  const req = store.exchange_requests.find((r) => r.id === Number(id));
  if (!req) return null;

  const sender = store.users.find((u) => u.id === req.sender_id);
  const senderProfile = store.student_profiles.find((p) => p.user_id === req.sender_id);
  const receiver = store.users.find((u) => u.id === req.receiver_id);
  const receiverProfile = store.student_profiles.find((p) => p.user_id === req.receiver_id);
  const offered = store.skills.find((s) => s.id === req.offered_skill_id);
  const requested = store.skills.find((s) => s.id === req.requested_skill_id);

  return {
    ...req,
    senderName: sender?.full_name || '',
    senderCollege: senderProfile?.college_name || '',
    senderAvatar: senderProfile?.avatar_url || null,
    receiverName: receiver?.full_name || '',
    receiverCollege: receiverProfile?.college_name || '',
    receiverAvatar: receiverProfile?.avatar_url || null,
    offeredSkill: offered?.name || '',
    requestedSkill: requested?.name || '',
  };
};

export const getByUserId = async (userId) => {
  const store = getMemoryStore();
  const uid = Number(userId);

  const enrich = (req) => {
    const sender = store.users.find((u) => u.id === req.sender_id);
    const senderProfile = store.student_profiles.find((p) => p.user_id === req.sender_id);
    const receiver = store.users.find((u) => u.id === req.receiver_id);
    const receiverProfile = store.student_profiles.find((p) => p.user_id === req.receiver_id);
    const offered = store.skills.find((s) => s.id === req.offered_skill_id);
    const requested = store.skills.find((s) => s.id === req.requested_skill_id);

    return {
      ...req,
      senderName: sender?.full_name || '',
      senderCollege: senderProfile?.college_name || '',
      senderAvatar: senderProfile?.avatar_url || null,
      receiverName: receiver?.full_name || '',
      receiverCollege: receiverProfile?.college_name || '',
      receiverAvatar: receiverProfile?.avatar_url || null,
      offeredSkill: offered?.name || '',
      requestedSkill: requested?.name || '',
    };
  };

  const sent = store.exchange_requests.filter((r) => r.sender_id === uid).map(enrich);
  const received = store.exchange_requests.filter((r) => r.receiver_id === uid).map(enrich);

  return { sent, received };
};

export const create = async ({ senderId, receiverId, offeredSkillId, requestedSkillId, proposedHours, personalMessage }) => {
  const store = getMemoryStore();

  // Rule 1: No self-requests
  if (Number(senderId) === Number(receiverId)) {
    throw new Error('You cannot propose a skill exchange to yourself.');
  }

  // Rule 2: Prevent duplicate active pending requests
  const existingPending = store.exchange_requests.find(
    (r) => r.sender_id === Number(senderId) && r.receiver_id === Number(receiverId) && r.status === 'Pending'
  );
  if (existingPending) {
    throw new Error('You already have an active pending proposal sent to this peer.');
  }

  const newId = store.exchange_requests.length > 0 ? Math.max(...store.exchange_requests.map((r) => r.id)) + 1 : 1;
  const newReq = {
    id: newId,
    sender_id: Number(senderId),
    receiver_id: Number(receiverId),
    offered_skill_id: Number(offeredSkillId),
    requested_skill_id: Number(requestedSkillId),
    proposed_hours: proposedHours || '2 hrs / weekend',
    personal_message: personalMessage,
    status: 'Pending',
    rejection_reason: null,
    created_at: new Date(),
    updated_at: new Date(),
  };

  store.exchange_requests.push(newReq);
  return findById(newId);
};

export const updateStatus = async (id, status, userId, reason = null) => {
  const store = getMemoryStore();
  const req = store.exchange_requests.find((r) => r.id === Number(id));
  if (!req) throw new Error('Exchange request not found.');

  // Authorization checks
  if (status === 'Accepted' || status === 'Rejected') {
    if (req.receiver_id !== Number(userId)) {
      throw new Error('Unauthorized: Only the intended recipient can accept or decline this proposal.');
    }
  }

  if (status === 'Cancelled') {
    if (req.sender_id !== Number(userId)) {
      throw new Error('Unauthorized: Only the student who sent the proposal can withdraw it.');
    }
  }

  if (req.status !== 'Pending') {
    throw new Error(`Cannot change status: request is already marked "${req.status}".`);
  }

  req.status = status;
  if (reason) req.rejection_reason = reason;
  req.updated_at = new Date();

  return findById(req.id);
};

