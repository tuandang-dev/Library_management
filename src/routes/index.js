const newsRouter = require('./news');
const bookRouter = require('./book');
const siteRouter = require('./site');
const adminRouter = require('./admin');

function route(app) {
    app.use('/news', newsRouter);
    app.use('/book', bookRouter);
    app.use('/', siteRouter);
    app.use('/admin', adminRouter);
}

module.exports = route;