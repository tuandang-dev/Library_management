const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Book = require('../models/Book');
const Category = require('../models/Category');
const BorrowRecord = require('../models/BorrowRecord');
const escapeRegex = require('../../util/escapeRegex');
const { generateUniqueCategorySlug } = require('../../util/slugify');
const { getPaginationData } = require('../helpers/paginationHelper');

const DEFAULT_BOOK_COVER = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400';

class AdminBookController {
    // [GET] /admin/books
    async books(req, res) {
        try {
            const { search, category, status } = req.query;
            const filter = {};

            if (search && search.trim() !== '') {
                const keyword = escapeRegex(search.trim());
                filter.$or = [
                    { title: { $regex: keyword, $options: 'i' } },
                    { author: { $regex: keyword, $options: 'i' } },
                    { isbn: { $regex: keyword, $options: 'i' } },
                    { bookId: { $regex: keyword, $options: 'i' } },
                ];
            }

            if (category && category !== 'all') {
                filter.category = category;
            }

            if (status && status !== 'all') {
                if (status === 'overdue') {
                    let overdueBookIds = [];
                    try {
                        const overdueRecords = await BorrowRecord.find({
                            status: { $in: ['borrowed', 'overdue'] },
                            dueDate: { $lt: new Date() },
                            returnDate: null,
                        }).select('bookId');
                        overdueBookIds = overdueRecords.map((r) => r.bookId);
                    } catch (e) {
                    }
                    filter.$or = [
                        { status: 'overdue' },
                        { _id: { $in: overdueBookIds } },
                    ];
                } else if (status === 'available') {
                    filter.availableQuantity = { $gt: 0 };
                } else if (status === 'borrowed') {
                    filter.availableQuantity = 0;
                }
            }

            const totalFilteredBooks = await Book.countDocuments(filter);
            const pagination = getPaginationData({
                query: req.query,
                totalItems: totalFilteredBooks,
                limit: 10,
            });

            const [rawBooks, totalInventoryAgg, distinctCategories, totalBooksCount] = await Promise.all([
                Book.find(filter)
                    .sort({ createdAt: -1 })
                    .skip(pagination.skip)
                    .limit(pagination.limit)
                    .lean(),
                Book.aggregate([
                    { $group: { _id: null, totalCopies: { $sum: '$totalQuantity' } } },
                ]),
                Book.distinct('category'),
                Book.countDocuments(),
            ]);

            const totalInventory = totalInventoryAgg.length > 0 ? totalInventoryAgg[0].totalCopies : 0;

            const books = rawBooks.map((book) => {
                const isOverdue = book.status === 'overdue';
                const isAvailable = !isOverdue && (book.availableQuantity > 0);
                const isBorrowed = !isOverdue && (book.availableQuantity === 0);

                return {
                    ...book,
                    isAvailable,
                    isBorrowed,
                    isOverdue,
                    displayStatus: isOverdue ? 'overdue' : (isAvailable ? 'available' : 'borrowed'),
                };
            });

            const categoryOptions = distinctCategories.filter(Boolean).map((cat) => ({
                name: cat,
                isSelected: category === cat,
            }));

            res.render('admin/books', {
                layout: 'user',
                title: 'Admin Book Management - UCC Library',
                isAdminPortal: true,
                isAdmin: true,
                isBooksPage: true,
                books,
                categoryOptions,
                showingCount: books.length,
                totalBooksCount,
                totalInventory,
                pagination,
                filters: {
                    search: search || '',
                    category: category || 'all',
                    status: status || 'all',
                    isStatusAll: !status || status === 'all',
                    isStatusAvailable: status === 'available',
                    isStatusBorrowed: status === 'borrowed',
                    isStatusOverdue: status === 'overdue',
                },
            });
        } catch (error) {
            console.error('Lỗi khi tải danh sách quản lý sách:', error);
            res.status(500).render('error', {
                layout: 'user',
                message: 'Unable to load book catalog.',
            });
        }
    }

    // [POST] /admin/books
    async createBook(req, res) {
        try {
            const { title, author, isbn, bookId, category, location, copies, description, image, adminPassword } = req.body;

            if (!title || !author || !isbn || !bookId) {
                return res.status(400).json({
                    success: false,
                    message: 'Please fill in all required fields (*): Title, Author, ISBN, Book ID.',
                });
            }

            if (!adminPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Please enter your password to confirm this action.',
                });
            }

            const currentAdmin = await User.findById(req.session.user._id);
            if (!currentAdmin) {
                return res.status(401).json({
                    success: false,
                    message: 'Session expired. Please log in again.',
                });
            }

            const isMatch = await bcrypt.compare(adminPassword, currentAdmin.password);
            if (!isMatch) {
                return res.status(403).json({
                    success: false,
                    message: 'Admin password is incorrect!',
                });
            }

            const cleanBookId = bookId.trim().toUpperCase();
            const cleanIsbn = isbn.trim();

            const existingBook = await Book.findOne({
                $or: [{ bookId: cleanBookId }, { isbn: cleanIsbn }],
            });

