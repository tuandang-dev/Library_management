const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');
const Schema = mongoose.Schema;

const BorrowRecordSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
        ticketId: { type: String, default: '', trim: true },
        borrowDate: { type: Date, required: true, default: Date.now },
        dueDate: { type: Date, required: true },
        returnDate: { type: Date, default: null },
        staffName: { type: String, default: 'Sarah Chen', trim: true },
        status: { type: String, enum: ['BORROWED', 'RETURNED', 'OVERDUE'], default: 'BORROWED' },
        notes: { type: String, default: '' },
    },
    {
        timestamps: true,
    }
);

BorrowRecordSchema.plugin(mongooseDelete, {
    overrideMethods: 'all',
    deletedAt: true,
});

module.exports = mongoose.model('BorrowRecord', BorrowRecordSchema);