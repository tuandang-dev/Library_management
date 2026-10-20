const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const QRCode = require('qrcode');
const crypto = require('node:crypto');
const dns = require('node:dns').promises;
const escapeRegex = require('./escapeRegex');

const DATASET = 'library-demo-v1';
const TARGET_HOST = 'library-management-syst.acu8hcg.mongodb.net';
const TARGET_DB = 'test';
const CONFIRMATION = DATASET + '@' + TARGET_HOST + '/' + TARGET_DB;

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

// Chỉ dựng dữ liệu trong bộ nhớ; không kết nối hoặc ghi database.
async function buildDemoPlan({
    now = new Date(),
    studentPasswordHash = 'NOT_FOR_INSERT',
} = {}) {
    const batches = Object.fromEntries(
        [
            'categories',
            'books',
            'users',
            'borrowtickets',
            'borrowrecords',
            'attendances',
            'activitylogs',
        ].map((name) => [name, []]),
    );
    function add(collection, key, payload) {
        const hex = crypto
            .createHash('sha256')
            .update(DATASET + ':' + collection + ':' + key)
            .digest('hex')
            .slice(0, 24);
        const doc = {
            ...payload,
            _id: new mongoose.Types.ObjectId(hex),
            createdAt: payload.createdAt || new Date(now),
            updatedAt: new Date(now),
        };
        if (collection === 'borrowtickets') doc.ticketId = key;
        if (
            ['books', 'users', 'borrowtickets', 'borrowrecords'].includes(
                collection,
            )
        )
            doc.deleted = false;
        batches[collection].push(doc);
        return doc;
    }
    // 1. Seed Categories (idempotent: match by slug)
    const categoryMap = new Map();
    for (const cat of categoriesData) {
        const savedCat = add('categories', cat.slug, {
            name: cat.name,
            slug: cat.slug,
        });
        categoryMap.set(cat.slug, savedCat);
    }

    // 2. Seed Books (idempotent: match by bookId)
    const bookMap = new Map();
    for (const b of booksData) {
        const catDoc = categoryMap.get(b.categorySlug);
        const savedBook = add('books', b.bookId, {
            bookId: b.bookId,
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
        });
        bookMap.set(b.bookId, savedBook);
    }

    // 3. Chỉ tạo sinh viên demo; admin do startup quản lý.
    // Seed Students
    const userMap = new Map();
    for (const stu of studentsData) {
        const savedUser = add('users', stu.studentId, {
            fullname: stu.fullname,
            studentId: stu.studentId,
            email: stu.email,
            password: studentPasswordHash,
            role: 'user',
            status: 'active',
            mustChangePassword: false,
            lastActive: new Date(now),
        });
        userMap.set(stu.studentId, savedUser);
    }

    // 4. Seed BorrowTickets
    const primaryStudent = userMap.get('STU10001');
    const secondStudent = userMap.get('STU10002');
    const thirdStudent = userMap.get('STU10003');

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

    add('borrowtickets', activeTicketId, {
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
    });

    add('borrowtickets', activeTicket2Id, {
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
    });

    add('borrowtickets', 'TKT-DEMO-COMPLETED-01', {
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
        qrCodeDataUrl: '',
        expectedReturnDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        status: 'COMPLETED',
        generatedAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(now.getTime() - 19 * 24 * 60 * 60 * 1000),
    });

    // 5. Seed BorrowRecords (16 records with RETURNED, BORROWED, OVERDUE tiers)
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

    for (const plan of borrowRecordsPlan) {
        add('borrowrecords', plan.ticketId, {
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
        });
    }

    // 6. Seed Attendances (15 unique records respecting { userId: 1, dateKey: 1 } and Asia/Ho_Chi_Minh)
    const formatDateKey = (date) => {
        return new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Asia/Ho_Chi_Minh',
        }).format(date);
    };

    const dateParts = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Ho_Chi_Minh',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(now);
    const today = new Date(`${dateParts}T12:00:00+07:00`);
    const attendancePlan = [
        // Today (4 students)
        {
            user: userMap.get('STU10001'),
            date: new Date(today.getTime() - 2 * 60 * 60 * 1000),
            location: 'Library Entrance',
        },
        {
            user: userMap.get('STU10002'),
            date: new Date(today.getTime() - 3 * 60 * 60 * 1000),
            location: 'Main Hall Desk',
        },
        {
            user: userMap.get('STU10003'),
            date: new Date(today.getTime() - 4 * 60 * 60 * 1000),
            location: 'Study Area 2F',
        },
        {
            user: userMap.get('STU10004'),
            date: new Date(today.getTime() - 5 * 60 * 60 * 1000),
            location: 'Library Entrance',
        },

        // Yesterday (3 students)
        {
            user: userMap.get('STU10001'),
            date: new Date(today.getTime() - 1 * oneDayMs - 1 * 60 * 60 * 1000),
            location: 'Library Entrance',
        },
        {
            user: userMap.get('STU10005'),
            date: new Date(today.getTime() - 1 * oneDayMs - 2 * 60 * 60 * 1000),
            location: 'Study Area 2F',
        },
        {
            user: userMap.get('STU10006'),
            date: new Date(today.getTime() - 1 * oneDayMs - 3 * 60 * 60 * 1000),
            location: 'Main Hall Desk',
        },

        // 2 Days ago (3 students)
        {
            user: userMap.get('STU10001'),
            date: new Date(today.getTime() - 2 * oneDayMs - 2 * 60 * 60 * 1000),
            location: 'Library Entrance',
        },
        {
            user: userMap.get('STU10007'),
            date: new Date(today.getTime() - 2 * oneDayMs - 4 * 60 * 60 * 1000),
            location: 'Study Area 3F',
        },
        {
            user: userMap.get('STU10008'),
            date: new Date(today.getTime() - 2 * oneDayMs - 5 * 60 * 60 * 1000),
            location: 'Main Hall Desk',
        },

        // 3 Days ago (2 students)
        {
            user: userMap.get('STU10009'),
            date: new Date(today.getTime() - 3 * oneDayMs - 2 * 60 * 60 * 1000),
            location: 'Library Entrance',
        },
        {
            user: userMap.get('STU10010'),
            date: new Date(today.getTime() - 3 * oneDayMs - 3 * 60 * 60 * 1000),
            location: 'Study Area 2F',
        },

        // 5 Days ago (2 students)
        {
            user: userMap.get('STU10001'),
            date: new Date(today.getTime() - 5 * oneDayMs - 1 * 60 * 60 * 1000),
            location: 'Library Entrance',
        },
        {
            user: userMap.get('STU10011'),
            date: new Date(today.getTime() - 5 * oneDayMs - 4 * 60 * 60 * 1000),
            location: 'Main Hall Desk',
        },

        // 7 Days ago (1 student)
        {
            user: userMap.get('STU10001'),
            date: new Date(today.getTime() - 7 * oneDayMs - 3 * 60 * 60 * 1000),
            location: 'Library Entrance',
        },
    ];

    for (const [index, item] of attendancePlan.entries()) {
        const dateKey = formatDateKey(item.date);
        add('attendances', `attendance-${index}`, {
            userId: item.user._id,
            studentId: item.user.studentId,
            dateKey: dateKey,
            checkInTime: item.date,
            method: 'QR_CODE',
            location: item.location,
            notes: 'Recorded via QR scan portal',
        });
    }

    // 7. Seed ActivityLogs (20 logs covering all categories)
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
            description:
                'Desk checkout completed for Alex Johnson (BK-CS101, BK-CS102).',
            actor: { name: 'Sarah Chen', role: 'admin' },
            icon: 'fa-book-open',
            createdAt: new Date(now.getTime() - 25 * 60 * 1000),
        },
        {
            action: 'Check-in Recorded',
            category: 'attendance',
            categoryLabel: 'Attendance',
            description:
                'Recorded library check-in for Alex Johnson (STU10001).',
            actor: { name: 'Sarah Chen', role: 'admin' },
            icon: 'fa-qrcode',
            createdAt: new Date(now.getTime() - 40 * 60 * 1000),
        },
        {
            action: 'Check-in Recorded',
            category: 'attendance',
            categoryLabel: 'Attendance',
            description:
                'Recorded library check-in for Maria Garcia (STU10002).',
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
            description:
                'Student account status verified and permissions refreshed.',
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
            description:
                'Automated email reminder dispatched for overdue item (BK-CS102).',
            actor: { name: 'System', role: 'system' },
            icon: 'fa-envelope',
            createdAt: new Date(now.getTime() - 5 * 60 * 60 * 1000),
        },
        {
            action: 'Bulk Reminders Dispatched',
            category: 'books',
            categoryLabel: 'Books',
            description:
                'Bulk notification broadcast sent to 4 overdue readers.',
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
            description:
                'Added new volume: Designing Data-Intensive Applications.',
            actor: { name: 'System Admin', role: 'admin' },
            icon: 'fa-plus',
            createdAt: new Date(
                now.getTime() - 1 * oneDayMs - 2 * 60 * 60 * 1000,
            ),
        },
        {
            action: 'Check-in Recorded',
            category: 'attendance',
            categoryLabel: 'Attendance',
            description:
                'Recorded library check-in for David Wilson (STU10003).',
            actor: { name: 'Sarah Chen', role: 'admin' },
            icon: 'fa-qrcode',
            createdAt: new Date(
                now.getTime() - 1 * oneDayMs - 4 * 60 * 60 * 1000,
            ),
        },
        {
            action: 'Check-in Recorded',
            category: 'attendance',
            categoryLabel: 'Attendance',
            description: 'Recorded library check-in for Emma Davis (STU10004).',
            actor: { name: 'Sarah Chen', role: 'admin' },
            icon: 'fa-qrcode',
            createdAt: new Date(
                now.getTime() - 1 * oneDayMs - 5 * 60 * 60 * 1000,
            ),
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
            description:
                'Verified compound indexes across collections for high performance.',
            actor: { name: 'System', role: 'system' },
            icon: 'fa-database',
            createdAt: new Date(
                now.getTime() - 2 * oneDayMs - 3 * 60 * 60 * 1000,
            ),
        },
        {
            action: 'Session Store Initialized',
            category: 'system',
            categoryLabel: 'System',
            description:
                'Persistent MongoStore active with 1-day TTL session retention.',
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
            createdAt: new Date(
                now.getTime() - 3 * oneDayMs - 4 * 60 * 60 * 1000,
            ),
        },
        {
            action: 'Check-in Recorded',
            category: 'attendance',
            categoryLabel: 'Attendance',
            description:
                'Recorded library check-in for Michael Brown (STU10005).',
            actor: { name: 'Sarah Chen', role: 'admin' },
            icon: 'fa-qrcode',
            createdAt: new Date(now.getTime() - 4 * oneDayMs),
        },
        {
            action: 'Inventory Exported',
            category: 'books',
            categoryLabel: 'Books',
            description:
                'Catalog inventory exported to CSV format by administrator.',
            actor: { name: 'System Admin', role: 'admin' },
            icon: 'fa-file-export',
            createdAt: new Date(now.getTime() - 5 * oneDayMs),
        },
        {
            action: 'System Health Check',
            category: 'system',
            categoryLabel: 'System',
            description:
                'All services, caches, and database replication reported operational.',
            actor: { name: 'System', role: 'system' },
            icon: 'fa-shield-halved',
            createdAt: new Date(now.getTime() - 6 * oneDayMs),
        },
    ];

    for (const [index, logItem] of activityLogsPlan.entries()) {
        add('activitylogs', `log-${index}`, {
            action: logItem.action,
            category: logItem.category,
            categoryLabel: logItem.categoryLabel,
            description: `[DEMO library-demo-v1] ${logItem.description}`,
            actor: logItem.actor,
            icon: logItem.icon,
            createdAt: logItem.createdAt,
        });
    }

    // Tồn kho ban đầu khớp các lượt mượn chưa trả; vé ACTIVE chưa trừ kho.
    for (const book of batches.books) {
        const borrowed = batches.borrowrecords.filter(
            (record) =>
                String(record.bookId) === String(book._id) &&
                !record.returnDate,
        ).length;
        book.availableQuantity = book.totalQuantity - borrowed;
        if (book.availableQuantity < 0)
            throw new Error('Invalid demo inventory.');
    }
    return batches;
}

