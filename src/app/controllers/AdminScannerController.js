const mongoose = require('mongoose');
const User = require('../models/User');
const BorrowTicket = require('../models/BorrowTicket');
const BorrowRecord = require('../models/BorrowRecord');
const ActivityLog = require('../models/ActivityLog');
const Attendance = require('../models/Attendance');
const escapeRegex = require('../../util/escapeRegex');
const circulationService = require('../services/circulationService');

class AdminScannerController {
    // [GET] /admin/scanner
    async scanner(req, res) {
        try {
            const recentLogs = await ActivityLog.find({
                category: { $in: ['books', 'attendance'] },
            })
                .sort({ createdAt: -1 })
                .limit(5)
                .lean();

            const formatScanTime = (date) => {
                if (!date) return 'N/A';
                const d = new Date(date);
                if (isNaN(d.getTime())) return 'N/A';
                const pad = (n) => String(n).padStart(2, '0');
                return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
            };

            const recentScans = recentLogs.map((log) => {
                const isCheckout = log.action && log.action.toLowerCase().includes('borrow');
                const isReturn = log.action && log.action.toLowerCase().includes('return');

                let badgeClass = 'admin-scanner__badge--neutral';
                let badgeText = log.categoryLabel || 'Recorded';

                if (isCheckout) {
                    badgeClass = 'admin-scanner__badge--checkout';
                    badgeText = 'Checkout Completed';
                } else if (isReturn) {
                    badgeClass = 'admin-scanner__badge--return';
                    badgeText = 'Book Returned';
                }

                return {
                    _id: log._id,
                    studentName: log.actor?.name || 'Student Reader',
                    studentIdentifier: log.actor?.role === 'user' ? 'STU-VERIFIED' : (log.actor?.role || 'STUDENT'),
                    description: log.description || 'Processed transaction at desk',
                    staffName: req.session.user?.fullname || 'Sarah Chen',
                    formattedTime: formatScanTime(log.createdAt),
                    badgeClass,
                    badgeText,
                };
            });

            return res.render('admin/scanner', {
                layout: 'user',
                title: 'QR Code Scanner - UCC Library',
                isAdminPortal: true,
                isAdmin: true,
                isScannerPage: true,
                user: {
                    ...req.session.user,
                    isAdmin: true,
                },
                recentScans,
            });
        } catch (error) {
            console.error('Lỗi khi tải trang Admin Scanner:', error);
            return res.status(500).render('error', {
                layout: 'user',
                message: 'Unable to initialize admin QR scanner.',
            });
        }
    }

    // [POST] /admin/scanner/verify
    async verifyTicket(req, res) {
        try {
            const { ticketData } = req.body;
            if (!ticketData || String(ticketData).trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide a valid ticket ID or QR code data.',
                });
            }

            let searchKey = String(ticketData).trim();

            if (searchKey.startsWith('{') && searchKey.endsWith('}')) {
                try {
                    const parsedJson = JSON.parse(searchKey);
                    if (parsedJson.ticketId) {
                        searchKey = String(parsedJson.ticketId).trim();
                    }
                } catch (e) {
                }
            }

            const formatTicketDate = (date) => {
                const d = date ? new Date(date) : new Date();
                if (isNaN(d.getTime())) return new Date().toLocaleString('en-US');
                const pad = (n) => String(n).padStart(2, '0');
                const month = pad(d.getMonth() + 1);
                const day = pad(d.getDate());
                const year = d.getFullYear();
                let hours = d.getHours();
                const minutes = pad(d.getMinutes());
                const seconds = pad(d.getSeconds());
                const ampm = hours >= 12 ? 'PM' : 'AM';
                hours = hours % 12;
                hours = hours ? pad(hours) : '12';
                return `${month}/${day}/${year}, ${hours}:${minutes}:${seconds} ${ampm}`;
            };

            const safeSearchPattern = new RegExp(`^${escapeRegex(searchKey)}$`, 'i');

            const ticket = await BorrowTicket.findOne({
                ticketId: { $regex: safeSearchPattern },
            })
                .populate('userId', 'fullname email')
                .lean();

            if (ticket) {
                if (ticket.status === 'COMPLETED') {
                    return res.status(400).json({
                        success: false,
                        message: `Borrow ticket "${ticket.ticketId}" has already been checked out!`,
                    });
                }

                if (ticket.status === 'CANCELLED') {
                    return res.status(400).json({
                        success: false,
                        message: `Borrow ticket "${ticket.ticketId}" has been cancelled!`,
                    });
                }

                const studentName = ticket.userId?.fullname || 'Student Reader';
                const studentCode = ticket.userId?.email
                    ? ticket.userId.email.split('@')[0].toUpperCase()
                    : 'STU-001';

                const books = (ticket.items || []).map((item) => ({
                    bookId: item.bookId,
                    title: item.title,
                    author: item.author,
                    isbn: item.isbn || 'N/A',
                    category: item.category || 'General',
                }));

                return res.json({
                    success: true,
                    message: 'Ticket verified successfully!',
                    data: {
                        ticketId: ticket.ticketId,
                        ticketDbId: ticket._id,
                        userId: ticket.userId?._id,
                        studentName,
                        studentCode,
                        studentEmail: ticket.userId?.email || 'N/A',
                        generatedAt: formatTicketDate(ticket.generatedAt || ticket.createdAt),
                        status: ticket.status,
                        books,
                    },
                });
            }

