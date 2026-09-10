const express = require('express');
const router = express.Router();
const authController = require('../app/controllers/AuthController');
const { requireAuth } = require('../app/middlewares/authMiddleware');

router.get('/login', authController.showLogin);
router.get('/forgot-password', authController.showForgotPassword);
router.get('/reset-password/:token', authController.showResetPassword);
router.post('/login', authController.processLogin);
router.post('/forgot-password', authController.processForgotPassword);
router.post('/reset-password/:token', authController.updatePassword);
router.get('/logout', requireAuth, authController.logout);

module.exports = router;