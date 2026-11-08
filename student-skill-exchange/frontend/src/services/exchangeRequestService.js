/**
 * Exchange Request Management Service
 * Connected to Express backend & MySQL database
 */

import api from './api.js';

const normalizeRequest = (r) => {
  if (!r) return null;
  const senderName = r.senderName || r.sender_name || 'Student Peer';
  const receiverName = r.receiverName || r.receiver_name || 'Student Peer';

  return {
    id: r.id,
    senderId: r.sender_id || r.senderId,
    senderName,
    senderInitials: senderName.split(' ').map((w) => w[0]).slice(0, 2).join('') || 'SP',
    senderCollege: r.senderCollege || r.sender_college || 'Campus Partner',
    senderAvatar: r.senderAvatar || r.sender_avatar || null,
    receiverId: r.receiver_id || r.receiverId,
    receiverName,
    receiverInitials: receiverName.split(' ').map((w) => w[0]).slice(0, 2).join('') || 'SP',
    receiverCollege: r.receiverCollege || r.receiver_college || 'Campus Partner',
    receiverAvatar: r.receiverAvatar || r.receiver_avatar || null,
    offeredSkill: r.offeredSkill || r.offered_skill || 'Peer Mentoring',
    requestedSkill: r.requestedSkill || r.requested_skill || 'Skill Exchange',
    offeredSkillId: r.offered_skill_id || r.offeredSkillId,
    requestedSkillId: r.requested_skill_id || r.requestedSkillId,
    proposedHours: r.proposed_hours || r.proposedHours || '2 hrs / week',
    personalMessage: r.personal_message || r.personalMessage || '',
    status: r.status,
    createdAt: r.created_at ? new Date(r.created_at).toLocaleDateString() : 'Recent',
    timestamp: r.created_at ? new Date(r.created_at).getTime() : Date.now(),
  };
};

/**
 * Get Student Requests grouped with summary counts
 */
export async function getStudentRequests() {
  try {
    const res = await api.get('/requests');
    const sent = (res.data?.sent || []).map(normalizeRequest);
    const received = (res.data?.received || []).map(normalizeRequest);

    const pendingReceived = received.filter((r) => r.status === 'Pending').length;
    const pendingSent = sent.filter((r) => r.status === 'Pending').length;
    const accepted = [...sent, ...received].filter((r) => r.status === 'Accepted').length;

    return {
      sent,
      received,
      counts: {
        total: sent.length + received.length,
        pendingReceived,
        pendingSent,
        accepted,
      },
    };
  } catch (err) {
    console.error('[getStudentRequests Error]', err);
    return {
      sent: [],
      received: [],
      counts: { total: 0, pendingReceived: 0, pendingSent: 0, accepted: 0 },
    };
  }
}

/**
 * Fetch all exchange requests for the logged-in student
 */
export async function getAllRequests() {
  try {
    const res = await api.get('/requests');
    const sent = (res.data?.sent || []).map(normalizeRequest);
    const received = (res.data?.received || []).map(normalizeRequest);
    return [...sent, ...received];
  } catch (err) {
    console.error('[getAllRequests Error]', err);
    return [];
  }
}

/**
 * Get Received Requests
 */
export async function getReceivedRequests() {
  try {
    const res = await api.get('/requests');
    return (res.data?.received || []).map(normalizeRequest);
  } catch (err) {
    console.error('[getReceivedRequests Error]', err);
    return [];
  }
}

/**
 * Get Sent Requests
 */
export async function getSentRequests() {
  try {
    const res = await api.get('/requests');
    return (res.data?.sent || []).map(normalizeRequest);
  } catch (err) {
    console.error('[getSentRequests Error]', err);
    return [];
  }
}

/**
 * Send an exchange proposal
 */
export async function sendExchangeRequest(data) {
  const payload = {
    receiverId: data.receiverId,
    offeredSkill: data.offeredSkill,
    offeredSkillId: data.offeredSkillId,
    requestedSkill: data.requestedSkill,
    requestedSkillId: data.requestedSkillId,
    proposedHours: data.proposedHours || '2 hrs / week',
    personalMessage: data.personalMessage || 'Excited to swap skills!',
  };

  const res = await api.post('/requests', payload);
  return {
    success: true,
    request: normalizeRequest(res.data),
    message: res.message || 'Exchange proposal sent successfully!',
  };
}

/**
 * Accept a received request
 */
export async function acceptExchangeRequest(requestId) {
  const res = await api.put(`/requests/${requestId}/accept`);
  return {
    success: true,
    requestId,
    status: 'Accepted',
    request: normalizeRequest(res.data),
    message: 'Exchange proposal accepted! You can now book a session.',
  };
}

/**
 * Reject a received request
 */
export async function rejectExchangeRequest(requestId, reason = '') {
  const res = await api.put(`/requests/${requestId}/reject`, { reason });
  return {
    success: true,
    requestId,
    status: 'Rejected',
    request: normalizeRequest(res.data),
    message: 'Exchange proposal declined.',
  };
}

/**
 * Cancel a sent request
 */
export async function cancelExchangeRequest(requestId) {
  const res = await api.put(`/requests/${requestId}/cancel`);
  return {
    success: true,
    requestId,
    status: 'Cancelled',
    request: normalizeRequest(res.data),
    message: 'Proposal withdrawn successfully.',
  };
}
