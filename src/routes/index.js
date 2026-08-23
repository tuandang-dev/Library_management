const bookRouter = require('./book');
const siteRouter = require('./site');
const authRouter = require('./auth');
const adminRouter = require('./admin');

const { requireAuth, requireAdmin } = require('../app/middlewares/authMiddleware');

function route(app) {
    app.use('/admin', adminRouter);
    app.use('/book', bookRouter);
    app.use('/', siteRouter);
    app.use('/', authRouter);

    app.get('/profile', requireAuth, (req, res) => {
        const user = req.session.user;
        res.send(`<h1>Chào mừng ${user.fullname} đã vào trang cá nhân bí mật!</h1>`);
    });
}

module.exports = route;