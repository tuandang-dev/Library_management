const express = require('express');
const router = express.Router();

const adminController = require('../app/controllers/AdminController');

// Route này dành cho trang chi tiết bình thường
router.get('/show', adminController.show);

module.exports = router;