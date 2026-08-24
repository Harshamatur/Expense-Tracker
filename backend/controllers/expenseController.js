const expenseService = require('../services/expenseService');
const { validateExpensePayload, validateExpenseQuery } = require('../validators/expenseValidators');
const { sendSuccess, AppError } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

const listExpenses = asyncHandler(async (req, res) => {
  validateExpenseQuery(req.query);
  const result = await expenseService.listExpensesForUser(req.user.id, req.query);
  return sendSuccess(res, { message: 'Expenses retrieved.', data: result });
});

const getExpense = asyncHandler(async (req, res) => {
  const expense = await expenseService.getOwnedExpense(req.user.id, req.params.id);
  if (!expense) {
    throw new AppError('Expense not found.', 404, 'EXPENSE_NOT_FOUND');
  }
  return sendSuccess(res, { message: 'Expense retrieved.', data: { expense } });
});

const createExpense = asyncHandler(async (req, res) => {
  validateExpensePayload(req.body);
  // Ownership always derives from the authenticated session, never the request body.
  const expense = await expenseService.createExpense(req.user.id, req.body);
  return sendSuccess(res, { status: 201, message: 'Expense created.', data: { expense } });
});

const updateExpense = asyncHandler(async (req, res) => {
  validateExpensePayload(req.body);
  const expense = await expenseService.updateExpense(req.user.id, req.params.id, req.body);
  return sendSuccess(res, { message: 'Expense updated.', data: { expense } });
});

const deleteExpense = asyncHandler(async (req, res) => {
  await expenseService.deleteExpense(req.user.id, req.params.id);
  return sendSuccess(res, { message: 'Expense deleted.', data: null });
});

module.exports = { listExpenses, getExpense, createExpense, updateExpense, deleteExpense };
