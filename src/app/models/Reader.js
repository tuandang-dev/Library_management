const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Reader = new Schema({
    name: { type: String, required: true },
    studentId: { type: String, required: true, unique: true }, // unique: Không cho phép 2 người trùng mã SV
    email: { type: String, required: true },
    phone: { type: String }
}, {
    timestamps: true // Tự động tạo 2 trường: createdAt (ngày tạo) và updatedAt (ngày cập nhật cuối)
});

module.exports = mongoose.model('Reader', Reader);