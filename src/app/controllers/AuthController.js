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
                    errorMessage: 'Tài khoản hoặc mật khẩu không chính xác!'
                });
            }

            if (user.status === 'disable') {
                return res.status(403).render('auth/login', {
                    layout: 'auth',
                    errorMessage: 'Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ Quản trị viên.',
                });
            }

            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(401).render('auth/login', {
                    layout: 'auth',
                    errorMessage: 'Tài khoản hoặc mật khẩu không chính xác!'
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
                    avatar: user.avatar
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
            const responseMessage = 'Nếu email tồn tại, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu.';

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

            const emailSubject = '[UCC Library] Yêu cầu khôi phục mật khẩu';
            const emailHtml = `
                <h3>Xin chào ${user.fullname || 'bạn'},</h3>
                <p>Bạn nhận được email này vì đã yêu cầu khôi phục mật khẩu cho tài khoản tại hệ thống Thư viện UCC.</p>
                <p>Vui lòng click vào đường link bên dưới để thiết lập lại mật khẩu:</p>
                <a href="${resetUrl}" target="_blank" style="display:inline-block; padding:10px 20px; background-color:#d35400; color:#fff; text-decoration:none; border-radius:4px;">Khôi phục mật khẩu</a>
                <p><i>Đường link này sẽ hết hạn sau 15 phút.</i></p>
                <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này và mật khẩu của bạn sẽ được giữ an toàn.</p>
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
                errorMessage: 'Đã có lỗi xảy ra từ phía máy chủ. Vui lòng thử lại sau.'
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
                    errorMessage: 'Mật khẩu mới phải có độ dài tối thiểu 6 ký tự!'
                });
            }

            if (password !== confirmPassword) {
                return res.render('auth/reset-password', {
                    layout: 'auth',
                    token: token,
                    errorMessage: 'Mật khẩu xác nhận không khớp. Vui lòng nhập lại.'
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
                    errorMessage: 'Token không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu link mới.'
                });
            }

            user.password = password;
            user.resetPasswordToken = null;
            user.resetPasswordExpires = null;
            await user.save();

            return res.render('auth/login', {
                layout: 'auth',
                successMessage: 'Mật khẩu của bạn đã được cập nhật thành công! Vui lòng đăng nhập lại.'
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
                    errorMessage: 'Đường link khôi phục không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu link mới.'
                });
            }

            res.render('auth/reset-password', {
                layout: 'auth',
                title: 'Đặt lại mật khẩu',
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
                return res.status(500).send('Lỗi khi đăng xuất');
            }

            res.clearCookie('connect.sid');

            res.redirect('/login');
        });
    }
}

module.exports = new AuthController();