const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');
const Schema = mongoose.Schema;

const Book = new Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    isbn: { type: String, unique: true },
    description: { type: String },
    location: { type: String },
    totalQuantity: { type: Number, required: true, min: 0 },
    availableQuantity: { type: Number, required: true, min: 0 },
    image: { type: String },
    accessionNumber: { type: String },
}, {
    timestamps: true
});

Book.plugin(mongooseDelete, {
    overrideMethods: 'all',
    deletedAt: true
});

module.exports = mongoose.model('Book', Book);