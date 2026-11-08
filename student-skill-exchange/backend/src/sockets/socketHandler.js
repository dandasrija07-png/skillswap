/**
 * Real-Time Socket.IO Handler
 * Manages live peer-to-peer chat, presence, notifications, and study rooms
 * Server-side authorization is strictly enforced on all messages and rooms.
 */

import { verifyToken } from '../utils/jwtHelper.js';
import * as messageModel from '../models/messageModel.js';
import * as notificationModel from '../models/notificationModel.js';
import { canUsersChat, canJoinStudyRoom } from '../services/chatAuthService.js';
import { emitToUser, emitNotification } from './socketEmitter.js';
import { getMemoryStore } from '../config/db.js';

// In-Memory Online Presence Tracker (userId -> Set of socketIds)
const onlineUsers = new Map();

export const isUserOnline = (userId) => {
  const sockets = onlineUsers.get(Number(userId));
  return Boolean(sockets && sockets.size > 0);
};

export const getOnlineUserIds = () => Array.from(onlineUsers.keys());

export const setupSockets = (io) => {
  // Middleware: Authenticate socket connection via JWT Bearer token
  io.use((socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace('Bearer ', '') ||
      socket.handshake.query?.token;

    if (!token) {
      // Allow unauthenticated socket if any, but mark socket.user as null
      socket.user = null;
      return next();
    }

    try {
      const decoded = verifyToken(token);
      const store = getMemoryStore();
      const dbUser = store.users.find((u) => u.id === decoded.id);
      if (!dbUser || !dbUser.is_active) {
        return next(new Error('Authentication failed: User account not found or inactive'));
      }
      socket.user = {
        id: dbUser.id,
        email: dbUser.email,
        fullName: dbUser.full_name,
        role: dbUser.role,
      };
      return next();
    } catch (err) {
      return next(new Error('Authentication failed: Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.user;

    if (user) {
      const userId = Number(user.id);
      if (!onlineUsers.has(userId)) {
        onlineUsers.set(userId, new Set());
      }
      const userSockets = onlineUsers.get(userId);
      const wasOffline = userSockets.size === 0;
      userSockets.add(socket.id);

      // Join private user room for targeted notifications and direct messages
      const userRoom = `user_${userId}`;
      socket.join(userRoom);
      console.log(`[Socket.IO] Authenticated user #${userId} (${user.email}) connected to room: ${userRoom}`);

      // Broadcast presence change to other users if newly online
      if (wasOffline) {
        io.emit('user_status_changed', {
          userId,
          isOnline: true,
          timestamp: new Date().toISOString(),
        });
      }

      // Send the current list of online users to the newly connected socket
      socket.emit('online_users_list', Array.from(onlineUsers.keys()));
    } else {
      console.log(`[Socket.IO] Unauthenticated client connected: ${socket.id}`);
    }

    // Check Online Status for specific user IDs
    socket.on('check_online_status', (userIds, callback) => {
      if (typeof callback !== 'function') return;
      const ids = Array.isArray(userIds) ? userIds : userIds ? [userIds] : [];
      const statusMap = {};
      for (const id of ids) {
        const numId = Number(id);
        statusMap[numId] = onlineUsers.has(numId) && onlineUsers.get(numId).size > 0;
      }
      callback({
        status: 'success',
        onlineStatus: statusMap,
        onlineUserIds: Array.from(onlineUsers.keys()),
      });
    });

    // Join Session Study Room (strictly protected by canJoinStudyRoom)
    socket.on('join_study_room', async ({ sessionId }, callback) => {
      try {
        if (!sessionId) {
          if (callback) callback({ status: 'error', message: 'sessionId is required.' });
          return;
        }

        if (!user) {
          const errMsg = 'Authentication required to enter study room.';
          socket.emit('room_error', { sessionId, message: errMsg });
          if (callback) callback({ status: 'error', message: errMsg });
          return;
        }

        const authorized = await canJoinStudyRoom(user.id, sessionId);
        if (!authorized) {
          const errMsg = 'Unauthorized: You are not an enrolled participant in this study session.';
          console.warn(`[Socket.IO Room Blocked] User #${user.id} denied access to session_${sessionId}`);
          socket.emit('room_error', { sessionId, message: errMsg, code: 403 });
          if (callback) callback({ status: 'error', message: errMsg, code: 403 });
          return;
        }

        const room = `session_${sessionId}`;
        socket.join(room);
        console.log(`[Socket.IO] Socket ${socket.id} (User #${user.id}) joined ${room}`);

        io.to(room).emit('user_joined_room', {
          sessionId,
          userId: user.id,
          userName: user.fullName,
          timestamp: new Date().toISOString(),
        });

        if (callback) callback({ status: 'success', room });
      } catch (err) {
        console.error('[Socket.IO join_study_room error]:', err);
        if (callback) callback({ status: 'error', message: err.message });
      }
    });

    // Leave Session Study Room
    socket.on('leave_study_room', ({ sessionId }) => {
      if (!sessionId) return;
      const room = `session_${sessionId}`;
      socket.leave(room);
      io.to(room).emit('user_left_room', {
        sessionId,
        userId: user?.id,
        userName: user?.fullName,
        timestamp: new Date().toISOString(),
      });
    });

    // Live Peer Message (strictly checked by canUsersChat)
    socket.on('send_message', async (data, callback) => {
      try {
        if (!user) {
          const errMsg = 'Authentication required to send messages.';
          socket.emit('chat_error', { message: errMsg });
          if (callback) callback({ status: 'error', message: errMsg });
          return;
        }

        const { receiverId, messageText, exchangeRequestId } = data;
        if (!receiverId || !messageText?.trim()) {
          const errMsg = 'receiverId and messageText are required.';
          if (callback) callback({ status: 'error', message: errMsg });
          return;
        }

        // Enforce Server-Side Chat Authorization
        const authorized = await canUsersChat(user.id, receiverId);
        if (!authorized) {
          const errMsg = 'Chat is only permitted between students with an active exchange proposal or scheduled session.';
          console.warn(`[Socket.IO Chat Blocked] User #${user.id} tried to message user #${receiverId} without exchange.`);
          socket.emit('chat_error', { receiverId, message: errMsg, code: 403 });
          if (callback) callback({ status: 'error', message: errMsg, code: 403 });
          return;
        }

        // Persist message to database
        const savedMessage = await messageModel.create({
          senderId: user.id,
          receiverId: Number(receiverId),
          exchangeRequestId: exchangeRequestId ? Number(exchangeRequestId) : null,
          messageText: messageText.trim(),
        });

        const enrichedMessage = {
          ...savedMessage,
          senderName: user.fullName,
          isMe: false,
        };

        // Emit to recipient's private room
        emitToUser(receiverId, 'receive_message', enrichedMessage);

        // Persist and push notification to recipient
        const notif = await notificationModel.create({
          userId: Number(receiverId),
          type: 'new_message',
          title: `New message from ${user.fullName}`,
          message: messageText.trim().substring(0, 80),
          referenceId: savedMessage.id,
          referenceType: 'message',
        });
        emitNotification(receiverId, notif);

        // Acknowledge sender
        if (callback) {
          callback({
            status: 'success',
            data: { ...savedMessage, senderName: user.fullName, isMe: true },
          });
        }
      } catch (err) {
        console.error('[Socket.IO send_message error]:', err);
        if (callback) callback({ status: 'error', message: err.message });
      }
    });

    // Typing Indicators
    socket.on('typing_start', ({ receiverId }) => {
      if (user && receiverId) {
        io.to(`user_${receiverId}`).emit('partner_typing', {
          senderId: user.id,
          senderName: user.fullName,
          isTyping: true,
        });
      }
    });

    socket.on('typing_stop', ({ receiverId }) => {
      if (user && receiverId) {
        io.to(`user_${receiverId}`).emit('partner_typing', {
          senderId: user.id,
          senderName: user.fullName,
          isTyping: false,
        });
      }
    });

    // Disconnect & Presence Cleanup
    socket.on('disconnect', () => {
      if (user) {
        const userId = Number(user.id);
        const userSockets = onlineUsers.get(userId);
        if (userSockets) {
          userSockets.delete(socket.id);
          if (userSockets.size === 0) {
            onlineUsers.delete(userId);
            // Broadcast user went offline
            io.emit('user_status_changed', {
              userId,
              isOnline: false,
              timestamp: new Date().toISOString(),
            });
          }
        }
        console.log(`[Socket.IO] User #${userId} (${user.email}) disconnected.`);
      } else {
        console.log(`[Socket.IO] Client ${socket.id} disconnected.`);
      }
    });
  });
};
