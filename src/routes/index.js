const bookRouter = require('./book');
const siteRouter = require('./site');
const authRouter = require('./auth');
const adminRouter = require('./admin');
const attendanceRouter = require('./attendance');
const cartRouter = require('./cart');
const historyRouter = require('./history');
const scannerRouter = require('./scanner');

const { requireAuth, requireAdmin } = require('../app/middlewares/authMiddleware');

function route(app) {
    app.use((req, res, next) => {
        res.locals.cartCount = req.session.cart ? req.session.cart.length : 0;
        next();
    });

    app.use('/admin', adminRouter);
    app.use('/cart', cartRouter);
    app.use('/history', historyRouter);
    app.use('/scanner', scannerRouter);
    app.use('/book', bookRouter);
    app.use('/attendance', attendanceRouter);
    app.use('/', authRouter);
    app.use('/', siteRouter);
}

module.exports = route;