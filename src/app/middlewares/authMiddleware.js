module.exports = {
    requireAuth: (req, res, next) => {
        if (req.session.user) {
            next();
        } else {
            res.redirect('/login');
        }
    },

    requireAdmin: (req, res, next) => {
        if (req.session.user && req.session.user.role === 'admin') {
            next();
        } else {
            res.status(403).send(`
                <h1>Lỗi 403: Truy cập bị từ chối</h1>
                <p>Bạn không có quyền Quản trị viên để vào khu vực này!</p>
                <a href="/">Quay về trang chủ</a>
            `);
        }
    }
};