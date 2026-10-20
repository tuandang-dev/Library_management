const Book = require('../models/Book');
const Category = require('../models/Category');
const BorrowRecord = require('../models/BorrowRecord');
const Attendance = require('../models/Attendance');
const escapeRegex = require('../../util/escapeRegex');
const { getPaginationData } = require('../helpers/paginationHelper');

class SiteController {
    // [GET] /
    async index(req, res) {
        if (req.session.user && req.session.user.role === 'admin') {
            return res.redirect('/admin/dashboard');
        }

        try {
            if (req.session && req.session.user) {
                const currentUser = req.session.user;
                const now = new Date();

                // Lấy đầu tháng hiện tại (00:00:00 ngày 1 của tháng)
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);

                const [
                    borrowedCount,
                    daysVisited,
                    overdueCount,
                    activeBorrowRecords,
                ] = await Promise.all([
                    BorrowRecord.countDocuments({
                        userId: currentUser._id,
                        returnDate: null,
                    }),
                    Attendance.countDocuments({
                        userId: currentUser._id,
                        checkInTime: { $gte: startOfMonth },
                    }),
                    BorrowRecord.countDocuments({
                        userId: currentUser._id,
                        returnDate: null,
                        dueDate: { $lt: now },
                    }),
                    BorrowRecord.find({
                        userId: currentUser._id,
                        returnDate: null,
                    })
                        .populate('bookId', 'title author')
                        .sort({ dueDate: 1 })
                        .limit(3)
                        .lean(),
                ]);

                const borrowedBooks = activeBorrowRecords.map((record) => {
                    const isOverdue = now > new Date(record.dueDate);
                    const dueObj = new Date(record.dueDate);
                    const formattedDue = isNaN(dueObj.getTime())
                        ? 'N/A'
                        : `${dueObj.getFullYear()}-${String(dueObj.getMonth() + 1).padStart(2, '0')}-${String(dueObj.getDate()).padStart(2, '0')}`;

                    return {
                        title: record.bookId?.title || 'Unknown Title',
                        author: record.bookId?.author || 'Unknown Author',
                        dueDate: formattedDue,
                        statusType: isOverdue ? 'overdue' : 'borrowed',
                        statusText: isOverdue ? 'Overdue' : 'Borrowed',
                    };
                });

                return res.render('dashboard', {
                    title: 'Student Portal - UCC Library',
                    layout: 'user',
                    user: currentUser,
                    isHomePage: true,
                    stats: {
                        borrowedCount: borrowedCount || 0,
                        daysVisited: daysVisited || 0,
                        overdueCount: overdueCount || 0,
                    },
                    borrowedBooks,
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

            if (keyword && keyword.trim() !== '') {
                const safeKeyword = escapeRegex(keyword.trim());
                filterConditions.$or = [
                    { title: { $regex: safeKeyword, $options: 'i' } },
                    { isbn: { $regex: safeKeyword, $options: 'i' } },
                    { bookId: { $regex: safeKeyword, $options: 'i' } },
                    { author: { $regex: safeKeyword, $options: 'i' } },
                ];
            }

            const totalFilteredBooks = await Book.countDocuments(filterConditions);
            const pagination = getPaginationData({
                query: req.query,
                totalItems: totalFilteredBooks,
                limit: 12,
            });

            const [
                books,
                categories,
                totalCopiesResult,
                countDocuments,
                availableQuantityTotal,
            ] = await Promise.all([
                Book.find(filterConditions)
                    .populate('categoryId')
                    .skip(pagination.skip)
                    .limit(pagination.limit)
                    .lean(),
                Category.find({}).lean(),
                Book.aggregate([
                    {
                        $group: {
                            _id: null,
                            totalCopies: { $sum: '$totalQuantity' },
                        },
                    },
                ]),
                Book.countDocuments({}),
                Book.countDocuments({ availableQuantity: { $gt: 0 } }),
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
                pagination,
                layout: false,
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Server error!');
        }
    }
}

module.exports = new SiteController();