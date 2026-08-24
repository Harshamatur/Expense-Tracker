const { pool } = require('../config/db');

const PUBLIC_USER_FIELDS = 'id, name, email, role, status, created_at, updated_at';

async function findByEmail(email) {
  const [rows] = await pool.query(
    'SELECT id, name, email, password_hash, role, status FROM users WHERE email = ? LIMIT 1',
    [email.toLowerCase().trim()]
  );
  return rows[0] || null;
}

async function findActiveUserById(id) {
  const [rows] = await pool.query(
    `SELECT ${PUBLIC_USER_FIELDS} FROM users WHERE id = ? AND status = 'active' LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

async function findById(id) {
  const [rows] = await pool.query(`SELECT ${PUBLIC_USER_FIELDS} FROM users WHERE id = ? LIMIT 1`, [id]);
  return rows[0] || null;
}

async function createConsumer({ name, email, passwordHash }) {
  const [result] = await pool.query(
    `INSERT INTO users (name, email, password_hash, role, status) VALUES (?, ?, ?, 'consumer', 'active')`,
    [name.trim(), email.toLowerCase().trim(), passwordHash]
  );
  return findById(result.insertId);
}

async function listUsers({ search, page, limit, status }) {
  const offset = (page - 1) * limit;
  const params = [];
  const clauses = [];
  if (search) {
    clauses.push('(name LIKE ? OR email LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }
  if (status) {
    clauses.push('status = ?');
    params.push(status);
  }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

  const [rows] = await pool.query(
    `SELECT ${PUBLIC_USER_FIELDS} FROM users ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM users ${where}`, params);

  return { rows, total };
}

async function setUserStatus(userId, status) {
  const [result] = await pool.query(`UPDATE users SET status = ? WHERE id = ?`, [status, userId]);
  if (result.affectedRows === 0) return null;
  return findById(userId);
}

module.exports = {
  findByEmail,
  findActiveUserById,
  findById,
  createConsumer,
  listUsers,
  setUserStatus,
};
