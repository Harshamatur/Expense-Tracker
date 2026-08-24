const express = require('express');
const expenseController = require('../controllers/expenseController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(requireAuth);

router.get('/', expenseController.listExpenses);
router.post('/', expenseController.createExpense);
router.get('/:id', expenseController.getExpense);
router.put('/:id', expenseController.updateExpense);
router.delete('/:id', expenseController.deleteExpense);

module.exports = router;
