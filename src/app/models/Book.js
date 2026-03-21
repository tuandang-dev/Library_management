const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
const mongooseDelete = require('mongoose-delete');
const Schema = mongoose.Schema;

// Cấp quyền cho mongoose sử dụng plugin tạo slug
mongoose.plugin(slug);

const Book = new Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    isbn: { type: String, unique: true }, // ISBN là mã chuẩn quốc tế, không được trùng
    description: { type: String },
    location: { type: String },
    totalQuantity: { type: Number, required: true, min: 0 },
    availableQuantity: { type: Number, required: true, min: 0 },
    image: { type: String },
    accessionNumber: { type: String },

    // Tự động generate từ trường 'title'. VD: "Đắc Nhân Tâm" -> "dac-nhan-tam"
    slug: { type: String, slug: 'title', unique: true }
}, {
    timestamps: true
});

// Tích hợp Plugin Xóa mềm (Soft Delete)
// Khi gọi Book.delete(), nó sẽ không xóa hẳn mà thêm trường deleted: true và deletedAt: thời_gian_xóa
Book.plugin(mongooseDelete, {
    overrideMethods: 'all',
    deletedAt: true
});

module.exports = mongoose.model('Book', Book);