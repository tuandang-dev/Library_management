# Library Management System

A full-stack, server-side rendered web application for academic and institutional library management. Built with **Node.js**, **Express 5**, **Express-Handlebars**, and **MongoDB (Mongoose 9)**, the application follows the Model-View-Controller architectural pattern to deliver book cataloging, circulation tracking, attendance monitoring, and role-based administration.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [User Roles and Permissions](#user-roles-and-permissions)
- [Technology Stack](#technology-stack)
- [Security Features](#security-features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation and Setup](#installation-and-setup)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Automated Testing](#automated-testing)
- [Database and Seed Data](#database-and-seed-data)
- [Usage Guide](#usage-guide)
- [Troubleshooting](#troubleshooting)
- [Future Improvements](#future-improvements)
- [Author / Contact](#author--contact)

---

## Overview

Managing physical library resources, tracking student circulation, and maintaining visitor attendance often suffers from disparate records, stock discrepancies, and manual processing errors.

This **Library Management System** addresses those challenges by providing:
- A centralized digital catalog with real-time stock availability.
- A self-service borrowing cart that generates digital borrow tickets with dynamic QR codes.
- An administrative circulation desk to verify tickets, check out books atomically, and handle returns without inventory corruption.
- Daily attendance check-ins enforced per student with timezone awareness (`Asia/Ho_Chi_Minh`).
- Automated overdue loan categorization, email notifications, and administrative data exports in CSV format.
- Defense-in-depth security including rate limiting, CSRF protection, salted bcrypt password hashing, and single-use password reset tokens.

---

## Key Features

### 1. Catalog & Borrowing Workflow (Student / Reader)
- **Book Discovery & Filtering:** Search books by title, author, or ISBN; filter by category and stock availability (`available` vs. `borrowed`).
- **Session-Based Borrow Cart:** Add and remove books with real-time cart counters stored in user sessions.
- **Digital QR Borrow Tickets:** Check out from the cart to create a `BorrowTicket` featuring a unique ticket ID (`TKT-...`), a 14-day expected return window, and an automatically generated QR code image for librarian scanning.
- **Borrowing History:** Personal timeline displaying active loans, returned books, and overdue status with day counters.
- **Ticket Ownership Enforcement:** Strict server-side checks ensure students can only view their own borrow tickets.

### 2. Attendance & Check-In
- **QR & Manual Attendance Portal:** Check-in interface recording student entrance timestamps.
- **One Check-In Per Day Rule:** Strictly enforces a single check-in per student per calendar day based on the `Asia/Ho_Chi_Minh` timezone, backed by a unique compound database index.
- **Attendance History:** Filter personal attendance logs across daily, weekly, monthly, and yearly intervals.

### 3. Circulation & Inventory Management (Administrator)
- **QR Circulation Desk:** Verify reader ticket QR data, execute atomic checkout (locking ticket and decrementing inventory), and process book returns with automatic stock replenishment.
- **Book Catalog Management:** Full CRUD capabilities for books (Title, Author, Category, ISBN, Quantities, Shelf Location, Cover Image).
- **Automated Slug Generation:** Generates URL-friendly, Vietnamese-accent-normalized category slugs with duplicate resolution.
- **Bulk CSV Import & Export:** Bulk import books and users via CSV; export book catalogs, overdue records, attendance logs, and circulation histories.

### 4. Overdue Tracking & Alerts (Administrator)
- **Tier-Based Overdue Classification:** Categorizes overdue loans into severity levels: `OVERDUE` (1–6 days), `CRITICAL` (7–13 days), and `LOST` (14+ days).
- **Email Reminders:** Send individual or bulk reminder emails via Nodemailer with customizable notification bodies.
- **Report Export:** Export overdue summaries and records as CSV files.

### 5. User Management & Audit Logging (Administrator)
- **User Administration:** Create users with optional Student ID (`studentId`), toggle account status (`active` / `disable`), and soft-delete accounts.
- **CSV Bulk User Import:** Supports both legacy 3-column (`Fullname,Email,Role`) and 4-column (`Fullname,Email,Role,StudentId`) CSV files.
- **System Activity Audit Logs:** Centralized audit logs recording actions across authentication, books, users, attendance, and system events.

---

## User Roles and Permissions

The system implements Role-Based Access Control (RBAC) via session-backed middleware (`requireAuth` and `requireAdmin`):

| Area / Action | Guest (Unauthenticated) | Student (`role: 'user'`) | Administrator (`role: 'admin'`) |
| :--- | :---: | :---: | :---: |
| Public Landing Page (`/`) | View | View / Redirect to Dashboard | Redirect to `/admin/dashboard` |
| Authentication (`/login`, `/forgot-password`, `/reset-password/:token`) | Full Access | Authenticated | Authenticated |
| Book Catalog (`/book`) | Redirect to `/login` | Browse & Add to Cart | Browse & Add to Cart |
| Borrow Cart & Checkout (`/cart`, `/cart/checkout`) | Redirect to `/login` | Full Access | Full Access |
| View Borrow Ticket (`/cart/ticket/:ticketId`) | Redirect to `/login` | Owner Only (404 for non-owners) | Owner Only |
| Personal Attendance & Scanner (`/attendance`, `/scanner`) | Redirect to `/login` | Full Access | Full Access |
| Personal Borrow History (`/history`) | Redirect to `/login` | View Own Records | View Own Records |
| Profile & Password Update (`/profile`) | Redirect to `/login` | Full Access | Full Access |
| Admin Dashboard (`/admin/dashboard`) | Redirect to `/login` | HTTP 403 Forbidden | Full Access |
| User & Book Management (`/admin/users`, `/admin/books`) | Redirect to `/login` | HTTP 403 Forbidden | Full Access |
| QR Desk / Circulation Scan (`/admin/scanner/*`) | Redirect to `/login` | HTTP 403 Forbidden | Full Access |
| Overdue Alerts & Reminders (`/admin/alerts/*`) | Redirect to `/login` | HTTP 403 Forbidden | Full Access |
| Activity Logs & CSV Exports (`/admin/logs`, `/admin/*/export`) | Redirect to `/login` | HTTP 403 Forbidden | Full Access |

---

## Technology Stack

### Backend & Runtime
- **Node.js** (v20.6.0+ recommended) — JavaScript runtime with built-in `--env-file` and native test runner.
- **Express.js (v5.2.1)** — HTTP web framework.
- **Express-Handlebars (v8.0.4)** — Server-side templating engine with Handlebars SSR.
- **express-session (v1.19.0)** — Cookie-based session management.
- **method-override (v3.0.0)** — RESTful HTTP verb overrides (`PUT`, `PATCH`, `DELETE`) for HTML forms.

### Database & ODM
- **MongoDB** — Document-oriented database.
- **Mongoose (v9.0.1)** — Object Data Modeling (ODM) library.
- **mongoose-delete (v1.0.7)** — Soft delete plugin providing `deleted` timestamps and filtered queries.

### Security & Utilities
- **bcryptjs (v3.0.3)** — Password hashing with salt rounds.
- **express-rate-limit (v8.7.1)** — Rate-limiting middleware for brute-force mitigation.
- **nodemailer (v9.0.3)** — SMTP email dispatch for password resets and overdue notices.
- **qrcode (v1.5.4)** — Dynamic QR code generation for digital borrow tickets.
- **dotenv (v18.0.5)** — Environment variable loading.

### Frontend & Styling
- **Sass (v1.98.0)** — SCSS preprocessing compiled to `src/public/css/app.css`.
- **FontAwesome 6** — Interface iconography.

### Testing & Code Quality
- **Node.js Native Test Runner (`node:test`, `node:assert`)** — Zero-dependency test execution.
- **Prettier (v3.7.4) & lint-staged (v16.2.7)** — Code formatting automation.
- **Morgan (v1.10.1)** — HTTP request logger.
- **Nodemon (v3.1.11)** — Development file watcher.

---

## Security Features

The application incorporates multiple layers of security verified in code:

1. **Password Hashing (bcryptjs):**
   - User passwords are automatically salted and hashed using `bcrypt.genSalt(10)` via a Mongoose `pre('save')` lifecycle hook. Passwords are never stored or rendered in plain text.
2. **Session Hardening:**
   - Sessions are configured with `httpOnly: true`, `sameSite: 'lax'`, a 24-hour expiration window, and conditional `secure: true` in production (`NODE_ENV === 'production'`).
   - Session identifiers are regenerated on login (`req.session.regenerate`) to protect against session fixation attacks.
3. **Defense-in-Depth CSRF Guard (`src/app/middlewares/csrfGuard.js`):**
   - Applies to all state-changing requests (`POST`, `PUT`, `PATCH`, `DELETE`).
   - Validates `Sec-Fetch-Site` header (allowing only `same-origin` and `none`).
   - Validates request `Origin` (rejecting `null` and mismatched hosts).
   - Validates `Referer` fallback headers against the incoming host.
4. **Rate Limiting (`src/app/middlewares/rateLimiters.js`):**
   - `POST /forgot-password`: Capped at 5 requests/15 min by IP, and 3 requests/15 min by normalized email.
   - `POST /reset-password/:token`: Capped at 10 requests/15 min by IP.
   - `POST /login`: Limit of 100 failed attempts/15 min by IP, and 10 failed attempts/15 min by combined `IP + normalized identifier` (`skipSuccessfulRequests: true`).
5. **Secure One-Time Password Reset Tokens:**
   - Generates 20 cryptographically random bytes via `crypto.randomBytes(20)`.
   - Stores only a SHA-256 hash in MongoDB with a 15-minute expiration timestamp (`Date.now() + 15 * 60 * 1000`).
   - The token and expiration are set to `null` immediately upon successful reset, preventing replay attacks.
6. **ReDoS & Query Injection Mitigation (`escapeRegex`):**
   - All user-supplied search parameters used in MongoDB `$regex` queries pass through `src/util/escapeRegex.js` to escape regex special characters (`[.*+?^${}()|[\]\\]`).
7. **XSS Mitigation:**
   - Handlebars server-side expressions (`{{ }}`) escape HTML entities by default.
   - Dynamic client-side DOM insertions apply strict 5-character HTML escaping (`&`, `<`, `>`, `"`, `'`).
8. **Atomic Concurrency & Inventory Protection:**
   - Checkout uses `BorrowTicket.findOneAndUpdate` to lock active tickets into `PROCESSING` state before stock reduction.
   - Stock deduction uses atomic `$inc: { availableQuantity: -1 }` with `{ availableQuantity: { $gt: 0 } }` to prevent negative inventory.
   - Returns check unreturned status atomically and guard the stock ceiling (`$expr: { $lt: ['$availableQuantity', '$totalQuantity'] }`).
   - Attendance check-in race conditions are blocked by a unique compound index `{ userId: 1, dateKey: 1 }`.
9. **HTTP Header Hardening:**
   - `app.disable('x-powered-by')` conceals server technology.
   - Global headers set `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, and `Referrer-Policy: same-origin`.

---

## Project Structure

```text
Library-Management-System/
├── .env.example                    # Sample environment variable template
├── .gitignore                      # Git ignored files and directories
├── AGENTS.md                       # Internal project conventions and guidelines
├── package.json                    # Project dependencies and script definitions
├── package-lock.json               # Locked dependency tree
├── src/
│   ├── index.js                    # Express application entry point & server bootstrap
│   ├── config/
│   │   └── db/
│   │       └── index.js            # MongoDB Mongoose connection configuration
│   ├── routes/                     # Express route modules
│   │   ├── index.js                # Master route aggregator
│   │   ├── admin.js                # Administrator endpoints
│   │   ├── attendance.js           # Reader attendance endpoints
│   │   ├── auth.js                 # Login, logout & password reset endpoints
│   │   ├── book.js                 # Catalog & book viewing endpoints
│   │   ├── cart.js                 # Borrowing cart & QR ticket endpoints
│   │   ├── history.js              # Reader borrow history endpoints
│   │   ├── profile.js              # Reader profile & password change endpoints
│   │   ├── scanner.js              # Reader QR attendance scanner endpoints
│   │   └── site.js                 # Public homepage & landing endpoints
│   ├── app/
│   │   ├── controllers/            # MVC Controllers
│   │   │   ├── AdminController.js
│   │   │   ├── AttendanceController.js
│   │   │   ├── AuthController.js
│   │   │   ├── BookController.js
│   │   │   ├── CartController.js
│   │   │   ├── HistoryController.js
│   │   │   ├── ProfileController.js
│   │   │   ├── ScannerController.js
│   │   │   └── SiteController.js
│   │   ├── models/                 # Mongoose Schemas & Models
│   │   │   ├── ActivityLog.js
│   │   │   ├── Attendance.js
│   │   │   ├── Book.js
│   │   │   ├── BorrowRecord.js
│   │   │   ├── BorrowTicket.js
│   │   │   ├── Category.js
│   │   │   ├── Loan.js
│   │   │   └── User.js
│   │   ├── middlewares/            # Express Middlewares
│   │   │   ├── authMiddleware.js   # requireAuth & requireAdmin RBAC
│   │   │   ├── csrfGuard.js        # Origin / Sec-Fetch-Site CSRF validation
│   │   │   ├── rateLimiters.js     # express-rate-limit configurations
│   │   │   └── viewLocalsMiddleware.js # Exposes user & cart counts to views
│   │   ├── helpers/                # Domain helper utilities
│   │   │   ├── attendanceHelper.js # Period calculations & attendance formatting
│   │   │   ├── emailHelper.js      # Nodemailer transport & mailer helper
│   │   │   └── loggerHelper.js     # Activity audit log creation & seeding
│   │   └── services/               # Data seeders & services
│   │       ├── borrowRecordSeeder.js
│   │       └── seeder.js           # Default admin account initialization
│   ├── util/                       # Reusable utility functions
│   │   ├── borrowHelper.js         # Overdue calculation & loan formatting
│   │   ├── escapeRegex.js          # MongoDB regex input sanitization
│   │   ├── mongoose.js             # Lean document transformation helpers
│   │   └── slugify.js              # Vietnamese-compatible slug generation
│   ├── public/                     # Static assets (compiled CSS, JS, images)
│   │   ├── css/app.css
│   │   ├── js/admin-scanner.js
│   │   └── img/
│   └── resources/
│       ├── scss/app.scss           # Master SCSS styles
│       └── views/                  # Handlebars templates
│           ├── layouts/            # main, user, auth layouts
│           ├── partials/           # header, footer, button, input partials
│           ├── admin/              # Admin view templates
│           ├── auth/               # Login, forgot & reset password templates
│           └── ...                 # User-facing templates (books, cart, history, etc.)
└── tests/                          # Automated test suite
    ├── test.env                    # Isolated test environment variables
    ├── helpers.js                  # Test server bootstrap, email stub & cleanup
    ├── smoke.test.js               # End-to-end smoke test scenarios (A - E)
    └── regression.test.js          # Security & concurrency regression tests (1 - 7)
```

---

## Prerequisites

Before running the application locally, ensure you have the following installed:

- **Node.js**: Version **`20.6.0` or higher** (required for native `--env-file` configuration and the Node.js Test Runner).
- **npm**: Version **`9.0.0` or higher** (bundled with Node.js).
- **MongoDB**: Community Server version **`6.0` or higher** running locally on port `27017`, or a reachable MongoDB connection URI.

---

## Installation and Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/tuandang-dev/nodejs_library_management.git
   cd nodejs_library_management
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Copy the provided `.env.example` file to create a local `.env` file:
   ```bash
   cp .env.example .env
   ```
   Open `.env` in a text editor and fill in your local values (refer to the [Environment Variables](#environment-variables) section below).

---

## Environment Variables

The application reads configuration from `.env` via the Node.js `--env-file=.env` flag:

| Variable Name | Required | Description | Safe Example Value |
| :--- | :---: | :--- | :--- |
| `PORT` | Optional | Port on which the HTTP server listens|
| `MONGODB_URI` | **Yes** | MongoDB connection string for the development database |
| `SESSION_SECRET` | **Yes** | Secret string used to sign session cookies |
| `EMAIL_USER` | Optional | Gmail/SMTP username for sending notifications |
| `EMAIL_PASS` | Optional | App-specific password for SMTP authentication |
| `NODE_ENV` | Optional | Environment mode (`development`, `production`, `test`) |
| `ADMIN_DEFAULT_PASSWORD` | **Yes** | Password used when auto-seeding the default admin |

> [!WARNING]
> Never commit your `.env` file or real secrets to version control. Keep credentials safe and use app-specific passwords when configuring SMTP.

---

## Running the Application

### 1. Start the Development Server
Starts the application using `nodemon` with automatic environment variable injection and debugging inspection:
```bash
npm start
```
The server will start and output:
```text
Connect successfully!!!
Tài khoản Admin mặc định đã tồn tại.
App listening on port 3000
```
Visit `http://localhost:3000` in your browser.

### 2. Compile SCSS Styles (Optional / Asset Development)
If you modify SCSS files under `src/resources/scss/`, run the Sass watcher in a separate terminal:
```bash
npm run watch
```

### 3. Code Formatting
To format staged code using Prettier via lint-staged:
```bash
npm run beautiful
```

---

## Automated Testing

The project includes an automated test suite executed with the native **Node.js Test Runner** (`node:test` and `node:assert`).

### Running the Test Suite
Execute the entire test suite with:
```bash
npm test
```

### Test Database Isolation & Safety Architecture
Automated tests are strictly isolated from development data:
- **Dedicated Test Database:** Tests run under `tests/test.env` pointing strictly to `library-management-test`.
- **Accidental Execution Safeguard:** In `tests/helpers.js`, both `initTestServer()` and `cleanupTestData()` inspect `mongoose.connection.name`. If the connected database is not `library-management-test`, test execution aborts immediately with an error.
- **Dynamic Port Binding:** The test server binds to a randomly assigned free port (`port 0`), preventing port conflicts with local instances.
- **Stubbed Email Dispatch:** Nodemailer `sendEmail` is stubbed in-memory during tests; no real emails are transmitted.
- **Strict Data Lifecycle Cleanup:** Synthetic test documents use the prefix `TEST_SMOKE_` or `TEST_REGR_`. Before and after each suite, hard deletions (`deleteMany`) clean all test documents without affecting existing development data.

### Test Coverage (12 Verified Tests across 2 Suites)

1. **Smoke Tests (`tests/smoke.test.js`):**
   - **Scenario A (Guest):** Verifies public pages return HTTP 200, protected routes return HTTP 302 redirects to `/login`, and invalid routes return HTTP 404.
   - **Scenario B (Student):** Verifies login, catalog browsing, cart additions, QR ticket generation (`TKT-...`), daily attendance check-in, duplicate check-in rejection (HTTP 400), password updates, and admin route rejection (HTTP 403).
   - **Scenario C (Ownership):** Verifies readers cannot view tickets belonging to other students (HTTP 404).
   - **Scenario D (Admin):** Verifies access to the dashboard, user and book tables, CSV exports (HTTP 200 `text/csv`), QR ticket verification, atomic checkout, book returns, email reminders, and logout.
   - **Scenario E (CSRF Guard):** Verifies requests from foreign origins are blocked (HTTP 403).

2. **Regression & Security Tests (`tests/regression.test.js`):**
   - **Test 1:** Attendance race conditions (concurrent check-in requests allow only one record per day).
   - **Test 2:** Last-copy concurrent checkout race conditions (prevents inventory from dropping below zero).
   - **Test 3:** Duplicate book return race conditions (prevents available inventory from exceeding total stock).
   - **Test 4:** Password reset token security (SHA-256 storage, 15-minute expiration, and single-use invalidation).
   - **Test 5:** Login rate limiting (blocks brute force after 10 failed attempts with HTTP 429).
   - **Test 6:** CSRF Guard validation (blocks spoofed origins, `null` origins, and cross-site fetch requests with HTTP 403).
   - **Test 7:** Login identifier flexibility (verifies login with Student ID and case-insensitive/trimmed email).

---

## Database and Seed Data

### Initialization & Default Admin Seeding
On server startup (`src/index.js` -> `src/config/db/index.js`), the application connects to MongoDB and runs `seedAdmin()` (`src/app/services/seeder.js`):
- If no user with email `admin@library.com` exists, an administrator account is created:
  - **Full Name:** System Admin
  - **Email:** `admin@library.com`
  - **Password:** Sourced from `ADMIN_DEFAULT_PASSWORD` in your `.env` file
  - **Role:** `admin`
  - **Status:** `active`

### Sample Activity Logs
During initial bootstrap, if the `ActivityLog` collection is empty, `seedSampleLogs()` (`src/app/helpers/loggerHelper.js`) creates 4 sample log entries across books, users, authentication, and system categories for demonstration.

### Reader Borrow Records Service
The project includes `seedBorrowRecordsForUser(userId)` (`src/app/services/borrowRecordSeeder.js`) as a standalone helper to populate 5 sample borrowing records for demonstration or testing purposes.

---

## Usage Guide

### 1. Logging in as Administrator
1. Navigate to `http://localhost:3000/login`.
2. Enter the administrator credentials:
   - **Username / Student Number:** `admin@library.com`
   - **Password:** The password configured in your `ADMIN_DEFAULT_PASSWORD` environment variable.
3. Click **Sign In**. You will be directed to `/admin/dashboard`.
4. From the admin navigation bar:
   - Manage users (`/admin/users`) or import them via CSV.
   - Manage books (`/admin/books`) or export inventory as CSV.
   - Open the QR Circulation Desk (`/admin/scanner`) to verify and check out student borrow tickets.
   - Monitor overdue books and trigger reminders (`/admin/alerts`).
   - Review audit logs (`/admin/logs`) and attendance histories (`/admin/attendance`).

### 2. Logging in as a Student
1. Create a student account through `/admin/users` or via CSV import, providing a **Full Name**, **Email**, **Student ID**, and password.
2. Sign in at `http://localhost:3000/login` using either the **Email** or **Student ID**.
3. Browse books at `/book` and click **Add to Cart**.
4. Open the cart at `/cart` and click **Checkout**.
5. Present the generated QR Borrow Ticket to the library administrator for scanning.
6. Check in for the day at `/scanner` or review borrowing records at `/history`.

---

## Troubleshooting

- **MongoDB Connection Failure (`Connect failure!!!`):**
  - Verify that the MongoDB daemon is running locally (`mongod` or via Windows Services).
  - Check the `MONGODB_URI` string in `.env`.
- **Node.js Environment Syntax Error / Unknown `--env-file` Flag:**
  - Verify your Node.js version using `node -v`. Upgrade to Node.js `>= 20.6.0` to support the built-in `--env-file` flag.
- **Emails Not Sending for Overdue Alerts or Password Resets:**
  - Ensure `EMAIL_USER` and `EMAIL_PASS` are configured in `.env`.
  - When using Gmail, generate and use an **App Password** rather than your personal account password.
- **Port Conflict (`EADDRINUSE: address already in use`):**
  - Change `PORT=3000` in `.env` to an alternate open port (e.g., `3001` or `8080`).
- **Styles Not Updating After SCSS Changes:**
  - Run `npm run watch` to recompile `src/resources/scss/app.scss` into `src/public/css/app.css`.

---

## Future Improvements

- **Fine-Grained Permission Matrix:** Implement granular permissions for librarians and circulation staff beyond the current binary `admin` and `user` roles.
- **Persistent Session Store:** Transition session storage from in-memory memory store to MongoDB (`connect-mongo`) or Redis for production cluster horizontal scaling.
- **Automated Scheduled Tasks:** Add background cron jobs to check overdue records daily and automatically trigger email reminders.
- **Book Reservation & Hold Queue:** Enable students to place hold requests on currently borrowed titles with queue notifications.
- **Decoupled RESTful API:** Expose headless REST or GraphQL endpoints for mobile app integration.

---

## Author / Contact

- **Author:** `[Đặng Anh Tuấn]`
- **GitHub:** `[https://github.com/tuandang-dev]`
- **Email:** `[danganht456@gmail.com]`
- **Project Repository:** [https://github.com/tuandang-dev/nodejs_library_management](https://github.com/tuandang-dev/nodejs_library_management)
