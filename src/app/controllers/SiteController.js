const Book = require('../models/Book');
const Category = require('../models/Category');
const { mutipleMongooseToObject } = require('../../util/mongoose');

class SiteController {
    // [GET] /
    async index(req, res) {
        if (req.session.user && req.session.user.role === 'admin') {
            return res.redirect('/admin/dashboard');
        }

        try {
            if (req.session && req.session.user) {
                return res.render('dashboard', {
                    title: 'Trang chủ sinh viên - UCC Library',
                    layout: 'user',
                    user: req.session.user,
                    isHomePage: true,
                    stats: {
                        borrowedCount: 3,
                        daysVisited: 12,
                        overdueCount: 1,
                    },
                    borrowedBooks: [
                        {
                            title: 'Introduction to Computer Science',
                            author: 'John Smith',
                            dueDate: '2025-08-15',
                            statusType: 'borrowed',
                            statusText: 'Borrowed',
                        },
                        {
                            title: 'Data Structures and Algorithms',
                            author: 'Jane Doe',
                            dueDate: '2025-08-10',
                            statusType: 'overdue',
                            statusText: 'Overdue',
                        },
                        {
                            title: 'Database Management Systems',
                            author: 'Mike Johnson',
                            dueDate: '2025-08-20',
                            statusType: 'borrowed',
                            statusText: 'Borrowed',
                        },
                    ],
                });
            }

            let keyword = req.query.searchbook;
            let category = req.query.category;
            let status = req.query.status;
            let filterConditions = {};

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
                totalCopiesResult,
                countDocuments,
                availableQuantityTotal,
            ] = await Promise.all([
                Book.find(filterConditions).populate('categoryId').lean(),
                Category.find({}).lean(),
                Book.aggregate([
                    {
                        $group: {
                            _id: null,
                            totalCopies: { $sum: '$totalQuantity' },
                        },
                    },
                ]),
                Book.countDocuments({}).lean(),
                Book.countDocuments({ availableQuantity: { $gt: 0 } }).lean(),
            ]);

            const totalCopies =
                totalCopiesResult.length > 0 ? totalCopiesResult[0].totalCopies : 0;

            res.render('home', {
                keyword,
                books,
                categories,
                totalCopies,
                countDocuments,
                availableQuantityTotal,
                layout: false,
            });
        } catch (error) {
            console.log(error);
            res.status(500).send('Lỗi server!');
        }
    }
}

module.exports = new SiteController();