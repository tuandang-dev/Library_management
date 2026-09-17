const User = require('../models/User');
const bcrypt = require('bcryptjs');

class ProfileController {
    // [GET] /profile
    index(req, res, next) {
        try {
            const currentUser = req.session.user;

            return res.render('profile', {
                title: 'Change Password - UCC Library',
                layout: 'user',
                user: currentUser,
            });
        } catch (error) {
            console.error('Lỗi tại ProfileController.index:', error);
            next(error);
        }
    }

    // [POST] /profile
    async changePassword(req, res, next) {
        try {
            const currentUser = req.session.user;
            const { currentPassword, newPassword, confirmPassword } = req.body;

            if (!currentPassword || !newPassword || !confirmPassword) {
                return res.render('profile', {
                    title: 'Change Password - UCC Library',
                    layout: 'user',
                    user: currentUser,
                    errorMessage: 'Vui lòng nhập đầy đủ các trường mật khẩu bắt buộc!',
                });
            }

            if (newPassword.length < 6) {
                return res.render('profile', {
                    title: 'Change Password - UCC Library',
                    layout: 'user',
                    user: currentUser,
                    errorMessage: 'Mật khẩu mới phải có độ dài tối thiểu 6 ký tự!',
                });
            }

            if (newPassword !== confirmPassword) {
                return res.render('profile', {
                    title: 'Change Password - UCC Library',
                    layout: 'user',
                    user: currentUser,
                    errorMessage: 'Mật khẩu xác nhận không trùng khớp với mật khẩu mới!',
                });
            }

            const user = await User.findById(currentUser._id);
            if (!user) {
                return res.redirect('/logout');
            }

            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.render('profile', {
                    title: 'Change Password - UCC Library',
                    layout: 'user',
                    user: currentUser,
                    errorMessage: 'Mật khẩu hiện tại không chính xác!',
                });
            }

            const isSamePassword = await bcrypt.compare(newPassword, user.password);
            if (isSamePassword) {
                return res.render('profile', {
                    title: 'Change Password - UCC Library',
                    layout: 'user',
                    user: currentUser,
                    errorMessage: 'Mật khẩu mới không được trùng với mật khẩu hiện tại!',
                });
            }

            user.password = newPassword;
            await user.save();

            return res.render('profile', {
                title: 'Change Password - UCC Library',
                layout: 'user',
                user: currentUser,
                successMessage: 'Mật khẩu của bạn đã được cập nhật thành công!',
            });
        } catch (error) {
            console.error('Lỗi tại ProfileController.changePassword:', error);
            next(error);
        }
    }
}

module.exports = new ProfileController();