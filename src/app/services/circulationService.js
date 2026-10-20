const BorrowTicket = require('../models/BorrowTicket');
const Book = require('../models/Book');
const BorrowRecord = require('../models/BorrowRecord');
const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');

class CirculationService {
    /**
     * Xử lý thủ tục mượn sách từ vé mượn (checkoutTicket)
     * @param {Object} params
     * @param {string} params.ticketId - Mã định danh vé mượn (VD: TKT-XXXXXX)
     * @param {string} [params.userId] - ID độc giả (để kiểm tra khớp với chủ vé)
     * @param {string} params.staffName - Tên thủ thư/quản trị viên thực hiện
     * @param {string} [params.actorRole='admin'] - Vai trò của người thực hiện
     * @returns {Promise<Object>} Kết quả xử lý { success, message, studentName, itemCount }
     */
    async checkoutTicket({ ticketId, userId, staffName, actorRole = 'admin' }) {
        if (!ticketId) {
            const error = new Error('Missing ticket ID to proceed with book checkout.');
            error.statusCode = 400;
            throw error;
        }

        const initialTicket = await BorrowTicket.findOne({ ticketId });
        if (!initialTicket) {
            const error = new Error(`Borrow ticket with ID "${ticketId}" was not found.`);
            error.statusCode = 404;
            throw error;
        }

        if (initialTicket.expiresAt && new Date() > new Date(initialTicket.expiresAt)) {
            const error = new Error('Borrow ticket has expired. Please generate a new ticket.');
            error.statusCode = 400;
            throw error;
        }

        const ticket = await BorrowTicket.findOneAndUpdate(
            { ticketId, status: 'ACTIVE' },
            { $set: { status: 'PROCESSING' } },
            { new: true }
        ).populate('userId');

        if (!ticket) {
            const currentTicket = await BorrowTicket.findOne({ ticketId });
            if (!currentTicket) {
                const error = new Error(`Borrow ticket with ID "${ticketId}" was not found.`);
                error.statusCode = 404;
                throw error;
            }
            if (currentTicket.status === 'COMPLETED') {
                const error = new Error('This borrow ticket has already been processed.');
                error.statusCode = 400;
                throw error;
            }
            const msg = currentTicket.status === 'PROCESSING'
                ? 'This borrow ticket is currently being processed by another request.'
                : `This borrow ticket has already been processed or is not ready (status: ${currentTicket.status}).`;
            const error = new Error(msg);
            error.statusCode = 400;
            throw error;
        }

        const borrowerId = ticket.userId?._id || ticket.userId;
        if (!borrowerId) {
            await BorrowTicket.updateOne({ _id: ticket._id }, { $set: { status: 'ACTIVE' } });
            const error = new Error('Borrow ticket owner information not found.');
            error.statusCode = 400;
            throw error;
        }

        if (userId && userId.toString() !== borrowerId.toString()) {
            await BorrowTicket.updateOne({ _id: ticket._id }, { $set: { status: 'ACTIVE' } });
            const error = new Error('User information does not match borrow ticket owner.');
            error.statusCode = 400;
            throw error;
        }

        const deductedBookIds = [];
        try {
            if (!ticket.items || ticket.items.length === 0) {
                await BorrowTicket.updateOne({ _id: ticket._id }, { $set: { status: 'ACTIVE' } });
                const error = new Error('Borrow ticket does not contain any valid books.');
                error.statusCode = 400;
                throw error;
            }

            for (const item of ticket.items) {
                const updatedBook = await Book.findOneAndUpdate(
                    { _id: item.bookId, availableQuantity: { $gt: 0 } },
                    { $inc: { availableQuantity: -1 } },
                    { new: true }
                );

                if (!updatedBook) {
                    if (deductedBookIds.length > 0) {
                        await Book.updateMany(
                            { _id: { $in: deductedBookIds } },
                            { $inc: { availableQuantity: 1 } }
                        );
                    }

                    await BorrowTicket.updateOne({ _id: ticket._id }, { $set: { status: 'ACTIVE' } });

                    const error = new Error(`Book "${item.title || 'unknown'}" is currently out of stock.`);
                    error.statusCode = 400;
                    throw error;
                }

                deductedBookIds.push(item.bookId);
            }

            const dueDate = ticket.expectedReturnDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

            const recordPromises = ticket.items.map((item) => {
                return BorrowRecord.create({
                    userId: borrowerId,
                    bookId: item.bookId,
                    ticketId: ticket.ticketId,
                    borrowDate: new Date(),
                    dueDate: dueDate,
                    staffName: staffName,
                    status: 'BORROWED',
                });
            });

            await Promise.all(recordPromises);

            await BorrowTicket.updateOne({ _id: ticket._id }, { $set: { status: 'COMPLETED' } });

            const studentName = ticket.userId?.fullname || 'Student Reader';
            const bookTitles = ticket.items.map((i) => i.title).join(', ');
            await ActivityLog.create({
                category: 'books',
                categoryLabel: 'Books',
                action: 'Complete Checkout',
                description: `Completed checkout of ${ticket.items.length} book(s) [${bookTitles}] for ${studentName}`,
                actor: {
                    name: staffName,
                    role: actorRole,
                },
            });

            return {
                success: true,
                message: `Successfully completed checkout of ${ticket.items.length} book(s) for ${studentName}!`,
                studentName,
                itemCount: ticket.items.length,
            };
        } catch (processError) {
            if (deductedBookIds.length > 0) {
                await Book.updateMany(
                    { _id: { $in: deductedBookIds } },
                    { $inc: { availableQuantity: 1 } }
                );
            }
            await BorrowTicket.updateOne({ _id: ticket._id }, { $set: { status: 'ACTIVE' } });
            throw processError;
        }
    }

