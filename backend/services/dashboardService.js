const { pool } = require('../config/db');
const budgetService = require('./budgetService');

/**
 * Consumer dashboard summary: budget, spent, remaining, utilization,
 * and transaction count for the current calendar month. "Spent" is
 * always the sum of the authenticated user's own expenses only.
 */
async function getSummary(userId) {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const [[{ spent, txCount }]] = await pool.query(
    `SELECT COALESCE(SUM(amount), 0) AS spent, COUNT(*) AS txCount
     FROM expenses
     WHERE user_id = ? AND MONTH(expense_date) = ? AND YEAR(expense_date) = ?`,
    [userId, month, year]
  );

  const budget = await budgetService.getBudgetForMonth(userId, month, year);
  const budgetAmount = budget ? Number(budget.amount) : 0;
  const spentAmount = Number(spent);
  const remaining = budgetAmount - spentAmount;
  const utilization = budgetAmount > 0 ? Number(((spentAmount / budgetAmount) * 100).toFixed(2)) : null;

  const [recent] = await pool.query(
    `SELECT e.id, e.title, e.amount, e.expense_date, c.name AS category_name
     FROM expenses e JOIN categories c ON c.id = e.category_id
     WHERE e.user_id = ? ORDER BY e.expense_date DESC, e.created_at DESC LIMIT 5`,
    [userId]
  );

  return {
    month,
    year,
    budget: budgetAmount,
    spent: spentAmount,
    remaining,
    utilizationPercent: utilization,
    isOverBudget: budget !== null && remaining < 0,
    transactionCount: Number(txCount),
    recentExpenses: recent,
  };
}

async function getCategorySummary(userId) {
  const now = new Date();
  const [rows] = await pool.query(
    `SELECT c.id AS category_id, c.name AS category_name, COALESCE(SUM(e.amount), 0) AS total, COUNT(e.id) AS count
     FROM categories c
     LEFT JOIN expenses e ON e.category_id = c.id AND e.user_id = ? AND MONTH(e.expense_date) = ? AND YEAR(e.expense_date) = ?
     WHERE c.is_active = 1
     GROUP BY c.id, c.name
     HAVING total > 0
     ORDER BY total DESC`,
    [userId, now.getMonth() + 1, now.getFullYear()]
  );
  return rows.map((r) => ({ ...r, total: Number(r.total) }));
}

async function getMonthlySummary(userId, monthsBack = 6) {
  const [rows] = await pool.query(
    `SELECT DATE_FORMAT(expense_date, '%Y-%m') AS month, COALESCE(SUM(amount), 0) AS total
     FROM expenses
     WHERE user_id = ? AND expense_date >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
     GROUP BY month
     ORDER BY month ASC`,
    [userId, monthsBack]
  );
  return rows.map((r) => ({ month: r.month, total: Number(r.total) }));
}

module.exports = { getSummary, getCategorySummary, getMonthlySummary };
