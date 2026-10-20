const User = require('../models/User');
const Book = require('../models/Book');
const Attendance = require('../models/Attendance');
const BorrowRecord = require('../models/BorrowRecord');
const adminUserController = require('./AdminUserController');
const adminBookController = require('./AdminBookController');
const adminScannerController = require('./AdminScannerController');
const adminAttendanceController = require('./AdminAttendanceController');
const adminAlertController = require('./AdminAlertController');

class AdminController {
    // [GET] /admin/dashboard
    async dashboard(req, res) {
        try {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
            const todayDateKey = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(now);

            // 1. Thống kê tổng quan qua Promise.all
            const [
                totalUsers,
                newUsersThisMonth,
                bookInventoryAgg,
                dailyVisitorsCount,
                topVisitorsAgg,
            ] = await Promise.all([
                User.countDocuments({ deleted: { $ne: true } }),
                User.countDocuments({ deleted: { $ne: true }, createdAt: { $gte: startOfMonth } }),
                Book.aggregate([
                    { $match: { deleted: { $ne: true } } },
                    {
                        $group: {
                            _id: null,
                            totalCopies: { $sum: '$totalQuantity' },
                            availableCopies: { $sum: '$availableQuantity' },
                        },
                    },
                ]),
                Attendance.countDocuments({ dateKey: todayDateKey }),
                Attendance.aggregate([
                    {
                        $group: {
                            _id: '$userId',
                            count: { $sum: 1 },
                        },
                    },
                    { $sort: { count: -1 } },
                    { $limit: 5 },
                    {
                        $lookup: {
                            from: 'users',
                            localField: '_id',
                            foreignField: '_id',
                            as: 'userInfo',
                        },
                    },
                    { $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true } },
                    {
                        $project: {
                            fullname: { $ifNull: ['$userInfo.fullname', 'Unknown Reader'] },
                            count: 1,
                        },
                    },
                ]),
            ]);

            const inventory = bookInventoryAgg.length > 0
                ? bookInventoryAgg[0]
                : { totalCopies: 0, availableCopies: 0 };

            const totalCopies = inventory.totalCopies || 0;
            const availableCopies = inventory.availableCopies || 0;
            const availabilityPercent = totalCopies > 0
                ? Math.round((availableCopies / totalCopies) * 100)
                : 0;

            const metrics = {
                totalUsers: {
                    value: new Intl.NumberFormat('en-US').format(totalUsers || 0),
                    growth: `+${newUsersThisMonth || 0} this month`,
                },
                activeBooks: {
                    value: new Intl.NumberFormat('en-US').format(totalCopies),
                    availability: `${availabilityPercent}% available`,
                },
                dailyVisitors: {
                    value: new Intl.NumberFormat('en-US').format(dailyVisitorsCount || 0),
                    timeLabel: 'Today',
                },
            };

            // 2. Dữ liệu Top Visitors Chart
            const topVisitorsChart = {
                labels: topVisitorsAgg.length > 0 ? topVisitorsAgg.map((v) => v.fullname) : [],
                data: topVisitorsAgg.length > 0 ? topVisitorsAgg.map((v) => v.count) : [],
            };

            // 3. Dữ liệu Weekly Activity Chart (7 ngày gần nhất kết thúc vào hôm nay)
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const last7Days = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
                const dateKey = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(d);
                const dayLabel = dayNames[d.getDay()];

                const startOfDay = new Date(d);
                startOfDay.setHours(0, 0, 0, 0);
                const endOfDay = new Date(d);
                endOfDay.setHours(23, 59, 59, 999);

                last7Days.push({
                    dateKey,
                    dayLabel,
                    startOfDay,
                    endOfDay,
                });
            }

            const sevenDaysStart = last7Days[0].startOfDay;
            const sevenDaysEnd = last7Days[last7Days.length - 1].endOfDay;

            const [weeklyAttendanceAgg, weeklyBorrowAgg] = await Promise.all([
                Attendance.aggregate([
                    {
                        $match: {
                            dateKey: { $in: last7Days.map((d) => d.dateKey) },
                        },
                    },
                    {
                        $group: {
                            _id: '$dateKey',
                            count: { $sum: 1 },
                        },
                    },
                ]),
                BorrowRecord.find({
                    borrowDate: { $gte: sevenDaysStart, $lte: sevenDaysEnd },
                }).select('borrowDate').lean(),
            ]);

            const attendanceCountByDateKey = new Map();
            for (const item of weeklyAttendanceAgg) {
                attendanceCountByDateKey.set(item._id, item.count);
            }

            const borrowCountByDateKey = new Map();
            for (const record of weeklyBorrowAgg) {
                const recDate = new Date(record.borrowDate);
                const recDateKey = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(recDate);
                borrowCountByDateKey.set(recDateKey, (borrowCountByDateKey.get(recDateKey) || 0) + 1);
            }

            const weeklyActivityChart = {
                labels: last7Days.map((d) => d.dayLabel),
                visitors: last7Days.map((d) => attendanceCountByDateKey.get(d.dateKey) || 0),
                borrowed: last7Days.map((d) => borrowCountByDateKey.get(d.dateKey) || 0),
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
                message: 'Unable to load admin dashboard.',
            });
        }
    }

    // Delegate to AdminUserController (Quản lý người dùng)
    users = adminUserController.users.bind(adminUserController);
    createUser = adminUserController.createUser.bind(adminUserController);
    bulkImport = adminUserController.bulkImport.bind(adminUserController);
    updateStatus = adminUserController.updateStatus.bind(adminUserController);
    deleteUser = adminUserController.deleteUser.bind(adminUserController);

    // Delegate to AdminBookController (Quản lý sách)
    books = adminBookController.books.bind(adminBookController);
    createBook = adminBookController.createBook.bind(adminBookController);
    updateBook = adminBookController.updateBook.bind(adminBookController);
    deleteBook = adminBookController.deleteBook.bind(adminBookController);
    exportBooks = adminBookController.exportBooks.bind(adminBookController);
    bulkImportBooks = adminBookController.bulkImportBooks.bind(adminBookController);

    // Delegate to AdminAlertController (Quản lý cảnh báo quá hạn)
    overdueAlerts = adminAlertController.overdueAlerts.bind(adminAlertController);
    sendReminder = adminAlertController.sendReminder.bind(adminAlertController);
    sendBulkReminders = adminAlertController.sendBulkReminders.bind(adminAlertController);
    exportOverdueCsv = adminAlertController.exportOverdueCsv.bind(adminAlertController);

    // Delegate to AdminAttendanceController (Điểm danh, lịch sử, nhật ký)
    activityLogs = adminAttendanceController.activityLogs.bind(adminAttendanceController);
    attendance = adminAttendanceController.attendance.bind(adminAttendanceController);
    exportAttendanceLogs = adminAttendanceController.exportAttendanceLogs.bind(adminAttendanceController);
    history = adminAttendanceController.history.bind(adminAttendanceController);
    exportHistoryCsv = adminAttendanceController.exportHistoryCsv.bind(adminAttendanceController);

    // Delegate to AdminScannerController (Quét mã QR và lưu thông mượn/trả)
    scanner = adminScannerController.scanner.bind(adminScannerController);
    verifyTicket = adminScannerController.verifyTicket.bind(adminScannerController);
    checkoutTicket = adminScannerController.checkoutTicket.bind(adminScannerController);
    returnBooks = adminScannerController.returnBooks.bind(adminScannerController);
    recordAttendanceScan = adminScannerController.recordAttendanceScan.bind(adminScannerController);
}

module.exports = new AdminController();