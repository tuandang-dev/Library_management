const Book = require('../models/Book');
const Category = require('../models/Category');
const escapeRegex = require('../../util/escapeRegex');
const { getPaginationData } = require('../helpers/paginationHelper');

class BookController {
    // [GET] /book
    async index(req, res, next) {
        try {
            const currentUser = req.session.user;
            const { searchbook, category, status } = req.query;

            // 1. Xây dựng điều kiện lọc (Filter Conditions)
            let filterConditions = {};

            if (searchbook && searchbook.trim() !== '') {
                const searchRegex = new RegExp(escapeRegex(searchbook.trim()), 'i');
                filterConditions.$or = [
                    { title: searchRegex },
                    { author: searchRegex },
                    { isbn: searchRegex },
                ];
            }

            if (category) {
                filterConditions.categoryId = category;
            }

            if (status) {
                if (status === 'available') {
                    filterConditions.availableQuantity = { $gt: 0 };
                } else if (status === 'borrow') {
                    filterConditions.availableQuantity = { $lte: 0 };
                }
            }

            // 2. Tính toán phân trang và truy vấn dữ liệu song song
            const totalFilteredBooks = await Book.countDocuments(filterConditions);
            const pagination = getPaginationData({
                query: req.query,
                totalItems: totalFilteredBooks,
                limit: 12,
            });

            const [books, categories, totalAvailableAgg] = await Promise.all([
                Book.find(filterConditions)
                    .populate('categoryId')
                    .skip(pagination.skip)
                    .limit(pagination.limit)
                    .lean(),
                Category.find({}).lean(),
                Book.aggregate([
                    { $match: { deleted: { $ne: true } } },
                    { $group: { _id: null, totalAvailable: { $sum: '$availableQuantity' } } },
                ]),
            ]);

            const availableQuantityTotal = totalAvailableAgg.length > 0 ? totalAvailableAgg[0].totalAvailable : 0;
            const countDocuments = await Book.countDocuments({ deleted: { $ne: true } });

            // 3. Đánh dấu cờ isInCart dựa trên req.session.cart
            const cart = req.session.cart || [];
            const cartBookIds = cart.map((item) => item.bookId);

            const booksWithCartStatus = books.map((book) => ({
                ...book,
                isInCart: cartBookIds.includes(book._id.toString()),
            }));

            return res.render('books', {
                title: 'Book Catalog - UCC Library',
                layout: 'user',
                user: currentUser,
                isBooksPage: true,
                books: booksWithCartStatus,
                categories,
                keyword: searchbook || '',
                countDocuments,
                availableQuantityTotal,
                pagination,
            });
        } catch (error) {
            console.error('Lỗi tại BookController.index:', error);
            next(error);
        }
    }

    // [GET] /book/:_id/api
    show(req, res, next) {
        Book.findById(req.params._id)
            .populate('categoryId')
            .lean()
            .then((book) => {
                if (!book) {
                    return res.status(404).json({ success: false, message: 'Book not found' });
                }
                res.json(book);
            })
            .catch(next);
    }
}

module.exports = new BookController();