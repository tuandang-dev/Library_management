const express = require('express');
const router = express.Router();
const authController = require('../app/controllers/AuthController');
const { requireAuth } = require('../app/middlewares/authMiddleware');

// Route hiển thị giao diện Login
router.get('/login', authController.showLogin);

// Route hiển thị trang Quên mật khẩu
router.get('/forgot-password', authController.showForgotPassword);

// Route hiển thị form nhập mật khẩu mới
router.get('/reset-password/:token', authController.showResetPassword);

// Route xử lý dữ liệu
router.post('/login', authController.processLogin);

// Route xử lý quên mật khẩu
router.post('/forgot-password', authController.processForgotPassword);

// Route xử lý việc submit mật khẩu mới
router.post('/reset-password/:token', authController.updatePassword);

// Route đăng xuất
router.get('/logout', requireAuth, authController.logout);

module.exports = router;