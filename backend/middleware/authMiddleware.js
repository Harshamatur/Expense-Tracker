const { verifyToken } = require('../utils/jwt');
const { sendError, AppError } = require('../utils/response');
const userService = require('../services/userService');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Verifies the Authorization: Bearer <token> header, checks the token
 * signature/expiry, and re-loads the user from the database so that a
 * deactivated account is rejected even with a still-valid token.
 * Populates req.user with a minimal, sanitized identity.
 */
const requireAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return sendError(res, { status: 401, message: 'Authentication required.', errorCode: 'NO_TOKEN' });
  }

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (err) {
    return sendError(res, { status: 401, message: 'Invalid or expired session.', errorCode: 'INVALID_TOKEN' });
  }

  const user = await userService.findActiveUserById(decoded.sub);
  if (!user) {
    return sendError(res, { status: 401, message: 'Account not found or inactive.', errorCode: 'ACCOUNT_INACTIVE' });
  }

  req.user = { id: user.id, role: user.role, name: user.name, email: user.email };
  next();
});

module.exports = { requireAuth };
