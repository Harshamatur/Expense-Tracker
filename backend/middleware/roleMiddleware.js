const { sendError } = require('../utils/response');

/**
 * Restricts a route to one or more roles. Must run after requireAuth.
 * This is the real authorization boundary — the frontend route guards
 * are UX only and are never trusted for security.
 */
function requireRole(...allowedRoles) {
  return function roleCheck(req, res, next) {
    if (!req.user) {
      return sendError(res, { status: 401, message: 'Authentication required.', errorCode: 'NO_TOKEN' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return sendError(res, { status: 403, message: 'You do not have permission to perform this action.', errorCode: 'FORBIDDEN' });
    }
    next();
  };
}

module.exports = { requireRole };
