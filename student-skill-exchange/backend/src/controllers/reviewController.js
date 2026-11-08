/**
 * Review Controller
 * Handles post-session feedback and peer ratings
 */

import * as reviewModel from '../models/reviewModel.js';
import * as sessionModel from '../models/sessionModel.js';
import * as notificationModel from '../models/notificationModel.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';

export const createReview = async (req, res, next) => {
  try {
    const { sessionId, revieweeId, rating, feedbackComment } = req.body;

    if (!sessionId || !revieweeId || rating === undefined) {
      return errorResponse(res, 'sessionId, revieweeId, and rating are required.', 400);
    }

    const numRating = Number(rating);
    if (!Number.isInteger(numRating) || numRating < 1 || numRating > 5) {
      return errorResponse(res, 'Rating must be an integer between 1 and 5.', 400);
    }

    if (Number(revieweeId) === req.user.id) {
      return errorResponse(res, 'You cannot review yourself.', 400);
    }

    // Verify session existence and user participation
    const session = await sessionModel.findById(sessionId);
    if (!session) {
      return errorResponse(res, 'Session not found.', 404);
    }

    const isParticipant =
      session.initiator_id === req.user.id || session.partner_id === req.user.id;
    if (!isParticipant) {
      return errorResponse(res, 'Unauthorized: You did not participate in this session.', 403);
    }

    const revieweeIsParticipant =
      session.initiator_id === Number(revieweeId) || session.partner_id === Number(revieweeId);
    if (!revieweeIsParticipant) {
      return errorResponse(res, 'The specified reviewee was not a participant in this session.', 400);
    }

    const review = await reviewModel.create({
      sessionId,
      reviewerId: req.user.id,
      revieweeId,
      rating: numRating,
      feedbackComment,
    });

    // Notify reviewee
    await notificationModel.create({
      userId: revieweeId,
      type: 'new_review',
      title: 'New Session Review Received',
      message: `${req.user.fullName} left you a ${numRating}★ review!`,
      referenceId: review.id,
      referenceType: 'review',
    });

    return successResponse(res, review, 'Review submitted successfully.', 201);
  } catch (error) {
    if (error.message.includes('already submitted') || error.message.includes('cannot review')) {
      return errorResponse(res, error.message, 400);
    }
    next(error);
  }
};

export const getStudentReviews = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return errorResponse(res, 'studentId is required.', 400);
    }

    const reviews = await reviewModel.getByRevieweeId(studentId);
    const avgRating =
      reviews.length > 0
        ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(2))
        : 0;

    return successResponse(res, {
      reviews,
      averageRating: avgRating,
      totalCount: reviews.length,
    });
  } catch (error) {
    next(error);
  }
};

