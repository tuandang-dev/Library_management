const Book = require('../models/Book');
const Category = require('../models/Category');
const { mutipleMongooseToObject } = require('../../util/mongoose');

console.log('Book =', Book);


class SiteController {

    // [GET] /
    index(req, res, next) {

       

        // Sử dụng Promise.all để chạy song song 2 câu lệnh tìm kiếm
        Promise.all([
            Category.find({}),
            Book.find({}).populate('categoryId')
        ])
            .then(([categories, books]) => {
                // Khi CẢ 2 việc tìm kiếm xong, nó mới chạy vào đây
                res.render('home', {
                    categories: mutipleMongooseToObject(categories),
                    books: mutipleMongooseToObject(books),
                    totalBooks: books.length
                });
            })
            .catch(next); // Nếu 1 trong 2 cái lỗi, nó sẽ nhảy vào đây
    }

    // [GET] /search
    search(req, res) {
        res.render('search')
    }
}

module.exports = new SiteController();