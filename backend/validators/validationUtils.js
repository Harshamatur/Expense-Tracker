const { AppError } = require('../utils/response');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

function isValidEmail(v) {
  return typeof v === 'string' && EMAIL_RE.test(v.trim()) && v.trim().length <= 190;
}

function isValidPassword(v) {
  return typeof v === 'string' && v.length >= 8 && v.length <= 128;
}

function isPositiveDecimal(v) {
  if (v === null || v === undefined || v === '') return false;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 && Math.round(n * 100) === n * 100;
}

function isValidDateString(v) {
  if (typeof v !== 'string') return false;
  return /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));
}

function isValidMonth(v) {
  const n = Number(v);
  return Number.isInteger(n) && n >= 1 && n <= 12;
}

function isValidYear(v) {
  const n = Number(v);
  return Number.isInteger(n) && n >= 2000 && n <= 2100;
}

/**
 * Runs a set of {field, check, message} rules and throws a single
 * 422 AppError listing every failure, or returns silently if all pass.
 */
function validate(rules) {
  const errors = [];
  for (const rule of rules) {
    if (!rule.check) errors.push({ field: rule.field, message: rule.message });
  }
  if (errors.length > 0) {
    const err = new AppError('Validation failed.', 422, 'VALIDATION_ERROR');
    err.details = errors;
    throw err;
  }
}

module.exports = {
  isNonEmptyString,
  isValidEmail,
  isValidPassword,
  isPositiveDecimal,
  isValidDateString,
  isValidMonth,
  isValidYear,
  validate,
};
