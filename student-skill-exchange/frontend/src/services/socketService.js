/**
 * Socket.IO Real-Time Client Service
 * Manages live peer messaging, session room presence, and real-time notifications
 */

import { io } from 'socket.io-client';

const SOCKET_SERVER_URL =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SOCKET_URL) ||
  (typeof process !== 'undefined' && process.env && process.env.VITE_SOCKET_URL) ||
  'http://localhost:5000';

let socket = null;

export const initSocket = (token) => {
  if (socket && socket.connected) {
    return socket;
  }

  const authToken = token || (typeof localStorage !== 'undefined' ? localStorage.getItem('skillswap_token') : null);

  socket = io(SOCKET_SERVER_URL, {
    auth: {
      token: authToken,
    },
    transports: ['websocket', 'polling'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('[Socket.IO Frontend] Connected with ID:', socket.id);
  });

  socket.on('connect_error', (err) => {
    console.warn('[Socket.IO Frontend] Connection notice:', err.message);
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initSocket();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const sendMessage = (data, callback) => {
  const s = getSocket();
  if (s) {
    s.emit('send_message', data, callback);
  }
};

export const onReceiveMessage = (callback) => {
  const s = getSocket();
  if (s) {
    s.off('receive_message');
    s.on('receive_message', callback);
  }
  return () => s && s.off('receive_message', callback);
};

export const onNotificationReceived = (callback) => {
  const s = getSocket();
  if (s) {
    s.off('notification_received');
    s.on('notification_received', callback);
  }
  return () => s && s.off('notification_received', callback);
};

export const emitTyping = (receiverId, isTyping) => {
  const s = getSocket();
  if (s) {
    s.emit(isTyping ? 'typing_start' : 'typing_stop', { receiverId });
  }
};

export const onPartnerTyping = (callback) => {
  const s = getSocket();
  if (s) {
    s.off('partner_typing');
    s.on('partner_typing', callback);
  }
  return () => s && s.off('partner_typing', callback);
};

export const onUserStatusChanged = (callback) => {
  const s = getSocket();
  if (s) {
    s.off('user_status_changed');
    s.on('user_status_changed', callback);
  }
  return () => s && s.off('user_status_changed', callback);
};

export const onOnlineUsersList = (callback) => {
  const s = getSocket();
  if (s) {
    s.off('online_users_list');
    s.on('online_users_list', callback);
  }
  return () => s && s.off('online_users_list', callback);
};

export const checkOnlineStatus = (userIds, callback) => {
  const s = getSocket();
  if (s) {
    s.emit('check_online_status', userIds, callback);
  }
};

export const onChatError = (callback) => {
  const s = getSocket();
  if (s) {
    s.off('chat_error');
    s.on('chat_error', callback);
  }
  return () => s && s.off('chat_error', callback);
};

export const onRoomError = (callback) => {
  const s = getSocket();
  if (s) {
    s.off('room_error');
    s.on('room_error', callback);
  }
  return () => s && s.off('room_error', callback);
};

export const joinStudyRoom = (sessionId, callback) => {
  const s = getSocket();
  if (s && sessionId) {
    s.emit('join_study_room', { sessionId }, callback);
  }
};

export const leaveStudyRoom = (sessionId) => {
  const s = getSocket();
  if (s && sessionId) {
    s.emit('leave_study_room', { sessionId });
  }
};

export const onUserJoinedRoom = (callback) => {
  const s = getSocket();
  if (s) {
    s.off('user_joined_room');
    s.on('user_joined_room', callback);
  }
  return () => s && s.off('user_joined_room', callback);
};

export const onUserLeftRoom = (callback) => {
  const s = getSocket();
  if (s) {
    s.off('user_left_room');
    s.on('user_left_room', callback);
  }
  return () => s && s.off('user_left_room', callback);
};
