/**
 * Authentication Controller
 * Handles user registration, login, and session validation
 */

import bcrypt from 'bcryptjs';
import * as userModel from '../models/userModel.js';
import * as profileModel from '../models/profileModel.js';
import * as creditModel from '../models/creditModel.js';
import { generateToken } from '../utils/jwtHelper.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';
import { validateEmail } from '../middleware/validateMiddleware.js';

export const register = async (req, res, next) => {
  try {
    const { fullName, email, password, department, academicYear, collegeName } = req.body;

    if (!fullName || !email || !password || !department || !academicYear || !collegeName) {
      return errorResponse(res, 'All registration fields are required.', 400);
    }

    if (!validateEmail(email)) {
      return errorResponse(res, 'Please provide a valid college email address.', 400);
    }

    if (password.length < 8) {
      return errorResponse(res, 'Password must be at least 8 characters long.', 400);
    }

    // Check existing email
    const existing = await userModel.findByEmail(email);
    if (existing) {
      return errorResponse(res, 'A user account with this email address already exists.', 409);
    }

    // Hash password with bcrypt
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user in database
    const newUser = await userModel.create({
      fullName: fullName.trim(),
      email: email.trim(),
      passwordHash,
      role: 'student',
    });

    // Create student profile
    const newProfile = await profileModel.create({
      userId: newUser.id,
      collegeName: collegeName.trim(),
      department: department.trim(),
      academicYear: academicYear.trim(),
      shortBio: `Hello! I am a ${academicYear} student at ${collegeName}. Excited to exchange skills!`,
    });

    // Award 10 starter welcome credits in immutable ledger
    await creditModel.recordTransaction({
      userId: newUser.id,
      sessionId: null,
      type: 'signup_bonus',
      amount: 10,
      description: 'Initial registration welcome credits bonus',
    });

    // Generate JWT token
    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    return successResponse(
      res,
      {
        user: {
          id: newUser.id,
          fullName: newUser.full_name,
          email: newUser.email,
          role: newUser.role,
        },
        profile: newProfile,
        token,
      },
      'Registration successful! Welcome to SkillSwap.',
      201
    );
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'Email and password are required.', 400);
    }

    const user = await userModel.findByEmail(email);
    if (!user) {
      return errorResponse(res, 'Invalid email or password.', 401);
    }

    if (!user.is_active) {
      return errorResponse(res, 'Account deactivated. Please contact support.', 403);
    }

    // Compare bcrypt hash
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return errorResponse(res, 'Invalid email or password.', 401);
    }

    const profile = await profileModel.findByUserId(user.id);

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return successResponse(
      res,
      {
        user: {
          id: user.id,
          fullName: user.full_name,
          email: user.email,
          role: user.role,
        },
        profile,
        token,
      },
      'Login successful.'
    );
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user) {
      return errorResponse(res, 'User not found.', 404);
    }

    const profile = await profileModel.findByUserId(user.id);

    return successResponse(res, {
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
      },
      profile,
    });
  } catch (error) {
    next(error);
  }
};

