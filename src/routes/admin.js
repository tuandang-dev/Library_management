const express = require('express');
const router = express.Router();
const adminController = require('../app/controllers/AdminController');
const { requireAuth, requireAdmin } = require('../app/middlewares/authMiddleware');

// GET /admin/dashboard
router.get('/dashboard', requireAuth, requireAdmin, adminController.dashboard);

module.exports = router;