const { rateLimit, ipKeyGenerator } = require('express-rate-limit');

const forgotPasswordIpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    handler: (req, res) => {
        return res.status(429).render('auth/forgot-password', {
            layout: 'auth',
            errorMessage: 'Bạn đã yêu cầu đặt lại mật khẩu quá nhiều lần. Vui lòng thử lại sau 15 phút.',
        });
    },
});

const forgotPasswordEmailLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 3,
    keyGenerator: (req) => {
        const email = req.body?.email ? String(req.body.email).trim().toLowerCase() : '';
        if (email) {
            return `email:${email}`;
        }
        return `ip:${ipKeyGenerator(req.ip)}`;
    },
    handler: (req, res) => {
        return res.status(429).render('auth/forgot-password', {
            layout: 'auth',
            errorMessage: 'Bạn đã yêu cầu đặt lại mật khẩu cho email này quá nhiều lần. Vui lòng thử lại sau 15 phút.',
        });
    },
});

const resetPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    handler: (req, res) => {
        return res.status(429).render('auth/reset-password', {
            layout: 'auth',
            token: req.params.token,
            errorMessage: 'Bạn đã thử đặt lại mật khẩu quá nhiều lần. Vui lòng thử lại sau 15 phút.',
        });
    },
});

const loginIpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    skipSuccessfulRequests: true,
    handler: (req, res) => {
        return res.status(429).render('auth/login', {
            layout: 'auth',
            errorMessage: 'IP của bạn đã thực hiện quá nhiều lần đăng nhập không thành công. Vui lòng thử lại sau 15 phút.',
        });
    },
});

const loginAccountLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    skipSuccessfulRequests: true,
    keyGenerator: (req) => {
        const email = req.body?.email ? String(req.body.email).trim().toLowerCase() : '';
        return `login:${ipKeyGenerator(req.ip)}:${email}`;
    },
    handler: (req, res) => {
        return res.status(429).render('auth/login', {
            layout: 'auth',
            errorMessage: 'Bạn đã đăng nhập sai quá nhiều lần cho tài khoản này. Vui lòng thử lại sau 15 phút.',
        });
    },
});

module.exports = {
    forgotPasswordIpLimiter,
    forgotPasswordEmailLimiter,
    resetPasswordLimiter,
    loginLimiter: loginAccountLimiter,
    loginAccountLimiter,
    loginIpLimiter,
};
