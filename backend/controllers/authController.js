const authService = require('../services/authService');
const { validateRegister, validateLogin } = require('../validators/authValidators');
const { sendSuccess } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

const register = asyncHandler(async (req, res) => {
  validateRegister(req.body);
  const { name, email, password } = req.body;
  const { user, token } = await authService.register({ name, email, password });
  return sendSuccess(res, { status: 201, message: 'Account created successfully.', data: { user, token } });
});

const login = asyncHandler(async (req, res) => {
  validateLogin(req.body);
  const { email, password } = req.body;
  const { user, token } = await authService.login({ email, password });
  return sendSuccess(res, { message: 'Logged in successfully.', data: { user, token } });
});

const me = asyncHandler(async (req, res) => {
  return sendSuccess(res, { message: 'Current user.', data: { user: req.user } });
});

// Stateless JWTs: "logout" is a client-side token discard. No server-side
// revocation list is implemented in Phase 1, so this endpoint exists for
// a consistent API contract and to allow future revocation logic.
const logout = asyncHandler(async (req, res) => {
  return sendSuccess(res, { message: 'Logged out.', data: null });
});

module.exports = { register, login, me, logout };
