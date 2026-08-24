/**
 * Centralized response envelope: { success, message, data, errorCode }
 * Keeping this consistent lets the frontend handle every response the same way.
 */

function sendSuccess(res, { status = 200, message = 'OK', data = null } = {}) {
  return res.status(status).json({ success: true, message, data, errorCode: null });
}

function sendError(res, { status = 500, message = 'Something went wrong', errorCode = 'INTERNAL_ERROR', data = null } = {}) {
  return res.status(status).json({ success: false, message, data, errorCode });
}

/**
 * Custom error class carrying an HTTP status and stable error code.
 * Thrown from services/controllers and caught by the central error middleware.
 */
class AppError extends Error {
  constructor(message, status = 500, errorCode = 'INTERNAL_ERROR') {
    super(message);
    this.status = status;
    this.errorCode = errorCode;
  }
}

module.exports = { sendSuccess, sendError, AppError };