class SeedError extends Error {}

function parseOptions(args) {
    const options = { write: false, publicDns: false };
    for (const arg of args) {
        if (arg === '--write') options.write = true;
        else if (arg === '--dns-cloudflare') options.publicDns = true;
        else if (arg === '--dry-run') continue;
        else if (arg === `--confirm=${CONFIRMATION}`) options.confirmed = true;
        else
            throw new SeedError(
                'Unknown option or incorrect target confirmation.',
            );
    }
    if (args.includes('--dry-run') && options.write)
        throw new SeedError('Choose dry-run or write, not both.');
    if (options.write && !options.confirmed)
        throw new SeedError('Writing requires explicit target confirmation.');
    return options;
}

function validateTarget(uri) {
    let target;
    try {
        target = new URL(uri);
    } catch {
        throw new SeedError('Invalid MONGODB_URI.');
    }
    const allowed = new Set(['retryWrites', 'w', 'appName', 'authSource']);
    if (
        target.protocol !== 'mongodb+srv:' ||
        target.hostname !== TARGET_HOST ||
        target.port ||
        target.pathname !== `/${TARGET_DB}` ||
        target.hash ||
        [...target.searchParams.keys()].some((key) => !allowed.has(key))
    ) {
        throw new SeedError(
            'Target refused: use the approved Atlas cluster and explicit /test database.',
        );
    }
}

