/**
 * Review Routes
 * /api/reviews
 */

import { Router } from 'express';
import * as reviewController from '../controllers/reviewController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/', authenticateToken, reviewController.createReview);
router.get('/student/:studentId', reviewController.getStudentReviews);

export default router;

