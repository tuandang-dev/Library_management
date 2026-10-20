const express = require('express');
const router = express.Router();
const adminController = require('../app/controllers/AdminController');
const adminUserController = require('../app/controllers/AdminUserController');
const adminBookController = require('../app/controllers/AdminBookController');
const adminAlertController = require('../app/controllers/AdminAlertController');
const adminAttendanceController = require('../app/controllers/AdminAttendanceController');
const adminScannerController = require('../app/controllers/AdminScannerController');
const { requireAuth, requireAdmin } = require('../app/middlewares/authMiddleware');

router.get('/', requireAuth, requireAdmin, (req, res) => res.redirect('/admin/dashboard'));
router.get('/dashboard', requireAuth, requireAdmin, adminController.dashboard);

// Miền Người dùng (AdminUserController)
router.get('/users', requireAuth, requireAdmin, adminUserController.users);
router.post('/users', requireAuth, requireAdmin, adminUserController.createUser);
router.post('/users/bulk-import', requireAuth, requireAdmin, adminUserController.bulkImport);
router.patch('/users/:id/status', requireAuth, requireAdmin, adminUserController.updateStatus);
router.delete('/users/:id', requireAuth, requireAdmin, adminUserController.deleteUser);

// Miền Sách (AdminBookController)
router.get('/books', requireAuth, requireAdmin, adminBookController.books);
router.post('/books', requireAuth, requireAdmin, adminBookController.createBook);
router.put('/books/:id', requireAuth, requireAdmin, adminBookController.updateBook);
router.delete('/books/:id', requireAuth, requireAdmin, adminBookController.deleteBook);
router.get('/books/export', requireAuth, requireAdmin, adminBookController.exportBooks);
router.post('/books/bulk-import', requireAuth, requireAdmin, adminBookController.bulkImportBooks);

// Miền Cảnh báo quá hạn & Nhắc nhở (AdminAlertController)
router.get('/alerts', requireAuth, requireAdmin, adminAlertController.overdueAlerts);
router.get('/alerts/export', requireAuth, requireAdmin, adminAlertController.exportOverdueCsv);
router.post('/alerts/:id/remind', requireAuth, requireAdmin, adminAlertController.sendReminder);
router.post('/alerts/bulk-remind', requireAuth, requireAdmin, adminAlertController.sendBulkReminders);

// Miền Điểm danh, Lịch sử & Nhật ký (AdminAttendanceController)
router.get('/logs', requireAuth, requireAdmin, adminAttendanceController.activityLogs);
router.get('/attendance', requireAuth, requireAdmin, adminAttendanceController.attendance);
router.get('/attendance/export', requireAuth, requireAdmin, adminAttendanceController.exportAttendanceLogs);
router.get('/history', requireAuth, requireAdmin, adminAttendanceController.history);
router.get('/history/export', requireAuth, requireAdmin, adminAttendanceController.exportHistoryCsv);

// Miền Scanner & Mượn trả lưu thông (AdminScannerController)
router.get('/scanner', requireAuth, requireAdmin, adminScannerController.scanner);
router.post('/scanner/verify', requireAuth, requireAdmin, adminScannerController.verifyTicket);
router.post('/scanner/checkout', requireAuth, requireAdmin, adminScannerController.checkoutTicket);
router.post('/scanner/return', requireAuth, requireAdmin, adminScannerController.returnBooks);
router.post('/scanner/attendance', requireAuth, requireAdmin, adminScannerController.recordAttendanceScan);

module.exports = router;