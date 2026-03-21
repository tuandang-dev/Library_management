const Admin = require('../models/Admin');
const Book = require('../models/Book');
const { mongooseToObject } = require('../../util/mongoose');

class AdminController {

    // [GET] /admins/:_id
    show(req, res, next) {
        res.render('admins/show');
    }
}

module.exports = new AdminController;