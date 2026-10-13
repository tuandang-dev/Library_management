function isApiOrFetch(req) {
    return Boolean(
        req.xhr ||
        req.is('json') ||
        (req.headers.accept && req.headers.accept.includes('application/json')) ||
        (req.headers['content-type'] && req.headers['content-type'].includes('application/json'))
    );
}

function sendForbidden(req, res) {
    const message = 'Yêu cầu bị từ chối.';

    if (isApiOrFetch(req)) {
        return res.status(403).json({
            success: false,
            message,
        });
    }

    return res.status(403).render('error', {
        message,
    });
}

function csrfGuard(req, res, next) {
    const effectiveMethod = (req.originalMethod || req.method || '').toUpperCase();
    const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
    if (safeMethods.includes(effectiveMethod)) {
        return next();
    }

    const secFetchSite = req.get('sec-fetch-site');
    if (secFetchSite) {
        const site = secFetchSite.trim().toLowerCase();
        if (site !== 'same-origin' && site !== 'none') {
            return sendForbidden(req, res);
        }
        return next();
    }

    const reqHost = req.get('host');

    const origin = req.get('origin');
    if (origin) {
        const trimmedOrigin = origin.trim();
        if (trimmedOrigin.toLowerCase() === 'null') {
            return sendForbidden(req, res);
        }

        let originHost = '';
        try {
            originHost = new URL(trimmedOrigin).host;
        } catch {
            return sendForbidden(req, res);
        }

        if (!originHost || !reqHost || originHost.toLowerCase() !== reqHost.toLowerCase()) {
            return sendForbidden(req, res);
        }
        return next();
    }

    const referer = req.get('referer');
    if (referer) {
        let refererHost = '';
        try {
            refererHost = new URL(referer).host;
        } catch {
            return sendForbidden(req, res);
        }

        if (!reqHost || refererHost.toLowerCase() !== reqHost.toLowerCase()) {
            return sendForbidden(req, res);
        }
        return next();
    }

    return next();
}

module.exports = csrfGuard;
