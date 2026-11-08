/**
 * Admin Routes
 * /api/admin
 * Gated by authentication and requireRole('admin')
 */

import { Router } from 'express';
import * as adminController from '../controllers/adminController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

// Protect all admin endpoints with authentication
router.use(authenticateToken);

// Reports submission by any authenticated student
router.post('/reports', adminController.submitReport);

// All subsequent routes strictly restricted to administrators
router.use(requireRole('admin'));

// 1. KPI Statistics & Analytics
router.get('/stats', adminController.getStats);
router.get('/activity', adminController.getActivity);
router.get('/reports/usage', adminController.getUsageReport);

// 2. Student Account Moderation
router.get('/users', adminController.getUsers);
router.put('/users/:id/status', adminController.updateUserStatus);
router.put('/users/:id/moderate', adminController.moderateUserProfile);

// 3. Skill & Category Catalog Management
router.get('/skills', adminController.getCatalogSkills);
router.post('/skills', adminController.createCatalogSkill);
router.put('/skills/:id', adminController.updateCatalogSkill);
router.delete('/skills/:id', adminController.deleteCatalogSkill);

// 4. Dispute & Content Moderation Reports
router.get('/reports', adminController.getReports);
router.put('/reports/:id/resolve', adminController.resolveReport);
router.put('/reports/:id/dismiss', adminController.dismissReport);

export default router;
