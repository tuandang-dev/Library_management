const User = require('../models/User');
const bcrypt = require('bcryptjs');

const seedAdmin = async () => {
    try {
        // 1. Tìm xem tài khoản admin đã tồn tại trong DB chưa
        const adminExists = await User.findOne({ email: 'admin@library.com' });

        if (!adminExists) {
            // 2. Hash mật khẩu
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('admin123', salt);

            // 3. Tạo mới tài khoản
            await User.create({
                fullname: 'System Admin',
                email: 'admin@library.com',
                password: hashedPassword,
                role: 'admin',
                status: 'active'
            });
            console.log('Đã tạo tài khoản Admin mặc định thành công!');
        } else {
            console.log('Tài khoản Admin mặc định đã tồn tại.');
        }
    } catch (error) {
        console.error('Lỗi khi tạo Admin mặc định:', error);
    }
};

module.exports = { seedAdmin };