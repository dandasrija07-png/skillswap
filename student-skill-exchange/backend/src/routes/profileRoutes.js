/**
 * Profile Routes
 * /api/profile
 */

import { Router } from 'express';
import * as profileController from '../controllers/profileController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/me', authenticateToken, profileController.getMyProfile);
router.put('/me', authenticateToken, profileController.updateMyProfile);
router.get('/:id', profileController.getPublicProfile);

export default router;

