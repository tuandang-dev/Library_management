const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

const User = new Schema(
    {
        fullname: { type: String, required: true, maxLength: 255 },
        email: { type: String, required: true, unique: true, maxLength: 255 },
        password: { type: String, required: true },
        role: { type: String, enum: ['user', 'admin'], default: 'user' },
        status: { type: String, enum: ['active', 'inactive'], default: 'active' },
        avatar: { type: String, default: '/img/default-avatar.png' },
    },
    {
        timestamps: true,
    }
);

// Mongoose Pre-hook: Chạy tự động TRƯỚC KHI lưu vào DB
User.pre('save', async function () {
    // "this" đại diện cho tài khoản người dùng đang chuẩn bị được lưu

    // Nếu mật khẩu không bị thay đổi (ví dụ: chỉ đổi tên), thì bỏ qua không hash lại
    if (!this.isModified('password')) return;

    try {
        // Sinh ra "muối" (độ phức tạp là 10 vòng)
        const salt = await bcrypt.genSalt(10);

        // Hash mật khẩu kết hợp với muối
        this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
        throw new Error('Lỗi khi mã hóa mật khẩu');
    }
});

module.exports = mongoose.model('User', User);