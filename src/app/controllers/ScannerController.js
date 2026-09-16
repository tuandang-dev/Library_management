const Attendance = require('../models/Attendance');
const User = require('../models/User');

class ScannerController {
    // [GET] /scanner
    async index(req, res) {
        try {
            const currentUser = req.session.user;

            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);

            const latestAttendance = await Attendance.findOne({
                userId: currentUser._id,
                checkInTime: { $gte: startOfDay, $lte: endOfDay },
            })
                .sort({ checkInTime: -1 })
                .lean();

            let activeSessionTime = null;
            if (latestAttendance) {
                const dateObj = new Date(latestAttendance.checkInTime);
                const hours = String(dateObj.getHours()).padStart(2, '0');
                const minutes = String(dateObj.getMinutes()).padStart(2, '0');
                activeSessionTime = `${hours}:${minutes}`;
            }

            return res.render('scanner', {
                title: 'Attendance QR Scanner - UCC Library',
                layout: 'user',
                user: currentUser,
                hasActiveSession: Boolean(latestAttendance),
                activeSessionTime: activeSessionTime,
                isScannerPage: true,
            });
        } catch (error) {
            console.error('Lỗi tại ScannerController.index:', error);
            return res.status(500).send('Lỗi máy chủ nội bộ!');
        }
    }

    // [POST] /scanner/check-in
    async checkIn(req, res) {
        try {
            const currentUser = req.session.user;
            const { location = 'Library Entrance', notes = '' } = req.body;

            let studentId = currentUser.studentId;
            if (!studentId) {
                const userInDb = await User.findById(currentUser._id).lean();
                studentId = userInDb?.studentId || 'N/A';
            }

            const newAttendance = await Attendance.create({
                userId: currentUser._id,
                studentId: studentId,
                checkInTime: new Date(),
                method: 'QR_CODE',
                location: location,
                notes: notes,
            });

            const dateObj = new Date(newAttendance.checkInTime);
            const hours = String(dateObj.getHours()).padStart(2, '0');
            const minutes = String(dateObj.getMinutes()).padStart(2, '0');

            return res.status(201).json({
                success: true,
                message: 'Điểm danh vào thư viện thành công!',
                data: {
                    attendanceId: newAttendance._id,
                    studentId: newAttendance.studentId,
                    checkInTime: newAttendance.checkInTime,
                    formattedTime: `${hours}:${minutes}`,
                    location: newAttendance.location,
                },
            });
        } catch (error) {
            console.error('Lỗi tại ScannerController.checkIn:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi máy chủ khi ghi nhận điểm danh!',
            });
        }
    }
}

module.exports = new ScannerController();