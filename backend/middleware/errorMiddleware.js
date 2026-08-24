const { sendError } = require('../utils/response');

/**
 * Catches anything thrown/forwarded from routes. Known AppErrors (with a
 * status + errorCode) are returned as-is with a clean message. Anything
 * else is treated as an unexpected server error: log full detail server
 * side, but never leak stack traces, SQL errors, or secrets to the client.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err && err.status && err.errorCode) {
    return sendError(res, {
      status: err.status,
      message: err.message,
      errorCode: err.errorCode,
      data: err.details ? { fields: err.details } : null,
    });
  }

  // Unknown/unexpected error — log full detail server-side only.
  console.error('[UNHANDLED ERROR]', err);
  return sendError(res, {
    status: 500,
    message: 'An unexpected error occurred. Please try again later.',
    errorCode: 'INTERNAL_ERROR',
  });
}

function notFoundHandler(req, res) {
  return sendError(res, { status: 404, message: 'Resource not found.', errorCode: 'NOT_FOUND' });
}

module.exports = { errorHandler, notFoundHandler };
