const { isNonEmptyString, isValidEmail, isValidPassword, validate } = require('./validationUtils');

function validateRegister(body) {
  const { name, email, password, confirmPassword } = body || {};
  validate([
    { field: 'name', check: isNonEmptyString(name) && name.trim().length <= 120, message: 'Name is required (max 120 characters).' },
    { field: 'email', check: isValidEmail(email), message: 'A valid email is required.' },
    { field: 'password', check: isValidPassword(password), message: 'Password must be 8-128 characters.' },
    { field: 'confirmPassword', check: password === confirmPassword, message: 'Passwords do not match.' },
  ]);
}

function validateLogin(body) {
  const { email, password } = body || {};
  validate([
    { field: 'email', check: isValidEmail(email), message: 'A valid email is required.' },
    { field: 'password', check: isNonEmptyString(password), message: 'Password is required.' },
  ]);
}

module.exports = { validateRegister, validateLogin };
