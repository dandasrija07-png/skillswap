/**
 * Request Body Validation Middleware
 * Checks for required fields and validates data formats
 */

import { errorResponse } from '../utils/responseHelper.js';

export const validateBody = (requiredFields = []) => {
  return (req, res, next) => {
    const missing = [];

    for (const field of requiredFields) {
      if (req.body[field] === undefined || req.body[field] === null || String(req.body[field]).trim() === '') {
        missing.push(field);
      }
    }

    if (missing.length > 0) {
      return errorResponse(
        res,
        `Validation error: Missing required field(s): ${missing.join(', ')}`,
        400,
        missing
      );
    }

    next();
  };
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

export const validateEmailMiddleware = (req, res, next) => {
  if (req.body && req.body.email) {
    if (!validateEmail(req.body.email)) {
      return errorResponse(res, 'Please provide a valid college email address.', 400);
    }
  }
  next();
};
