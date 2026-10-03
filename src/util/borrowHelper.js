/**
 * @param {Date|string|null} date
 * @returns {string}
 */
const formatDate = (date) => {
    if (!date) return 'Not returned';
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Not returned';

    return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

/**
 * @param {Date|string|null} date
 * @returns {string}
 */
const formatDateDisplay = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'N/A';
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
};

/**
 * @param {Date|string} dueDate 
 * @param {Date|string|null} returnDate 
 * @returns {number}
 */
const calculateOverdueDays = (dueDate, returnDate = null) => {
    if (returnDate) return 0;
    const due = new Date(dueDate).getTime();
    const now = Date.now();
    if (isNaN(due) || now <= due) return 0;

    return Math.floor((now - due) / (1000 * 60 * 60 * 24));
};

/**
 * @param {number} overdueDays 
 * @returns {{ tier: string, label: string, badgeClass: string }}
 */
const getOverdueAlertTier = (overdueDays) => {
    if (overdueDays >= 14) {
        return {
            tier: 'LOST',
            label: 'LOST',
            badgeClass: 'badge-tier--lost',
        };
    }
    if (overdueDays >= 7) {
        return {
            tier: 'CRITICAL',
            label: 'CRITICAL',
            badgeClass: 'badge-tier--critical',
        };
    }
    if (overdueDays >= 1) {
        return {
            tier: 'OVERDUE',
            label: 'OVERDUE',
            badgeClass: 'badge-tier--overdue',
        };
    }
    return {
        tier: 'NORMAL',
        label: 'ON TIME',
        badgeClass: 'badge-tier--normal',
    };
};

/**
 * @param {Object} params
 * @param {string} params.studentName
 * @param {string} params.bookTitle
 * @param {string} params.dueDateFormatted
 * @param {number} params.daysOverdue
 * @returns {string}
 */
const generateDefaultEmailMessage = ({ studentName, bookTitle, dueDateFormatted, daysOverdue }) => {
    return (
        `Dear ${studentName},\n\n` +
        `This is a reminder that the following book is overdue:\n\n` +
        `Title: ${bookTitle}\n` +
        `Due Date: ${dueDateFormatted}\n` +
        `Days Overdue: ${daysOverdue}\n\n` +
        `Please return this book as soon as possible.\n\n` +
        `Thank you,\nLibrary Administration`
    );
};

/**
 * @param {Array<Object>} records
 * @returns {{ totalOverdue: number, criticalCases: number, averageOverdue: number }}
 */
const calculateOverdueSummary = (records = []) => {
    const totalOverdue = records.length;
    if (totalOverdue === 0) {
        return {
            totalOverdue: 0,
            criticalCases: 0,
            averageOverdue: 0,
        };
    }

    let totalDays = 0;
    let criticalCases = 0;

    for (const record of records) {
        const days = record.overdueDays || 0;
        totalDays += days;
        if (days >= 7) {
            criticalCases += 1;
        }
    }

    const averageOverdue = Math.round(totalDays / totalOverdue);

    return {
        totalOverdue,
        criticalCases,
        averageOverdue,
    };
};

/**
 * @param {Object} record
 * @returns {Object}
 */
const processBorrowStatus = (record) => {
    const now = new Date();
    const dueDate = new Date(record.dueDate);
    const returnDate = record.returnDate ? new Date(record.returnDate) : null;

    if (returnDate) {
        return {
            statusCode: 'RETURNED',
            badgeClass: 'badge--returned',
            badgeText: 'Returned',
            isReturned: true,
            isOverdue: false,
            overdueDays: 0,
        };
    }

    if (now > dueDate) {
        const diffTime = Math.abs(now.getTime() - dueDate.getTime());
        const overdueDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        return {
            statusCode: 'OVERDUE',
            badgeClass: 'badge--overdue',
            badgeText: `Overdue (+${overdueDays}d)`,
            isReturned: false,
            isOverdue: true,
            overdueDays,
        };
    }

    return {
        statusCode: 'BORROWED',
        badgeClass: 'badge--borrowed',
        badgeText: 'Borrowed',
        isReturned: false,
        isOverdue: false,
        overdueDays: 0,
    };
};

/**
 * @param {Object} record
 * @returns {Object}
 */
const formatAdminBorrowRecord = (record) => {
    if (!record) return null;

    const statusInfo = processBorrowStatus(record);
    const isReturned = Boolean(record.returnDate);

    return {
        _id: record._id,
        ticketId: record.ticketId || '',
        bookTitle: record.bookId?.title || 'Unknown Book',
        bookAuthor: record.bookId?.author || 'Unknown Author',
        bookIsbn: record.bookId?.isbn || 'N/A',
        studentName: record.userId?.fullname || 'Unknown Student',
        studentEmail: record.userId?.email || 'N/A',
        staffName: record.staffName || 'Sarah Chen',
        borrowDateFormatted: formatDate(record.borrowDate),
        dueDateFormatted: formatDate(record.dueDate),
        returnDateFormatted: formatDate(record.returnDate),
        isReturned,
        ...statusInfo,
    };
};

module.exports = {
    formatDate,
    formatDateDisplay,
    calculateOverdueDays,
    getOverdueAlertTier,
    generateDefaultEmailMessage,
    calculateOverdueSummary,
    processBorrowStatus,
    formatAdminBorrowRecord,
};