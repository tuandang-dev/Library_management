const User = require('../models/User');
const bcrypt = require('bcryptjs');

class ProfileController {
    // [GET] /profile
    index(req, res, next) {
        try {
            const currentUser = req.session.user;
            const errorMessage = req.session.errorMessage || null;
            if (req.session.errorMessage) {
                delete req.session.errorMessage;
            }

            return res.render('profile', {
                title: 'Change Password - UCC Library',
                layout: 'user',
                user: currentUser,
                errorMessage,
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
                    errorMessage: 'Please fill in all required password fields!',
                });
            }

            if (newPassword.length < 6) {
                return res.render('profile', {
                    title: 'Change Password - UCC Library',
                    layout: 'user',
                    user: currentUser,
                    errorMessage: 'New password must be at least 6 characters long!',
                });
            }

            if (newPassword !== confirmPassword) {
                return res.render('profile', {
                    title: 'Change Password - UCC Library',
                    layout: 'user',
                    user: currentUser,
                    errorMessage: 'Confirm password does not match new password!',
                });
            }

            const user = await User.findById(currentUser._id);
            if (!user) {
                return req.session.destroy((err) => {
                    if (err) {
                        console.error('Lỗi khi hủy session tại ProfileController:', err);
                    }
                    res.redirect('/login');
                });
            }

            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.render('profile', {
                    title: 'Change Password - UCC Library',
                    layout: 'user',
                    user: currentUser,
                    errorMessage: 'Current password is incorrect!',
                });
            }

            const isSamePassword = await bcrypt.compare(newPassword, user.password);
            if (isSamePassword) {
                return res.render('profile', {
                    title: 'Change Password - UCC Library',
                    layout: 'user',
                    user: currentUser,
                    errorMessage: 'New password cannot be the same as current password!',
                });
            }

            user.password = newPassword;
            user.mustChangePassword = false;
            await user.save();

            if (req.session && req.session.user) {
                req.session.user.mustChangePassword = false;
            }

            return res.render('profile', {
                title: 'Change Password - UCC Library',
                layout: 'user',
                user: currentUser,
                successMessage: 'Your password has been updated successfully!',
            });
        } catch (error) {
            console.error('Lỗi tại ProfileController.changePassword:', error);
            next(error);
        }
    }
}

module.exports = new ProfileController();