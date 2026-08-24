const {
  isNonEmptyString,
  isPositiveDecimal,
  isValidDateString,
  validate,
} = require('./validationUtils');

function validateExpensePayload(body) {
  const { title, amount, categoryId, expenseDate, description } = body || {};
  validate([
    { field: 'title', check: isNonEmptyString(title) && title.trim().length <= 150, message: 'Title is required (max 150 characters).' },
    { field: 'amount', check: isPositiveDecimal(amount), message: 'Amount must be a positive number with up to 2 decimal places.' },
    { field: 'categoryId', check: Number.isInteger(Number(categoryId)) && Number(categoryId) > 0, message: 'A valid category is required.' },
    { field: 'expenseDate', check: isValidDateString(expenseDate), message: 'A valid expense date (YYYY-MM-DD) is required.' },
    { field: 'description', check: description === undefined || description === null || (typeof description === 'string' && description.length <= 500), message: 'Description must be 500 characters or fewer.' },
  ]);
}

function validateExpenseQuery(query) {
  const { page, limit, sortBy, sortOrder } = query || {};
  const allowedSort = ['expense_date', 'amount', 'title', 'created_at'];
  validate([
    { field: 'page', check: page === undefined || (Number.isInteger(Number(page)) && Number(page) >= 1), message: 'page must be a positive integer.' },
    { field: 'limit', check: limit === undefined || (Number.isInteger(Number(limit)) && Number(limit) >= 1 && Number(limit) <= 100), message: 'limit must be between 1 and 100.' },
    { field: 'sortBy', check: sortBy === undefined || allowedSort.includes(sortBy), message: `sortBy must be one of: ${allowedSort.join(', ')}.` },
    { field: 'sortOrder', check: sortOrder === undefined || ['asc', 'desc'].includes(String(sortOrder).toLowerCase()), message: 'sortOrder must be asc or desc.' },
  ]);
}

module.exports = { validateExpensePayload, validateExpenseQuery };
