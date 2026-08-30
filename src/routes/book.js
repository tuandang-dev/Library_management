const express = require('express');
const router = express.Router();

const bookController = require('../app/controllers/BookController');

router.get('/:_id/api', bookController.show);

module.exports = router;