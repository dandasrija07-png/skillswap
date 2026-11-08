/**
 * Exchange Request Controller
 */

import * as requestModel from '../models/requestModel.js';
import * as skillModel from '../models/skillModel.js';
import * as notificationModel from '../models/notificationModel.js';
import { emitNotification } from '../sockets/socketEmitter.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';

export const sendRequest = async (req, res, next) => {
  try {
    let {
      receiverId,
      offeredSkillId,
      requestedSkillId,
      offeredSkill,
      requestedSkill,
      proposedHours,
      personalMessage,
    } = req.body;

    // Resolve offeredSkillId if string was passed
    if (!offeredSkillId && offeredSkill) {
      const s = await skillModel.findOrCreateSkill({ name: offeredSkill });
      offeredSkillId = s.id;
    }

    // Resolve requestedSkillId if string was passed
    if (!requestedSkillId && requestedSkill) {
      const s = await skillModel.findOrCreateSkill({ name: requestedSkill });
      requestedSkillId = s.id;
    }

    if (!receiverId || !offeredSkillId || !requestedSkillId) {
      return errorResponse(res, 'receiverId, offeredSkill (or ID), and requestedSkill (or ID) are required.', 400);
    }

    const newReq = await requestModel.create({
      senderId: req.user.id,
      receiverId,
      offeredSkillId,
      requestedSkillId,
      proposedHours,
      personalMessage: personalMessage || 'Excited to swap skills and learn together!',
    });

    // Create notification for recipient and emit via Socket.IO
    const notif = await notificationModel.create({
      userId: receiverId,
      type: 'request_received',
      title: 'New Skill Exchange Proposal',
      message: `${req.user.fullName} proposed a skill exchange with you.`,
      referenceId: newReq.id,
      referenceType: 'exchange_request',
    });
    emitNotification(receiverId, notif);

    return successResponse(res, newReq, 'Exchange proposal sent successfully.', 201);
  } catch (error) {
    if (
      error.message.includes('cannot propose') ||
      error.message.includes('already have an active') ||
      error.message.includes('not found')
    ) {
      return errorResponse(res, error.message, 400);
    }
    next(error);
  }
};

export const getMyRequests = async (req, res, next) => {
  try {
    const requests = await requestModel.getByUserId(req.user.id);
    return successResponse(res, requests);
  } catch (error) {
    if (
      error.message.includes('cannot propose') ||
      error.message.includes('already have an active') ||
      error.message.includes('not found')
    ) {
      return errorResponse(res, error.message, 400);
    }
    next(error);
  }
};

export const acceptRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await requestModel.updateStatus(id, 'Accepted', req.user.id);

    // Notify sender that request was accepted
    const notif = await notificationModel.create({
      userId: updated.sender_id,
      type: 'request_accepted',
      title: 'Exchange Proposal Accepted!',
      message: `${req.user.fullName} accepted your skill exchange proposal. You can now schedule a session!`,
      referenceId: updated.id,
      referenceType: 'exchange_request',
    });
    emitNotification(updated.sender_id, notif);

    return successResponse(res, updated, 'Exchange proposal accepted.');
  } catch (error) {
    if (
      error.message.includes('cannot propose') ||
      error.message.includes('already have an active') ||
      error.message.includes('not found')
    ) {
      return errorResponse(res, error.message, 400);
    }
    next(error);
  }
};

export const rejectRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const updated = await requestModel.updateStatus(id, 'Rejected', req.user.id, reason);

    const notif = await notificationModel.create({
      userId: updated.sender_id,
      type: 'request_rejected',
      title: 'Exchange Proposal Declined',
      message: `${req.user.fullName} declined your exchange proposal.`,
      referenceId: updated.id,
      referenceType: 'exchange_request',
    });
    emitNotification(updated.sender_id, notif);

    return successResponse(res, updated, 'Exchange proposal declined.');
  } catch (error) {
    if (
      error.message.includes('cannot propose') ||
      error.message.includes('already have an active') ||
      error.message.includes('not found')
    ) {
      return errorResponse(res, error.message, 400);
    }
    next(error);
  }
};

export const cancelRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await requestModel.updateStatus(id, 'Cancelled', req.user.id);
    return successResponse(res, updated, 'Exchange proposal withdrawn.');
  } catch (error) {
    if (
      error.message.includes('cannot propose') ||
      error.message.includes('already have an active') ||
      error.message.includes('not found')
    ) {
      return errorResponse(res, error.message, 400);
    }
    next(error);
  }
};
