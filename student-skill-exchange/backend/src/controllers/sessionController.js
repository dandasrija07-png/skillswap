/**
 * Session Controller
 * Handles booking, rescheduling, cancellations, and dual-confirmation completion
 * Real-time notifications pushed instantly via Socket.IO
 */

import * as sessionModel from '../models/sessionModel.js';
import * as skillModel from '../models/skillModel.js';
import * as notificationModel from '../models/notificationModel.js';
import { emitNotification } from '../sockets/socketEmitter.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';

export const scheduleSession = async (req, res, next) => {
  try {
    let {
      exchangeRequestId,
      partnerId,
      topicSkillId,
      topic,
      topicName,
      exchangeSkillId,
      sessionDate,
      startTime,
      durationMinutes,
      mode,
      locationOrLink,
      agendaNotes,
    } = req.body;

    if (!topicSkillId && (topic || topicName)) {
      const resolved = await skillModel.findOrCreateSkill({ name: topic || topicName });
      topicSkillId = resolved.id;
    }

    if (!partnerId || !topicSkillId || !sessionDate || !startTime) {
      return errorResponse(res, 'partnerId, topicSkillId (or topic), sessionDate, and startTime are required.', 400);
    }

    const session = await sessionModel.create({
      exchangeRequestId,
      initiatorId: req.user.id,
      partnerId,
      topicSkillId,
      exchangeSkillId,
      sessionDate,
      startTime,
      durationMinutes: durationMinutes || 60,
      mode: mode || 'Online',
      locationOrLink,
      agendaNotes,
    });

    // Notify partner of scheduled session via DB and Socket.IO
    const notif = await notificationModel.create({
      userId: partnerId,
      type: 'session_scheduled',
      title: 'New Learning Session Scheduled',
      message: `${req.user.fullName} scheduled a session for ${sessionDate} at ${startTime}.`,
      referenceId: session.id,
      referenceType: 'session',
    });
    emitNotification(partnerId, notif);

    return successResponse(res, session, 'Learning session scheduled successfully.', 201);
  } catch (error) {
    if (error.message.includes('overlap') || error.message.includes('past') || error.message.includes('cannot schedule')) {
      return errorResponse(res, error.message, 400);
    }
    next(error);
  }
};

export const getMySessions = async (req, res, next) => {
  try {
    const sessions = await sessionModel.getByUserId(req.user.id);
    return successResponse(res, sessions);
  } catch (error) {
    next(error);
  }
};

export const getSessionById = async (req, res, next) => {
  try {
    const session = await sessionModel.findById(req.params.id);
    if (!session) {
      return errorResponse(res, 'Session not found.', 404);
    }

    if (
      session.initiator_id !== req.user.id &&
      session.partner_id !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return errorResponse(res, 'Unauthorized: You are not a participant in this session.', 403);
    }

    return successResponse(res, session);
  } catch (error) {
    next(error);
  }
};

export const rescheduleSession = async (req, res, next) => {
  try {
    const { newDate, newTime, durationMinutes, reason } = req.body;

    if (!newDate || !newTime) {
      return errorResponse(res, 'newDate and newTime are required.', 400);
    }

    const session = await sessionModel.reschedule({
      sessionId: req.params.id,
      newDate,
      newTime,
      durationMinutes,
      reason,
      userId: req.user.id,
    });

    const otherParticipantId =
      session.initiator_id === req.user.id ? session.partner_id : session.initiator_id;

    const notif = await notificationModel.create({
      userId: otherParticipantId,
      type: 'session_rescheduled',
      title: 'Session Rescheduled',
      message: `${req.user.fullName} rescheduled your session to ${newDate} at ${newTime}.`,
      referenceId: session.id,
      referenceType: 'session',
    });
    emitNotification(otherParticipantId, notif);

    return successResponse(res, session, 'Session rescheduled successfully.');
  } catch (error) {
    if (error.message.includes('Unauthorized')) {
      return errorResponse(res, error.message, 403);
    }
    if (error.message.includes('overlap') || error.message.includes('Cannot reschedule')) {
      return errorResponse(res, error.message, 400);
    }
    next(error);
  }
};

export const cancelSession = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const session = await sessionModel.cancel({
      sessionId: req.params.id,
      reason: reason || 'Cancelled by participant',
      userId: req.user.id,
    });

    const otherParticipantId =
      session.initiator_id === req.user.id ? session.partner_id : session.initiator_id;

    const notif = await notificationModel.create({
      userId: otherParticipantId,
      type: 'session_cancelled',
      title: 'Session Cancelled',
      message: `${req.user.fullName} cancelled the session scheduled for ${session.session_date}.`,
      referenceId: session.id,
      referenceType: 'session',
    });
    emitNotification(otherParticipantId, notif);

    return successResponse(res, session, 'Session cancelled successfully.');
  } catch (error) {
    if (error.message.includes('Unauthorized')) {
      return errorResponse(res, error.message, 403);
    }
    if (error.message.includes('Cannot cancel')) {
      return errorResponse(res, error.message, 400);
    }
    next(error);
  }
};

export const confirmCompletion = async (req, res, next) => {
  try {
    const result = await sessionModel.confirmCompletion(req.params.id, req.user.id);

    const session = result.session;
    const otherParticipantId =
      session.initiator_id === req.user.id ? session.partner_id : session.initiator_id;

    if (result.isFullyCompleted) {
      const notif = await notificationModel.create({
        userId: otherParticipantId,
        type: 'session_completed',
        title: 'Session Fully Completed!',
        message: `Both parties confirmed session completion. Exchange credits have been awarded!`,
        referenceId: session.id,
        referenceType: 'session',
      });
      emitNotification(otherParticipantId, notif);
    } else {
      const notif = await notificationModel.create({
        userId: otherParticipantId,
        type: 'session_confirmation_needed',
        title: 'Completion Confirmation Needed',
        message: `${req.user.fullName} confirmed session completion. Please confirm on your end to release credits.`,
        referenceId: session.id,
        referenceType: 'session',
      });
      emitNotification(otherParticipantId, notif);
    }

    return successResponse(
      res,
      result,
      result.isFullyCompleted
        ? 'Session successfully completed and credits awarded to both participants!'
        : 'Session completion confirmed by you. Awaiting your partner confirmation to release credits.'
    );
  } catch (error) {
    if (error.message.includes('Unauthorized')) {
      return errorResponse(res, error.message, 403);
    }
    if (error.message.includes('Cannot complete') || error.message.includes('not found')) {
      return errorResponse(res, error.message, 400);
    }
    next(error);
  }
};
