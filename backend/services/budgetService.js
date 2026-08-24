const { pool } = require('../config/db');
const { AppError } = require('../utils/response');

async function getCurrentBudget(userId) {
  const now = new Date();
  return getBudgetForMonth(userId, now.getMonth() + 1, now.getFullYear());
}

async function getBudgetForMonth(userId, month, year) {
  const [rows] = await pool.query(
    'SELECT id, month, year, amount, created_at, updated_at FROM budgets WHERE user_id = ? AND month = ? AND year = ? LIMIT 1',
    [userId, month, year]
  );
  return rows[0] || null;
}

async function getOwnedBudget(userId, budgetId) {
  const [rows] = await pool.query(
    'SELECT id, month, year, amount, created_at, updated_at FROM budgets WHERE id = ? AND user_id = ? LIMIT 1',
    [budgetId, userId]
  );
  return rows[0] || null;
}

/**
 * Creates a budget, or deterministically updates the existing one for
 * that user/month/year if it already exists (enforced by the DB's
 * unique constraint as the source of truth).
 */
async function createOrUpdateBudget(userId, { month, year, amount }) {
  const existing = await getBudgetForMonth(userId, month, year);
  if (existing) {
    await pool.query('UPDATE budgets SET amount = ? WHERE id = ? AND user_id = ?', [amount, existing.id, userId]);
    return getOwnedBudget(userId, existing.id);
  }

  const [result] = await pool.query(
    'INSERT INTO budgets (user_id, month, year, amount) VALUES (?, ?, ?, ?)',
    [userId, month, year, amount]
  );
  return getOwnedBudget(userId, result.insertId);
}

async function updateBudget(userId, budgetId, { amount }) {
  const existing = await getOwnedBudget(userId, budgetId);
  if (!existing) {
    throw new AppError('Budget not found.', 404, 'BUDGET_NOT_FOUND');
  }
  await pool.query('UPDATE budgets SET amount = ? WHERE id = ? AND user_id = ?', [amount, budgetId, userId]);
  return getOwnedBudget(userId, budgetId);
}

module.exports = { getCurrentBudget, getBudgetForMonth, getOwnedBudget, createOrUpdateBudget, updateBudget };
