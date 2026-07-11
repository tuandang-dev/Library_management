const bookRouter = require('./book');
const siteRouter = require('./site');
const authRouter = require('./auth');

const { requireAuth, requireAdmin } = require('../app/middlewares/authMiddleware');

function route(app) {
    app.use('/book', bookRouter);
    app.use('/', siteRouter);
    app.use('/', authRouter);

    // BÁO LỖI NẾU BẠN CHƯA CÓ CONTROLLER: Tạm thời chúng ta viết callback trực tiếp để test
    // Chèn requireAuth vào giữa đường dẫn và hàm xử lý
    app.get('/profile', requireAuth, (req, res) => {
        // Lấy thông tin user từ session ra để hiển thị
        const user = req.session.user;
        res.send(`<h1>Chào mừng ${user.fullname} đã vào trang cá nhân bí mật!</h1>`);
    });

    // Route của Admin (Cần cả requireAuth VÀ requireAdmin)
    app.get('/admin/dashboard', requireAuth, requireAdmin, (req, res) => {
        res.send(`
            <h1>Khu vực tuyệt mật - Chỉ dành cho Admin</h1>
            <p>Chào mừng Quản trị viên: ${req.session.user.fullname}</p>
        `);
    });
}

module.exports = route;