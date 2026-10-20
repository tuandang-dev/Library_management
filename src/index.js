const path = require('path')
const express = require('express')
const morgan = require('morgan')
const session = require('express-session');
const mongoose = require('mongoose');
const { MongoStore } = require('connect-mongo');
const methodOverride = require('method-override');
const { engine } = require('express-handlebars');
const app = express()
const port = process.env.PORT || 3000

// Kiem tra bien moi truong bat buoc khi chay moi truong production
if (process.env.NODE_ENV === 'production') {
  const missingEnvs = [];
  if (!process.env.SESSION_SECRET) {
    missingEnvs.push('SESSION_SECRET');
  }
  if (!process.env.MONGODB_URI) {
    missingEnvs.push('MONGODB_URI');
  }
  if (missingEnvs.length > 0) {
    console.error(`[FATAL] Production environment missing required variables: ${missingEnvs.join(', ')}`);
    process.exit(1);
  }
}

app.disable('x-powered-by');

// Cau hinh trust proxy khi chay sau Reverse Proxy (Nginx, Caddy, Cloudflare, AWS ALB,...)
// Mac dinh tat; neu TRUST_PROXY duoc thiet lap (vi du TRUST_PROXY=1 hoac TRUST_PROXY=true),
// cau hinh app.set('trust proxy', ...) truoc session va rate limiters.
if (process.env.TRUST_PROXY) {
  const trustProxyVal = process.env.TRUST_PROXY.trim();
  if (/^\d+$/.test(trustProxyVal)) {
    app.set('trust proxy', parseInt(trustProxyVal, 10));
  } else if (trustProxyVal.toLowerCase() === 'true') {
    app.set('trust proxy', true);
  } else if (trustProxyVal.toLowerCase() === 'false') {
    app.set('trust proxy', false);
  } else {
    app.set('trust proxy', trustProxyVal);
  }
}

// Middleware đặt header bảo mật cơ bản
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'same-origin');
  next();
});

const route = require('./routes');
const db = require('./config/db');

const { seedSampleLogs } = require('./app/helpers/loggerHelper');
const csrfGuard = require('./app/middlewares/csrfGuard');

app.use(express.static(path.join(__dirname, 'public')))

app.use(express.urlencoded({
  extended: true
}))
app.use(express.json())

app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    const method = req.body._method;
    delete req.body._method;
    return method;
  }
  if (req.query && '_method' in req.query) {
    return req.query._method;
  }
}))

// HTTP logger
app.use(morgan('combined'))

// Template engine
app.engine('handlebars', engine({
  helpers: {
    sum: (a, b) => a + b,

    currentYear: () => {
      return new Date().getFullYear();
    }
  }
}))
app.set('view engine', 'handlebars')
app.set('views', path.join(__dirname, 'resources', 'views'))

const clientPromise = new Promise((resolve) => {
  if (mongoose.connection.readyState === 1) {
    return resolve(mongoose.connection.getClient());
  }
  mongoose.connection.once('open', () => {
    resolve(mongoose.connection.getClient());
  });
});

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    clientPromise,
    collectionName: 'sessions',
    ttl: 60 * 60 * 24, // 1 ngày
    autoRemove: 'native',
  }),
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24
  }
}));

app.use(csrfGuard);

// Route init
route(app);

// 404 handler cho route khong ton tai theo cu phap Express 5
app.use('/*splat', (req, res) => {
  res.status(404).render('error', {
    message: 'The page you are looking for does not exist.',
  });
});

// Middleware xu ly loi tap trung
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  console.error('Lỗi máy chủ:', err.stack || err.message || err);

  let status = err.status || 500;
  let clientMessage;

  if (err.name === 'CastError') {
    status = 400;
    clientMessage = 'Invalid data';
  } else if (status >= 500) {
    clientMessage = 'A system error occurred. Please try again later.';
  } else {
    clientMessage = err.message || 'Invalid request.';
  }

  const isApiOrFetch = Boolean(
    req.xhr ||
    req.is('json') ||
    (req.headers.accept && req.headers.accept.includes('application/json')) ||
    (req.headers['content-type'] && req.headers['content-type'].includes('application/json'))
  );

  if (isApiOrFetch) {
    return res.status(status).json({
      success: false,
      message: clientMessage,
    });
  }

  res.status(status).render('error', {
    message: clientMessage,
  });
});

async function startServer() {
  try {
    await db.connect();
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      throw new Error('MongoDB database connection failed');
    }
    await seedSampleLogs();
    const server = app.listen(port, () => {
      console.log(`App listening on port ${port}`);
    });
    return server;
  } catch (error) {
    console.error('Lỗi khi khởi động ứng dụng:', error.message || error);
    process.exit(1);
  }
}

const serverPromise = startServer();

module.exports = { app, serverPromise };
