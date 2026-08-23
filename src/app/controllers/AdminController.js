class AdminController {
    // [GET] /admin/dashboard
    dashboard(req, res) {
        res.send(`
            <h1>Khu vực Quản trị (Admin Dashboard)</h1>
            <p>Xin chào: <strong>${req.session.user.fullname}</strong> (${req.session.user.role})</p>
            <a href="/logout">Đăng xuất</a>
        `);
    }
}

module.exports = new AdminController();