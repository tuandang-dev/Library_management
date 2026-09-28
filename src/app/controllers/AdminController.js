const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Book = require('../models/Book');
const Category = require('../models/Category');
const BorrowRecord = require('../models/BorrowRecord');
const borrowHelper = require('../../util/borrowHelper');
const { sendEmail } = require('../helpers/emailHelper');

const DEFAULT_BOOK_COVER = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400';

class AdminController {
    // [GET] /admin/dashboard
    async dashboard(req, res) {
        try {
            const metrics = {
                totalUsers: {
                    value: '234',
                    growth: '+12 this month',
                },
                activeBooks: {
                    value: '1,247',
                    availability: '89% available',
                },
                dailyVisitors: {
                    value: '47',
                    timeLabel: 'Today',
                },
            };

            const topVisitorsChart = {
                labels: ['Alex Johnson', 'Maria Garcia', 'David Wilson', 'Emma Davis', 'Michael Brown'],
                data: [24, 21, 20, 18, 16],
            };

            const weeklyActivityChart = {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                visitors: [48, 52, 48, 64, 58, 38, 24],
                borrowed: [12, 18, 15, 22, 19, 8, 4],
            };

            res.render('admin/dashboard', {
                layout: 'user',
                title: 'UCC Library - Admin Portal',
                isAdminPortal: true,
                isAdmin: true,
                isHomePage: true,
                user: {
                    ...req.session.user,
                    isAdmin: true,
                },
                metrics,
                topVisitorsJson: JSON.stringify(topVisitorsChart),
                weeklyActivityJson: JSON.stringify(weeklyActivityChart),
            });
        } catch (error) {
            console.error('Lỗi tải Admin Dashboard:', error);
            res.status(500).render('error', {
                layout: 'user',
                message: 'Không thể tải bảng điều khiển quản trị.',
            });
        }
    }