// Bao gồm bản ghi xóa mềm bằng collection trực tiếp, không qua plugin.
function naturalKeys(name, doc) {
    switch (name) {
        case 'categories':
            return [{ slug: doc.slug }, { name: doc.name }];
        case 'books':
            return [{ bookId: doc.bookId }, { isbn: doc.isbn }];
        case 'users':
            return [
                { email: new RegExp(`^${escapeRegex(doc.email)}$`, 'i') },
                { studentId: doc.studentId },
            ];
        case 'borrowtickets':
        case 'borrowrecords':
            return [{ ticketId: doc.ticketId }];
        case 'attendances':
            return [{ userId: doc.userId, dateKey: doc.dateKey }];
        case 'activitylogs':
            return [{ description: doc.description }];
        default:
            throw new SeedError('Unknown demo collection.');
    }
}

function validateIdentity(name, actual, expected) {
    if (actual.deleted || actual.deletedAt)
        throw new SeedError(
            `Soft-deleted demo document in ${name}; manual review required.`,
        );
    const fields = {
        categories: ['name', 'slug'],
        books: ['bookId', 'isbn', 'categoryId'],
        users: ['email', 'studentId', 'role'],
        borrowtickets: ['ticketId', 'userId'],
        borrowrecords: ['ticketId', 'userId', 'bookId'],
        attendances: ['userId', 'studentId'],
        activitylogs: ['description'],
    }[name];
    if (
        fields.some(
            (field) => String(actual[field]) !== String(expected[field]),
        )
    ) {
        throw new SeedError(
            `Demo identity or reference changed in ${name}; manual review required.`,
        );
    }
    if (
        name === 'borrowtickets' &&
        JSON.stringify(actual.items?.map((item) => String(item.bookId))) !==
            JSON.stringify(expected.items.map((item) => String(item.bookId)))
    ) {
        throw new SeedError(
            'Demo ticket references changed; manual review required.',
        );
    }
    if (name === 'attendances') {
        const time = new Date(actual.checkInTime);
        if (
            Number.isNaN(time.getTime()) ||
            actual.dateKey !==
                new Intl.DateTimeFormat('en-CA', {
                    timeZone: 'Asia/Ho_Chi_Minh',
                }).format(time)
        )
            throw new SeedError('Invalid demo attendance date.');
    }
}

