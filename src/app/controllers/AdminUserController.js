const mongoose = require('mongoose');
const User = require('../models/User');
const escapeRegex = require('../../util/escapeRegex');
const { getPaginationData } = require('../helpers/paginationHelper');

class AdminUserController {
    // [GET] /admin/users
    async users(req, res) {
        try {
            const { search, role, status } = req.query;
            const filter = {};

            if (search && search.trim() !== '') {
                const keyword = escapeRegex(search.trim());
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

            const totalUsers = await User.countDocuments(filter);
            const pagination = getPaginationData({
                query: req.query,
                totalItems: totalUsers,
                limit: 10,
            });

            const rawUsers = await User.find(filter)
                .sort({ createdAt: -1 })
                .skip(pagination.skip)
                .limit(pagination.limit);

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
                pagination,
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
                message: 'Unable to load user list.',
            });
        }
    }

    // [POST] /admin/users
    async createUser(req, res) {
        try {
            const defaultPassword = process.env.STUDENT_DEFAULT_PASSWORD;
            if (!defaultPassword) {
                const isApiOrFetch = Boolean(
                    req.xhr ||
                    req.is('json') ||
                    (req.headers.accept && req.headers.accept.includes('application/json')) ||
                    (req.headers['content-type'] && req.headers['content-type'].includes('application/json'))
                );
                if (isApiOrFetch) {
                    return res.status(400).json({
                        success: false,
                        message: 'Default password is not configured',
                    });
                }
                return res.status(400).render('error', {
                    layout: 'user',
                    message: 'Default password is not configured',
                });
            }

            const { fullname, email, role, studentId } = req.body;
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
                studentId: studentId ? String(studentId).trim() : undefined,
                password: defaultPassword,
                mustChangePassword: true,
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
                message: 'Unable to add new user.',
            });
        }
    }

    // [POST] /admin/users/bulk-import
    async bulkImport(req, res) {
        try {
            const defaultPassword = process.env.STUDENT_DEFAULT_PASSWORD;
            if (!defaultPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Default password is not configured',
                });
            }

            const { users } = req.body;
            if (!Array.isArray(users) || users.length === 0) {
                return res.status(400).json({ success: false, message: 'Import list is empty.' });
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
                        studentId: item.studentId ? String(item.studentId).trim() : undefined,
                        role,
                        password: defaultPassword,
                        mustChangePassword: true,
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
            return res.status(500).json({ success: false, message: 'Server error while importing file.' });
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
                    message: 'Invalid user ID format.',
                });
            }

            if (!['active', 'disable'].includes(status)) {
                return res.status(400).json({ success: false, message: 'Invalid status.' });
            }

            if (currentUserId && id === currentUserId.toString() && status === 'disable') {
                return res.status(400).json({
                    success: false,
                    message: 'You cannot disable your own admin account.',
                });
            }

            const updatedUser = await User.findByIdAndUpdate(id, { status }, { new: true });
            if (!updatedUser) {
                return res.status(404).json({ success: false, message: 'User not found.' });
            }

            return res.json({
                success: true,
                message: `Updated status to ${status}.`,
                status: updatedUser.status,
            });
        } catch (error) {
            console.error('Lỗi khi cập nhật trạng thái người dùng:', error);
            return res.status(500).json({ success: false, message: 'Server error updating status.' });
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
                    message: 'Invalid user ID format.',
                });
            }

            if (currentUserId && id === currentUserId.toString()) {
                return res.status(400).json({
                    success: false,
                    message: 'You cannot delete your own admin account.',
                });
            }

            const user = await User.findById(id);
            if (!user) {
                return res.status(404).json({ success: false, message: 'User to delete not found.' });
            }

            await user.delete();

            return res.json({ success: true, message: 'User deleted successfully.' });
        } catch (error) {
            console.error('Lỗi khi xóa người dùng:', error);
            return res.status(500).json({ success: false, message: 'Server error deleting user.' });
        }
    }
}

module.exports = new AdminUserController();