            if (existingBook) {
                const duplicateField = existingBook.bookId === cleanBookId ? `Book ID "${cleanBookId}"` : `ISBN "${cleanIsbn}"`;
                return res.status(400).json({
                    success: false,
                    message: `${duplicateField} already exists in the library!`,
                });
            }

            const categoryName = category && category.trim() !== '' ? category.trim() : 'General';
            let categoryDoc = await Category.findOne({
                name: { $regex: new RegExp(`^${escapeRegex(categoryName)}$`, 'i') },
            });

            if (!categoryDoc) {
                categoryDoc = new Category({
                    name: categoryName,
                    slug: await generateUniqueCategorySlug(categoryName, Category),
                });
                await categoryDoc.save();
            }

            const totalQuantity = parseInt(copies, 10) > 0 ? parseInt(copies, 10) : 1;
            const newBook = new Book({
                title: title.trim(),
                author: author.trim(),
                isbn: cleanIsbn,
                bookId: cleanBookId,
                category: categoryDoc.name,
                categoryId: categoryDoc._id,
                location: location ? location.trim() : 'General Stacks',
                totalQuantity,
                availableQuantity: totalQuantity,
                image: (image && image.trim() !== '') ? image.trim() : DEFAULT_BOOK_COVER,
                description: description ? description.trim() : '',
                status: 'available',
            });

            await newBook.save();

