const path = require('path')
const express = require('express')
const morgan = require('morgan')
const session = require('express-session');
const methodOverride = require('method-override');
const { engine } = require('express-handlebars');
const app = express()
const port = process.env.PORT || 3000

app.disable('x-powered-by');

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

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
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
    message: 'Trang bạn tìm kiếm không tồn tại.',
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
    clientMessage = 'Dữ liệu không hợp lệ';
  } else if (status >= 500) {
    clientMessage = 'Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.';
  } else {
    clientMessage = err.message || 'Yêu cầu không hợp lệ.';
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
      throw new Error('Kết nối cơ sở dữ liệu MongoDB thất bại');
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
