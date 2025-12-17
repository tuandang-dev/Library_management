const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Book = new Schema({
    title: { type: String, required: true },
    author: String,
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    yearOfPublication: Number,
    numberOfCopies: Number,
    image: String,
}, {
    timestamps: true
});

module.exports = mongoose.model('Book', Book);
