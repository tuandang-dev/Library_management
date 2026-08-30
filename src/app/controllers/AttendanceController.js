const Attendance = require('../models/Attendance');
const User = require('../models/User');

class AttendanceController {
    // [GET] /attendance
    async index(req, res) {
        try {
            const currentUser = req.session.user;

            const userInDb = await User.findById(currentUser._id).lean();
            const studentId = userInDb?.studentId || '';

            const period = (req.query.period || 'month').toLowerCase();
            const now = new Date();
            let startDate;
            let endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

            switch (period) {
                case 'day':
                    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
                    break;
                case 'week': {
                    const dayOfWeek = now.getDay();
                    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
                    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToMonday, 0, 0, 0, 0);
                    break;
                }
                case 'year':
                    startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
                    break;
                case 'month':
                default:
                    startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
                    break;
            }

            const [totalVisits, recordsData] = await Promise.all([
                Attendance.countDocuments({ userId: currentUser._id }),
                Attendance.find({
                    userId: currentUser._id,
                    checkInTime: { $gte: startDate, $lte: endDate },
                })
                    .sort({ checkInTime: -1 })
                    .lean(),
            ]);

            const formattedRecords = recordsData.map((record) => {
                const dateObj = new Date(record.checkInTime);
                const hours = String(dateObj.getHours()).padStart(2, '0');
                const minutes = String(dateObj.getMinutes()).padStart(2, '0');
                const day = String(dateObj.getDate()).padStart(2, '0');
                const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                const year = dateObj.getFullYear();

                return {
                    ...record,
                    formattedTime: `${hours}:${minutes} - ${day}/${month}/${year}`,
                };
            });

            return res.render('attendance', {
                title: 'My Attendance - UCC Library',
                layout: 'user',
                user: currentUser,
                studentId: studentId,
                totalVisits: totalVisits,
                records: formattedRecords,
                selectedPeriod: period,
                isDay: period === 'day',
                isWeek: period === 'week',
                isMonth: period === 'month' || !['day', 'week', 'year'].includes(period),
                isYear: period === 'year',
                isAttendancePage: true,
            });
        } catch (error) {
            console.error('Lỗi tại AttendanceController.index:', error);
            return res.status(500).send('Lỗi máy chủ!');
        }
    }
}

module.exports = new AttendanceController();