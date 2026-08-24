const rateLimit = require('express-rate-limit');

/**
 * Applied only to authentication endpoints to slow down credential
 * stuffing / brute force attempts without affecting normal API usage.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many attempts. Please try again later.',
    data: null,
    errorCode: 'RATE_LIMITED',
  },
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please slow down.',
    data: null,
    errorCode: 'RATE_LIMITED',
  },
});

module.exports = { authLimiter, generalLimiter };
