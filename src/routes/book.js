const express = require('express');
const router = express.Router();

const bookController = require('../app/controllers/BookController');

// Route này dành cho trang chi tiết bình thường
router.get('/:_id/api', bookController.show);

module.exports = router;