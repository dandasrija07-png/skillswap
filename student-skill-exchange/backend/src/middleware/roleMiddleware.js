/**
 * Role-Based Authorization Middleware
 * Verifies that the authenticated user possesses the required role
 */

import { errorResponse } from '../utils/responseHelper.js';

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required.', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(
        res,
        `Forbidden: Role '${req.user.role}' does not have permission to access this resource. Required: ${allowedRoles.join(' or ')}`,
        403
      );
    }

    next();
  };
};

