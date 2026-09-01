const express = require('express');
const router = express.Router();

const bookController = require('../app/controllers/BookController');
const { requireAuth } = require('../app/middlewares/authMiddleware');

router.get('/', requireAuth, bookController.index);
router.get('/:_id/api', bookController.show);

module.exports = router;