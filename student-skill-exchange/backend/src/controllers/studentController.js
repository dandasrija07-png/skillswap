/**
 * Student Search & Deterministic Rule-Based Matching Controller
 */

import * as profileModel from '../models/profileModel.js';
import * as skillModel from '../models/skillModel.js';
import { calculateStudentMatch } from '../services/matchingService.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';

export const searchStudents = async (req, res, next) => {
  try {
    const {
      query = '',
      teachingSkillQuery = '',
      category = 'All',
      department = 'All',
      academicYear = 'All',
      proficiency = 'All',
      availability = 'Any',
      learningMode = 'Any',
      sortBy = 'relevance',
    } = req.query;

    const allProfiles = await profileModel.getAllProfiles();

    // Current user's skills for calculating match metadata
    const userTeachSkills = req.user ? await skillModel.getStudentSkills(req.user.id, 'teach') : [];
    const userLearnSkills = req.user ? await skillModel.getStudentSkills(req.user.id, 'learn') : [];

    // Filter out current user from search
    let candidates = allProfiles.filter((p) => !req.user || p.user_id !== req.user.id);

    // Filter 1: Query (Name, College, Bio)
    if (query.trim()) {
      const q = query.toLowerCase().trim();
      candidates = candidates.filter(
        (c) =>
          c.full_name.toLowerCase().includes(q) ||
          c.college_name.toLowerCase().includes(q) ||
          (c.short_bio && c.short_bio.toLowerCase().includes(q))
      );
    }

    // Filter 2: Teaching skill query
    if (teachingSkillQuery.trim()) {
      const tq = teachingSkillQuery.toLowerCase().trim();
      candidates = candidates.filter((c) =>
        c.teaching_skills.some((s) => s.name.toLowerCase().includes(tq))
      );
    }

    // Filter 3: Category
    if (category !== 'All') {
      candidates = candidates.filter((c) =>
        c.teaching_skills.some((s) => s.category.toLowerCase() === category.toLowerCase())
      );
    }

    // Filter 4: Department
    if (department !== 'All') {
      candidates = candidates.filter((c) => c.department.toLowerCase() === department.toLowerCase());
    }

    // Filter 5: Academic Year
    if (academicYear !== 'All') {
      candidates = candidates.filter((c) => c.academic_year.startsWith(academicYear));
    }

    // Filter 6: Proficiency
    if (proficiency !== 'All') {
      candidates = candidates.filter((c) =>
        c.teaching_skills.some((s) => s.proficiency.toLowerCase() === proficiency.toLowerCase())
      );
    }

    // Filter 7: Availability
    if (availability !== 'Any') {
      candidates = candidates.filter(
        (c) =>
          c.availability_type.toLowerCase() === availability.toLowerCase() ||
          c.availability.toLowerCase().includes(availability.toLowerCase())
      );
    }

    // Filter 8: Learning Mode
    if (learningMode !== 'Any') {
      candidates = candidates.filter((c) =>
        c.preferred_learning_mode.toLowerCase().includes(learningMode.toLowerCase())
      );
    }

    // Compute rule-based match data for all candidate students
    const results = candidates.map((student) => {
      const match = calculateStudentMatch(student, userLearnSkills, userTeachSkills);
      return {
        ...student,
        match,
      };
    });

    // Sorting
    results.sort((a, b) => {
      if (sortBy === 'relevance') {
        if (a.match.isReciprocalMatch && !b.match.isReciprocalMatch) return -1;
        if (!a.match.isReciprocalMatch && b.match.isReciprocalMatch) return 1;
        return b.match.score - a.match.score;
      }
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'swaps') return b.completed_sessions_count - a.completed_sessions_count;
      if (sortBy === 'name') return a.full_name.localeCompare(b.full_name);
      return 0;
    });

    return successResponse(res, {
      total: results.length,
      students: results,
    });
  } catch (error) {
    next(error);
  }
};

export const getStudentMatch = async (req, res, next) => {
  try {
    const { id } = req.params;
    const targetProfile = await profileModel.findByUserId(id);
    if (!targetProfile) {
      return errorResponse(res, 'Student profile not found.', 404);
    }

    const candidateTeach = await skillModel.getStudentSkills(id, 'teach');
    const candidateLearn = await skillModel.getStudentSkills(id, 'learn');

    const userTeach = await skillModel.getStudentSkills(req.user.id, 'teach');
    const userLearn = await skillModel.getStudentSkills(req.user.id, 'learn');

    const candidate = {
      ...targetProfile,
      teaching_skills: candidateTeach,
      learning_skills: candidateLearn,
    };

    const match = calculateStudentMatch(candidate, userLearn, userTeach);

    return successResponse(res, {
      student: candidate,
      match,
    });
  } catch (error) {
    next(error);
  }
};

