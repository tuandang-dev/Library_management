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

module.exports = {
    formatDate,
    processBorrowStatus,
};