    /**
     * Xử lý trả sách (returnBooks)
     * @param {Object} params
     * @param {string} params.userId - ID người dùng
     * @param {Array} [params.books] - Danh sách sách trả (hoặc rỗng nếu trả hết)
     * @param {string} params.staffName - Tên thủ thư/quản trị viên thực hiện
     * @param {string} [params.actorRole='admin'] - Vai trò của người thực hiện
     * @returns {Promise<Object>} Kết quả xử lý { success, message, returnedCount, studentName }
     */
    async returnBooks({ userId, books, staffName, actorRole = 'admin' }) {
        if (!userId) {
            const error = new Error('Student reader to return books could not be identified.');
            error.statusCode = 400;
            throw error;
        }

        const student = await User.findById(userId).lean();
        const studentName = student?.fullname || 'Student Reader';

        let query = {
            userId: userId,
            returnDate: null,
        };

        if (Array.isArray(books) && books.length > 0) {
            const bookIds = books.map((b) => b.bookId || b._id).filter(Boolean);
            if (bookIds.length > 0) {
                query.bookId = { $in: bookIds };
            }
        }

        const activeRecords = await BorrowRecord.find(query).populate('bookId');

        if (!activeRecords || activeRecords.length === 0) {
            const error = new Error(`Student ${studentName} has no books to return at this time.`);
            error.statusCode = 400;
            throw error;
        }

        const returnedBookTitles = [];
        for (const record of activeRecords) {
            const updatedRecord = await BorrowRecord.findOneAndUpdate(
                {
                    _id: record._id,
                    returnDate: null,
                },
                {
                    $set: {
                        returnDate: new Date(),
                        status: 'RETURNED',
                        staffName: staffName,
                    },
                },
                { new: true }
            ).populate('bookId');

            if (updatedRecord) {
                const targetBookId = updatedRecord.bookId?._id || updatedRecord.bookId;
                await Book.findOneAndUpdate(
                    {
                        _id: targetBookId,
                        $expr: { $lt: ['$availableQuantity', '$totalQuantity'] },
                    },
                    {
                        $inc: { availableQuantity: 1 },
                    }
                );

                if (updatedRecord.bookId?.title) {
                    returnedBookTitles.push(updatedRecord.bookId.title);
                }
            }
        }

        if (returnedBookTitles.length === 0) {
            const error = new Error('The requested books have already been returned.');
            error.statusCode = 400;
            throw error;
        }

        await ActivityLog.create({
            category: 'books',
            categoryLabel: 'Books',
            action: 'Book Returned',
            description: `Processed return of ${activeRecords.length} book(s) [${returnedBookTitles.join(', ')}] for ${studentName}`,
            actor: {
                name: staffName,
                role: actorRole,
            },
        });

        return {
            success: true,
            message: `Successfully returned ${activeRecords.length} book(s) from ${studentName}!`,
            returnedCount: activeRecords.length,
            studentName,
        };
    }
}

module.exports = new CirculationService();
