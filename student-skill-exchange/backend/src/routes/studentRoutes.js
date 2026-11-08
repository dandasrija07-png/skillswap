/**
 * Student Search & Match Routes
 * /api/students
 */

import { Router } from 'express';
import * as studentController from '../controllers/studentController.js';
import { authenticateToken, optionalAuthToken } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', optionalAuthToken, studentController.searchStudents);
router.get('/:id/match', authenticateToken, studentController.getStudentMatch);

export default router;

