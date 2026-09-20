const bookRouter = require('./book');
const siteRouter = require('./site');
const authRouter = require('./auth');
const adminRouter = require('./admin');
const attendanceRouter = require('./attendance');
const cartRouter = require('./cart');
const historyRouter = require('./history');
const scannerRouter = require('./scanner');
const profileRouter = require('./profile');

const { requireAuth, requireAdmin } = require('../app/middlewares/authMiddleware');
const viewLocalsMiddleware = require('../app/middlewares/viewLocalsMiddleware');

function route(app) {
    app.use(viewLocalsMiddleware);
    app.use('/admin', adminRouter);
    app.use('/cart', cartRouter);
    app.use('/history', historyRouter);
    app.use('/scanner', scannerRouter);
    app.use('/profile', profileRouter);
    app.use('/book', bookRouter);
    app.use('/attendance', attendanceRouter);
    app.use('/', authRouter);
    app.use('/', siteRouter);
}

module.exports = route;