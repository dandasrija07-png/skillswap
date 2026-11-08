/**
 * Message Routes
 * /api/messages
 */

import { Router } from 'express';
import * as messageController from '../controllers/messageController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/', messageController.getConversations);
router.get('/:partnerId', messageController.getThread);
router.post('/', messageController.sendMessage);
router.put('/:partnerId/read', messageController.markRead);

export default router;
