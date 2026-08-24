const dashboardService = require('../services/dashboardService');
const categoryService = require('../services/categoryService');
const { sendSuccess } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

const getSummary = asyncHandler(async (req, res) => {
  const summary = await dashboardService.getSummary(req.user.id);
  return sendSuccess(res, { message: 'Dashboard summary retrieved.', data: summary });
});

const getCategorySummary = asyncHandler(async (req, res) => {
  const breakdown = await dashboardService.getCategorySummary(req.user.id);
  return sendSuccess(res, { message: 'Category summary retrieved.', data: { breakdown } });
});

const getMonthlySummary = asyncHandler(async (req, res) => {
  const trend = await dashboardService.getMonthlySummary(req.user.id);
  return sendSuccess(res, { message: 'Monthly summary retrieved.', data: { trend } });
});

const getCategories = asyncHandler(async (req, res) => {
  const categories = await categoryService.listActiveCategories();
  return sendSuccess(res, { message: 'Categories retrieved.', data: { categories } });
});

module.exports = { getSummary, getCategorySummary, getMonthlySummary, getCategories };
