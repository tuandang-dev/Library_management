const express = require('express');
const router = express.Router();
const profileController = require('../app/controllers/ProfileController');
const { requireAuth } = require('../app/middlewares/authMiddleware');

router.get('/', requireAuth, profileController.index);
router.post('/', requireAuth, profileController.changePassword);

module.exports = router;