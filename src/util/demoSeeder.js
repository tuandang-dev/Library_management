const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const QRCode = require('qrcode');

const Category = require('../app/models/Category');
const Book = require('../app/models/Book');
const User = require('../app/models/User');
const BorrowTicket = require('../app/models/BorrowTicket');
const BorrowRecord = require('../app/models/BorrowRecord');
const Attendance = require('../app/models/Attendance');
const ActivityLog = require('../app/models/ActivityLog');

const DEFAULT_COVER = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400';

const categoriesData = [
    { name: 'Computer Science', slug: 'computer-science' },
    { name: 'Software Engineering', slug: 'software-engineering' },
    { name: 'Artificial Intelligence', slug: 'artificial-intelligence' },
    { name: 'Data Science & Analytics', slug: 'data-science-analytics' },
    { name: 'Information Security', slug: 'information-security' },
    { name: 'Business & Management', slug: 'business-management' },
    { name: 'Mathematics & Statistics', slug: 'mathematics-statistics' },
];

const booksData = [
    {
        bookId: 'BK-CS101',
        title: 'Introduction to Algorithms, Fourth Edition',
        author: 'Thomas H. Cormen, Charles E. Leiserson',
        isbn: '978-0262046305',
        categorySlug: 'computer-science',
        categoryName: 'Computer Science',
        totalQuantity: 12,
        availableQuantity: 9,
        location: 'Section A, Shelf 1',
        description: 'Comprehensive introduction to the modern study of computer algorithms.',
        image: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?auto=format&fit=crop&q=80&w=400',
    },
    {
        bookId: 'BK-CS102',
        title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
        author: 'Robert C. Martin',
        isbn: '978-0132350884',
        categorySlug: 'software-engineering',
        categoryName: 'Software Engineering',
        totalQuantity: 8,
        availableQuantity: 5,
        location: 'Section A, Shelf 2',
        description: 'Even bad code can function. But if code isn\'t clean, it can bring a development organization to its knees.',
        image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400',
    },
    {
        bookId: 'BK-CS103',
        title: 'Design Patterns: Elements of Reusable Object-Oriented Software',
        author: 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides',
        isbn: '978-0201633610',
        categorySlug: 'software-engineering',
        categoryName: 'Software Engineering',
        totalQuantity: 10,
        availableQuantity: 7,
        location: 'Section A, Shelf 3',
        description: 'Captures a wealth of experience about the design of object-oriented software by four top designers.',
        image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400',
    },
    {
        bookId: 'BK-AI201',
        title: 'Artificial Intelligence: A Modern Approach, 4th Edition',
        author: 'Stuart Russell, Peter Norvig',
        isbn: '978-0134610993',
        categorySlug: 'artificial-intelligence',
        categoryName: 'Artificial Intelligence',
        totalQuantity: 6,
        availableQuantity: 3,
        location: 'Section B, Shelf 1',
        description: 'The standard textbook in Artificial Intelligence used in over 1,500 universities worldwide.',
        image: 'https://images.unsplash.com/photo-1507842229451-7f01be7ac102?auto=format&fit=crop&q=80&w=400',
    },
    {
        bookId: 'BK-AI202',
        title: 'Deep Learning',
        author: 'Ian Goodfellow, Yoshua Bengio, Aaron Courville',
        isbn: '978-0262035613',
        categorySlug: 'artificial-intelligence',
        categoryName: 'Artificial Intelligence',
        totalQuantity: 8,
        availableQuantity: 6,
        location: 'Section B, Shelf 2',
        description: 'An introduction to a broad range of topics in deep learning, covering mathematical foundations.',
        image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=400',
    },
    {
        bookId: 'BK-AI203',
        title: 'Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow',
        author: 'Aurélien Géron',
        isbn: '978-1492032649',
        categorySlug: 'artificial-intelligence',
        categoryName: 'Artificial Intelligence',
        totalQuantity: 10,
        availableQuantity: 7,
        location: 'Section B, Shelf 3',
        description: 'Practical guide to building intelligent systems using concrete examples and minimal theory.',
        image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=400',
    },
    {
        bookId: 'BK-DS301',
        title: 'Python for Data Analysis, 3rd Edition',
        author: 'Wes McKinney',
        isbn: '978-1098104030',
        categorySlug: 'data-science-analytics',
        categoryName: 'Data Science & Analytics',
        totalQuantity: 15,
        availableQuantity: 11,
        location: 'Section C, Shelf 1',
        description: 'Complete guide for manipulating, processing, cleaning, and crunching datasets in Python.',
        image: DEFAULT_COVER,
    },
    {
        bookId: 'BK-DS302',
        title: 'Designing Data-Intensive Applications',
        author: 'Martin Kleppmann',
        isbn: '978-1449373320',
        categorySlug: 'data-science-analytics',
        categoryName: 'Data Science & Analytics',
        totalQuantity: 9,
        availableQuantity: 4,
        location: 'Section C, Shelf 2',
        description: 'Key principles, algorithms, and practical trade-offs for distributed data systems.',
        image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400',
    },
    {
        bookId: 'BK-DS303',
        title: 'Database System Concepts, 7th Edition',
        author: 'Abraham Silberschatz, Henry F. Korth',
        isbn: '978-0078022159',
        categorySlug: 'computer-science',
        categoryName: 'Computer Science',
        totalQuantity: 12,
        availableQuantity: 10,
        location: 'Section C, Shelf 3',
        description: 'Foundational concepts of database management and query processing.',
        image: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?auto=format&fit=crop&q=80&w=400',
    },
    {
        bookId: 'BK-SE401',
        title: 'The Pragmatic Programmer: Your Journey To Mastery',
        author: 'David Thomas, Andrew Hunt',
        isbn: '978-0135957059',
        categorySlug: 'software-engineering',
        categoryName: 'Software Engineering',
        totalQuantity: 7,
        availableQuantity: 5,
        location: 'Section D, Shelf 1',
        description: 'One of the most significant books on software craftsmanship and pragmatic engineering.',
        image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400',
    },
    {
        bookId: 'BK-SE402',
        title: 'Refactoring: Improving the Design of Existing Code',
        author: 'Martin Fowler',
        isbn: '978-0134757599',
        categorySlug: 'software-engineering',
        categoryName: 'Software Engineering',
        totalQuantity: 6,
        availableQuantity: 4,
        location: 'Section D, Shelf 2',
        description: 'Understand the principles and specific techniques of refactoring codebases safely.',
        image: DEFAULT_COVER,
    },
    {
        bookId: 'BK-SE403',
        title: 'Building Microservices: Designing Fine-Grained Systems',
        author: 'Sam Newman',
        isbn: '978-1492034025',
        categorySlug: 'software-engineering',
        categoryName: 'Software Engineering',
        totalQuantity: 8,
        availableQuantity: 6,
        location: 'Section D, Shelf 3',
        description: 'Comprehensive guide to designing, developing, and managing microservice architectures.',
        image: 'https://images.unsplash.com/photo-1507842229451-7f01be7ac102?auto=format&fit=crop&q=80&w=400',
    },
    {
        bookId: 'BK-SEC501',
        title: 'Computer Security: Principles and Practice',
        author: 'William Stallings, Lawrie Brown',
        isbn: '978-0134794105',
        categorySlug: 'information-security',
        categoryName: 'Information Security',
        totalQuantity: 10,
        availableQuantity: 8,
        location: 'Section E, Shelf 1',
        description: 'Core security principles, cryptographic fundamentals, and operating system safeguards.',
        image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=400',
    },
    {
        bookId: 'BK-SEC502',
        title: 'The Web Application Hacker\'s Handbook',
        author: 'Dafydd Stuttard, Marcus Pinto',
        isbn: '978-1118026472',
        categorySlug: 'information-security',
        categoryName: 'Information Security',
        totalQuantity: 5,
        availableQuantity: 2,
        location: 'Section E, Shelf 2',
        description: 'Definitive guide to finding and exploiting security flaws in modern web applications.',
        image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=400',
    },
    {
        bookId: 'BK-SEC503',
        title: 'Practical Malware Analysis',
        author: 'Michael Sikorski, Andrew Honig',
        isbn: '978-1593272906',
        categorySlug: 'information-security',
        categoryName: 'Information Security',
        totalQuantity: 6,
        availableQuantity: 5,
        location: 'Section E, Shelf 3',
        description: 'Hands-on guide to dissecting malicious software and reverse engineering binaries.',
        image: DEFAULT_COVER,
    },
    {
        bookId: 'BK-BUS601',
        title: 'The Lean Startup',
        author: 'Eric Ries',
        isbn: '978-0307887894',
        categorySlug: 'business-management',
        categoryName: 'Business & Management',
        totalQuantity: 12,
        availableQuantity: 9,
        location: 'Section F, Shelf 1',
        description: 'How today\'s entrepreneurs use continuous innovation to create radically successful businesses.',
        image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400',
    },
    {
        bookId: 'BK-BUS602',
        title: 'Principles of Economics, 9th Edition',
        author: 'N. Gregory Mankiw',
        isbn: '978-0357038314',
        categorySlug: 'business-management',
        categoryName: 'Business & Management',
        totalQuantity: 10,
        availableQuantity: 8,
        location: 'Section F, Shelf 2',
        description: 'Clear and engaging introduction to microeconomics and macroeconomics principles.',
        image: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?auto=format&fit=crop&q=80&w=400',
    },
    {
        bookId: 'BK-MATH701',
        title: 'Linear Algebra and Its Applications, 5th Edition',
        author: 'David C. Lay, Steven R. Lay',
        isbn: '978-0321982384',
        categorySlug: 'mathematics-statistics',
        categoryName: 'Mathematics & Statistics',
        totalQuantity: 14,
        availableQuantity: 11,
        location: 'Section G, Shelf 1',
        description: 'Matrix algebra, vector spaces, eigenvalues, and linear transformations applied in computing.',
        image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400',
    },
    {
        bookId: 'BK-MATH702',
        title: 'Probability and Statistics for Engineering and the Sciences',
        author: 'Jay L. Devore',
        isbn: '978-1305251809',
        categorySlug: 'mathematics-statistics',
        categoryName: 'Mathematics & Statistics',
        totalQuantity: 8,
        availableQuantity: 5,
        location: 'Section G, Shelf 2',
        description: 'Comprehensive introduction to probability models and statistical methodology.',
        image: 'https://images.unsplash.com/photo-1507842229451-7f01be7ac102?auto=format&fit=crop&q=80&w=400',
    },
    {
        bookId: 'BK-CS104',
        title: 'Computer Networks, 5th Edition',
        author: 'Andrew S. Tanenbaum, David J. Wetherall',
        isbn: '978-0132126953',
        categorySlug: 'computer-science',
        categoryName: 'Computer Science',
        totalQuantity: 11,
        availableQuantity: 9,
        location: 'Section A, Shelf 4',
        description: 'Classic textbook on networking architecture from physical layer to application protocols.',
        image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=400',
    },
];

