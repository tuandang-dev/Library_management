module.exports = {
    requireAuth: (req, res, next) => {
        if (!req.session.user) {
            return res.redirect('/login');
        }

        if (req.session.user.mustChangePassword) {
            const rawPath = (req.originalUrl || '').split('?')[0];
            const urlPath = rawPath.endsWith('/') && rawPath.length > 1 ? rawPath.slice(0, -1) : rawPath;
            const isAllowed =
                ((req.method === 'GET' || req.method === 'POST') && urlPath === '/profile') ||
                (req.method === 'POST' && urlPath === '/logout');

            if (!isAllowed) {
                const isApiOrFetch = Boolean(
                    req.xhr ||
                    req.is('json') ||
                    (req.headers.accept && req.headers.accept.includes('application/json')) ||
                    (req.headers['content-type'] && req.headers['content-type'].includes('application/json'))
                );

                if (isApiOrFetch) {
                    return res.status(403).json({
                        success: false,
                        message: 'Please change your password on first login',
                    });
                }

                req.session.errorMessage = 'Please change your password on first login';
                return res.redirect('/profile');
            }
        }

        next();
    },

    requireAdmin: (req, res, next) => {
        if (req.session.user && req.session.user.role === 'admin') {
            next();
        } else {
            res.status(403).send(`
                <h1>403 Forbidden: Access Denied</h1>
                <p>You do not have Administrator permissions to access this area!</p>
                <a href="/">Back to Homepage</a>
            `);
        }
    }
};