            return res.json({
                success: true,
                message: 'Book added successfully!',
            });
        } catch (error) {
            console.error('Lỗi khi thêm mới sách:', error);
            return res.status(500).json({
                success: false,
                message: 'Server error creating book: ' + error.message,
            });
        }
    }

    // [PUT] /admin/books/:id
    async updateBook(req, res) {
        try {
            const { id } = req.params;
            const { title, author, isbn, bookId, category, location, copies, description, image, adminPassword } = req.body;

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid book ID.',
                });
            }

            if (!adminPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Please enter your password to confirm this action.',
                });
            }

            const currentAdmin = await User.findById(req.session.user._id);
            if (!currentAdmin) {
                return res.status(401).json({
                    success: false,
                    message: 'Session expired. Please log in again.',
                });
            }

            const isMatch = await bcrypt.compare(adminPassword, currentAdmin.password);
            if (!isMatch) {
                return res.status(403).json({
                    success: false,
                    message: 'Admin password is incorrect!',
                });
            }

            const book = await Book.findById(id);
            if (!book) {
                return res.status(404).json({
                    success: false,
                    message: 'Book to update not found.',
                });
            }

            const cleanBookId = bookId.trim().toUpperCase();
            const cleanIsbn = isbn.trim();

            const duplicateCheck = await Book.findOne({
                _id: { $ne: id }, $or: [{ bookId: cleanBookId }, { isbn: cleanIsbn }],
            });

            if (duplicateCheck) {
                const duplicateField = duplicateCheck.bookId === cleanBookId ? `Book ID "${cleanBookId}"` : `ISBN "${cleanIsbn}"`;
                return res.status(400).json({
                    success: false,
                    message: `${duplicateField} is already used by another book!`,
                });
            }

            const newTotalQuantity = parseInt(copies, 10) >= 0 ? parseInt(copies, 10) : book.totalQuantity;
            const currentlyBorrowed = Math.max(0, book.totalQuantity - book.availableQuantity);
            const newAvailableQuantity = Math.max(0, newTotalQuantity - currentlyBorrowed);

            if (category && category.trim() !== '') {
                const categoryName = category.trim();
                let categoryDoc = await Category.findOne({
                    name: { $regex: new RegExp(`^${escapeRegex(categoryName)}$`, 'i') },
                });

                if (!categoryDoc) {
                    categoryDoc = new Category({
                        name: categoryName,
                        slug: await generateUniqueCategorySlug(categoryName, Category),
                    });
                    await categoryDoc.save();
                }

                book.category = categoryDoc.name;
                book.categoryId = categoryDoc._id;
            }

            book.title = title.trim();
            book.author = author.trim();
            book.isbn = cleanIsbn;
            book.bookId = cleanBookId;
            book.category = category ? category.trim() : book.category;
            book.location = location ? location.trim() : book.location;
            book.totalQuantity = newTotalQuantity;
            book.availableQuantity = newAvailableQuantity;
            book.image = (image && image.trim() !== '') ? image.trim() : (book.image || DEFAULT_BOOK_COVER);
            book.description = description !== undefined ? description.trim() : book.description;

            await book.save();

            return res.json({
                success: true,
                message: 'Book updated successfully!',
            });
        } catch (error) {
            console.error('Lỗi khi cập nhật sách:', error);
            return res.status(500).json({
                success: false,
                message: 'Server error updating book: ' + error.message,
            });
        }
    }

    // [DELETE] /admin/books/:id
    async deleteBook(req, res) {
        try {
            const { id } = req.params;
            const { adminPassword } = req.body;

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid book ID.',
                });
            }

            if (!adminPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Please enter your password to confirm deletion.',
                });
            }

            const currentAdmin = await User.findById(req.session.user._id);
            if (!currentAdmin) {
                return res.status(401).json({
                    success: false,
                    message: 'Session expired. Please log in again.',
                });
            }

            const isMatch = await bcrypt.compare(adminPassword, currentAdmin.password);
            if (!isMatch) {
                return res.status(403).json({
                    success: false,
                    message: 'Admin password is incorrect!',
                });
            }

            const book = await Book.findById(id);
            if (!book) {
                return res.status(404).json({
                    success: false,
                    message: 'Book to delete not found.',
                });
            }

            await book.delete();

            return res.json({
                success: true,
                message: `Successfully deleted book "${book.title}".`,
            });
        } catch (error) {
            console.error('Lỗi khi xóa sách:', error);
            return res.status(500).json({
                success: false,
                message: 'Server error deleting book: ' + error.message,
            });
        }
    }

    // [GET] /admin/books/export
    async exportBooks(req, res) {
        try {
            const books = await Book.find().sort({ createdAt: -1 }).lean();

            const headers = ['Book ID', 'Title', 'Author', 'ISBN', 'Category', 'Location', 'Total Copies', 'Available Copies', 'Status', 'Cover Image', 'Description'];

            const escapeCsv = (str) => {
                if (str === null || str === undefined) return '""';
                const clean = String(str).replace(/"/g, '""');
                return `"${clean}"`;
            };

            const rows = books.map(b => [
                escapeCsv(b.bookId),
                escapeCsv(b.title),
                escapeCsv(b.author),
                escapeCsv(b.isbn),
                escapeCsv(b.category || 'General'),
                escapeCsv(b.location || 'General Stacks'),
                escapeCsv(b.totalQuantity),
                escapeCsv(b.availableQuantity),
                escapeCsv(b.status),
                escapeCsv(b.image || DEFAULT_BOOK_COVER),
                escapeCsv(b.description || '')
            ].join(','));

            const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');

            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', 'attachment; filename="books-inventory.csv"');
            return res.send(csvContent);
        } catch (error) {
            console.error('Lỗi khi xuất danh sách sách ra CSV:', error);
            return res.status(500).render('error', {
                layout: 'user',
                message: 'Unable to export book catalog to CSV.',
            });
        }
    }

    // [POST] /admin/books/bulk-import
    async bulkImportBooks(req, res) {
        try {
            const { books, adminPassword } = req.body;

            if (!Array.isArray(books) || books.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Book list is empty or invalid format.',
                });
            }

            if (!adminPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Please enter admin password to confirm import.',
                });
            }

            const currentAdmin = await User.findById(req.session.user._id);
            if (!currentAdmin) {
                return res.status(401).json({
                    success: false,
                    message: 'Session expired. Please log in again.',
                });
            }

            const isMatch = await bcrypt.compare(adminPassword, currentAdmin.password);
            if (!isMatch) {
                return res.status(403).json({
                    success: false,
                    message: 'Admin password is incorrect!',
                });
            }

            let insertedCount = 0;
            let skippedCount = 0;

            for (const item of books) {
                const title = item.title ? item.title.trim() : '';
                const author = item.author ? item.author.trim() : '';
                const isbn = item.isbn ? item.isbn.trim() : '';
                const bookId = item.bookid ? item.bookid.trim().toUpperCase() : (item.bookId ? item.bookId.trim().toUpperCase() : '');

                if (!title || !author || !isbn || !bookId) {
                    skippedCount++;
                    continue;
                }

                const existing = await Book.findOne({
                    $or: [{ bookId: bookId }, { isbn: isbn }],
                });

                if (existing) {
                    skippedCount++;
                    continue;
                }

                const categoryName = item.category && item.category.trim() !== '' ? item.category.trim() : 'General';
                let categoryDoc = await Category.findOne({
                    name: { $regex: new RegExp(`^${escapeRegex(categoryName)}$`, 'i') },
                });

                if (!categoryDoc) {
                    categoryDoc = new Category({
                        name: categoryName,
                        slug: await generateUniqueCategorySlug(categoryName, Category),
                    });
                    await categoryDoc.save();
                }

                const totalQuantity = parseInt(item.copies, 10) > 0 ? parseInt(item.copies, 10) : 1;

                const bookImage = item.image && item.image.trim() !== '' ? item.image.trim() : DEFAULT_BOOK_COVER;

                const newBook = new Book({
                    title,
                    author,
                    isbn,
                    bookId,
                    category: categoryDoc.name,
                    categoryId: categoryDoc._id,
                    location: item.location ? item.location.trim() : 'General Stacks',
                    totalQuantity,
                    availableQuantity: totalQuantity,
                    image: bookImage,
                    description: item.description ? item.description.trim() : '',
                    status: 'available',
                });

                await newBook.save();
                insertedCount++;
            }

            return res.json({
                success: true,
                message: `Successfully imported ${insertedCount} books into catalog (Skipped ${skippedCount} duplicates/invalid).`,
                count: insertedCount,
                skipped: skippedCount,
            });
        } catch (error) {
            console.error('Lỗi khi nạp sách hàng loạt:', error);
            return res.status(500).json({
                success: false,
                message: 'Server error importing books: ' + error.message,
            });
        }
    }
}

module.exports = new AdminBookController();
