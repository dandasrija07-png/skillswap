/**
 * Master API Router
 * Aggregates all modular sub-routes under /api
 */

import { Router } from 'express';
import authRoutes from './authRoutes.js';
import profileRoutes from './profileRoutes.js';
import skillRoutes from './skillRoutes.js';
import studentRoutes from './studentRoutes.js';
import requestRoutes from './requestRoutes.js';
import sessionRoutes from './sessionRoutes.js';
import messageRoutes from './messageRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import reviewRoutes from './reviewRoutes.js';
import creditRoutes from './creditRoutes.js';
import adminRoutes from './adminRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/skills', skillRoutes);
router.use('/students', studentRoutes);
router.use('/requests', requestRoutes);
router.use('/sessions', sessionRoutes);
router.use('/messages', messageRoutes);
router.use('/notifications', notificationRoutes);
router.use('/reviews', reviewRoutes);
router.use('/credits', creditRoutes);
router.use('/admin', adminRoutes);

export default router;

