const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;
const mongooseDelete = require('mongoose-delete');

const User = new Schema(
    {
        fullname: { type: String, required: true, maxLength: 255 },
        email: { type: String, required: true, unique: true, maxLength: 255 },
        password: { type: String, required: true },
        role: { type: String, enum: ['user', 'admin'], default: 'user' },
        status: { type: String, enum: ['active', 'disable'], default: 'active' },
        permissions: { type: [String], default: [] },
        lastActive: { type: Date, default: Date.now },
        avatar: { type: String, default: '/img/default-avatar.png' },
        resetPasswordToken: { type: String, default: null },
        resetPasswordExpires: { type: Date, default: null },
    },
    {
        timestamps: true,
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
    }
);

User.methods.hasPermission = function (permission) {
    if (this.role === 'admin') return true;
    return Array.isArray(this.permissions) && this.permissions.includes(permission);
};

User.methods.getFormattedDate = function (field) {
    const targetDate = this[field];
    if (!targetDate) return 'N/A';
    const d = new Date(targetDate);
    if (isNaN(d.getTime())) return 'N/A';
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
};

User.pre('save', async function () {
    if (!this.isModified('password')) return;

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
        throw new Error('Lỗi khi mã hóa mật khẩu');
    }
});

User.plugin(mongooseDelete, {
    deletedAt: true,
    overrideMethods: 'all',
});

module.exports = mongoose.model('User', User);