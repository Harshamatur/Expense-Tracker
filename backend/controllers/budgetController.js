const budgetService = require('../services/budgetService');
const { validateBudgetPayload, validateBudgetUpdatePayload } = require('../validators/budgetValidators');
const { sendSuccess } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

const getCurrentBudget = asyncHandler(async (req, res) => {
  const budget = await budgetService.getCurrentBudget(req.user.id);
  return sendSuccess(res, { message: 'Current budget retrieved.', data: { budget } });
});

const createBudget = asyncHandler(async (req, res) => {
  validateBudgetPayload(req.body);
  const { month, year, amount } = req.body;
  const budget = await budgetService.createOrUpdateBudget(req.user.id, { month, year, amount });
  return sendSuccess(res, { status: 201, message: 'Budget saved.', data: { budget } });
});

const updateBudget = asyncHandler(async (req, res) => {
  validateBudgetUpdatePayload(req.body);
  const budget = await budgetService.updateBudget(req.user.id, req.params.id, req.body);
  return sendSuccess(res, { message: 'Budget updated.', data: { budget } });
});

module.exports = { getCurrentBudget, createBudget, updateBudget };
