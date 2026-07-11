module.exports = {
    // Middleware kiểm tra xem đã đăng nhập chưa
    requireAuth: (req, res, next) => {
        // Kiểm tra xem trong session có biến user không (đã lưu ở Bước 9)
        if (req.session.user) {
            // Đã đăng nhập -> Cấp quyền đi tiếp
            next();
        } else {
            // Chưa đăng nhập -> Chuyển hướng về trang login
            res.redirect('/login');
        }
    },

    // Middleware phân quyền: Bắt buộc là Admin mới được đi tiếp
    requireAdmin: (req, res, next) => {
        // Kiểm tra an toàn kép: Phải có user trong session VÀ role phải là 'admin'
        if (req.session.user && req.session.user.role === 'admin') {
            next(); // Đủ thẩm quyền -> Cho đi tiếp
        } else {
            // Đã đăng nhập nhưng là 'user' bình thường -> Báo lỗi cấm truy cập
            res.status(403).send(`
                <h1>Lỗi 403: Truy cập bị từ chối</h1>
                <p>Bạn không có quyền Quản trị viên để vào khu vực này!</p>
                <a href="/">Quay về trang chủ</a>
            `);
        }
    }
};