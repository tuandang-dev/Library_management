const Book = require('../models/Book');
const BorrowRecord = require('../models/BorrowRecord');

/**
 * @param {string|ObjectId} userId
 */
const seedBorrowRecordsForUser = async (userId) => {
    try {
        const existingCount = await BorrowRecord.countDocuments({ userId });
        if (existingCount > 0) return;

        let books = await Book.find({}).limit(5).lean();

        if (!books || books.length === 0) {
            const defaultBook = await Book.create({
                title: 'Introduction to Computer Science',
                author: 'John Smith',
                totalQuantity: 10,
                availableQuantity: 8,
                location: 'Section A, Shelf 1',
            });
            books = [defaultBook];
        }

        const getBookId = (index) => {
            return books[index] ? books[index]._id : books[0]._id;
        };

        const now = new Date();
        const oneDay = 24 * 60 * 60 * 1000;

        const mockRecords = [
            {
                userId,
                bookId: getBookId(0),
                ticketId: 'TKT-CS101',
                borrowDate: new Date(now.getTime() - 40 * oneDay),
                dueDate: new Date(now.getTime() - 26 * oneDay),
                returnDate: new Date(now.getTime() - 36 * oneDay),
                staffName: 'Sarah Chen',
                status: 'RETURNED',
            },
            {
                userId,
                bookId: getBookId(1),
                ticketId: 'TKT-DSA202',
                borrowDate: new Date(now.getTime() - 43 * oneDay),
                dueDate: new Date(now.getTime() - 29 * oneDay),
                returnDate: null,
                staffName: 'Sarah Chen',
                status: 'OVERDUE',
            },
            {
                userId,
                bookId: getBookId(2),
                ticketId: 'TKT-PHY303',
                borrowDate: new Date(now.getTime() - 3 * oneDay),
                dueDate: new Date(now.getTime() + 11 * oneDay),
                returnDate: null,
                staffName: 'Robert Johnson',
                status: 'BORROWED',
            },
            {
                userId,
                bookId: getBookId(3),
                ticketId: 'TKT-DB404',
                borrowDate: new Date(now.getTime() - 60 * oneDay),
                dueDate: new Date(now.getTime() - 46 * oneDay),
                returnDate: new Date(now.getTime() - 50 * oneDay),
                staffName: 'Sarah Chen',
                status: 'RETURNED',
            },
            {
                userId,
                bookId: getBookId(4),
                ticketId: 'TKT-NET505',
                borrowDate: new Date(now.getTime() - 75 * oneDay),
                dueDate: new Date(now.getTime() - 61 * oneDay),
                returnDate: new Date(now.getTime() - 65 * oneDay),
                staffName: 'Michael Brown',
                status: 'RETURNED',
            },
        ];

        await BorrowRecord.insertMany(mockRecords);
        console.log('✅ Đã tạo thành công 5 bản ghi BorrowRecord mẫu cho sinh viên!');
    } catch (error) {
        console.error('Lỗi khi seed dữ liệu BorrowRecord:', error);
    }
};

module.exports = { seedBorrowRecordsForUser };