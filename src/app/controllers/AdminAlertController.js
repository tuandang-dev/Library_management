const mongoose = require('mongoose');
const BorrowRecord = require('../models/BorrowRecord');
const { getPaginationData } = require('../helpers/paginationHelper');
const borrowHelper = require('../../util/borrowHelper');
const { sendEmail } = require('../helpers/emailHelper');

class AdminAlertController {
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

            const pagination = getPaginationData({
                query: req.query,
                totalItems: filteredRecords.length,
                limit: 10,
            });
            const pagedRecords = filteredRecords.slice(
                pagination.skip,
                pagination.skip + pagination.limit,
            );

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
                records: pagedRecords,
                totalOverdueCount: filteredRecords.length,
                pagination,
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
                message: 'Unable to load overdue alerts list.',
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
                    message: 'Invalid borrow record ID.',
                });
            }

            const record = await BorrowRecord.findById(id)
                .populate('userId', 'fullname email')
                .populate('bookId', 'title author');

            if (!record) {
                return res.status(404).json({
                    success: false,
                    message: 'Borrow record to remind not found.',
                });
            }

            const studentEmail = record.userId?.email;
            if (!studentEmail) {
                return res.status(400).json({
                    success: false,
                    message: 'This student has no email in the system.',
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
                    message: 'Unable to send email. Please check email service configuration.',
                });
            }

            record.remindersSent = (record.remindersSent || 0) + 1;
            record.lastReminderSentAt = new Date();
            await record.save();

            return res.json({
                success: true,
                message: `Email reminder sent successfully to ${studentEmail}!`,
                remindersSent: record.remindersSent,
            });
        } catch (error) {
            console.error('Lỗi khi gửi email nhắc nhở đơn lẻ:', error);
            return res.status(500).json({
                success: false,
                message: 'Server error sending reminder: ' + error.message,
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
                    message: 'There are currently no cases requiring reminders.',
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
                message: `Successfully sent reminder emails to ${sentSuccessCount} students!`,
                sentCount: sentSuccessCount,
            });
        } catch (error) {
            console.error('Lỗi khi gửi email hàng loạt:', error);
            return res.status(500).json({
                success: false,
                message: 'Server error sending bulk reminders: ' + error.message,
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
                message: 'Unable to export overdue books report.',
            });
        }
    }
}

module.exports = new AdminAlertController();
