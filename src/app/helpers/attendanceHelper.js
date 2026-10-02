/**
 * @param {string} period 'week' | 'month' | 'year'
 * @returns {{ start: Date, end: Date, label: string }}
 */
const getPeriodDateRange = (period = 'week') => {
    const now = new Date();
    let start = new Date(now);
    let end = new Date(now);
    let label = 'This Week';

    if (period === 'month') {
        start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        label = 'This Month';
    } else if (period === 'year') {
        start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
        end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        label = 'This Year';
    } else {
        const day = now.getDay();
        const diffToMonday = now.getDate() - day + (day === 0 ? -6 : 1);
        start = new Date(now.getFullYear(), now.getMonth(), diffToMonday, 0, 0, 0, 0);

        end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        label = 'This Week';
    }

    return { start, end, label };
};

/**
 * @param {string} dateFilter 'today' | 'yesterday' | 'all'
 * @returns {{ $gte?: Date, $lte?: Date } | null}
 */
const getDateFilterRange = (dateFilter = 'today') => {
    const now = new Date();

    if (dateFilter === 'today') {
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        return { $gte: start, $lte: end };
    }

    if (dateFilter === 'yesterday') {
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        const start = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 0, 0, 0, 0);
        const end = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59, 999);
        return { $gte: start, $lte: end };
    }

    return null;
};

/**
 * @param {Object} record Mongoose Lean Document của Attendance
 * @returns {Object}
 */
const formatAttendanceRecord = (record) => {
    const date = record.checkInTime ? new Date(record.checkInTime) : new Date();

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const monthDay = `${months[date.getMonth()]} ${date.getDate()}`;
    const dayOfWeek = days[date.getDay()];

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const checkInTimeFormatted = `${hours}:${minutes}`;

    const studentName = record.userId?.fullname || 'Unknown Visitor';
    const studentEmail = record.userId?.email || 'N/A';

    return {
        _id: record._id,
        studentName,
        studentEmail,
        monthDay,
        dayOfWeek,
        checkInTimeFormatted,
        method: record.method || 'QR_CODE',
        location: record.location || 'Library Entrance',
        statusLabel: 'Visited',
        statusDescription: 'Library attendance',
    };
};

module.exports = {
    getPeriodDateRange,
    getDateFilterRange,
    formatAttendanceRecord,
};