async function inspectDataset(db, batches, session) {
    let present = 0;
    let total = 0;
    for (const [name, docs] of Object.entries(batches)) {
        total += docs.length;
        const expected = new Map(docs.map((doc) => [String(doc._id), doc]));
        const query = {
            $or: [
                { _id: { $in: docs.map((doc) => doc._id) } },
                ...docs.flatMap((doc) => naturalKeys(name, doc)),
            ],
        };
        const found = await db
            .collection(name)
            .find(query, { session })
            .toArray();
        for (const actual of found) {
            const planned = expected.get(String(actual._id));
            if (!planned)
                throw new SeedError(
                    `Natural-key conflict in ${name}; no data will be replaced.`,
                );
            validateIdentity(name, actual, planned);
            present++;
        }
    }
    if (present && present !== total)
        throw new SeedError('Incomplete demo dataset; manual review required.');
    return present ? 'exists' : 'new';
}

// Không tạo index trong seed. Index thiếu phải được kiểm tra riêng trước khi cho phép ghi.
async function checkIndexes(db, session) {
    const required = {
        categories: [{ name: 1 }, { slug: 1 }],
        books: [{ bookId: 1 }, { isbn: 1 }],
        users: [{ email: 1 }],
        borrowtickets: [{ ticketId: 1 }],
        attendances: [{ userId: 1, dateKey: 1 }],
        borrowrecords: [],
        activitylogs: [],
    };
    for (const [name, keys] of Object.entries(required)) {
        let indexes;
        try {
            indexes = await db
                .collection(name)
                .listIndexes({ session })
                .toArray();
        } catch {
            throw new SeedError(
                `Cannot inspect collection/indexes in ${name}; manual review required.`,
            );
        }
        for (const key of keys) {
            if (
                !indexes.some(
                    (index) =>
                        index.unique &&
                        JSON.stringify(index.key) === JSON.stringify(key) &&
                        !index.sparse &&
                        (!index.collation ||
                            index.collation.locale === 'simple') &&
                        (!index.partialFilterExpression ||
                            (name === 'attendances' &&
                                JSON.stringify(
                                    index.partialFilterExpression,
                                ) ===
                                    JSON.stringify({
                                        dateKey: { $exists: true },
                                    }))),
                )
            ) {
                throw new SeedError(
                    `Required unique index missing or unsuitable in ${name}.`,
                );
            }
        }
    }
}

