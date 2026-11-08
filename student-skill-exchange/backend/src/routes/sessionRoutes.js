/**
 * Session Routes
 * /api/sessions
 */

import { Router } from 'express';
import * as sessionController from '../controllers/sessionController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticateToken);

router.post('/', sessionController.scheduleSession);
router.get('/', sessionController.getMySessions);
router.get('/:id', sessionController.getSessionById);
router.put('/:id/reschedule', sessionController.rescheduleSession);
router.put('/:id/cancel', sessionController.cancelSession);
router.put('/:id/complete', sessionController.confirmCompletion);
router.put('/:id/confirm', sessionController.confirmCompletion);

export default router;

