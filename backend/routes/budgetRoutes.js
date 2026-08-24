const express = require('express');
const budgetController = require('../controllers/budgetController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(requireAuth);

router.get('/current', budgetController.getCurrentBudget);
router.post('/', budgetController.createBudget);
router.put('/:id', budgetController.updateBudget);

module.exports = router;
