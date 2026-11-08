/**
 * Notification Model
 */

import { getMemoryStore } from '../config/db.js';

export const getByUserId = async (userId) => {
  const store = getMemoryStore();
  return store.notifications
    .filter((n) => n.user_id === Number(userId))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
};

export const create = async ({ userId, type, title, message, referenceId = null, referenceType = null }) => {
  const store = getMemoryStore();
  const newId = store.notifications.length > 0 ? Math.max(...store.notifications.map((n) => n.id)) + 1 : 1;

  const newNotif = {
    id: newId,
    user_id: Number(userId),
    type,
    title,
    message,
    reference_id: referenceId ? Number(referenceId) : null,
    reference_type: referenceType,
    is_read: 0,
    created_at: new Date(),
  };

  store.notifications.push(newNotif);
  return newNotif;
};

export const markRead = async (id, userId) => {
  const store = getMemoryStore();
  const notif = store.notifications.find((n) => n.id === Number(id) && n.user_id === Number(userId));
  if (notif) {
    notif.is_read = 1;
    return true;
  }
  return false;
};

export const markAllRead = async (userId) => {
  const store = getMemoryStore();
  let count = 0;
  for (const notif of store.notifications) {
    if (notif.user_id === Number(userId) && !notif.is_read) {
      notif.is_read = 1;
      count++;
    }
  }
  return count;
};

