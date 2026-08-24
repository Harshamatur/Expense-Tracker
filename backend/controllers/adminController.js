const adminService = require('../services/adminService');
const { sendSuccess, AppError } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

const getStats = asyncHandler(async (req, res) => {
  const stats = await adminService.getSystemStats();
  return sendSuccess(res, { message: 'System statistics retrieved.', data: stats });
});

const listUsers = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const { search, status } = req.query;
  const { rows, total } = await adminService.listUsers({ search, page, limit, status });
  return sendSuccess(res, {
    message: 'Users retrieved.',
    data: { items: rows, pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) } },
  });
});

const updateUserStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['active', 'inactive'].includes(status)) {
    throw new AppError('Status must be either "active" or "inactive".', 422, 'VALIDATION_ERROR');
  }
  const user = await adminService.setUserStatus(req.user.id, req.params.id, status);
  return sendSuccess(res, { message: 'User status updated.', data: { user } });
});

module.exports = { getStats, listUsers, updateUserStatus };
