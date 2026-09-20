module.exports = function viewLocalsMiddleware(req, res, next) {
    res.locals.cartCount = req.session.cart ? req.session.cart.length : 0;

    if (req.session.user) {
        res.locals.user = req.session.user;
        res.locals.isAdmin = req.session.user.role === 'admin';
    } else {
        res.locals.user = null;
        res.locals.isAdmin = false;
    }

    next();
};