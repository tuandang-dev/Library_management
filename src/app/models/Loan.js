const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Loan = new Schema({
    bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    borrowDate: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },
    returnDate: { type: Date },

    status: { type: String, enum: ['borrowing', 'returned', 'overdue', 'lost'], default: 'borrowing' }
}, {
    timestamps: true
});

module.exports = mongoose.model('Loan', Loan);