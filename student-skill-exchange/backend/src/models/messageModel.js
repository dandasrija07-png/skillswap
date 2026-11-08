/**
 * Messages Model
 */

import { getMemoryStore } from '../config/db.js';

export const getThread = async (userId1, userId2) => {
  const store = getMemoryStore();
  const u1 = Number(userId1);
  const u2 = Number(userId2);

  const messages = store.messages
    .filter(
      (m) =>
        (m.sender_id === u1 && m.receiver_id === u2) ||
        (m.sender_id === u2 && m.receiver_id === u1)
    )
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  return messages.map((m) => {
    const sender = store.users.find((u) => u.id === m.sender_id);
    return {
      ...m,
      senderName: sender?.full_name || '',
      isMe: m.sender_id === u1,
    };
  });
};

export const create = async ({ senderId, receiverId, exchangeRequestId = null, messageText }) => {
  const store = getMemoryStore();

  const newId = store.messages.length > 0 ? Math.max(...store.messages.map((m) => m.id)) + 1 : 1;
  const newMsg = {
    id: newId,
    sender_id: Number(senderId),
    receiver_id: Number(receiverId),
    exchange_request_id: exchangeRequestId ? Number(exchangeRequestId) : null,
    message_text: messageText,
    is_read: 0,
    read_at: null,
    created_at: new Date(),
  };

  store.messages.push(newMsg);
  return newMsg;
};

export const markAsRead = async (senderId, receiverId) => {
  const store = getMemoryStore();
  const sId = Number(senderId);
  const rId = Number(receiverId);

  let updatedCount = 0;
  for (const msg of store.messages) {
    if (msg.sender_id === sId && msg.receiver_id === rId && !msg.is_read) {
      msg.is_read = 1;
      msg.read_at = new Date();
      updatedCount++;
    }
  }

  return updatedCount;
};

export const getConversations = async (userId) => {
  const store = getMemoryStore();
  const uid = Number(userId);

  const partnerIdSet = new Set();

  for (const r of store.exchange_requests) {
    if (r.status === 'Accepted' || r.status === 'Pending') {
      if (r.sender_id === uid) partnerIdSet.add(r.receiver_id);
      if (r.receiver_id === uid) partnerIdSet.add(r.sender_id);
    }
  }

  for (const s of store.sessions) {
    if (s.status !== 'Cancelled') {
      if (s.initiator_id === uid) partnerIdSet.add(s.partner_id);
      if (s.partner_id === uid) partnerIdSet.add(s.initiator_id);
    }
  }

  for (const m of store.messages) {
    if (m.sender_id === uid) partnerIdSet.add(m.receiver_id);
    if (m.receiver_id === uid) partnerIdSet.add(m.sender_id);
  }

  const conversations = [];

  for (const pid of partnerIdSet) {
    const partnerUser = store.users.find((u) => u.id === pid);
    if (!partnerUser || !partnerUser.is_active) continue;

    const partnerProfile = store.student_profiles.find((p) => p.user_id === pid) || {};

    const thread = store.messages
      .filter(
        (m) =>
          (m.sender_id === uid && m.receiver_id === pid) ||
          (m.sender_id === pid && m.receiver_id === uid)
      )
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const lastMessage = thread[0] || null;
    const unreadCount = thread.filter((m) => m.sender_id === pid && !m.is_read).length;

    conversations.push({
      partnerId: pid,
      name: partnerUser.full_name,
      email: partnerUser.email,
      department: partnerProfile.department || 'Student Peer',
      collegeName: partnerProfile.college_name || 'Campus Peer',
      avatarUrl: partnerProfile.avatar_url || '',
      lastMessage: lastMessage?.message_text || 'Active exchange partner',
      lastMessageTime: lastMessage?.created_at || null,
      unreadCount,
    });
  }

  return conversations.sort((a, b) => {
    const tA = a.lastMessageTime ? new Date(a.lastMessageTime) : new Date(0);
    const tB = b.lastMessageTime ? new Date(b.lastMessageTime) : new Date(0);
    return tB - tA;
  });
};
