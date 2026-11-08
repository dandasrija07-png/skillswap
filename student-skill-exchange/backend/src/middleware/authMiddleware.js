/**
 * JWT Authentication Middleware
 * Protects private endpoints by validating the Authorization header
 */

import { verifyToken } from '../utils/jwtHelper.js';
import { errorResponse } from '../utils/responseHelper.js';
import { getMemoryStore } from '../config/db.js';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: Bearer <token>

  if (!token) {
    return errorResponse(res, 'Access denied. Authentication token required.', 401);
  }

  try {
    const decoded = verifyToken(token);

    // Verify user exists in database
    const store = getMemoryStore();
    const user = store.users.find((u) => u.id === decoded.id);

    if (!user || !user.is_active) {
      return errorResponse(res, 'User account not found or has been deactivated.', 401);
    }

    req.user = {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
    };

    next();
  } catch (error) {
    return errorResponse(res, 'Invalid or expired authentication token.', 401);
  }
};

/**
 * Optional token authentication
 * Populates req.user if a valid token is present; proceeds without error if absent
 */
export const optionalAuthToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = verifyToken(token);
    const store = getMemoryStore();
    const user = store.users.find((u) => u.id === decoded.id);

    if (user && user.is_active) {
      req.user = {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
      };
    } else {
      req.user = null;
    }
  } catch {
    req.user = null;
  }

  next();
};
