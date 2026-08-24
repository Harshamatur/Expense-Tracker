const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(requireAuth);

router.get('/summary', dashboardController.getSummary);
router.get('/category-summary', dashboardController.getCategorySummary);
router.get('/monthly-summary', dashboardController.getMonthlySummary);

module.exports = router;
