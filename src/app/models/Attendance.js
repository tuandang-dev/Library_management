const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Attendance = new Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        studentId: { type: String, required: true, trim: true },
        checkInTime: { type: Date, default: Date.now, required: true },
        method: { type: String, enum: ['QR_CODE', 'MANUAL'], default: 'QR_CODE' },
        location: { type: String, default: 'Library Entrance', trim: true },
        notes: { type: String, default: '', trim: true },
    },
    {
        timestamps: true,
    }
);

Attendance.index({ userId: 1, checkInTime: -1 });
Attendance.index({ studentId: 1, checkInTime: -1 });

module.exports = mongoose.model('Attendance', Attendance);