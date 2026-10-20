const { rateLimit, ipKeyGenerator } = require('express-rate-limit');

const forgotPasswordIpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    handler: (req, res) => {
        return res.status(429).render('auth/forgot-password', {
            layout: 'auth',
            errorMessage: 'Too many password reset requests. Please try again after 15 minutes.',
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
            errorMessage: 'Too many password reset requests for this email. Please try again after 15 minutes.',
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
            errorMessage: 'Too many attempts to reset password. Please try again after 15 minutes.',
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
            errorMessage: 'Too many failed login attempts from your IP. Please try again after 15 minutes.',
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
            errorMessage: 'Too many failed login attempts for this account. Please try again after 15 minutes.',
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
