/**
 * Skill Catalog & Student Skills Routes
 * /api/skills
 */

import { Router } from 'express';
import * as skillController from '../controllers/skillController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', skillController.getCatalogSkills);
router.get('/my-skills', authenticateToken, skillController.getMySkills);
router.post('/my-skills', authenticateToken, skillController.addMySkill);
router.delete('/my-skills/:id', authenticateToken, skillController.removeMySkill);

export default router;

