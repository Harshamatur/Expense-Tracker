const express = require('express');
const adminController = require('../controllers/adminController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(requireAuth, requireRole('admin'));

router.get('/stats', adminController.getStats);
router.get('/users', adminController.listUsers);
router.patch('/users/:id/status', adminController.updateUserStatus);

module.exports = router;
