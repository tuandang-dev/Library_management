const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ActivityLog = new Schema(
    {
        action: { type: String, required: true, trim: true },
        category: { type: String, required: true, enum: ['authentication', 'books', 'users', 'attendance', 'system'], default: 'system', index: true, },
        categoryLabel: { type: String, trim: true },
        description: { type: String, required: true, trim: true },
        userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
        actor: { name: { type: String, default: 'System', trim: true }, role: { type: String, default: 'System', trim: true }, },
        icon: { type: String, default: 'fa-circle-info' },
    },
    {
        timestamps: true,
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
    }
);

ActivityLog.index({ category: 1, createdAt: -1 });
ActivityLog.index({ createdAt: -1 });

ActivityLog.methods.getFormattedTime = function () {
    if (!this.createdAt) return 'N/A';
    const date = new Date(this.createdAt);
    if (isNaN(date.getTime())) return 'N/A';

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const day = date.getDate();

    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours.toString().padStart(2, '0') : '12';

    return `${month} ${day} · ${hours}:${minutes} ${ampm}`;
};

module.exports = mongoose.model('ActivityLog', ActivityLog);