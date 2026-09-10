const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');
const Schema = mongoose.Schema;

const BorrowTicketSchema = new Schema(
    {
        ticketId: { type: String, required: true, unique: true, trim: true },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        items: [
            {
                bookId: {
                    type: Schema.Types.ObjectId,
                    ref: 'Book',
                    required: true,
                },
                title: { type: String, required: true },
                author: { type: String, required: true },
                isbn: { type: String, default: 'N/A' },
                category: { type: String, default: 'General' },
                location: { type: String, default: 'Section A, Shelf 1' },
                image: { type: String, default: '' },
            },
        ],
        qrCodeDataUrl: { type: String, default: '' },
        expectedReturnDate: { type: Date, required: true },
        status: { type: String, enum: ['ACTIVE', 'COMPLETED', 'EXPIRED', 'CANCELLED'], default: 'ACTIVE' },
        generatedAt: { type: Date, default: Date.now },
        expiresAt: { type: Date, required: true },
    },
    {
        timestamps: true,
    }
);

BorrowTicketSchema.plugin(mongooseDelete, {
    overrideMethods: 'all',
    deletedAt: true,
});

module.exports = mongoose.model('BorrowTicket', BorrowTicketSchema);