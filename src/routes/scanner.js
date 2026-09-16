const express = require('express');
const router = express.Router();
const scannerController = require('../app/controllers/ScannerController');
const { requireAuth } = require('../app/middlewares/authMiddleware');

router.post('/check-in', requireAuth, scannerController.checkIn);
router.get('/', requireAuth, scannerController.index);

module.exports = router;