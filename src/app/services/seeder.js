const User = require('../models/User');

const seedAdmin = async () => {
    try {
        const findAdmin = typeof User.findOneWithDeleted === 'function'
            ? User.findOneWithDeleted({ email: 'admin@library.com' })
            : User.findOne({ email: 'admin@library.com' });
        const adminExists = await findAdmin;

        if (adminExists) {
            if (adminExists.deleted) {
                console.warn('Cảnh báo: Tài khoản Admin mặc định đang ở trạng thái đã bị xoá mềm.');
                return;
            }
            console.log('Tài khoản Admin mặc định đã tồn tại.');
            return;
        }

        const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD;
        if (!defaultPassword) {
            console.warn('⚠️ [seeder] Thiếu biến môi trường ADMIN_DEFAULT_PASSWORD. Bỏ qua việc tạo tài khoản Admin mặc định.');
            return;
        }

        try {
            await User.create({
                fullname: 'System Admin',
                email: 'admin@library.com',
                password: defaultPassword,
                role: 'admin',
                status: 'active'
            });
            console.log('Đã tạo tài khoản Admin mặc định thành công!');
        } catch (createErr) {
            if (createErr.code === 11000 || (createErr.message && createErr.message.includes('E11000'))) {
                console.log('Tài khoản Admin mặc định đã tồn tại.');
            } else {
                throw createErr;
            }
        }
    } catch (error) {
        console.error('Lỗi khi tạo Admin mặc định:', error);
    }
};

module.exports = { seedAdmin };