    // [GET] /admin/users
    async users(req, res) {
        try {
            const { search, role, status } = req.query;
            const filter = {};

            if (search && search.trim() !== '') {
                const keyword = search.trim();
                filter.$or = [
                    { fullname: { $regex: keyword, $options: 'i' } },
                    { email: { $regex: keyword, $options: 'i' } },
                ];
            }

            if (role && role !== 'all') {
                filter.role = role;
            }

            if (status && status !== 'all') {
                filter.status = status;
            }

            const rawUsers = await User.find(filter).sort({ createdAt: -1 });

            const formatDate = (date) => {
                if (!date) return 'N/A';
                const d = new Date(date);
                return isNaN(d.getTime()) ? 'N/A' : `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
            };

            const users = rawUsers.map((user) => {
                const userObj = user.toObject ? user.toObject() : user;
                return {
                    ...userObj,
                    formattedJoinDate: typeof user.getFormattedDate === 'function'
                        ? user.getFormattedDate('createdAt')
                        : formatDate(user.createdAt),
                    formattedLastActive: typeof user.getFormattedDate === 'function'
                        ? user.getFormattedDate('lastActive')
                        : formatDate(user.lastActive),
                    isAdmin: user.role === 'admin',
                    isActive: user.status === 'active',
                };
            });

            res.render('admin/users', {
                layout: 'user',
                title: 'User Management - UCC Library',
                isAdminPortal: true,
                isAdmin: true,
                users,
                filters: {
                    search: search || '',
                    role: role || 'all',
                    status: status || 'all',
                    isRoleAll: !role || role === 'all',
                    isRoleUser: role === 'user',
                    isRoleAdmin: role === 'admin',
                    isStatusAll: !status || status === 'all',
                    isStatusActive: status === 'active',
                    isStatusDisable: status === 'disable',
                },
            });
        } catch (error) {
            console.error('Lỗi khi tải danh sách người dùng:', error);
            res.status(500).render('error', {
                layout: 'user',
                message: 'Không thể tải danh sách người dùng.',
            });
        }
    }

    // [POST] /admin/users
    async createUser(req, res) {
        try {
            const { fullname, email, role } = req.body;
            let { permissions } = req.body;

            if (!permissions) {
                permissions = [];
            } else if (!Array.isArray(permissions)) {
                permissions = [permissions];
            }

            if (!fullname || !email) {
                return res.redirect('/admin/users');
            }

            const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
            if (existingUser) {
                return res.redirect('/admin/users');
            }

            const newUser = new User({
                fullname: fullname.trim(),
                email: email.trim().toLowerCase(),
                password: '123456',
                role: role || 'user',
                status: 'active',
                permissions,
                lastActive: new Date(),
            });

            await newUser.save();
            return res.redirect('/admin/users');
        } catch (error) {
            console.error('Lỗi khi tạo mới người dùng:', error);
            return res.status(500).render('error', {
                layout: 'user',
                message: 'Không thể thêm người dùng mới.',
            });
        }
    }

    // [POST] /admin/users/bulk-import
    async bulkImport(req, res) {
        try {
            const { users } = req.body;
            if (!Array.isArray(users) || users.length === 0) {
                return res.status(400).json({ success: false, message: 'Dữ liệu danh sách trống.' });
            }

            let insertedCount = 0;
            for (const item of users) {
                if (!item.fullname || !item.email) continue;
                const emailClean = item.email.trim().toLowerCase();
                const existing = await User.findOne({ email: emailClean });

                if (!existing) {
                    const role = (item.role && item.role.toLowerCase() === 'admin') ? 'admin' : 'user';
                    const newUser = new User({
                        fullname: item.fullname.trim(),
                        email: emailClean,
                        role,
                        password: '123456',
                        status: 'active',
                        lastActive: new Date(),
                    });
                    await newUser.save();
                    insertedCount++;
                }
            }

            return res.json({ success: true, count: insertedCount });
        } catch (error) {
            console.error('Lỗi khi nhập hàng loạt tài khoản:', error);
            return res.status(500).json({ success: false, message: 'Lỗi server khi nạp file.' });
        }
    }

    // [PATCH] /admin/users/:id/status
    async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const currentUserId = req.session.user ? req.session.user._id : null;

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Định dạng ID người dùng không hợp lệ.',
                });
            }

            if (!['active', 'disable'].includes(status)) {
                return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ.' });
            }

            if (currentUserId && id === currentUserId.toString() && status === 'disable') {
                return res.status(400).json({
                    success: false,
                    message: 'Bạn không thể tự vô hiệu hóa tài khoản quản trị của chính mình.',
                });
            }

            const updatedUser = await User.findByIdAndUpdate(id, { status }, { new: true });
            if (!updatedUser) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
            }

            return res.json({
                success: true,
                message: `Đã cập nhật trạng thái sang ${status}.`,
                status: updatedUser.status,
            });
        } catch (error) {
            console.error('Lỗi khi cập nhật trạng thái người dùng:', error);
            return res.status(500).json({ success: false, message: 'Lỗi server khi đổi trạng thái.' });
        }
    }

    // [DELETE] /admin/users/:id
    async deleteUser(req, res) {
        try {
            const { id } = req.params;
            const currentUserId = req.session.user ? req.session.user._id : null;

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Định dạng ID người dùng không hợp lệ.',
                });
            }

            if (currentUserId && id === currentUserId.toString()) {
                return res.status(400).json({
                    success: false,
                    message: 'Bạn không thể tự xóa tài khoản quản trị của chính mình.',
                });
            }

            const user = await User.findById(id);
            if (!user) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng cần xóa.' });
            }

            await user.delete();

            return res.json({ success: true, message: 'Đã xóa người dùng thành công (Soft Delete).' });
        } catch (error) {
            console.error('Lỗi khi xóa người dùng:', error);
            return res.status(500).json({ success: false, message: 'Lỗi server khi xóa tài khoản.' });
        }
    }

    // [GET] /admin/books
    async books(req, res) {
        try {
            const { search, category, status } = req.query;
            const filter = {};

            if (search && search.trim() !== '') {
                const keyword = search.trim();
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
                        const BorrowRecord = require('../models/BorrowRecord');
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

            const [rawBooks, totalInventoryAgg, distinctCategories, totalBooksCount] = await Promise.all([
                Book.find(filter).sort({ createdAt: -1 }).lean(),
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
                books,
                categoryOptions,
                showingCount: books.length,
                totalBooksCount,
                totalInventory,
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
                message: 'Không thể tải kho sách quản trị.',
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
                    message: 'Vui lòng điền đầy đủ các trường bắt buộc (*): Title, Author, ISBN, Book ID.',
                });
            }

            if (!adminPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng nhập mật khẩu của bạn để xác thực hành động.',
                });
            }

            const currentAdmin = await User.findById(req.session.user._id);
            if (!currentAdmin) {
                return res.status(401).json({
                    success: false,
                    message: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.',
                });
            }

            const isMatch = await bcrypt.compare(adminPassword, currentAdmin.password);
            if (!isMatch) {
                return res.status(403).json({
                    success: false,
                    message: 'Mật khẩu quản trị viên không chính xác!',
                });
            }

            const cleanBookId = bookId.trim().toUpperCase();
            const cleanIsbn = isbn.trim();

            const existingBook = await Book.findOne({
                $or: [{ bookId: cleanBookId }, { isbn: cleanIsbn }],
            });

            if (existingBook) {
                const duplicateField = existingBook.bookId === cleanBookId ? `Mã Book ID "${cleanBookId}"` : `Mã ISBN "${cleanIsbn}"`;
                return res.status(400).json({
                    success: false,
                    message: `${duplicateField} đã tồn tại trong thư viện!`,
                });
            }

            const categoryName = category && category.trim() !== '' ? category.trim() : 'General';
            let categoryDoc = await Category.findOne({
                name: { $regex: new RegExp(`^${categoryName}$`, 'i') },
            });

            if (!categoryDoc) {
                categoryDoc = new Category({
                    name: categoryName,
                    slug: categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
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
                message: 'Thêm mới sách thành công!',
            });
        } catch (error) {
            console.error('Lỗi khi thêm mới sách:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi server khi tạo sách mới: ' + error.message,
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
                    message: 'Mã định danh sách không hợp lệ.',
                });
            }

            if (!adminPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng nhập mật khẩu của bạn để xác thực hành động.',
                });
            }

            const currentAdmin = await User.findById(req.session.user._id);
            if (!currentAdmin) {
                return res.status(401).json({
                    success: false,
                    message: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.',
                });
            }

            const isMatch = await bcrypt.compare(adminPassword, currentAdmin.password);
            if (!isMatch) {
                return res.status(403).json({
                    success: false,
                    message: 'Mật khẩu quản trị viên không chính xác!',
                });
            }

            const book = await Book.findById(id);
            if (!book) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy thông tin cuốn sách cần chỉnh sửa.',
                });
            }

            const cleanBookId = bookId.trim().toUpperCase();
            const cleanIsbn = isbn.trim();

            const duplicateCheck = await Book.findOne({
                _id: { $ne: id }, $or: [{ bookId: cleanBookId }, { isbn: cleanIsbn }],
            });

            if (duplicateCheck) {
                const duplicateField = duplicateCheck.bookId === cleanBookId ? `Mã Book ID "${cleanBookId}"` : `Mã ISBN "${cleanIsbn}"`;
                return res.status(400).json({
                    success: false,
                    message: `${duplicateField} đã bị trùng với một đầu sách khác!`,
                });
            }

            const newTotalQuantity = parseInt(copies, 10) >= 0 ? parseInt(copies, 10) : book.totalQuantity;
            const currentlyBorrowed = Math.max(0, book.totalQuantity - book.availableQuantity);
            const newAvailableQuantity = Math.max(0, newTotalQuantity - currentlyBorrowed);

            if (category && category.trim() !== '') {
                const categoryName = category.trim();
                let categoryDoc = await Category.findOne({
                    name: { $regex: new RegExp(`^${categoryName}$`, 'i') },
                });

                if (!categoryDoc) {
                    categoryDoc = new Category({
                        name: categoryName,
                        slug: categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
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
                message: 'Cập nhật thông tin sách thành công!',
            });
        } catch (error) {
            console.error('Lỗi khi cập nhật sách:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi server khi cập nhật sách: ' + error.message,
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
                    message: 'Mã định danh sách không hợp lệ.',
                });
            }

            if (!adminPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng nhập mật khẩu của bạn để xác thực hành động xóa.',
                });
            }

            const currentAdmin = await User.findById(req.session.user._id);
            if (!currentAdmin) {
                return res.status(401).json({
                    success: false,
                    message: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.',
                });
            }

            const isMatch = await bcrypt.compare(adminPassword, currentAdmin.password);
            if (!isMatch) {
                return res.status(403).json({
                    success: false,
                    message: 'Mật khẩu quản trị viên không chính xác!',
                });
            }

            const book = await Book.findById(id);
            if (!book) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy sách cần xóa trong hệ thống.',
                });
            }

            await book.delete();

            return res.json({
                success: true,
                message: `Đã xóa cuốn sách "${book.title}" thành công.`,
            });
        } catch (error) {
            console.error('Lỗi khi xóa sách:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi server khi thực hiện xóa sách: ' + error.message,
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
                message: 'Không thể xuất dữ liệu kho sách ra file CSV.',
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
                    message: 'Danh sách sách tải lên trống hoặc không đúng cấu trúc.',
                });
            }

            if (!adminPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng nhập mật khẩu quản trị để cấp quyền nạp sách.',
                });
            }

            const currentAdmin = await User.findById(req.session.user._id);
            if (!currentAdmin) {
                return res.status(401).json({
                    success: false,
                    message: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.',
                });
            }

            const isMatch = await bcrypt.compare(adminPassword, currentAdmin.password);
            if (!isMatch) {
                return res.status(403).json({
                    success: false,
                    message: 'Mật khẩu quản trị viên không chính xác!',
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
                    name: { $regex: new RegExp(`^${categoryName}$`, 'i') },
                });

                if (!categoryDoc) {
                    categoryDoc = new Category({
                        name: categoryName,
                        slug: categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
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
                message: `Đã nạp thành công ${insertedCount} cuốn sách vào kho (Bỏ qua ${skippedCount} sách trùng lặp hoặc không hợp lệ).`,
                count: insertedCount,
                skipped: skippedCount,
            });
        } catch (error) {
            console.error('Lỗi khi nạp sách hàng loạt:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi server khi nạp dữ liệu sách: ' + error.message,
            });
        }
    }

    // [GET] /admin/alerts
    async overdueAlerts(req, res) {
        try {
            const { search, status } = req.query;
            const now = new Date();

            const rawRecords = await BorrowRecord.find({
                returnDate: null,
                dueDate: { $lt: now },
            })
                .populate('userId', 'fullname email')
                .populate('bookId', 'title author isbn category')
                .sort({ dueDate: 1 })
                .lean();

            const processedRecords = rawRecords.map((record) => {
                const overdueDays = borrowHelper.calculateOverdueDays(record.dueDate, record.returnDate);
                const tierInfo = borrowHelper.getOverdueAlertTier(overdueDays);
                const studentName = record.userId?.fullname || 'Unknown Student';
                const studentEmail = record.userId?.email || 'N/A';
                const bookTitle = record.bookId?.title || 'Unknown Book';
                const bookAuthor = record.bookId?.author || 'Unknown Author';
                const bookIsbn = record.bookId?.isbn || 'N/A';
                const bookCategory = record.bookId?.category || 'General';

                const dueDateFormatted = borrowHelper.formatDateDisplay(record.dueDate);
                const borrowDateFormatted = borrowHelper.formatDateDisplay(record.borrowDate);

                const defaultEmailMessage = borrowHelper.generateDefaultEmailMessage({
                    studentName,
                    bookTitle,
                    dueDateFormatted,
                    daysOverdue: overdueDays,
                });

                return {
                    _id: record._id,
                    studentName,
                    studentEmail,
                    bookTitle,
                    bookAuthor,
                    bookIsbn,
                    bookCategory,
                    dueDateFormatted,
                    borrowDateFormatted,
                    overdueDays,
                    remindersSent: record.remindersSent || 0,
                    statusTier: tierInfo.tier,
                    statusLabel: tierInfo.label,
                    statusBadgeClass: tierInfo.badgeClass,
                    defaultEmailMessage,
                };
            });

            const metrics = borrowHelper.calculateOverdueSummary(processedRecords);

            let filteredRecords = [...processedRecords];

            if (status && status !== 'all') {
                const targetTier = status.trim().toUpperCase();
                filteredRecords = filteredRecords.filter((r) => r.statusTier === targetTier);
            }

            if (search && search.trim() !== '') {
                const keyword = search.trim().toLowerCase();
                filteredRecords = filteredRecords.filter((r) => {
                    return (
                        r.bookTitle.toLowerCase().includes(keyword) ||
                        r.bookAuthor.toLowerCase().includes(keyword) ||
                        r.bookIsbn.toLowerCase().includes(keyword) ||
                        r.studentName.toLowerCase().includes(keyword) ||
                        r.studentEmail.toLowerCase().includes(keyword)
                    );
                });
            }

            return res.render('admin/alerts', {
                layout: 'user',
                title: 'Overdue Alerts Management - UCC Library',
                isAdminPortal: true,
                isAdmin: true,
                user: {
                    ...req.session.user,
                    isAdmin: true,
                },
                metrics,
                records: filteredRecords,
                totalOverdueCount: filteredRecords.length,
                filters: {
                    search: search || '',
                    status: status || 'all',
                    isStatusAll: !status || status === 'all',
                    isStatusOverdue: status === 'overdue',
                    isStatusCritical: status === 'critical',
                    isStatusLost: status === 'lost',
                },
            });
        } catch (error) {
            console.error('Lỗi khi tải trang Quản lý Cảnh báo quá hạn:', error);
            return res.status(500).render('error', {
                layout: 'user',
                message: 'Không thể tải danh sách cảnh báo sách quá hạn.',
            });
        }
    }

    // [POST] /admin/alerts/:id/remind
    async sendReminder(req, res) {
        try {
            const { id } = req.params;
            const { message } = req.body;

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Mã bản ghi mượn sách không hợp lệ.',
                });
            }

            const record = await BorrowRecord.findById(id)
                .populate('userId', 'fullname email')
                .populate('bookId', 'title author');

            if (!record) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy bản ghi mượn sách cần nhắc nhở.',
                });
            }

            const studentEmail = record.userId?.email;
            if (!studentEmail) {
                return res.status(400).json({
                    success: false,
                    message: 'Sinh viên này chưa có thông tin email trong hệ thống.',
                });
            }

            const studentName = record.userId?.fullname || 'Student';
            const bookTitle = record.bookId?.title || 'Borrowed Book';
            const daysOverdue = borrowHelper.calculateOverdueDays(record.dueDate, record.returnDate);
            const dueDateFormatted = borrowHelper.formatDateDisplay(record.dueDate);

            const emailContent = message && message.trim() !== ''
                ? message.trim().replace(/\n/g, '<br>')
                : borrowHelper.generateDefaultEmailMessage({
                    studentName,
                    bookTitle,
                    dueDateFormatted,
                    daysOverdue,
                }).replace(/\n/g, '<br>');

            const emailSubject = `[UCC Library Alert] Overdue Book Reminder: ${bookTitle}`;
            const emailHtml = `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                    <div style="background-color: #ea580c; color: #fff; padding: 16px 20px; font-size: 18px; font-weight: bold;">
                        UCC Library - Overdue Alert
                    </div>
                    <div style="padding: 24px 20px;">
                        ${emailContent}
                    </div>
                    <div style="background-color: #f8fafc; padding: 12px 20px; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
                        This is an automated notification from UCC Library Management System. Please do not reply directly to this email.
                    </div>
                </div>
            `;

            const mailSent = await sendEmail(studentEmail, emailSubject, emailHtml);

            if (!mailSent) {
                return res.status(500).json({
                    success: false,
                    message: 'Không thể gửi email. Vui lòng kiểm tra lại cấu hình email dịch vụ.',
                });
            }

            record.remindersSent = (record.remindersSent || 0) + 1;
            record.lastReminderSentAt = new Date();
            await record.save();

            return res.json({
                success: true,
                message: `Đã gửi email nhắc nhở thành công đến ${studentEmail}!`,
                remindersSent: record.remindersSent,
            });
        } catch (error) {
            console.error('Lỗi khi gửi email nhắc nhở đơn lẻ:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi server khi gửi nhắc nhở: ' + error.message,
            });
        }
    }

    // [POST] /admin/alerts/bulk-remind
    async sendBulkReminders(req, res) {
        try {
            const now = new Date();
            const overdueRecords = await BorrowRecord.find({
                returnDate: null,
                dueDate: { $lt: now },
            })
                .populate('userId', 'fullname email')
                .populate('bookId', 'title author');

            if (!overdueRecords || overdueRecords.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Hiện không có trường hợp nào cần gửi nhắc nhở.',
                });
            }

            let sentSuccessCount = 0;

            for (const record of overdueRecords) {
                const studentEmail = record.userId?.email;
                if (!studentEmail) continue;

                const studentName = record.userId?.fullname || 'Student';
                const bookTitle = record.bookId?.title || 'Borrowed Book';
                const daysOverdue = borrowHelper.calculateOverdueDays(record.dueDate, record.returnDate);
                const dueDateFormatted = borrowHelper.formatDateDisplay(record.dueDate);

                const messageText = borrowHelper.generateDefaultEmailMessage({
                    studentName,
                    bookTitle,
                    dueDateFormatted,
                    daysOverdue,
                });

                const emailSubject = `[UCC Library Alert] Bulk Reminder: ${bookTitle} is Overdue`;
                const emailHtml = `
                    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                        <div style="background-color: #ea580c; color: #fff; padding: 16px 20px; font-size: 18px; font-weight: bold;">
                            UCC Library - Bulk Overdue Alert
                        </div>
                        <div style="padding: 24px 20px;">
                            ${messageText.replace(/\n/g, '<br>')}
                        </div>
                        <div style="background-color: #f8fafc; padding: 12px 20px; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
                            This is an automated notification from UCC Library Management System.
                        </div>
                    </div>
                `;

                const isSuccess = await sendEmail(studentEmail, emailSubject, emailHtml);
                if (isSuccess) {
                    record.remindersSent = (record.remindersSent || 0) + 1;
                    record.lastReminderSentAt = new Date();
                    await record.save();
                    sentSuccessCount++;
                }
            }

            return res.json({
                success: true,
                message: `Đã gửi thành công email nhắc nhở đến ${sentSuccessCount} sinh viên!`,
                sentCount: sentSuccessCount,
            });
        } catch (error) {
            console.error('Lỗi khi gửi email hàng loạt:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi máy chủ khi gửi thông báo hàng loạt: ' + error.message,
            });
        }
    }

    // [GET] /admin/alerts/export
    async exportOverdueCsv(req, res) {
        try {
            const now = new Date();
            const overdueRecords = await BorrowRecord.find({
                returnDate: null,
                dueDate: { $lt: now },
            })
                .populate('userId', 'fullname email')
                .populate('bookId', 'title author isbn category')
                .sort({ dueDate: 1 })
                .lean();

            const headers = [
                'Book Title',
                'Author',
                'ISBN',
                'Category',
                'Student Name',
                'Student Email',
                'Borrow Date',
                'Due Date',
                'Days Overdue',
                'Status',
                'Reminders Sent',
            ];

            const escapeCsv = (str) => {
                if (str === null || str === undefined) return '""';
                const clean = String(str).replace(/"/g, '""');
                return `"${clean}"`;
            };

            const rows = overdueRecords.map((r) => {
                const daysOverdue = borrowHelper.calculateOverdueDays(r.dueDate, r.returnDate);
                const tierInfo = borrowHelper.getOverdueAlertTier(daysOverdue);

                return [
                    escapeCsv(r.bookId?.title || 'Unknown Book'),
                    escapeCsv(r.bookId?.author || 'Unknown Author'),
                    escapeCsv(r.bookId?.isbn || 'N/A'),
                    escapeCsv(r.bookId?.category || 'General'),
                    escapeCsv(r.userId?.fullname || 'Unknown Student'),
                    escapeCsv(r.userId?.email || 'N/A'),
                    escapeCsv(borrowHelper.formatDateDisplay(r.borrowDate)),
                    escapeCsv(borrowHelper.formatDateDisplay(r.dueDate)),
                    escapeCsv(daysOverdue),
                    escapeCsv(tierInfo.label),
                    escapeCsv(r.remindersSent || 0),
                ].join(',');
            });

            const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');

            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', 'attachment; filename="overdue-alerts-report.csv"');
            return res.send(csvContent);
        } catch (error) {
            console.error('Lỗi khi xuất danh sách sách quá hạn ra CSV:', error);
            return res.status(500).render('error', {
                layout: 'user',
                message: 'Không thể xuất báo cáo danh sách sách quá hạn.',
            });
        }
    }
}

module.exports = new AdminController();