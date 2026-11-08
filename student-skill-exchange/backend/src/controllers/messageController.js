/**
 * Message Controller
 * Handles direct messaging between peer students with strict server-side authorization
 * and real-time Socket.IO emission to connected client rooms.
 */

import * as messageModel from '../models/messageModel.js';
import * as notificationModel from '../models/notificationModel.js';
import { canUsersChat } from '../services/chatAuthService.js';
import { emitToUser, emitNotification } from '../sockets/socketEmitter.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';

export const getConversations = async (req, res, next) => {
  try {
    const list = await messageModel.getConversations(req.user.id);
    return successResponse(res, list);
  } catch (error) {
    next(error);
  }
};

export const getThread = async (req, res, next) => {
  try {
    const { partnerId } = req.params;

    if (!partnerId) {
      return errorResponse(res, 'partnerId is required.', 400);
    }

    // Verify chat authorization between these students
    const authorized = await canUsersChat(req.user.id, partnerId);
    if (!authorized) {
      return errorResponse(
        res,
        'Unauthorized: Chat is only permitted between students with an active exchange proposal or scheduled session.',
        403
      );
    }

    const messages = await messageModel.getThread(req.user.id, partnerId);
    return successResponse(res, messages);
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const { receiverId, exchangeRequestId, messageText } = req.body;

    if (!receiverId || !messageText || !messageText.trim()) {
      return errorResponse(res, 'receiverId and messageText are required.', 400);
    }

    if (Number(receiverId) === req.user.id) {
      return errorResponse(res, 'You cannot message yourself.', 400);
    }

    // Enforce bilateral authorization server-side
    const authorized = await canUsersChat(req.user.id, receiverId);
    if (!authorized) {
      return errorResponse(
        res,
        'Chat is only permitted between students with an active exchange proposal or scheduled session.',
        403
      );
    }

    const message = await messageModel.create({
      senderId: req.user.id,
      receiverId: Number(receiverId),
      exchangeRequestId,
      messageText: messageText.trim(),
    });

    const enrichedMessage = {
      ...message,
      senderName: req.user.fullName,
      isMe: false,
    };

    // Emit live message to recipient's private Socket.IO room
    emitToUser(receiverId, 'receive_message', enrichedMessage);

    // Persist and emit push notification
    const notif = await notificationModel.create({
      userId: Number(receiverId),
      type: 'new_message',
      title: `New message from ${req.user.fullName}`,
      message: messageText.trim().substring(0, 80),
      referenceId: message.id,
      referenceType: 'message',
    });
    emitNotification(receiverId, notif);

    return successResponse(res, { ...message, senderName: req.user.fullName, isMe: true }, 'Message sent successfully.', 201);
  } catch (error) {
    next(error);
  }
};

export const markRead = async (req, res, next) => {
  try {
    const { partnerId } = req.params;

    if (!partnerId) {
      return errorResponse(res, 'partnerId is required.', 400);
    }

    // partner is sender, current user is receiver
    const updatedCount = await messageModel.markAsRead(partnerId, req.user.id);
    return successResponse(res, { updatedCount }, 'Messages marked as read.');
  } catch (error) {
    next(error);
  }
};
