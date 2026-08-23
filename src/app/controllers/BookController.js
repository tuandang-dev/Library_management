const Book = require('../models/Book');
const { mongooseToObject } = require('../../util/mongoose');

class BookController {

    // [GET] /books/:_id/api
    show(req, res, next) {
        Book.findById(req.params._id)
            .populate('categoryId')
            .then(book => {
                res.json(book);
            })
            .catch(next);
    }
}

module.exports = new BookController;