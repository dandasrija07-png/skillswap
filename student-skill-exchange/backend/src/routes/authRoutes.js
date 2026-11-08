/**
 * Authentication Routes
 * /api/auth
 */

import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { validateBody, validateEmailMiddleware } from '../middleware/validateMiddleware.js';

const router = Router();

router.post(
  '/register',
  validateBody(['fullName', 'email', 'password', 'department', 'academicYear', 'collegeName']),
  validateEmailMiddleware,
  authController.register
);

router.post(
  '/login',
  validateBody(['email', 'password']),
  validateEmailMiddleware,
  authController.login
);

router.get('/me', authenticateToken, authController.getMe);

export default router;
