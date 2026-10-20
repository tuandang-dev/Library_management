const BorrowRecord = require('../models/BorrowRecord');
const { formatDate, processBorrowStatus } = require('../../util/borrowHelper');
const { getPaginationData } = require('../helpers/paginationHelper');

class HistoryController {
    // [GET] /history
    async index(req, res, next) {
        try {
            const currentUser = req.session.user;
            const now = new Date();

            // 1. Tính toán thẻ thống kê trên toàn bộ lịch sử của độc giả
            const [
                totalBorrowedCount,
                currentlyBorrowedCount,
                overdueCount,
                returnedCount,
            ] = await Promise.all([
                BorrowRecord.countDocuments({ userId: currentUser._id }),
                BorrowRecord.countDocuments({ userId: currentUser._id, returnDate: null }),
                BorrowRecord.countDocuments({ userId: currentUser._id, returnDate: null, dueDate: { $lt: now } }),
                BorrowRecord.countDocuments({ userId: currentUser._id, returnDate: { $ne: null } }),
            ]);

            // 2. Tính toán phân trang
            const pagination = getPaginationData({
                query: req.query,
                totalItems: totalBorrowedCount,
                limit: 10,
            });

            // 3. Truy vấn các bản ghi theo trang hiện tại
            const rawRecords = await BorrowRecord.find({ userId: currentUser._id })
                .populate('bookId')
                .sort({ createdAt: -1 })
                .skip(pagination.skip)
                .limit(pagination.limit)
                .lean();

            const records = rawRecords.map((record) => {
                const statusInfo = processBorrowStatus(record);

                const bookTitle = record.bookId?.title || 'Unknown Book';
                const bookAuthor = record.bookId?.author || 'Unknown Author';

                return {
                    ...record,
                    bookTitle,
                    bookAuthor,
                    borrowDateFormatted: formatDate(record.borrowDate),
                    dueDateFormatted: formatDate(record.dueDate),
                    returnDateFormatted: formatDate(record.returnDate),
                    badgeClass: statusInfo.badgeClass,
                    badgeText: statusInfo.badgeText,
                    isReturned: statusInfo.isReturned,
                    isOverdue: statusInfo.isOverdue,
                };
            });

            return res.render('history', {
                title: 'My Borrowing History - UCC Library',
                layout: 'user',
                user: currentUser,
                isHistoryPage: true,
                stats: {
                    totalBorrowed: totalBorrowedCount,
                    currentlyBorrowed: currentlyBorrowedCount,
                    overdue: overdueCount,
                    returned: returnedCount,
                },
                records,
                pagination,
            });
        } catch (error) {
            console.error('Lỗi tại HistoryController.index:', error);
            next(error);
        }
    }
}

module.exports = new HistoryController();