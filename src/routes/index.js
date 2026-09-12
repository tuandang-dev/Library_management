const bookRouter = require('./book');
const siteRouter = require('./site');
const authRouter = require('./auth');
const adminRouter = require('./admin');
const attendanceRouter = require('./attendance');
const cartRouter = require('./cart');
const historyRouter = require('./history');

const { requireAuth, requireAdmin } = require('../app/middlewares/authMiddleware');

function route(app) {
    app.use((req, res, next) => {
        res.locals.cartCount = req.session.cart ? req.session.cart.length : 0;
        next();
    });

    app.use('/admin', adminRouter);
    app.use('/cart', cartRouter);
    app.use('/history', historyRouter);
    app.use('/book', bookRouter);
    app.use('/attendance', attendanceRouter);
    app.use('/', authRouter);
    app.use('/', siteRouter);

    app.get('/profile', requireAuth, (req, res) => {
        const user = req.session.user;
        res.send(`<h1>Chào mừng ${user.fullname} đã vào trang cá nhân bí mật!</h1>`);
    });
}

module.exports = route;