function loadModels() {
    return {
        categories: require('../app/models/Category'),
        books: require('../app/models/Book'),
        users: require('../app/models/User'),
        borrowtickets: require('../app/models/BorrowTicket'),
        borrowrecords: require('../app/models/BorrowRecord'),
        attendances: require('../app/models/Attendance'),
        activitylogs: require('../app/models/ActivityLog'),
    };
}

async function validatePlan(batches, models) {
    const result = {};
    for (const [name, docs] of Object.entries(batches)) {
        result[name] = [];
        for (const doc of docs) {
            const instance = new models[name](doc);
            await instance.validate();
            result[name].push(
                instance.toObject({ virtuals: false, versionKey: false }),
            );
        }
    }
    return result;
}

async function runSeed({
    args = process.argv.slice(2),
    env = process.env,
    connection = mongoose,
    resolver = dns,
    logger = console,
    modelLoader = loadModels,
    hash = bcrypt.hash,
    now = new Date(),
} = {}) {
    let connectionAttempted = false;
    let session;
    try {
        const options = parseOptions(args);
        validateTarget(env.MONGODB_URI);
        if (options.publicDns) resolver.setServers(['1.1.1.1']);
        // Không nạp ứng dụng hoặc gọi startup seeder; không tự tạo collection/index.
        connectionAttempted = true;
        await connection.connect(env.MONGODB_URI, {
            autoIndex: false,
            autoCreate: false,
            serverSelectionTimeoutMS: 10000,
        });
        if (connection.connection.name !== TARGET_DB)
            throw new SeedError(
                'Connected database does not match the approved target.',
            );
        const db = connection.connection.db;
        const batches = await buildDemoPlan({ now });
        const state = await inspectDataset(db, batches);
        if (state === 'exists') {
            logger.log('Demo dataset already exists; no documents changed.');
            return 'exists';
        }
        await checkIndexes(db);
        if (!options.write) {
            logger.log(
                'Dry-run: target, conflicts and indexes checked. No documents written.',
            );
            return 'dry-run';
        }
        if (
            !env.STUDENT_DEFAULT_PASSWORD ||
            env.STUDENT_DEFAULT_PASSWORD.length < 6
        ) {
            throw new SeedError(
                'STUDENT_DEFAULT_PASSWORD must contain at least 6 characters for new demo students.',
            );
        }
        const passwordHash = await hash(env.STUDENT_DEFAULT_PASSWORD, 10);
        for (const user of batches.users) user.password = passwordHash;
        const validated = await validatePlan(batches, modelLoader());
        session = await connection.startSession();
        // Mọi lần retry đọc lại trạng thái. Không song song hóa thao tác trong transaction.
        const outcome = await session.withTransaction(
            async () => {
                const current = await inspectDataset(db, batches, session);
                if (current === 'exists') return 'exists';
                for (const [name, docs] of Object.entries(validated)) {
                    await db
                        .collection(name)
                        .insertMany(docs, { session, ordered: true });
                }
                return 'created';
            },
            {
                readConcern: { level: 'snapshot' },
                writeConcern: { w: 'majority' },
                readPreference: 'primary',
            },
        );
        logger.log(
            outcome === 'created'
                ? 'Demo dataset committed. Admin and existing documents were not changed.'
                : 'Demo dataset already exists; no documents changed.',
        );
        return outcome;
    } catch (error) {
        // Không in URI, password, hash hoặc đối tượng lỗi do driver trả về.
        logger.error(
            error instanceof SeedError
                ? error.message
                : 'Demo seed failed. No success confirmed; inspect dataset state before retrying.',
        );
        throw new SeedError('Demo seed did not complete successfully.');
    } finally {
        try {
            if (session) await session.endSession();
        } finally {
            if (connectionAttempted) await connection.disconnect();
        }
    }
}

module.exports = {
    buildDemoPlan,
    runSeed,
    parseOptions,
    validateTarget,
    inspectDataset,
    validatePlan,
    CONFIRMATION,
};

if (require.main === module) {
    runSeed().catch(() => {
        process.exitCode = 1;
    });
}
