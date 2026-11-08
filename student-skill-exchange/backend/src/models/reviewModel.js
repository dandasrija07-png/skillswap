/**
 * Reviews Model
 */

import { getMemoryStore } from '../config/db.js';

export const getByRevieweeId = async (revieweeId) => {
  const store = getMemoryStore();
  const reviews = store.reviews.filter((r) => r.reviewee_id === Number(revieweeId));

  return reviews.map((r) => {
    const reviewer = store.users.find((u) => u.id === r.reviewer_id);
    const profile = store.student_profiles.find((p) => p.user_id === r.reviewer_id);
    return {
      ...r,
      reviewerName: reviewer?.full_name || '',
      reviewerCollege: profile?.college_name || '',
      reviewerAvatar: profile?.avatar_url || null,
    };
  });
};

export const create = async ({ sessionId, reviewerId, revieweeId, rating, feedbackComment }) => {
  const store = getMemoryStore();
  const rId = Number(reviewerId);
  const sId = Number(sessionId);

  // Validate rating 1 - 5
  if (rating < 1 || rating > 5) {
    throw new Error('Rating must be an integer between 1 and 5.');
  }

  if (Number(reviewerId) === Number(revieweeId)) {
    throw new Error('You cannot review yourself.');
  }

  // Enforce 1 review per participant per session
  const existing = store.reviews.find((r) => r.session_id === sId && r.reviewer_id === rId);
  if (existing) {
    throw new Error('You have already submitted a review for this session.');
  }

  const newId = store.reviews.length > 0 ? Math.max(...store.reviews.map((r) => r.id)) + 1 : 1;
  const newRev = {
    id: newId,
    session_id: sId,
    reviewer_id: rId,
    reviewee_id: Number(revieweeId),
    rating: Number(rating),
    feedback_comment: feedbackComment || '',
    created_at: new Date(),
    updated_at: new Date(),
  };

  store.reviews.push(newRev);

  // Re-calculate reviewee average rating
  const allUserReviews = store.reviews.filter((r) => r.reviewee_id === Number(revieweeId));
  const avg = allUserReviews.reduce((sum, rev) => sum + rev.rating, 0) / allUserReviews.length;
  const targetProfile = store.student_profiles.find((p) => p.user_id === Number(revieweeId));
  if (targetProfile) {
    targetProfile.rating = Number(avg.toFixed(2));
    targetProfile.reviews_count = allUserReviews.length;
  }

  return newRev;
};

