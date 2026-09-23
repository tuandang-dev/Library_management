const express = require('express');
const router = express.Router();
const adminController = require('../app/controllers/AdminController');
const { requireAuth, requireAdmin } = require('../app/middlewares/authMiddleware');

router.get('/dashboard', requireAuth, requireAdmin, adminController.dashboard);
router.get('/users', requireAuth, requireAdmin, adminController.users);
router.post('/users', requireAuth, requireAdmin, adminController.createUser);
router.post('/users/bulk-import', requireAuth, requireAdmin, adminController.bulkImport);
router.patch('/users/:id/status', requireAuth, requireAdmin, adminController.updateStatus);
router.delete('/users/:id', requireAuth, requireAdmin, adminController.deleteUser);

module.exports = router;