const BorrowRecord = require('../models/BorrowRecord');
const { formatDate, processBorrowStatus } = require('../../util/borrowHelper');
const { seedBorrowRecordsForUser } = require('../services/borrowRecordSeeder');

class HistoryController {
    // [GET] /history
    async index(req, res, next) {
        try {
            const currentUser = req.session.user;

            await seedBorrowRecordsForUser(currentUser._id);

            const rawRecords = await BorrowRecord.find({ userId: currentUser._id })
                .populate('bookId')
                .sort({ createdAt: -1 })
                .lean();

            let currentlyBorrowedCount = 0;
            let overdueCount = 0;
            let returnedCount = 0;

            const now = new Date();

            const records = rawRecords.map((record) => {
                const statusInfo = processBorrowStatus(record);

                if (statusInfo.isReturned) {
                    returnedCount++;
                } else {
                    currentlyBorrowedCount++;
                    if (statusInfo.isOverdue) {
                        overdueCount++;
                    }
                }

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

            const totalBorrowedCount = records.length;

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
            });
        } catch (error) {
            console.error('Lỗi tại HistoryController.index:', error);
            next(error);
        }
    }
}

module.exports = new HistoryController();