            const userFilter = [{ email: searchKey.toLowerCase() }];
            if (mongoose.Types.ObjectId.isValid(searchKey)) {
                userFilter.push({ _id: searchKey });
            }

            const matchedUser = await User.findOne({ $or: userFilter }).lean();

            if (matchedUser) {
                const activeBorrowRecords = await BorrowRecord.find({
                    userId: matchedUser._id,
                    returnDate: null,
                })
                    .populate('bookId', 'title author isbn category')
                    .lean();

                const books = activeBorrowRecords.map((record) => ({
                    bookId: record.bookId?._id || record.bookId,
                    title: record.bookId?.title || 'Unknown Title',
                    author: record.bookId?.author || 'Unknown Author',
                    isbn: record.bookId?.isbn || 'N/A',
                    category: record.bookId?.category || 'General',
                    borrowRecordId: record._id,
                }));

                return res.json({
                    success: true,
                    message: 'Student identified successfully!',
                    data: {
                        ticketId: `USER-${matchedUser._id.toString().slice(-6).toUpperCase()}`,
                        ticketDbId: null,
                        userId: matchedUser._id,
                        studentName: matchedUser.fullname,
                        studentCode: matchedUser.email.split('@')[0].toUpperCase(),
                        studentEmail: matchedUser.email,
                        generatedAt: formatTicketDate(new Date()),
                        status: 'ACTIVE',
                        books,
                    },
                });
            }

            return res.status(404).json({
                success: false,
                message: `No ticket or student found matching "${searchKey}".`,
            });
        } catch (error) {
            console.error('Lỗi khi xác thực vé mượn QR:', error);
            return res.status(500).json({
                success: false,
                message: 'Server error verifying ticket: ' + error.message,
            });
        }
    }

    // [POST] /admin/scanner/checkout
    async checkoutTicket(req, res) {
        try {
            const { ticketId, userId } = req.body;
            const staffName = req.session.user?.fullname;
            const actorRole = req.session.user?.role || 'admin';

            const result = await circulationService.checkoutTicket({
                ticketId,
                userId,
                staffName,
                actorRole,
            });

            return res.json(result);
        } catch (error) {
            console.error('Lỗi khi thực hiện Checkout vé mượn:', error);
            const statusCode = error.statusCode || 500;
            return res.status(statusCode).json({
                success: false,
                message: error.statusCode ? error.message : ('Server error completing checkout: ' + error.message),
            });
        }
    }

    // [POST] /admin/scanner/return
    async returnBooks(req, res) {
        try {
            const { userId, books } = req.body;
            const staffName = req.session.user?.fullname || 'Sarah Chen';
            const actorRole = req.session.user?.role || 'admin';

            const result = await circulationService.returnBooks({
                userId,
                books,
                staffName,
                actorRole,
            });

            return res.json(result);
        } catch (error) {
            console.error('Lỗi khi xử lý trả sách:', error);
            const statusCode = error.statusCode || 500;
            return res.status(statusCode).json({
                success: false,
                message: error.statusCode ? error.message : ('Server error processing return: ' + error.message),
            });
        }
    }

    // [POST] /admin/scanner/attendance
    async recordAttendanceScan(req, res) {
        try {
            const { userId, studentCode } = req.body;
            const staffName = req.session.user?.fullname || 'Sarah Chen';

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: 'Student information not found for attendance.',
                });
            }

            const student = await User.findById(userId).lean();
            if (!student) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found in database.',
                });
            }

            const dateKey = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date());

            const newAttendance = await Attendance.create({
                userId: student._id,
                studentId: studentCode || student.studentId || student.email.split('@')[0].toUpperCase(),
                dateKey: dateKey,
                checkInTime: new Date(),
                method: 'QR_CODE',
                location: 'Desk Scanner',
                notes: 'Recorded via Admin QR Scanner desk',
            });

            await ActivityLog.create({
                category: 'attendance',
                categoryLabel: 'Attendance',
                action: 'Record Attendance',
                description: `Recorded library check-in for ${student.fullname} (${student.email})`,
                actor: {
                    name: staffName,
                    role: req.session.user?.role || 'admin',
                },
            });

            return res.json({
                success: true,
                message: `Attendance recorded successfully for student ${student.fullname}!`,
                data: {
                    attendanceId: newAttendance._id,
                    studentName: student.fullname,
                    checkInTime: newAttendance.checkInTime,
                },
            });
        } catch (error) {
            if (error.code === 11000) {
                return res.status(400).json({
                    success: false,
                    message: 'You have already checked in today',
                });
            }
            console.error('Lỗi khi ghi nhận điểm danh qua Scanner:', error);
            return res.status(500).json({
                success: false,
                message: 'Server error recording attendance: ' + error.message,
            });
        }
    }
}

module.exports = new AdminScannerController();
