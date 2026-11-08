/**
 * Skill Catalog & Student Skills Controller
 */

import * as skillModel from '../models/skillModel.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';

export const getCatalogSkills = async (req, res, next) => {
  try {
    const { category } = req.query;
    const skills = await skillModel.getAllSkills(category);
    return successResponse(res, skills);
  } catch (error) {
    next(error);
  }
};

export const getMySkills = async (req, res, next) => {
  try {
    const teachingSkills = await skillModel.getStudentSkills(req.user.id, 'teach');
    const learningSkills = await skillModel.getStudentSkills(req.user.id, 'learn');

    return successResponse(res, {
      teachingSkills,
      learningSkills,
    });
  } catch (error) {
    next(error);
  }
};

export const addMySkill = async (req, res, next) => {
  try {
    let { skillId, name, category, skillType, proficiency, shortDescription } = req.body;

    if (!skillId && name) {
      const catalogItem = await skillModel.findOrCreateSkill({
        name,
        category: category || 'Other',
        description: shortDescription || '',
      });
      skillId = catalogItem.id;
    }

    if (!skillId || !skillType) {
      return errorResponse(res, 'skillId (or name) and skillType ("teach" or "learn") are required.', 400);
    }

    if (!['teach', 'learn'].includes(skillType)) {
      return errorResponse(res, 'skillType must be either "teach" or "learn".', 400);
    }

    const added = await skillModel.addStudentSkill({
      userId: req.user.id,
      skillId,
      skillType,
      proficiency: proficiency || 'Intermediate',
      shortDescription: shortDescription || '',
    });

    return successResponse(res, added, 'Skill added to profile successfully.', 201);
  } catch (error) {
    next(error);
  }
};

export const removeMySkill = async (req, res, next) => {
  try {
    const { id } = req.params;
    await skillModel.removeStudentSkill(id, req.user.id);
    return successResponse(res, null, 'Skill removed from profile successfully.');
  } catch (error) {
    next(error);
  }
};

