const express = require('express');
const router = express.Router();
const adminController = require('../app/controllers/AdminController');
const { requireAuth, requireAdmin } = require('../app/middlewares/authMiddleware');

router.get('/dashboard', requireAuth, requireAdmin, adminController.dashboard);

module.exports = router;