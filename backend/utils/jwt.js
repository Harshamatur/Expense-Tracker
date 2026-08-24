const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET;
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

if (!SECRET) {
  // Fail fast — never run with an undefined signing secret.
  throw new Error('JWT_SECRET is not set. Configure it in your environment before starting the server.');
}

/**
 * Signs a JWT with minimal claims only: subject id and role.
 * Never embed email, password data, or other PII in the token.
 */
function signToken(payload) {
  return jwt.sign({ sub: payload.id, role: payload.role }, SECRET, { expiresIn: EXPIRES_IN });
}

function verifyToken(token) {
  return jwt.verify(token, SECRET);
}

module.exports = { signToken, verifyToken };
