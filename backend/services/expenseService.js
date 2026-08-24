const { pool } = require('../config/db');
const { AppError } = require('../utils/response');
const categoryService = require('./categoryService');

const SORT_COLUMN_MAP = {
  expense_date: 'e.expense_date',
  amount: 'e.amount',
  title: 'e.title',
  created_at: 'e.created_at',
};

/**
 * Lists expenses for exactly one user (ownership is always derived from
 * the authenticated session, never from client input), with optional
 * search/filter/sort/pagination.
 */
async function listExpensesForUser(userId, query) {
  const page = Number(query.page) || 1;
  const limit = Math.min(Number(query.limit) || 20, 100);
  const offset = (page - 1) * limit;
  const sortColumn = SORT_COLUMN_MAP[query.sortBy] || 'e.expense_date';
  const sortOrder = String(query.sortOrder || 'desc').toLowerCase() === 'asc' ? 'ASC' : 'DESC';

  const params = [userId];
  let whereExtra = '';

  if (query.search) {
    whereExtra += ' AND (e.title LIKE ? OR e.description LIKE ?)';
    params.push(`%${query.search}%`, `%${query.search}%`);
  }
  if (query.categoryId) {
    whereExtra += ' AND e.category_id = ?';
    params.push(Number(query.categoryId));
  }
  if (query.startDate) {
    whereExtra += ' AND e.expense_date >= ?';
    params.push(query.startDate);
  }
  if (query.endDate) {
    whereExtra += ' AND e.expense_date <= ?';
    params.push(query.endDate);
  }

  const listSql = `
    SELECT e.id, e.title, e.amount, e.description, e.expense_date, e.created_at, e.updated_at,
           c.id AS category_id, c.name AS category_name
    FROM expenses e
    JOIN categories c ON c.id = e.category_id
    WHERE e.user_id = ? ${whereExtra}
    ORDER BY ${sortColumn} ${sortOrder}
    LIMIT ? OFFSET ?
  `;
  const countSql = `SELECT COUNT(*) AS total FROM expenses e WHERE e.user_id = ? ${whereExtra}`;

  const [rows] = await pool.query(listSql, [...params, limit, offset]);
  const [[{ total }]] = await pool.query(countSql, params);

  return {
    items: rows,
    pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  };
}

async function getOwnedExpense(userId, expenseId) {
  const [rows] = await pool.query(
    `SELECT e.id, e.title, e.amount, e.description, e.expense_date, e.created_at, e.updated_at,
            c.id AS category_id, c.name AS category_name
     FROM expenses e
     JOIN categories c ON c.id = e.category_id
     WHERE e.id = ? AND e.user_id = ? LIMIT 1`,
    [expenseId, userId]
  );
  return rows[0] || null;
}

async function createExpense(userId, payload) {
  const categoryOk = await categoryService.isActiveCategory(payload.categoryId);
  if (!categoryOk) {
    throw new AppError('Selected category is not available.', 422, 'INVALID_CATEGORY');
  }

  const [result] = await pool.query(
    `INSERT INTO expenses (user_id, category_id, title, amount, description, expense_date)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, payload.categoryId, payload.title.trim(), payload.amount, payload.description || null, payload.expenseDate]
  );
  return getOwnedExpense(userId, result.insertId);
}

async function updateExpense(userId, expenseId, payload) {
  const existing = await getOwnedExpense(userId, expenseId);
  if (!existing) {
    throw new AppError('Expense not found.', 404, 'EXPENSE_NOT_FOUND');
  }

  const categoryOk = await categoryService.isActiveCategory(payload.categoryId);
  if (!categoryOk) {
    throw new AppError('Selected category is not available.', 422, 'INVALID_CATEGORY');
  }

  await pool.query(
    `UPDATE expenses SET title = ?, amount = ?, category_id = ?, description = ?, expense_date = ?
     WHERE id = ? AND user_id = ?`,
    [payload.title.trim(), payload.amount, payload.categoryId, payload.description || null, payload.expenseDate, expenseId, userId]
  );
  return getOwnedExpense(userId, expenseId);
}

async function deleteExpense(userId, expenseId) {
  const [result] = await pool.query('DELETE FROM expenses WHERE id = ? AND user_id = ?', [expenseId, userId]);
  if (result.affectedRows === 0) {
    throw new AppError('Expense not found.', 404, 'EXPENSE_NOT_FOUND');
  }
}

module.exports = {
  listExpensesForUser,
  getOwnedExpense,
  createExpense,
  updateExpense,
  deleteExpense,
};
