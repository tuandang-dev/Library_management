const express = require('express');
const router = express.Router();
const cartController = require('../app/controllers/CartController');
const { requireAuth } = require('../app/middlewares/authMiddleware');

router.get('/', requireAuth, cartController.index);
router.post('/add', requireAuth, cartController.add);
router.post('/remove', requireAuth, cartController.remove);
router.post('/clear', requireAuth, cartController.clear);
router.get('/count', requireAuth, cartController.count);
router.post('/checkout', requireAuth, cartController.checkout);
router.get('/ticket/:ticketId', requireAuth, cartController.ticket);

module.exports = router;