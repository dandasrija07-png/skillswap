/**
 * Notification Controller
 * Manages user notifications and read receipts
 */

import * as notificationModel from '../models/notificationModel.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';

export const getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await notificationModel.getByUserId(req.user.id);
    const unreadCount = notifications.filter((n) => !n.is_read).length;

    return successResponse(res, {
      notifications,
      unreadCount,
    });
  } catch (error) {
    next(error);
  }
};

export const markRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await notificationModel.markRead(id, req.user.id);

    if (!updated) {
      return errorResponse(res, 'Notification not found or unauthorized.', 404);
    }

    return successResponse(res, { id: Number(id), isRead: true }, 'Notification marked as read.');
  } catch (error) {
    next(error);
  }
};

export const markAllRead = async (req, res, next) => {
  try {
    const count = await notificationModel.markAllRead(req.user.id);
    return successResponse(res, { updatedCount: count }, `${count} notification(s) marked as read.`);
  } catch (error) {
    next(error);
  }
};

