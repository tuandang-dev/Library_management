const crypto = require('crypto');
const User = require('../models/User');
const { sendEmail } = require('../helpers/emailHelper');
const bcrypt = require('bcryptjs');
const escapeRegex = require('../../util/escapeRegex');

class AuthController {
    // [GET] /login 
    showLogin(req, res) {
        res.render('auth/login', {
            layout: 'auth'
        });
    }

    // [GET] /forgot-password
    showForgotPassword(req, res) {
        res.render('auth/forgot-password', {
            layout: 'auth'
        });
    }

    // [POST] /login 
    async processLogin(req, res, next) {
        try {
            const { email, password } = req.body;
            const loginIdentifier = (email || '').trim();
            const safeIdentifier = escapeRegex(loginIdentifier);

            const user = await User.findOne({
                $or: [
                    { email: { $regex: new RegExp(`^${safeIdentifier}$`, 'i') } },
                    { studentId: loginIdentifier }
                ]
            });

            if (!user) {
                return res.status(401).render('auth/login', {
                    layout: 'auth',
                    errorMessage: 'Incorrect username or password!'
                });
            }

            if (user.status === 'disable') {
                return res.status(403).render('auth/login', {
                    layout: 'auth',
                    errorMessage: 'Your account has been disabled. Please contact the Administrator.',
                });
            }

            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(401).render('auth/login', {
                    layout: 'auth',
                    errorMessage: 'Incorrect username or password!'
                });
            }

            req.session.regenerate((err) => {
                if (err) {
                    console.error('Lỗi khi regenerate session:', err);
                    return next(err);
                }

                req.session.user = {
                    _id: user._id,
                    fullname: user.fullname,
                    email: user.email,
                    role: user.role,
                    avatar: user.avatar,
                    mustChangePassword: Boolean(user.mustChangePassword),
                };

                req.session.save((saveErr) => {
                    if (saveErr) {
                        console.error('Lỗi khi lưu session:', saveErr);
                        return next(saveErr);
                    }

                    if (user.role === 'admin') {
                        return res.redirect('/admin/dashboard');
                    } else {
                        return res.redirect('/');
                    }
                });
            });

        } catch (error) {
            console.error('Lỗi khi xử lý đăng nhập:', error);
            next(error);
        }
    }

    // [POST] /forgot-password
    async processForgotPassword(req, res, next) {
        try {
            const { email } = req.body;
            const normalizedEmail = (email || '').trim().toLowerCase();
            const responseMessage = 'If the email exists, we have sent password reset instructions.';

            const safeEmailPattern = new RegExp(`^${escapeRegex(normalizedEmail)}$`, 'i');
            const user = await User.findOne({ email: { $regex: safeEmailPattern } });

            if (!user) {
                return res.render('auth/forgot-password', {
                    layout: 'auth',
                    successMessage: responseMessage
                });
            }

            const resetToken = crypto.randomBytes(20).toString('hex');
            const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

            user.resetPasswordToken = hashedToken;
            user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
            await user.save();

            const resetUrl = `http://${req.headers.host}/reset-password/${resetToken}`;

            const emailSubject = '[UCC Library] Password Reset Request';
            const emailHtml = `
                <h3>Hello ${user.fullname || 'there'},</h3>
                <p>You are receiving this email because you requested a password reset for your UCC Library account.</p>
                <p>Please click the link below to set a new password:</p>
                <a href="${resetUrl}" target="_blank" style="display:inline-block; padding:10px 20px; background-color:#d35400; color:#fff; text-decoration:none; border-radius:4px;">Reset Password</a>
                <p><i>This link will expire in 15 minutes.</i></p>
                <p>If you did not request this, please ignore this email and your password will remain secure.</p>
            `;

            try {
                await sendEmail(user.email, emailSubject, emailHtml);
            } catch (emailErr) {
                console.error('Lỗi khi gửi email đặt lại mật khẩu:', emailErr.message);
            }

            return res.render('auth/forgot-password', {
                layout: 'auth',
                successMessage: responseMessage
            });

        } catch (error) {
            console.error('Lỗi khi xử lý quên mật khẩu:', error);
            return res.render('auth/forgot-password', {
                layout: 'auth',
                errorMessage: 'A server error occurred. Please try again later.'
            });
        }
    }

    // [POST] /reset-password/:token
    async updatePassword(req, res, next) {
        try {
            const { password, confirmPassword } = req.body;
            const { token } = req.params;

            if (!password || password.length < 6) {
                return res.render('auth/reset-password', {
                    layout: 'auth',
                    token: token,
                    errorMessage: 'New password must be at least 6 characters long!'
                });
            }

            if (password !== confirmPassword) {
                return res.render('auth/reset-password', {
                    layout: 'auth',
                    token: token,
                    errorMessage: 'Confirm password does not match. Please re-enter.'
                });
            }

            const rawToken = token || '';
            const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

            const user = await User.findOne({
                resetPasswordToken: hashedToken,
                resetPasswordExpires: { $gt: Date.now() }
            });

            if (!user) {
                return res.render('auth/forgot-password', {
                    layout: 'auth',
                    errorMessage: 'Token is invalid or has expired. Please request a new link.'
                });
            }

            user.password = password;
            user.resetPasswordToken = null;
            user.resetPasswordExpires = null;
            user.mustChangePassword = false;
            await user.save();

            if (req.session && req.session.user) {
                req.session.user.mustChangePassword = false;
            }

            return res.render('auth/login', {
                layout: 'auth',
                successMessage: 'Your password has been updated successfully! Please log in again.'
            });

        } catch (error) {
            console.error('Lỗi khi cập nhật mật khẩu mới:', error);
            next(error);
        }
    }

    // [GET] /reset-password/:token
    async showResetPassword(req, res, next) {
        try {
            const rawToken = req.params.token || '';
            const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

            const user = await User.findOne({
                resetPasswordToken: hashedToken,
                resetPasswordExpires: { $gt: Date.now() }
            });

            if (!user) {
                return res.render('auth/forgot-password', {
                    layout: 'auth',
                    errorMessage: 'Reset link is invalid or has expired. Please request a new link.'
                });
            }

            res.render('auth/reset-password', {
                layout: 'auth',
                title: 'Reset Password',
                token: rawToken
            });
        } catch (error) {
            console.error('Lỗi khi hiển thị trang reset password:', error);
            next(error);
        }
    }

    // [POST] /logout
    logout(req, res) {
        req.session.destroy((err) => {
            if (err) {
                console.error('Lỗi khi hủy session:', err);
                return res.status(500).send('Error logging out');
            }

            res.clearCookie('connect.sid');

            res.redirect('/login');
        });
    }
}

module.exports = new AuthController();