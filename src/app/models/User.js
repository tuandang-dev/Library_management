const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

const User = new Schema(
    {
        fullname: { type: String, required: true, maxLength: 255 },
        email: { type: String, required: true, unique: true, maxLength: 255 },
        password: { type: String, required: true },
        studentId: { type: String, unique: true, sparse: true, trim: true, default: null },
        role: { type: String, enum: ['user', 'admin'], default: 'user' },
        status: { type: String, enum: ['active', 'inactive'], default: 'active' },
        avatar: { type: String, default: '/img/default-avatar.png' },
        resetPasswordToken: { type: String, default: null },
        resetPasswordExpires: { type: Date, default: null },
    },
    {
        timestamps: true,
    }
);

User.pre('save', async function () {
    if (!this.isModified('password')) return;

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
        throw new Error('Lỗi khi mã hóa mật khẩu');
    }
});

module.exports = mongoose.model('User', User);