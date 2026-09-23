const mongoose = require('mongoose');
const User = require('../models/User');

class AdminController {
    // [GET] /admin/dashboard
    async dashboard(req, res) {
        try {
            const metrics = {
                totalUsers: {
                    value: '234',
                    growth: '+12 this month',
                },
                activeBooks: {
                    value: '1,247',
                    availability: '89% available',
                },
                dailyVisitors: {
                    value: '47',
                    timeLabel: 'Today',
                },
            };

            const topVisitorsChart = {
                labels: ['Alex Johnson', 'Maria Garcia', 'David Wilson', 'Emma Davis', 'Michael Brown'],
                data: [24, 21, 20, 18, 16],
            };

            const weeklyActivityChart = {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                visitors: [48, 52, 48, 64, 58, 38, 24],
                borrowed: [12, 18, 15, 22, 19, 8, 4],
            };

            res.render('admin/dashboard', {
                layout: 'user',
                title: 'UCC Library - Admin Portal',
                isAdminPortal: true,
                isAdmin: true,
                isHomePage: true,
                user: {
                    ...req.session.user,
                    isAdmin: true,
                },
                metrics,
                topVisitorsJson: JSON.stringify(topVisitorsChart),
                weeklyActivityJson: JSON.stringify(weeklyActivityChart),
            });
        } catch (error) {
            console.error('Lỗi tải Admin Dashboard:', error);
            res.status(500).render('error', {
                layout: 'user',
                message: 'Không thể tải bảng điều khiển quản trị.',
            });
        }
    }

    // [GET] /admin/users
    async users(req, res) {
        try {
            const { search, role, status } = req.query;
            const filter = {};

            if (search && search.trim() !== '') {
                const keyword = search.trim();
                filter.$or = [
                    { fullname: { $regex: keyword, $options: 'i' } },
                    { email: { $regex: keyword, $options: 'i' } },
                ];
            }

            if (role && role !== 'all') {
                filter.role = role;
            }

            if (status && status !== 'all') {
                filter.status = status;
            }

            const rawUsers = await User.find(filter).sort({ createdAt: -1 });

            const formatDate = (date) => {
                if (!date) return 'N/A';
                const d = new Date(date);
                return isNaN(d.getTime()) ? 'N/A' : `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
            };

            const users = rawUsers.map((user) => {
                const userObj = user.toObject ? user.toObject() : user;
                return {
                    ...userObj,
                    formattedJoinDate: typeof user.getFormattedDate === 'function'
                        ? user.getFormattedDate('createdAt')
                        : formatDate(user.createdAt),
                    formattedLastActive: typeof user.getFormattedDate === 'function'
                        ? user.getFormattedDate('lastActive')
                        : formatDate(user.lastActive),
                    isAdmin: user.role === 'admin',
                    isActive: user.status === 'active',
                };
            });

            res.render('admin/users', {
                layout: 'user',
                title: 'User Management - UCC Library',
                isAdminPortal: true,
                isAdmin: true,
                users,
                filters: {
                    search: search || '',
                    role: role || 'all',
                    status: status || 'all',
                    isRoleAll: !role || role === 'all',
                    isRoleUser: role === 'user',
                    isRoleAdmin: role === 'admin',
                    isStatusAll: !status || status === 'all',
                    isStatusActive: status === 'active',
                    isStatusDisable: status === 'disable',
                },
            });
        } catch (error) {
            console.error('Lỗi khi tải danh sách người dùng:', error);
            res.status(500).render('error', {
                layout: 'user',
                message: 'Không thể tải danh sách người dùng.',
            });
        }
    }

    // [POST] /admin/users
    async createUser(req, res) {
        try {
            const { fullname, email, role } = req.body;
            let { permissions } = req.body;

            if (!permissions) {
                permissions = [];
            } else if (!Array.isArray(permissions)) {
                permissions = [permissions];
            }

            if (!fullname || !email) {
                return res.redirect('/admin/users');
            }

            const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
            if (existingUser) {
                return res.redirect('/admin/users');
            }

            const newUser = new User({
                fullname: fullname.trim(),
                email: email.trim().toLowerCase(),
                password: '123456',
                role: role || 'user',
                status: 'active',
                permissions,
                lastActive: new Date(),
            });

            await newUser.save();
            return res.redirect('/admin/users');
        } catch (error) {
            console.error('Lỗi khi tạo mới người dùng:', error);
            return res.status(500).render('error', {
                layout: 'user',
                message: 'Không thể thêm người dùng mới.',
            });
        }
    }

    // [POST] /admin/users/bulk-import
    async bulkImport(req, res) {
        try {
            const { users } = req.body;
            if (!Array.isArray(users) || users.length === 0) {
                return res.status(400).json({ success: false, message: 'Dữ liệu danh sách trống.' });
            }

            let insertedCount = 0;
            for (const item of users) {
                if (!item.fullname || !item.email) continue;
                const emailClean = item.email.trim().toLowerCase();
                const existing = await User.findOne({ email: emailClean });

                if (!existing) {
                    const role = (item.role && item.role.toLowerCase() === 'admin') ? 'admin' : 'user';
                    const newUser = new User({
                        fullname: item.fullname.trim(),
                        email: emailClean,
                        role,
                        password: '123456',
                        status: 'active',
                        lastActive: new Date(),
                    });
                    await newUser.save();
                    insertedCount++;
                }
            }

            return res.json({ success: true, count: insertedCount });
        } catch (error) {
            console.error('Lỗi khi nhập hàng loạt tài khoản:', error);
            return res.status(500).json({ success: false, message: 'Lỗi server khi nạp file.' });
        }
    }

    // [PATCH] /admin/users/:id/status
    async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const currentUserId = req.session.user ? req.session.user._id : null;

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Định dạng ID người dùng không hợp lệ.',
                });
            }

            if (!['active', 'disable'].includes(status)) {
                return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ.' });
            }

            if (currentUserId && id === currentUserId.toString() && status === 'disable') {
                return res.status(400).json({
                    success: false,
                    message: 'Bạn không thể tự vô hiệu hóa tài khoản quản trị của chính mình.',
                });
            }

            const updatedUser = await User.findByIdAndUpdate(id, { status }, { new: true });
            if (!updatedUser) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
            }

            return res.json({
                success: true,
                message: `Đã cập nhật trạng thái sang ${status}.`,
                status: updatedUser.status,
            });
        } catch (error) {
            console.error('Lỗi khi cập nhật trạng thái người dùng:', error);
            return res.status(500).json({ success: false, message: 'Lỗi server khi đổi trạng thái.' });
        }
    }

    // [DELETE] /admin/users/:id
    async deleteUser(req, res) {
        try {
            const { id } = req.params;
            const currentUserId = req.session.user ? req.session.user._id : null;

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Định dạng ID người dùng không hợp lệ.',
                });
            }

            if (currentUserId && id === currentUserId.toString()) {
                return res.status(400).json({
                    success: false,
                    message: 'Bạn không thể tự xóa tài khoản quản trị của chính mình.',
                });
            }

            const user = await User.findById(id);
            if (!user) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng cần xóa.' });
            }

            await user.delete();

            return res.json({ success: true, message: 'Đã xóa người dùng thành công (Soft Delete).' });
        } catch (error) {
            console.error('Lỗi khi xóa người dùng:', error);
            return res.status(500).json({ success: false, message: 'Lỗi server khi xóa tài khoản.' });
        }
    }
}

module.exports = new AdminController();