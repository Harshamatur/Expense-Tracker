const bcrypt = require('bcrypt');
const userService = require('./userService');
const { signToken } = require('../utils/jwt');
const { AppError } = require('../utils/response');

const SALT_ROUNDS = 12;

function sanitizeUser(user) {
  const { password_hash, ...safe } = user;
  return safe;
}

async function register({ name, email, password }) {
  const existing = await userService.findByEmail(email);
  if (existing) {
    throw new AppError('An account with this email already exists.', 409, 'EMAIL_IN_USE');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await userService.createConsumer({ name, email, passwordHash });
  const token = signToken({ id: user.id, role: user.role });
  return { user: sanitizeUser(user), token };
}

async function login({ email, password }) {
  const user = await userService.findByEmail(email);
  if (!user) {
    throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
  }
  if (user.status !== 'active') {
    throw new AppError('This account has been deactivated. Contact an administrator.', 403, 'ACCOUNT_INACTIVE');
  }

  const matches = await bcrypt.compare(password, user.password_hash);
  if (!matches) {
    throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
  }

  const token = signToken({ id: user.id, role: user.role });
  return { user: sanitizeUser(user), token };
}

module.exports = { register, login, sanitizeUser };
