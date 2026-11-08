/**
 * Credit Controller
 * Handles student credit balance inquiries and transaction ledger
 */

import * as creditModel from '../models/creditModel.js';
import { successResponse } from '../utils/responseHelper.js';

export const getBalance = async (req, res, next) => {
  try {
    const balance = await creditModel.getBalance(req.user.id);
    return successResponse(res, {
      userId: req.user.id,
      balance,
      currency: 'SkillCredits',
    });
  } catch (error) {
    next(error);
  }
};

export const getHistory = async (req, res, next) => {
  try {
    const history = await creditModel.getHistory(req.user.id);
    return successResponse(res, history);
  } catch (error) {
    next(error);
  }
};