const studentsData = [
    { studentId: 'STU10001', fullname: 'Alex Johnson', email: 'student.demo@library.com' },
    { studentId: 'STU10002', fullname: 'Maria Garcia', email: 'maria.garcia@library.com' },
    { studentId: 'STU10003', fullname: 'David Wilson', email: 'david.wilson@library.com' },
    { studentId: 'STU10004', fullname: 'Emma Davis', email: 'emma.davis@library.com' },
    { studentId: 'STU10005', fullname: 'Michael Brown', email: 'michael.brown@library.com' },
    { studentId: 'STU10006', fullname: 'Sophia Martinez', email: 'sophia.martinez@library.com' },
    { studentId: 'STU10007', fullname: 'James Anderson', email: 'james.anderson@library.com' },
    { studentId: 'STU10008', fullname: 'Olivia Taylor', email: 'olivia.taylor@library.com' },
    { studentId: 'STU10009', fullname: 'Daniel Thomas', email: 'daniel.thomas@library.com' },
    { studentId: 'STU10010', fullname: 'Emily Jackson', email: 'emily.jackson@library.com' },
    { studentId: 'STU10011', fullname: 'Lucas White', email: 'lucas.white@library.com' },
    { studentId: 'STU10012', fullname: 'Chloe Harris', email: 'chloe.harris@library.com' },
    { studentId: 'STU10013', fullname: 'William Clark', email: 'william.clark@library.com' },
];

