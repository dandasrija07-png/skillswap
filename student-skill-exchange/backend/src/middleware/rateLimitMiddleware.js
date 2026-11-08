/**
 * Sliding Window In-Memory Rate Limiter
 * Protects APIs against brute-force attempts and excessive requests
 */

import { errorResponse } from '../utils/responseHelper.js';

const requestLog = new Map();

export const rateLimiter = (options = {}) => {
  const windowMs = options.windowMs || 60 * 1000; // 1 minute window
  const maxRequests = options.maxRequests || 120; // 120 requests per minute
  const message = options.message || 'Too many requests. Please slow down and try again shortly.';

  return (req, res, next) => {
    const ip = req.ip || (req.connection && req.connection.remoteAddress) || (req.socket && req.socket.remoteAddress) || '127.0.0.1';
    const now = Date.now();

    if (!requestLog.has(ip)) {
      requestLog.set(ip, []);
    }

    const timestamps = requestLog.get(ip);
    // Remove expired entries
    const validTimestamps = timestamps.filter((t) => now - t < windowMs);

    if (validTimestamps.length >= maxRequests) {
      return errorResponse(res, message, 429);
    }

    validTimestamps.push(now);
    requestLog.set(ip, validTimestamps);

    next();
  };
};

