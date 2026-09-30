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
router.get('/books', requireAuth, requireAdmin, adminController.books);
router.post('/books', requireAuth, requireAdmin, adminController.createBook);
router.put('/books/:id', requireAuth, requireAdmin, adminController.updateBook);
router.delete('/books/:id', requireAuth, requireAdmin, adminController.deleteBook);
router.get('/books/export', requireAuth, requireAdmin, adminController.exportBooks);
router.post('/books/bulk-import', requireAuth, requireAdmin, adminController.bulkImportBooks);
router.get('/alerts', requireAuth, requireAdmin, adminController.overdueAlerts);
router.get('/alerts/export', requireAuth, requireAdmin, adminController.exportOverdueCsv);
router.post('/alerts/:id/remind', requireAuth, requireAdmin, adminController.sendReminder);
router.post('/alerts/bulk-remind', requireAuth, requireAdmin, adminController.sendBulkReminders);
router.get('/logs', requireAuth, requireAdmin, adminController.activityLogs);

module.exports = router;