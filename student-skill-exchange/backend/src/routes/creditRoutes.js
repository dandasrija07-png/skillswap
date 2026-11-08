/**
 * Credit Transactions Routes
 * /api/credits
 */

import { Router } from 'express';
import * as creditController from '../controllers/creditController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/balance', creditController.getBalance);
router.get('/history', creditController.getHistory);

export default router;

