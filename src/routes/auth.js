const express = require('express');
const router = express.Router();
const authController = require('../app/controllers/AuthController');
const { requireAuth } = require('../app/middlewares/authMiddleware');

// Route 1: Nhận yêu cầu GET và hiển thị giao diện Login
router.get('/login', authController.showLogin);

// Route 2: Nhận yêu cầu POST từ Form HTML và xử lý dữ liệu
router.post('/login', authController.processLogin);

// Route 3: Đăng xuất (Chỉ người ĐÃ đăng nhập mới được gọi route này)
router.get('/logout', requireAuth, authController.logout);

module.exports = router;