const User = require('../models/User');
const bcrypt = require('bcryptjs');

class AuthController {
    // [GET] /login - Xử lý hiển thị giao diện
    showLogin(req, res) {
        res.render('login', {
            layout: 'auth'
        });
    }

    // [POST] /login - Xử lý dữ liệu form gửi lên
    async processLogin(req, res) {
        try {
            // 1. Lấy dữ liệu từ form
            const { email, password } = req.body;

            // 2. Tìm người dùng trong DB dựa trên email
            const user = await User.findOne({ email: email });

            // 3. Nếu không tìm thấy user
            if (!user) {
                // Tạm thời trả về text. Sau này sẽ gửi kèm biến error ra View (Handlebars)
                return res.render('login', {
                    layout: 'auth',
                    errorMessage: 'Tài khoản hoặc mật khẩu không chính xác!'
                });
            }

            // 4. Nếu tìm thấy, so sánh mật khẩu nhập vào với mã hash trong DB
            const isMatch = await bcrypt.compare(password, user.password);

            // 5. Nếu mật khẩu không khớp
            if (!isMatch) {
                return res.render('login', {
                    layout: 'auth',
                    errorMessage: 'Tài khoản hoặc mật khẩu không chính xác!'
                });
            }

            // 6. ĐĂNG NHẬP THÀNH CÔNG -> LƯU SESSION
            // Chỉ bóc tách lưu những thông tin cần thiết, tuyệt đối KHÔNG lưu password
            req.session.user = {
                _id: user._id,
                fullname: user.fullname,
                email: user.email,
                role: user.role,
                avatar: user.avatar
            };

            console.log('Session hiện tại:', req.session.user); // In ra để debug

            // 7. Chuyển hướng người dùng dựa vào Role
            if (user.role === 'admin') {
                res.redirect('/admin/dashboard'); // Chuyển sang trang quản trị
            } else {
                res.redirect('/');                // Chuyển về trang chủ cho User
            }

        } catch (error) {
            console.error('Lỗi khi xử lý đăng nhập:', error);
            res.status(500).send('Lỗi Server nội bộ');
        }
    }

    // [GET] /logout - Xử lý đăng xuất
    logout(req, res) {
        // 1. Hủy session trên Server
        req.session.destroy((err) => {
            if (err) {
                console.error('Lỗi khi hủy session:', err);
                return res.status(500).send('Lỗi khi đăng xuất');
            }

            // 2. Xóa cookie chứa Session ID trên trình duyệt người dùng
            // Tên mặc định của cookie sinh ra bởi express-session là 'connect.sid'
            res.clearCookie('connect.sid');

            // 3. Chuyển hướng về trang đăng nhập
            res.redirect('/login');
        });
    }
}

module.exports = new AuthController();