const Book = require('../models/Book');
const Category = require('../models/Category');
const { mutipleMongooseToObject } = require('../../util/mongoose');

class SiteController {

    // [GET] /
    index(req, res, next) {
        // Sử dụng Promise.all để chạy song song 2 câu lệnh tìm kiếm
        Promise.all([
            Category.find({}),
            Book.find({}).populate('categoryId')
        ])
            .then(([categories, books]) => {
                res.render('home', {
                    categories: mutipleMongooseToObject(categories),
                    books: mutipleMongooseToObject(books),
                    totalBooks: books.length
                });
            })
            .catch(next);
    }

    // [GET] /search
    search(req, res, next) {
        // 1. Lấy các tham số từ URL (query string)
        const { keyword, category, status } = req.query;

        // 2. Tạo object điều kiện tìm kiếm (Filter)
        let bookQuery = {};

        // -- Logic lọc theo Từ khóa (Title, Author, hoặc ISBN) --
        if (keyword) {
            bookQuery.$or = [
                { title: { $regex: keyword, $options: 'i' } },   // 'i' để không phân biệt hoa thường
                { author: { $regex: keyword, $options: 'i' } },
                { isbn: { $regex: keyword, $options: 'i' } }     // Giả sử trường mã sách là 'isbn'
            ];
        }

        // -- Logic lọc theo Thể loại --
        // Lưu ý: Dựa vào code cũ của bạn, mình đoán field trong db tên là 'categoryId'
        if (category && category !== '') {
            bookQuery.categoryId = category; 
        }

        // -- Logic lọc theo Trạng thái --
        if (status && status !== '') {
            bookQuery.status = status;
        }

        // 3. Thực hiện truy vấn (Cần lấy cả Categories để hiển thị lại dropdown)
        Promise.all([
            Category.find({}), 
            Book.find(bookQuery).populate('categoryId')
        ])
            .then(([categories, books]) => {
                // Render ra view (có thể dùng lại view 'home' hoặc view 'search' tùy bạn)
                res.render('home', { 
                    categories: mutipleMongooseToObject(categories),
                    books: mutipleMongooseToObject(books),
                    totalBooks: books.length,
                    searchOptions: req.query // Truyền lại data để giữ giá trị trên ô input
                });
            })
            .catch(next);
    }
}

module.exports = new SiteController();