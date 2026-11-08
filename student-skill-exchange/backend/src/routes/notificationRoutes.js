/**
 * Notification Routes
 * /api/notifications
 */

import { Router } from 'express';
import * as notificationController from '../controllers/notificationController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/', notificationController.getMyNotifications);
router.put('/read-all', notificationController.markAllRead);
router.put('/:id/read', notificationController.markRead);

export default router;

