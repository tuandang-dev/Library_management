const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Category = new Schema({
    name: { type: String, required: true, unique: true }, // Tên thể loại không được trùng nhau
    slug: { type: String, slug: 'name', unique: true }
}, {
    timestamps: true
});

module.exports = mongoose.model('Category', Category);