async function seedDemoDataset() {
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            console.error('❌ [seedDemoDataset] Missing MONGODB_URI environment variable.');
            process.exit(1);
        }

        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(mongoUri);
        console.log(`✅ Connected successfully to: ${mongoose.connection.name}`);

        // 1. Seed Categories (idempotent: match by slug)
        console.log('\n📁 [1/7] Seeding Categories...');
        const categoryMap = new Map();
        for (const cat of categoriesData) {
            const savedCat = await Category.findOneAndUpdate(
                { slug: cat.slug },
                { $set: { name: cat.name, slug: cat.slug } },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            categoryMap.set(cat.slug, savedCat);
        }
        console.log(`   ✔ Seeded ${categoryMap.size} categories.`);

        // 2. Seed Books (idempotent: match by bookId)
        console.log('\n📚 [2/7] Seeding Books...');
        const bookMap = new Map();
        for (const b of booksData) {
            const catDoc = categoryMap.get(b.categorySlug);
            const savedBook = await Book.findOneAndUpdate(
                { bookId: b.bookId },
                {
                    $set: {
                        title: b.title,
                        author: b.author,
                        isbn: b.isbn,
                        categoryId: catDoc ? catDoc._id : null,
                        category: b.categoryName,
                        location: b.location,
                        totalQuantity: b.totalQuantity,
                        availableQuantity: b.availableQuantity,
                        description: b.description,
                        image: b.image,
                        status: 'available',
                    },
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            bookMap.set(b.bookId, savedBook);
        }
        console.log(`   ✔ Seeded ${bookMap.size} books.`);

        // 3. Seed Users (Admin + 13 Students)
        console.log('\n👥 [3/7] Seeding Users...');
        const adminPasswordRaw = process.env.ADMIN_DEFAULT_PASSWORD || 'admin123';
        const studentPasswordRaw = process.env.STUDENT_DEFAULT_PASSWORD || 'student123';

        const adminPasswordHash = await bcrypt.hash(adminPasswordRaw, 10);
        const studentPasswordHash = await bcrypt.hash(studentPasswordRaw, 10);

        // Seed Admin
        const adminUser = await User.findOneAndUpdate(
            { email: 'admin@library.com' },
            {
                $set: {
                    fullname: 'System Admin',
                    email: 'admin@library.com',
                    password: adminPasswordHash,
                    role: 'admin',
                    status: 'active',
                    mustChangePassword: false,
                    lastActive: new Date(),
                },
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // Seed Students
        const userMap = new Map();
        for (const stu of studentsData) {
            const savedUser = await User.findOneAndUpdate(
                { email: stu.email },
                {
                    $set: {
                        fullname: stu.fullname,
                        studentId: stu.studentId,
                        email: stu.email,
                        password: studentPasswordHash,
                        role: 'user',
                        status: 'active',
                        mustChangePassword: false,
                        lastActive: new Date(),
                    },
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            userMap.set(stu.studentId, savedUser);
        }
        console.log(`   ✔ Seeded 1 Admin and ${userMap.size} Student accounts.`);

        // 4. Seed BorrowTickets
        console.log('\n🎫 [4/7] Seeding BorrowTickets...');
        const primaryStudent = userMap.get('STU10001');
        const secondStudent = userMap.get('STU10002');
        const thirdStudent = userMap.get('STU10003');

        const now = new Date();
        const activeExpiresAt = new Date(now.getTime() + 15 * 60 * 1000); // 15 mins
        const expectedReturn = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

        const book1 = bookMap.get('BK-CS101');
        const book2 = bookMap.get('BK-CS102');
        const book3 = bookMap.get('BK-AI201');

        // Create QR Payload & QR Data URL for active ticket
        const activeTicketId = 'TKT-DEMO-ACTIVE-01';
        const qrPayloadActive = JSON.stringify({
            ticketId: activeTicketId,
            userId: primaryStudent._id,
            totalItems: 2,
            generatedAt: now.toISOString(),
        });
        const qrDataUrlActive = await QRCode.toDataURL(qrPayloadActive, {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            margin: 2,
            width: 280,
        });

        const activeTicket2Id = 'TKT-DEMO-ACTIVE-02';
        const qrPayloadActive2 = JSON.stringify({
            ticketId: activeTicket2Id,
            userId: secondStudent._id,
            totalItems: 1,
            generatedAt: now.toISOString(),
        });
        const qrDataUrlActive2 = await QRCode.toDataURL(qrPayloadActive2, {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            margin: 2,
            width: 280,
        });

        await BorrowTicket.findOneAndUpdate(
            { ticketId: activeTicketId },
            {
                $set: {
                    userId: primaryStudent._id,
                    items: [
                        {
                            bookId: book1._id,
                            title: book1.title,
                            author: book1.author,
                            isbn: book1.isbn,
                            category: book1.category,
                            location: book1.location,
                            image: book1.image,
                        },
                        {
                            bookId: book2._id,
                            title: book2.title,
                            author: book2.author,
                            isbn: book2.isbn,
                            category: book2.category,
                            location: book2.location,
                            image: book2.image,
                        },
                    ],
                    qrCodeDataUrl: qrDataUrlActive,
                    expectedReturnDate: expectedReturn,
                    status: 'ACTIVE',
                    generatedAt: now,
                    expiresAt: activeExpiresAt,
                },
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        await BorrowTicket.findOneAndUpdate(
            { ticketId: activeTicket2Id },
            {
                $set: {
                    userId: secondStudent._id,
                    items: [
                        {
                            bookId: book3._id,
                            title: book3.title,
                            author: book3.author,
                            isbn: book3.isbn,
                            category: book3.category,
                            location: book3.location,
                            image: book3.image,
                        },
                    ],
                    qrCodeDataUrl: qrDataUrlActive2,
                    expectedReturnDate: expectedReturn,
                    status: 'ACTIVE',
                    generatedAt: now,
                    expiresAt: activeExpiresAt,
                },
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        await BorrowTicket.findOneAndUpdate(
            { ticketId: 'TKT-DEMO-COMPLETED-01' },
            {
                $set: {
                    userId: thirdStudent._id,
                    items: [
                        {
                            bookId: book1._id,
                            title: book1.title,
                            author: book1.author,
                            isbn: book1.isbn,
                            category: book1.category,
                            location: book1.location,
                            image: book1.image,
                        },
                    ],
                    qrCodeDataUrl: qrDataUrlActive,
                    expectedReturnDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
                    status: 'COMPLETED',
                    generatedAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
                    expiresAt: new Date(now.getTime() - 19 * 24 * 60 * 60 * 1000),
                },
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        console.log('   ✔ Seeded 3 BorrowTickets (2 ACTIVE ready for QR scanner, 1 COMPLETED).');

        // 5. Seed BorrowRecords (16 records with RETURNED, BORROWED, OVERDUE tiers)
        console.log('\n📖 [5/7] Seeding BorrowRecords...');
        const oneDayMs = 24 * 60 * 60 * 1000;

        const borrowRecordsPlan = [
            // Student 1 (Alex Johnson - Primary Demo Student) - 6 records
            {
                user: primaryStudent,
                book: bookMap.get('BK-CS101'),
                ticketId: 'TKT-DEMO-REC-01',
                borrowDate: new Date(now.getTime() - 20 * oneDayMs),
                dueDate: new Date(now.getTime() - 6 * oneDayMs),
                returnDate: new Date(now.getTime() - 8 * oneDayMs),
                status: 'RETURNED',
                notes: 'Returned in pristine condition',
            },
            {
                user: primaryStudent,
                book: bookMap.get('BK-CS102'),
                ticketId: 'TKT-DEMO-REC-02',
                borrowDate: new Date(now.getTime() - 16 * oneDayMs),
                dueDate: new Date(now.getTime() - 2 * oneDayMs), // Overdue by 2 days -> Tier OVERDUE
                returnDate: null,
                status: 'OVERDUE',
                remindersSent: 1,
                lastReminderSentAt: new Date(now.getTime() - 1 * oneDayMs),
                notes: 'First reminder sent',
            },
            {
                user: primaryStudent,
                book: bookMap.get('BK-AI201'),
                ticketId: 'TKT-DEMO-REC-03',
                borrowDate: new Date(now.getTime() - 22 * oneDayMs),
                dueDate: new Date(now.getTime() - 8 * oneDayMs), // Overdue by 8 days -> Tier CRITICAL
                returnDate: null,
                status: 'OVERDUE',
                remindersSent: 2,
                lastReminderSentAt: new Date(now.getTime() - 2 * oneDayMs),
                notes: 'Critical tier warning',
            },
            {
                user: primaryStudent,
                book: bookMap.get('BK-AI202'),
                ticketId: 'TKT-DEMO-REC-04',
                borrowDate: new Date(now.getTime() - 50 * oneDayMs),
                dueDate: new Date(now.getTime() - 36 * oneDayMs), // Overdue by 36 days -> Tier LOST
                returnDate: null,
                status: 'OVERDUE',
                remindersSent: 3,
                lastReminderSentAt: new Date(now.getTime() - 5 * oneDayMs),
                notes: 'Lost alert tier reached',
            },
            {
                user: primaryStudent,
                book: bookMap.get('BK-DS301'),
                ticketId: 'TKT-DEMO-REC-05',
                borrowDate: new Date(now.getTime() - 4 * oneDayMs),
                dueDate: new Date(now.getTime() + 10 * oneDayMs),
                returnDate: null,
                status: 'BORROWED',
                notes: 'Active loan within due window',
            },
            {
                user: primaryStudent,
                book: bookMap.get('BK-SE401'),
                ticketId: 'TKT-DEMO-REC-06',
                borrowDate: new Date(now.getTime() - 30 * oneDayMs),
                dueDate: new Date(now.getTime() - 16 * oneDayMs),
                returnDate: new Date(now.getTime() - 18 * oneDayMs),
                status: 'RETURNED',
                notes: 'Returned on schedule',
            },

            // Student 2 (Maria Garcia) - 2 records
            {
                user: userMap.get('STU10002'),
                book: bookMap.get('BK-DS302'),
                ticketId: 'TKT-DEMO-REC-07',
                borrowDate: new Date(now.getTime() - 18 * oneDayMs),
                dueDate: new Date(now.getTime() - 4 * oneDayMs), // Overdue by 4 days -> Tier OVERDUE
                returnDate: null,
                status: 'OVERDUE',
                remindersSent: 1,
                lastReminderSentAt: new Date(now.getTime() - 2 * oneDayMs),
                notes: 'Standard overdue',
            },
            {
                user: userMap.get('STU10002'),
                book: bookMap.get('BK-SEC501'),
                ticketId: 'TKT-DEMO-REC-08',
                borrowDate: new Date(now.getTime() - 5 * oneDayMs),
                dueDate: new Date(now.getTime() + 9 * oneDayMs),
                returnDate: null,
                status: 'BORROWED',
                notes: 'Active reading',
            },

            // Student 3 (David Wilson) - 2 records
            {
                user: userMap.get('STU10003'),
                book: bookMap.get('BK-SEC502'),
                ticketId: 'TKT-DEMO-REC-09',
                borrowDate: new Date(now.getTime() - 24 * oneDayMs),
                dueDate: new Date(now.getTime() - 10 * oneDayMs), // Overdue by 10 days -> Tier CRITICAL
                returnDate: null,
                status: 'OVERDUE',
                remindersSent: 2,
                lastReminderSentAt: new Date(now.getTime() - 3 * oneDayMs),
                notes: 'Critical overdue reminder sent',
            },
            {
                user: userMap.get('STU10003'),
                book: bookMap.get('BK-BUS601'),
                ticketId: 'TKT-DEMO-REC-10',
                borrowDate: new Date(now.getTime() - 12 * oneDayMs),
                dueDate: new Date(now.getTime() + 2 * oneDayMs),
                returnDate: new Date(now.getTime() - 1 * oneDayMs),
                status: 'RETURNED',
                notes: 'Returned early',
            },

            // Student 4 (Emma Davis) - 2 records
            {
                user: userMap.get('STU10004'),
                book: bookMap.get('BK-BUS602'),
                ticketId: 'TKT-DEMO-REC-11',
                borrowDate: new Date(now.getTime() - 60 * oneDayMs),
                dueDate: new Date(now.getTime() - 46 * oneDayMs), // Overdue by 46 days -> Tier LOST
                returnDate: null,
                status: 'OVERDUE',
                remindersSent: 4,
                lastReminderSentAt: new Date(now.getTime() - 6 * oneDayMs),
                notes: 'Case marked for replacement follow-up',
            },
            {
                user: userMap.get('STU10004'),
                book: bookMap.get('BK-MATH701'),
                ticketId: 'TKT-DEMO-REC-12',
                borrowDate: new Date(now.getTime() - 6 * oneDayMs),
                dueDate: new Date(now.getTime() + 8 * oneDayMs),
                returnDate: null,
                status: 'BORROWED',
                notes: 'Course study material',
            },

            // Student 5 (Michael Brown) - 2 records
            {
                user: userMap.get('STU10005'),
                book: bookMap.get('BK-MATH702'),
                ticketId: 'TKT-DEMO-REC-13',
                borrowDate: new Date(now.getTime() - 45 * oneDayMs),
                dueDate: new Date(now.getTime() - 31 * oneDayMs),
                returnDate: new Date(now.getTime() - 33 * oneDayMs),
                status: 'RETURNED',
                notes: 'Returned in good order',
            },
            {
                user: userMap.get('STU10005'),
                book: bookMap.get('BK-CS104'),
                ticketId: 'TKT-DEMO-REC-14',
                borrowDate: new Date(now.getTime() - 3 * oneDayMs),
                dueDate: new Date(now.getTime() + 11 * oneDayMs),
                returnDate: null,
                status: 'BORROWED',
                notes: 'Current active loan',
            },

            // Student 6 (Sophia Martinez) - 2 records
            {
                user: userMap.get('STU10006'),
                book: bookMap.get('BK-AI203'),
                ticketId: 'TKT-DEMO-REC-15',
                borrowDate: new Date(now.getTime() - 15 * oneDayMs),
                dueDate: new Date(now.getTime() - 1 * oneDayMs),
                returnDate: new Date(now.getTime() - 1 * oneDayMs),
                status: 'RETURNED',
                notes: 'Returned on due date',
            },
            {
                user: userMap.get('STU10006'),
                book: bookMap.get('BK-SE402'),
                ticketId: 'TKT-DEMO-REC-16',
                borrowDate: new Date(now.getTime() - 2 * oneDayMs),
                dueDate: new Date(now.getTime() + 12 * oneDayMs),
                returnDate: null,
                status: 'BORROWED',
                notes: 'Current active loan',
            },
        ];

        let seededRecordsCount = 0;
        for (const plan of borrowRecordsPlan) {
            await BorrowRecord.findOneAndUpdate(
                { ticketId: plan.ticketId },
                {
                    $set: {
                        userId: plan.user._id,
                        bookId: plan.book._id,
                        ticketId: plan.ticketId,
                        borrowDate: plan.borrowDate,
                        dueDate: plan.dueDate,
                        returnDate: plan.returnDate,
                        staffName: 'Sarah Chen',
                        status: plan.status,
                        remindersSent: plan.remindersSent || 0,
                        lastReminderSentAt: plan.lastReminderSentAt || null,
                        notes: plan.notes || '',
                    },
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            seededRecordsCount++;
        }
        console.log(`   ✔ Seeded ${seededRecordsCount} BorrowRecords (covers RETURNED, BORROWED, and all 3 alert tiers: OVERDUE, CRITICAL, LOST).`);

        // 6. Seed Attendances (15 unique records respecting { userId: 1, dateKey: 1 } and Asia/Ho_Chi_Minh)
        console.log('\n📅 [6/7] Seeding Attendance Logs...');
        const formatDateKey = (date) => {
            return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(date);
        };

        const today = new Date();
        const attendancePlan = [
            // Today (4 students)
            { user: userMap.get('STU10001'), date: new Date(today.getTime() - 2 * 60 * 60 * 1000), location: 'Library Entrance' },
            { user: userMap.get('STU10002'), date: new Date(today.getTime() - 3 * 60 * 60 * 1000), location: 'Main Hall Desk' },
            { user: userMap.get('STU10003'), date: new Date(today.getTime() - 4 * 60 * 60 * 1000), location: 'Study Area 2F' },
            { user: userMap.get('STU10004'), date: new Date(today.getTime() - 5 * 60 * 60 * 1000), location: 'Library Entrance' },

            // Yesterday (3 students)
            { user: userMap.get('STU10001'), date: new Date(today.getTime() - 1 * oneDayMs - 1 * 60 * 60 * 1000), location: 'Library Entrance' },
            { user: userMap.get('STU10005'), date: new Date(today.getTime() - 1 * oneDayMs - 2 * 60 * 60 * 1000), location: 'Study Area 2F' },
            { user: userMap.get('STU10006'), date: new Date(today.getTime() - 1 * oneDayMs - 3 * 60 * 60 * 1000), location: 'Main Hall Desk' },

            // 2 Days ago (3 students)
            { user: userMap.get('STU10001'), date: new Date(today.getTime() - 2 * oneDayMs - 2 * 60 * 60 * 1000), location: 'Library Entrance' },
            { user: userMap.get('STU10007'), date: new Date(today.getTime() - 2 * oneDayMs - 4 * 60 * 60 * 1000), location: 'Study Area 3F' },
            { user: userMap.get('STU10008'), date: new Date(today.getTime() - 2 * oneDayMs - 5 * 60 * 60 * 1000), location: 'Main Hall Desk' },

            // 3 Days ago (2 students)
            { user: userMap.get('STU10009'), date: new Date(today.getTime() - 3 * oneDayMs - 2 * 60 * 60 * 1000), location: 'Library Entrance' },
            { user: userMap.get('STU10010'), date: new Date(today.getTime() - 3 * oneDayMs - 3 * 60 * 60 * 1000), location: 'Study Area 2F' },

            // 5 Days ago (2 students)
            { user: userMap.get('STU10001'), date: new Date(today.getTime() - 5 * oneDayMs - 1 * 60 * 60 * 1000), location: 'Library Entrance' },
            { user: userMap.get('STU10011'), date: new Date(today.getTime() - 5 * oneDayMs - 4 * 60 * 60 * 1000), location: 'Main Hall Desk' },

            // 7 Days ago (1 student)
            { user: userMap.get('STU10001'), date: new Date(today.getTime() - 7 * oneDayMs - 3 * 60 * 60 * 1000), location: 'Library Entrance' },
        ];

        let seededAttendanceCount = 0;
        for (const item of attendancePlan) {
            const dateKey = formatDateKey(item.date);
            await Attendance.findOneAndUpdate(
                { userId: item.user._id, dateKey: dateKey },
                {
                    $set: {
                        studentId: item.user.studentId,
                        dateKey: dateKey,
                        checkInTime: item.date,
                        method: 'QR_CODE',
                        location: item.location,
                        notes: 'Recorded via QR scan portal',
                    },
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            seededAttendanceCount++;
        }
        console.log(`   ✔ Seeded ${seededAttendanceCount} Attendance logs with valid Asia/Ho_Chi_Minh dateKeys.`);

        // 7. Seed ActivityLogs (20 logs covering all categories)
        console.log('\n📜 [7/7] Seeding Activity Logs...');
        const activityLogsPlan = [
            {
                action: 'Admin Sign In',
                category: 'authentication',
                categoryLabel: 'Authentication',
                description: 'System administrator signed into the admin portal.',
                actor: { name: 'System Admin', role: 'admin' },
                icon: 'fa-right-to-bracket',
                createdAt: new Date(now.getTime() - 10 * 60 * 1000),
            },
            {
                action: 'Checkout Completed',
                category: 'books',
                categoryLabel: 'Books',
                description: 'Desk checkout completed for Alex Johnson (BK-CS101, BK-CS102).',
                actor: { name: 'Sarah Chen', role: 'admin' },
                icon: 'fa-book-open',
                createdAt: new Date(now.getTime() - 25 * 60 * 1000),
            },
            {
                action: 'Check-in Recorded',
                category: 'attendance',
                categoryLabel: 'Attendance',
                description: 'Recorded library check-in for Alex Johnson (STU10001).',
                actor: { name: 'Sarah Chen', role: 'admin' },
                icon: 'fa-qrcode',
                createdAt: new Date(now.getTime() - 40 * 60 * 1000),
            },
            {
                action: 'Check-in Recorded',
                category: 'attendance',
                categoryLabel: 'Attendance',
                description: 'Recorded library check-in for Maria Garcia (STU10002).',
                actor: { name: 'Sarah Chen', role: 'admin' },
                icon: 'fa-qrcode',
                createdAt: new Date(now.getTime() - 55 * 60 * 1000),
            },
            {
                action: 'Book Returned',
                category: 'books',
                categoryLabel: 'Books',
                description: 'Returned book received: Introduction to Algorithms.',
                actor: { name: 'Sarah Chen', role: 'admin' },
                icon: 'fa-rotate-left',
                createdAt: new Date(now.getTime() - 75 * 60 * 1000),
            },
            {
                action: 'User Profile Updated',
                category: 'users',
                categoryLabel: 'Users',
                description: 'Student account status verified and permissions refreshed.',
                actor: { name: 'System Admin', role: 'admin' },
                icon: 'fa-user-pen',
                createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
            },
            {
                action: 'Student Sign In',
                category: 'authentication',
                categoryLabel: 'Authentication',
                description: 'Alex Johnson signed in from student portal.',
                actor: { name: 'Alex Johnson', role: 'user' },
                icon: 'fa-right-to-bracket',
                createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000),
            },
            {
                action: 'Overdue Reminder Sent',
                category: 'books',
                categoryLabel: 'Books',
                description: 'Automated email reminder dispatched for overdue item (BK-CS102).',
                actor: { name: 'System', role: 'system' },
                icon: 'fa-envelope',
                createdAt: new Date(now.getTime() - 5 * 60 * 60 * 1000),
            },
            {
                action: 'Bulk Reminders Dispatched',
                category: 'books',
                categoryLabel: 'Books',
                description: 'Bulk notification broadcast sent to 4 overdue readers.',
                actor: { name: 'Sarah Chen', role: 'admin' },
                icon: 'fa-paper-plane',
                createdAt: new Date(now.getTime() - 8 * 60 * 60 * 1000),
            },
            {
                action: 'Bulk Student Import',
                category: 'users',
                categoryLabel: 'Users',
                description: 'Imported 12 new student profiles from registry CSV.',
                actor: { name: 'System Admin', role: 'admin' },
                icon: 'fa-file-import',
                createdAt: new Date(now.getTime() - 1 * oneDayMs),
            },
            {
                action: 'New Book Added',
                category: 'books',
                categoryLabel: 'Books',
                description: 'Added new volume: Designing Data-Intensive Applications.',
                actor: { name: 'System Admin', role: 'admin' },
                icon: 'fa-plus',
                createdAt: new Date(now.getTime() - 1 * oneDayMs - 2 * 60 * 60 * 1000),
            },
            {
                action: 'Check-in Recorded',
                category: 'attendance',
                categoryLabel: 'Attendance',
                description: 'Recorded library check-in for David Wilson (STU10003).',
                actor: { name: 'Sarah Chen', role: 'admin' },
                icon: 'fa-qrcode',
                createdAt: new Date(now.getTime() - 1 * oneDayMs - 4 * 60 * 60 * 1000),
            },
            {
                action: 'Check-in Recorded',
                category: 'attendance',
                categoryLabel: 'Attendance',
                description: 'Recorded library check-in for Emma Davis (STU10004).',
                actor: { name: 'Sarah Chen', role: 'admin' },
                icon: 'fa-qrcode',
                createdAt: new Date(now.getTime() - 1 * oneDayMs - 5 * 60 * 60 * 1000),
            },
            {
                action: 'Password Changed',
                category: 'authentication',
                categoryLabel: 'Authentication',
                description: 'User successfully updated security credentials.',
                actor: { name: 'Alex Johnson', role: 'user' },
                icon: 'fa-key',
                createdAt: new Date(now.getTime() - 2 * oneDayMs),
            },
            {
                action: 'Database Indexes Verified',
                category: 'system',
                categoryLabel: 'System',
                description: 'Verified compound indexes across collections for high performance.',
                actor: { name: 'System', role: 'system' },
                icon: 'fa-database',
                createdAt: new Date(now.getTime() - 2 * oneDayMs - 3 * 60 * 60 * 1000),
            },
            {
                action: 'Session Store Initialized',
                category: 'system',
                categoryLabel: 'System',
                description: 'Persistent MongoStore active with 1-day TTL session retention.',
                actor: { name: 'System', role: 'system' },
                icon: 'fa-server',
                createdAt: new Date(now.getTime() - 3 * oneDayMs),
            },
            {
                action: 'User Account Created',
                category: 'users',
                categoryLabel: 'Users',
                description: 'Created student record: Alex Johnson (STU10001).',
                actor: { name: 'System Admin', role: 'admin' },
                icon: 'fa-user-plus',
                createdAt: new Date(now.getTime() - 3 * oneDayMs - 4 * 60 * 60 * 1000),
            },
            {
                action: 'Check-in Recorded',
                category: 'attendance',
                categoryLabel: 'Attendance',
                description: 'Recorded library check-in for Michael Brown (STU10005).',
                actor: { name: 'Sarah Chen', role: 'admin' },
                icon: 'fa-qrcode',
                createdAt: new Date(now.getTime() - 4 * oneDayMs),
            },
            {
                action: 'Inventory Exported',
                category: 'books',
                categoryLabel: 'Books',
                description: 'Catalog inventory exported to CSV format by administrator.',
                actor: { name: 'System Admin', role: 'admin' },
                icon: 'fa-file-export',
                createdAt: new Date(now.getTime() - 5 * oneDayMs),
            },
            {
                action: 'System Health Check',
                category: 'system',
                categoryLabel: 'System',
                description: 'All services, caches, and database replication reported operational.',
                actor: { name: 'System', role: 'system' },
                icon: 'fa-shield-halved',
                createdAt: new Date(now.getTime() - 6 * oneDayMs),
            },
        ];

        let seededLogsCount = 0;
        for (const logItem of activityLogsPlan) {
            await ActivityLog.findOneAndUpdate(
                { description: logItem.description },
                {
                    $set: {
                        action: logItem.action,
                        category: logItem.category,
                        categoryLabel: logItem.categoryLabel,
                        description: logItem.description,
                        actor: logItem.actor,
                        icon: logItem.icon,
                        createdAt: logItem.createdAt,
                    },
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            seededLogsCount++;
        }
        console.log(`   ✔ Seeded ${seededLogsCount} Activity Logs across all categories.`);

        // Final Summary Table
        console.log('\n' + '='.repeat(68));
        console.log('             🎉 DEMO DATASET SEEDING COMPLETED SUCCESSFULLY!             ');
        console.log('='.repeat(68));
        console.table([
            { Entity: 'Categories', Count: categoryMap.size, Notes: 'Computer Science, AI, SE, Data...' },
            { Entity: 'Books', Count: bookMap.size, Notes: '12-20 items -> Pagination on /book & /admin/books' },
            { Entity: 'Users', Count: userMap.size + 1, Notes: '1 Admin + 13 Students -> Pagination on /admin/users' },
            { Entity: 'BorrowTickets', Count: 3, Notes: '2 ACTIVE (ready for QR scan), 1 COMPLETED' },
            { Entity: 'BorrowRecords', Count: seededRecordsCount, Notes: 'RETURNED, BORROWED, OVERDUE, CRITICAL, LOST' },
            { Entity: 'Attendances', Count: seededAttendanceCount, Notes: 'Asia/Ho_Chi_Minh dateKeys, today & past days' },
            { Entity: 'ActivityLogs', Count: seededLogsCount, Notes: 'Trải đều 5 categories -> Pagination on /admin/logs' },
        ]);

        console.log('\n🔑 DEMO LOGIN CREDENTIALS:');
        console.log('--------------------------------------------------------------------');
        console.log('1. Administrator Account:');
        console.log('   - Email:    admin@library.com');
        console.log(`   - Password: ${adminPasswordRaw}`);
        console.log('   - Role:     admin (Full Access to Admin Portal)');
        console.log('\n2. Primary Student Account:');
        console.log('   - Email:      student.demo@library.com');
        console.log('   - Student ID: STU10001');
        console.log(`   - Password:   ${studentPasswordRaw}`);
        console.log('   - Role:       user (Student Portal)');
        console.log('\n3. Additional Student Accounts (Sample):');
        console.log(`   - Maria Garcia:   maria.garcia@library.com  (ID: STU10002 / Pass: ${studentPasswordRaw})`);
        console.log(`   - David Wilson:   david.wilson@library.com  (ID: STU10003 / Pass: ${studentPasswordRaw})`);
        console.log(`   - Emma Davis:     emma.davis@library.com    (ID: STU10004 / Pass: ${studentPasswordRaw})`);
        console.log('\n4. Sample Active QR Ticket ID for Desk Scanner Test:');
        console.log(`   - Ticket ID 1: ${activeTicketId} (Alex Johnson - 2 Books)`);
        console.log(`   - Ticket ID 2: ${activeTicket2Id} (Maria Garcia - 1 Book)`);
        console.log('   (Paste either ID into "/admin/scanner" input to simulate a QR scan)');
        console.log('--------------------------------------------------------------------\n');

        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB. Process finished cleanly.\n');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during demo dataset seeding:', error);
        await mongoose.disconnect().catch(() => {});
        process.exit(1);
    }
}

seedDemoDataset();
