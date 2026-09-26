const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');
const Schema = mongoose.Schema;

const Book = new Schema({
    bookId: { type: String, required: true, unique: true, uppercase: true, trim: true },
    title: { type: String, required: true },
    author: { type: String, required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: false },
    isbn: { type: String, unique: true },
    category: { type: String, trim: true, default: 'General' },
    description: { type: String },
    location: { type: String },
    totalQuantity: { type: Number, required: true, min: 0 },
    availableQuantity: { type: Number, required: true, min: 0 },
    image: { type: String, trim: true, default: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400' },
    accessionNumber: { type: String },
}, {
    timestamps: true
});

Book.plugin(mongooseDelete, {
    overrideMethods: 'all',
    deletedAt: true
});

module.exports = mongoose.model('Book', Book);