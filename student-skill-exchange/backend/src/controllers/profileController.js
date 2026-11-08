/**
 * Student Profile Controller
 */

import * as profileModel from '../models/profileModel.js';
import * as skillModel from '../models/skillModel.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';

export const getMyProfile = async (req, res, next) => {
  try {
    const profile = await profileModel.findByUserId(req.user.id);
    if (!profile) {
      return errorResponse(res, 'Student profile not found.', 404);
    }

    const teachingSkills = await skillModel.getStudentSkills(req.user.id, 'teach');
    const learningSkills = await skillModel.getStudentSkills(req.user.id, 'learn');

    return successResponse(res, {
      ...profile,
      teachingSkills,
      learningSkills,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMyProfile = async (req, res, next) => {
  try {
    const updated = await profileModel.updateByUserId(req.user.id, req.body);
    if (!updated) {
      return errorResponse(res, 'Profile could not be updated.', 400);
    }

    return successResponse(res, updated, 'Student profile updated successfully.');
  } catch (error) {
    next(error);
  }
};

export const getPublicProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const profile = await profileModel.findByUserId(id);
    if (!profile) {
      return errorResponse(res, `Student profile with ID ${id} not found.`, 404);
    }

    const teachingSkills = await skillModel.getStudentSkills(id, 'teach');
    const learningSkills = await skillModel.getStudentSkills(id, 'learn');

    return successResponse(res, {
      ...profile,
      teachingSkills,
      learningSkills,
    });
  } catch (error) {
    next(error);
  }
};

