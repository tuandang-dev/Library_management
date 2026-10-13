const express = require('express');
const router = express.Router();
const authController = require('../app/controllers/AuthController');
const { requireAuth } = require('../app/middlewares/authMiddleware');
const {
    forgotPasswordIpLimiter,
    forgotPasswordEmailLimiter,
    resetPasswordLimiter,
    loginIpLimiter,
    loginAccountLimiter,
} = require('../app/middlewares/rateLimiters');

router.get('/login', authController.showLogin);
router.get('/forgot-password', authController.showForgotPassword);
router.get('/reset-password/:token', authController.showResetPassword);
router.post('/login', loginIpLimiter, loginAccountLimiter, authController.processLogin);
router.post('/forgot-password', forgotPasswordIpLimiter, forgotPasswordEmailLimiter, authController.processForgotPassword);
router.post('/reset-password/:token', resetPasswordLimiter, authController.updatePassword);
router.post('/logout', requireAuth, authController.logout);

module.exports = router;