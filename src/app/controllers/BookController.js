const Book = require('../models/Book');
const Category = require('../models/Category');

class BookController {
    // [GET] /book
    async index(req, res, next) {
        try {
            const currentUser = req.session.user;

            const keyword = req.query.searchbook || '';
            const category = req.query.category || '';
            const status = req.query.status || '';

            const filterConditions = {};

            if (status === 'avaiable') {
                filterConditions.availableQuantity = { $gt: 0 };
            } else if (status === 'borrow') {
                filterConditions.availableQuantity = { $lte: 0 };
            }

            if (category) {
                filterConditions.categoryId = category;
            }

            if (keyword) {
                filterConditions.$or = [
                    { title: { $regex: keyword, $options: 'i' } },
                    { isbn: { $regex: keyword, $options: 'i' } },
                    { accessionNumber: { $regex: keyword, $options: 'i' } },
                    { author: { $regex: keyword, $options: 'i' } },
                ];
            }

            const [
                books,
                categories,
                countDocuments,
                availableQuantityTotal,
            ] = await Promise.all([
                Book.find(filterConditions)
                    .populate('categoryId')
                    .lean(),
                Category.find({}).lean(),
                Book.countDocuments({}).lean(),
                Book.countDocuments({ availableQuantity: { $gt: 0 } }).lean(),
            ]);

            return res.render('books', {
                title: 'Book Catalog - UCC Library',
                layout: 'user',
                user: currentUser,
                isBooksPage: true,
                books,
                categories,
                countDocuments,
                availableQuantityTotal,
                keyword,
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
            .then(book => {
                res.json(book);
            })
            .catch(next);
    }
}

module.exports = new BookController();