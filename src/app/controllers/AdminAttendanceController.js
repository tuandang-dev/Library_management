const mongoose = require('mongoose');
const User = require('../models/User');
const Book = require('../models/Book');
const BorrowRecord = require('../models/BorrowRecord');
const Attendance = require('../models/Attendance');
const ActivityLog = require('../models/ActivityLog');
const attendanceHelper = require('../helpers/attendanceHelper');
const { getPaginationData } = require('../helpers/paginationHelper');
const borrowHelper = require('../../util/borrowHelper');
const escapeRegex = require('../../util/escapeRegex');

class AdminAttendanceController {
    // [GET] /admin/attendance
    async attendance(req, res) {
        try {
            const { period = 'week', search, date = 'today' } = req.query;

            const periodRange = attendanceHelper.getPeriodDateRange(period);

            const attendanceFilter = {};
            const dateRange = attendanceHelper.getDateFilterRange(date);
            if (dateRange) {
                attendanceFilter.checkInTime = dateRange;
            }

            if (search && search.trim() !== '') {
                const keyword = escapeRegex(search.trim());
                const matchedUsers = await User.find({
                    $or: [
                        { fullname: { $regex: keyword, $options: 'i' } },
                        { email: { $regex: keyword, $options: 'i' } },
                    ],
                }).select('_id').lean();

                const userIds = matchedUsers.map((u) => u._id);
                attendanceFilter.userId = { $in: userIds };
            }

            const totalFiltered = await Attendance.countDocuments(attendanceFilter);
            const pagination = getPaginationData({
                query: req.query,
                totalItems: totalFiltered,
                limit: 10,
            });

            const [periodVisitorsCount, rawRecords] = await Promise.all([
                Attendance.countDocuments({
                    checkInTime: { $gte: periodRange.start, $lte: periodRange.end },
                }),
                Attendance.find(attendanceFilter)
                    .populate('userId', 'fullname email studentId')
                    .sort({ checkInTime: -1 })
                    .skip(pagination.skip)
                    .limit(pagination.limit)
                    .lean(),
            ]);

            const records = rawRecords.map(attendanceHelper.formatAttendanceRecord);

            return res.render('admin/attendance', {
                layout: 'user',
                title: 'Attendance Logs - UCC Library',
                isAdminPortal: true,
                isAdmin: true,
                isAttendancePage: true,
                user: {
                    ...req.session.user,
                    isAdmin: true,
                },
                periodVisitorsCount,
                periodLabel: periodRange.label,
                records,
                showingCount: records.length,
                totalAttendanceCount: totalFiltered,
                pagination,
                filters: {
                    period,
                    search: search || '',
                    date,
                    isWeek: period === 'week',
                    isMonth: period === 'month',
                    isYear: period === 'year',
                    isDateToday: date === 'today',
                    isDateYesterday: date === 'yesterday',
                    isDateAll: date === 'all',
                },
            });
        } catch (error) {
            console.error('Lỗi khi tải trang Quản lý Điểm danh:', error);
            return res.status(500).render('error', {
                layout: 'user',
                message: 'Unable to load attendance logs and analytics.',
            });
        }
    }

