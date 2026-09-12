const express = require('express');
const router = express.Router();

const historyController = require('../app/controllers/HistoryController');
const { requireAuth } = require('../app/middlewares/authMiddleware');

router.get('/', requireAuth, historyController.index);

module.exports = router;