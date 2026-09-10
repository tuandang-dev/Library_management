const QRCode = require('qrcode');
const crypto = require('crypto');
const Book = require('../models/Book');
const BorrowTicket = require('../models/BorrowTicket');

class CartController {
    // [GET] /cart
    index(req, res) {
        try {
            const currentUser = req.session.user;
            const cart = req.session.cart || [];
            const returnDate = new Date();
            returnDate.setDate(returnDate.getDate() + 14);
            const formattedReturnDate = `${returnDate.getMonth() + 1}/${returnDate.getDate()}/${returnDate.getFullYear()}`;

            return res.render('cart', {
                title: 'My Cart - UCC Library',
                layout: 'user',
                user: currentUser,
                cart,
                cartCount: cart.length,
                expectedReturnDate: formattedReturnDate,
            });
        } catch (error) {
            console.error('Lỗi tại CartController.index:', error);
            return res.status(500).send('Lỗi máy chủ nội bộ!');
        }
    }

    // [POST] /cart/add
    async add(req, res) {
        try {
            const { bookId } = req.body;

            if (!bookId) {
                return res.status(400).json({
                    success: false,
                    message: 'Mã sách không hợp lệ!',
                });
            }

            if (!req.session.cart) {
                req.session.cart = [];
            }

            const isExist = req.session.cart.some((item) => item.bookId === bookId);
            if (isExist) {
                return res.status(400).json({
                    success: false,
                    message: 'Cuốn sách này đã có trong giỏ mượn của bạn!',
                    cartCount: req.session.cart.length,
                });
            }

            const book = await Book.findById(bookId).populate('categoryId').lean();
            if (!book) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy thông tin cuốn sách trong hệ thống!',
                });
            }

            if (book.availableQuantity <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Sách này hiện đã hết bản sao khả dụng để mượn!',
                });
            }

            const cartItem = {
                bookId: book._id.toString(),
                title: book.title,
                author: book.author,
                isbn: book.isbn || 'N/A',
                category: book.categoryId ? book.categoryId.name : 'General',
                location: book.location || 'Section A, Shelf 1',
                image: book.image || '/img/default-book.png',
                accessionNumber: book.accessionNumber || '',
            };

            req.session.cart.push(cartItem);

            return res.json({
                success: true,
                message: 'Đã thêm sách vào giỏ mượn thành công!',
                cartCount: req.session.cart.length,
                cart: req.session.cart,
            });
        } catch (error) {
            console.error('Lỗi tại CartController.add:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi hệ thống khi thêm vào giỏ!',
            });
        }
    }

    // [POST] /cart/remove
    remove(req, res) {
        try {
            const { bookId } = req.body;

            if (!req.session.cart) {
                req.session.cart = [];
            }

            req.session.cart = req.session.cart.filter((item) => item.bookId !== bookId);

            return res.json({
                success: true,
                message: 'Đã xóa cuốn sách khỏi giỏ mượn!',
                cartCount: req.session.cart.length,
                cart: req.session.cart,
            });
        } catch (error) {
            console.error('Lỗi tại CartController.remove:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi hệ thống khi xóa sách!',
            });
        }
    }

    // [POST] /cart/clear
    clear(req, res) {
        try {
            req.session.cart = [];
            return res.json({
                success: true,
                message: 'Đã làm trống giỏ mượn sách!',
                cartCount: 0,
                cart: [],
            });
        } catch (error) {
            console.error('Lỗi tại CartController.clear:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi hệ thống khi dọn giỏ!',
            });
        }
    }

    // [GET] /cart/count
    count(req, res) {
        const cart = req.session.cart || [];
        return res.json({
            success: true,
            cartCount: cart.length,
        });
    }

    // [POST] /cart/checkout
    async checkout(req, res) {
        try {
            const currentUser = req.session.user;
            const cart = req.session.cart || [];

            if (cart.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Giỏ mượn sách đang trống! Vui lòng chọn ít nhất 1 cuốn sách.',
                });
            }

            const randomSuffix = crypto.randomBytes(4).toString('hex').toUpperCase();
            const ticketId = `TKT-${randomSuffix}`;

            const now = new Date();
            const expiresAt = new Date(now.getTime() + 15 * 60 * 1000);
            const expectedReturnDate = new Date();
            expectedReturnDate.setDate(expectedReturnDate.getDate() + 14);

            const qrPayload = JSON.stringify({
                ticketId,
                userId: currentUser._id,
                totalItems: cart.length,
                generatedAt: now.toISOString(),
            });

            const qrCodeDataUrl = await QRCode.toDataURL(qrPayload, {
                errorCorrectionLevel: 'H',
                type: 'image/png',
                margin: 2,
                color: {
                    dark: '#1a1a1a',
                    light: '#ffffff',
                },
                width: 280,
            });

            const newTicket = await BorrowTicket.create({
                ticketId,
                userId: currentUser._id,
                items: cart.map((item) => ({
                    bookId: item.bookId,
                    title: item.title,
                    author: item.author,
                    isbn: item.isbn,
                    category: item.category,
                    location: item.location,
                    image: item.image,
                })),
                qrCodeDataUrl,
                expectedReturnDate,
                status: 'ACTIVE',
                generatedAt: now,
                expiresAt,
            });

            const formatDateTime = (date) => {
                return new Intl.DateTimeFormat('en-US', {
                    month: 'numeric',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true,
                }).format(date);
            };

            return res.json({
                success: true,
                message: 'Tạo vé mượn sách thành công!',
                ticket: {
                    _id: newTicket._id,
                    ticketId: newTicket.ticketId,
                    qrCodeDataUrl: newTicket.qrCodeDataUrl,
                    items: newTicket.items,
                    totalItems: newTicket.items.length,
                    status: newTicket.status,
                    expectedReturnDate: `${expectedReturnDate.getMonth() + 1}/${expectedReturnDate.getDate()}/${expectedReturnDate.getFullYear()}`,
                    generatedAtFormatted: formatDateTime(now),
                    expiresAtFormatted: formatDateTime(expiresAt),
                },
            });
        } catch (error) {
            console.error('Lỗi tại CartController.checkout:', error);
            return res.status(500).json({
                success: false,
                message: 'Có lỗi xảy ra khi tạo vé mượn QR!',
            });
        }
    }

    // [GET] /cart/ticket/:ticketId
    async ticket(req, res) {
        try {
            const currentUser = req.session.user;
            const { ticketId } = req.params;

            const ticket = await BorrowTicket.findOne({
                ticketId,
                userId: currentUser._id,
            }).lean();

            if (!ticket) {
                return res.status(404).send('Không tìm thấy vé mượn sách!');
            }

            const formatDateTime = (date) => {
                return new Intl.DateTimeFormat('en-US', {
                    month: 'numeric',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true,
                }).format(new Date(date));
            };

            const ticketData = {
                ...ticket,
                generatedAtFormatted: formatDateTime(ticket.generatedAt),
                expiresAtFormatted: formatDateTime(ticket.expiresAt),
                totalBooks: ticket.items.length,
                items: ticket.items.map((item, index) => ({
                    ...item,
                    index: index + 1,
                })),
            };

            return res.render('ticket-details', {
                title: 'QR Borrow Ticket - UCC Library',
                layout: 'user',
                user: currentUser,
                ticket: ticketData,
            });
        } catch (error) {
            console.error('Lỗi tại CartController.ticket:', error);
            return res.status(500).send('Lỗi máy chủ nội bộ!');
        }
    }
}

module.exports = new CartController();