const express = require('express');
const router = express.Router();
const attendanceController = require('../app/controllers/AttendanceController');
const { requireAuth } = require('../app/middlewares/authMiddleware');

router.get('/', requireAuth, attendanceController.index);

module.exports = router;