const Book = require('../models/Book');
const { mongooseToObject } = require('../../util/mongoose');

class BookController {
    
    // [GET] /books/:_id/api
    show(req, res, next) {
        // Lưu ý: dùng params._id cho khớp với route bên trên
        Book.findById(req.params._id) 
            .populate('categoryId')
            .then(book => {
                res.json(book); // Trả về JSON để popup hiển thị
            })
            .catch(next);
    }
}

module.exports = new BookController;