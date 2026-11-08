/**
 * Exchange Request Routes
 * /api/requests
 */

import { Router } from 'express';
import * as requestController from '../controllers/requestController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticateToken);

router.post('/', requestController.sendRequest);
router.get('/', requestController.getMyRequests);
router.put('/:id/accept', requestController.acceptRequest);
router.put('/:id/reject', requestController.rejectRequest);
router.put('/:id/cancel', requestController.cancelRequest);

export default router;

