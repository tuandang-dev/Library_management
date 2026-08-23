const crypto = require('crypto');
const User = require('../models/User');
const { sendEmail } = require('../helpers/emailHelper');
const bcrypt = require('bcryptjs');

class AuthController {
    // [GET] /login 
    showLogin(req, res) {
        res.render('login', {
            layout: 'auth'
        });
    }

    // [GET] /forgot-password
    showForgotPassword(req, res) {
        res.render('forgot-password', {
            layout: 'auth'
        });
    }

    // [POST] /login 
    async processLogin(req, res) {
        try {
            const { email, password } = req.body;

            const user = await User.findOne({ email: email });

            if (!user) {
                return res.render('login', {
                    layout: 'auth',
                    errorMessage: 'Tài khoản hoặc mật khẩu không chính xác!'
                });
            }

            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.render('login', {
                    layout: 'auth',
                    errorMessage: 'Tài khoản hoặc mật khẩu không chính xác!'
                });
            }

            req.session.user = {
                _id: user._id,
                fullname: user.fullname,
                email: user.email,
                role: user.role,
                avatar: user.avatar
            };

            console.log('Session hiện tại:', req.session.user);

            if (user.role === 'admin') {
                res.redirect('/admin/dashboard');
            } else {
                res.redirect('/profile');
            }

        } catch (error) {
            console.error('Lỗi khi xử lý đăng nhập:', error);
            res.status(500).send('Lỗi Server nội bộ');
        }
    }

    // [POST] /forgot-password
    async processForgotPassword(req, res, next) {
        try {
            const { email } = req.body;

            const user = await User.findOne({ email: email });

            if (!user) {
                return res.render('forgot-password', {
                    layout: 'auth',
                    successMessage: 'Nếu email của bạn tồn tại trong hệ thống, chúng tôi đã gửi một đường link khôi phục.'
                });
            }

            const resetToken = crypto.randomBytes(20).toString('hex');

            user.resetPasswordToken = resetToken;
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

            await sendEmail(user.email, emailSubject, emailHtml);

            return res.render('forgot-password', {
                layout: 'auth',
                successMessage: 'Nếu email của bạn tồn tại trong hệ thống, chúng tôi đã gửi một đường link khôi phục.'
            });

        } catch (error) {
            console.error('Lỗi khi xử lý quên mật khẩu:', error);
            return res.render('forgot-password', {
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

            if (password !== confirmPassword) {
                return res.render('reset-password', {
                    layout: 'auth',
                    token: token,
                    errorMessage: 'Mật khẩu xác nhận không khớp. Vui lòng nhập lại.'
                });
            }

            const user = await User.findOne({
                resetPasswordToken: token,
                resetPasswordExpires: { $gt: Date.now() }
            });

            if (!user) {
                return res.render('forgot-password', {
                    layout: 'auth',
                    errorMessage: 'Token không hợp lệ hoặc đã quá hạn 15 phút. Vui lòng yêu cầu link mới.'
                });
            }

            user.password = password;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();

            return res.render('login', {
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
            const user = await User.findOne({
                resetPasswordToken: req.params.token,
                resetPasswordExpires: { $gt: Date.now() }
            });

            if (!user) {
                return res.render('forgot-password', {
                    layout: 'auth',
                    errorMessage: 'Đường link khôi phục không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu link mới.'
                });
            }

            res.render('reset-password', {
                layout: 'auth',
                title: 'Đặt lại mật khẩu',
                token: req.params.token
            });
        } catch (error) {
            console.error('Lỗi khi hiển thị trang reset password:', error);
            next(error);
        }
    }

    // [GET] /logout
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