    // [GET] /admin/attendance/export
    async exportAttendanceLogs(req, res) {
        try {
            const { search, date } = req.query;
            const filter = {};

            if (date && date !== 'all') {
                const dateRange = attendanceHelper.getDateFilterRange(date);
                if (dateRange) {
                    filter.checkInTime = dateRange;
                }
            }

            if (search && search.trim() !== '') {
                const keyword = escapeRegex(search.trim());
                const matchedUsers = await User.find({
                    $or: [
                        { fullname: { $regex: keyword, $options: 'i' } },
                        { email: { $regex: keyword, $options: 'i' } },
                    ],
                }).select('_id').lean();

                const userIds = matchedUsers.map((u) => u._id);
                filter.userId = { $in: userIds };
            }

            const rawRecords = await Attendance.find(filter)
                .populate('userId', 'fullname email studentId')
                .sort({ checkInTime: -1 })
                .lean();

            const headers = [
                'Student Name',
                'Student Email',
                'Date',
                'Day of Week',
                'Check-in Time',
                'Method',
                'Location',
                'Status',
            ];

            const escapeCsv = (str) => {
                if (str === null || str === undefined) return '""';
                const clean = String(str).replace(/"/g, '""');
                return `"${clean}"`;
            };

            const rows = rawRecords.map((record) => {
                const formatted = attendanceHelper.formatAttendanceRecord(record);
                return [
                    escapeCsv(formatted.studentName),
                    escapeCsv(formatted.studentEmail),
                    escapeCsv(formatted.monthDay),
                    escapeCsv(formatted.dayOfWeek),
                    escapeCsv(formatted.checkInTimeFormatted),
                    escapeCsv(formatted.method),
                    escapeCsv(formatted.location),
                    escapeCsv(formatted.statusLabel),
                ].join(',');
            });

            const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');

            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', 'attachment; filename="attendance-logs-report.csv"');
            return res.send(csvContent);
        } catch (error) {
            console.error('Lỗi khi xuất danh sách điểm danh ra CSV:', error);
            return res.status(500).render('error', {
                layout: 'user',
                message: 'Unable to export attendance data to CSV.',
            });
        }
    }

    // [GET] /admin/history
    async history(req, res) {
        try {
            const { search, status } = req.query;
            const now = new Date();
            const queryFilter = {};

            if (status && status !== 'all') {
                if (status === 'returned') {
                    queryFilter.returnDate = { $ne: null };
                } else if (status === 'borrowed') {
                    queryFilter.returnDate = null;
                    queryFilter.dueDate = { $gte: now };
                } else if (status === 'overdue') {
                    queryFilter.returnDate = null;
                    queryFilter.dueDate = { $lt: now };
                }
            }

            if (search && search.trim() !== '') {
                const keyword = escapeRegex(search.trim());
                const [matchedUsers, matchedBooks] = await Promise.all([
                    User.find({ fullname: { $regex: keyword, $options: 'i' } }).select('_id').lean(),
                    Book.find({ title: { $regex: keyword, $options: 'i' } }).select('_id').lean(),
                ]);

                const userIds = matchedUsers.map((u) => u._id);
                const bookIds = matchedBooks.map((b) => b._id);

                queryFilter.$or = [
                    { userId: { $in: userIds } },
                    { bookId: { $in: bookIds } },
                ];
            }

            const totalFilteredRecords = await BorrowRecord.countDocuments(queryFilter);
            const pagination = getPaginationData({
                query: req.query,
                totalItems: totalFilteredRecords,
                limit: 10,
            });

            const [
                totalRecordsCount,
                currentlyBorrowedCount,
                returnedCount,
                overdueCount,
                rawRecords,
            ] = await Promise.all([
                BorrowRecord.countDocuments(),
                BorrowRecord.countDocuments({ returnDate: null, dueDate: { $gte: now } }),
                BorrowRecord.countDocuments({ returnDate: { $ne: null } }),
                BorrowRecord.countDocuments({ returnDate: null, dueDate: { $lt: now } }),
                BorrowRecord.find(queryFilter)
                    .populate('userId', 'fullname email')
                    .populate('bookId', 'title author isbn category')
                    .sort({ borrowDate: -1, createdAt: -1 })
                    .skip(pagination.skip)
                    .limit(pagination.limit)
                    .lean(),
            ]);

            const records = rawRecords.map(borrowHelper.formatAdminBorrowRecord);

            const metrics = {
                total: totalRecordsCount,
                borrowed: currentlyBorrowedCount,
                returned: returnedCount,
                overdue: overdueCount,
            };

            return res.render('admin/history', {
                layout: 'user',
                title: 'Borrowing History - UCC Library',
                isAdminPortal: true,
                isAdmin: true,
                isHistoryPage: true,
                user: {
                    ...req.session.user,
                    isAdmin: true,
                },
                metrics,
                records,
                showingCount: records.length,
                totalRecordsCount: totalFilteredRecords,
                pagination,
                filters: {
                    search: search || '',
                    status: status || 'all',
                    isStatusAll: !status || status === 'all',
                    isStatusBorrowed: status === 'borrowed',
                    isStatusReturned: status === 'returned',
                    isStatusOverdue: status === 'overdue',
                },
            });
        } catch (error) {
            console.error('Lỗi khi tải lịch sử mượn trả toàn hệ thống:', error);
            return res.status(500).render('error', {
                layout: 'user',
                message: 'Unable to load system-wide borrowing history.',
            });
        }
    }

    // [GET] /admin/history/export
    async exportHistoryCsv(req, res) {
        try {
            const { search, status } = req.query;
            const now = new Date();
            const queryFilter = {};

            if (status && status !== 'all') {
                if (status === 'returned') {
                    queryFilter.returnDate = { $ne: null };
                } else if (status === 'borrowed') {
                    queryFilter.returnDate = null;
                    queryFilter.dueDate = { $gte: now };
                } else if (status === 'overdue') {
                    queryFilter.returnDate = null;
                    queryFilter.dueDate = { $lt: now };
                }
            }

            if (search && search.trim() !== '') {
                const keyword = escapeRegex(search.trim());
                const [matchedUsers, matchedBooks] = await Promise.all([
                    User.find({ fullname: { $regex: keyword, $options: 'i' } }).select('_id').lean(),
                    Book.find({ title: { $regex: keyword, $options: 'i' } }).select('_id').lean(),
                ]);

                const userIds = matchedUsers.map((u) => u._id);
                const bookIds = matchedBooks.map((b) => b._id);

                queryFilter.$or = [
                    { userId: { $in: userIds } },
                    { bookId: { $in: bookIds } },
                ];
            }

            const rawRecords = await BorrowRecord.find(queryFilter)
                .populate('userId', 'fullname email')
                .populate('bookId', 'title author isbn category')
                .sort({ borrowDate: -1, createdAt: -1 })
                .lean();

            const records = rawRecords.map(borrowHelper.formatAdminBorrowRecord);

            const headers = [
                'Book Title',
                'Author',
                'ISBN',
                'Student Name',
                'Student Email',
                'Borrow Date',
                'Due Date',
                'Return Date',
                'Staff',
                'Status',
                'Days Overdue',
            ];

            const escapeCsv = (str) => {
                if (str === null || str === undefined) return '""';
                const clean = String(str).replace(/"/g, '""');
                return `"${clean}"`;
            };

            const rows = records.map((r) => [
                escapeCsv(r.bookTitle),
                escapeCsv(r.bookAuthor),
                escapeCsv(r.bookIsbn),
                escapeCsv(r.studentName),
                escapeCsv(r.studentEmail),
                escapeCsv(r.borrowDateFormatted),
                escapeCsv(r.dueDateFormatted),
                escapeCsv(r.returnDateFormatted),
                escapeCsv(r.staffName),
                escapeCsv(r.badgeText),
                escapeCsv(r.overdueDays),
            ].join(','));

            const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');

            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', 'attachment; filename="borrowing-history-report.csv"');
            return res.send(csvContent);
        } catch (error) {
            console.error('Lỗi khi xuất danh sách lịch sử mượn trả ra CSV:', error);
            return res.status(500).render('error', {
                layout: 'user',
                message: 'Unable to export borrowing history to CSV.',
            });
        }
    }

    // [GET] /admin/logs
    async activityLogs(req, res) {
        try {
            const { search, category } = req.query;
            const filter = {};

            if (category && category !== 'all') {
                filter.category = category.trim().toLowerCase();
            }

            if (search && search.trim() !== '') {
                const keyword = escapeRegex(search.trim());
                filter.$or = [
                    { action: { $regex: keyword, $options: 'i' } },
                    { description: { $regex: keyword, $options: 'i' } },
                    { 'actor.name': { $regex: keyword, $options: 'i' } },
                    { 'actor.role': { $regex: keyword, $options: 'i' } },
                    { categoryLabel: { $regex: keyword, $options: 'i' } },
                ];
            }

            const totalFilteredLogs = await ActivityLog.countDocuments(filter);
            const pagination = getPaginationData({
                query: req.query,
                totalItems: totalFilteredLogs,
                limit: 15,
            });

            const [
                rawLogs,
                totalLogsCount,
                authCount,
                booksCount,
                usersCount,
                attendanceCount,
                systemCount,
            ] = await Promise.all([
                ActivityLog.find(filter)
                    .sort({ createdAt: -1 })
                    .skip(pagination.skip)
                    .limit(pagination.limit)
                    .lean(),
                ActivityLog.countDocuments(),
                ActivityLog.countDocuments({ category: 'authentication' }),
                ActivityLog.countDocuments({ category: 'books' }),
                ActivityLog.countDocuments({ category: 'users' }),
                ActivityLog.countDocuments({ category: 'attendance' }),
                ActivityLog.countDocuments({ category: 'system' }),
            ]);

            const formatLogTime = (date) => {
                if (!date) return 'N/A';
                const d = new Date(date);
                if (isNaN(d.getTime())) return 'N/A';

                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const month = months[d.getMonth()];
                const day = d.getDate();

                let hours = d.getHours();
                const minutes = d.getMinutes().toString().padStart(2, '0');
                const ampm = hours >= 12 ? 'PM' : 'AM';
                hours = hours % 12;
                hours = hours ? hours.toString().padStart(2, '0') : '12';

                return `${month} ${day} · ${hours}:${minutes} ${ampm}`;
            };

            const logs = rawLogs.map((log) => {
                const formattedTime = formatLogTime(log.createdAt);
                const isSystem = !log.actor?.name || log.actor.name.toLowerCase() === 'system';

                const actorDisplayText = isSystem
                    ? 'System'
                    : `${log.actor.name}${log.actor.role ? ` (${log.actor.role})` : ''}`;

                return {
                    ...log,
                    formattedTime,
                    actorDisplayText,
                    badgeModifier: log.category || 'system',
                };
            });

            const metrics = {
                total: totalLogsCount,
                auth: authCount,
                books: booksCount,
                users: usersCount,
                attendance: attendanceCount,
                system: systemCount,
            };

            const categoryOptions = [
                { value: 'all', label: 'All Categories', isSelected: !category || category === 'all' },
                { value: 'authentication', label: 'Authentication', isSelected: category === 'authentication' },
                { value: 'books', label: 'Books', isSelected: category === 'books' },
                { value: 'users', label: 'Users', isSelected: category === 'users' },
                { value: 'attendance', label: 'Attendance', isSelected: category === 'attendance' },
                { value: 'system', label: 'System', isSelected: category === 'system' },
            ];

            return res.render('admin/activity-logs', {
                layout: 'user',
                title: 'Global Activity Logs - UCC Library',
                isAdminPortal: true,
                isAdmin: true,
                user: {
                    ...req.session.user,
                    isAdmin: true,
                },
                metrics,
                logs,
                showingCount: logs.length,
                totalLogsCount: totalFilteredLogs,
                pagination,
                categoryOptions,
                filters: {
                    search: search || '',
                    category: category || 'all',
                },
            });
        } catch (error) {
            console.error('Lỗi khi tải Global Activity Logs:', error);
            return res.status(500).render('error', {
                layout: 'user',
                message: 'Unable to load system activity logs.',
            });
        }
    }
}

module.exports = new AdminAttendanceController();
