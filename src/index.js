const path = require('path')
const express = require('express')
const morgan = require('morgan')
const session = require('express-session');
const { engine } = require('express-handlebars');
const app = express()
const port = 3000

const route = require('./routes');
const db = require('./config/db');

// Connect to DB
db.connect();

app.use(express.static(path.join(__dirname, 'public')))

app.use(express.urlencoded({
  extended: true
}))
app.use(express.json())

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

// Cấu hình Middleware Session
app.use(session({
  secret: 'my_super_secret_key_library_2026', // Khóa bí mật để ký session ID
  resave: false,                              // Không lưu lại nếu session không thay đổi
  saveUninitialized: false,                   // Không tạo session nếu người dùng chưa đăng nhập
  cookie: {
    secure: false,                          // Set là true nếu dự án có HTTPS
    maxAge: 1000 * 60 * 60 * 24             // Thời gian sống của cookie: 1 ngày (tính bằng milliseconds)
  }
}));

// Route init
route(app);

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
