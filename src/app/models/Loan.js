const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Loan = new Schema({
    // THUẬT TOÁN LIÊN KẾT (Reference)
    // Thay vì lưu toàn bộ tên sách, ta chỉ lưu ObjectId và trỏ (ref) về bảng 'Book'
    bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
    readerId: { type: Schema.Types.ObjectId, ref: 'Reader', required: true },

    borrowDate: { type: Date, default: Date.now }, // Mặc định lấy thời gian lúc tạo phiếu
    dueDate: { type: Date, required: true },       // Hạn trả (bắt buộc phải nhập)
    returnDate: { type: Date },                    // Ngày trả thực tế (ban đầu sẽ trống)

    // Enum giúp giới hạn giá trị. Status chỉ được phép mang 1 trong 4 chữ này, viết sai sẽ báo lỗi ngay.
    status: {
        type: String,
        enum: ['borrowing', 'returned', 'overdue', 'lost'],
        default: 'borrowing'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Loan', Loan);