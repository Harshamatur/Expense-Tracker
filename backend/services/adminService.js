const { pool } = require('../config/db');
const userService = require('./userService');
const { AppError } = require('../utils/response');

async function getSystemStats() {
  const [[{ totalUsers }]] = await pool.query('SELECT COUNT(*) AS totalUsers FROM users');
  const [[{ activeUsers }]] = await pool.query("SELECT COUNT(*) AS activeUsers FROM users WHERE status = 'active'");
  const [[{ totalTransactions }]] = await pool.query('SELECT COUNT(*) AS totalTransactions FROM expenses');
  const [[{ totalSpend }]] = await pool.query('SELECT COALESCE(SUM(amount), 0) AS totalSpend FROM expenses');

  const [categoryBreakdown] = await pool.query(
    `SELECT c.name AS category_name, COALESCE(SUM(e.amount), 0) AS total
     FROM categories c
     LEFT JOIN expenses e ON e.category_id = c.id
     WHERE c.is_active = 1
     GROUP BY c.id, c.name
     HAVING total > 0
     ORDER BY total DESC
     LIMIT 10`
  );

  return {
    totalUsers: Number(totalUsers),
    activeUsers: Number(activeUsers),
    inactiveUsers: Number(totalUsers) - Number(activeUsers),
    totalTransactions: Number(totalTransactions),
    totalSpend: Number(totalSpend),
    categoryBreakdown: categoryBreakdown.map((r) => ({ ...r, total: Number(r.total) })),
  };
}

async function listUsers({ search, page, limit, status }) {
  return userService.listUsers({ search, page, limit, status });
}

async function setUserStatus(adminUserId, targetUserId, status) {
  if (Number(adminUserId) === Number(targetUserId)) {
    throw new AppError('You cannot change your own account status.', 400, 'SELF_STATUS_CHANGE');
  }
  const updated = await userService.setUserStatus(targetUserId, status);
  if (!updated) {
    throw new AppError('User not found.', 404, 'USER_NOT_FOUND');
  }
  return updated;
}

module.exports = { getSystemStats, listUsers, setUserStatus };
