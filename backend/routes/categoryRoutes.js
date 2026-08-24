const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// Any authenticated user may read the active category list (needed to
// populate the expense form). Not part of the original endpoint table,
// but required for the "only active categories selectable" business rule.
router.get('/', requireAuth, dashboardController.getCategories);

module.exports = router;
