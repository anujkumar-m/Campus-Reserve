const mongoose = require('mongoose');

const dashboardMessageSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please specify a user'],
    },
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
    },
    message: {
        type: String,
        required: [true, 'Please provide a message'],
        trim: true,
    },
    type: {
        type: String,
        enum: ['info', 'warning', 'success', 'error'],
        default: 'info',
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    readAt: {
        type: Date,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Index for efficient queries
dashboardMessageSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('DashboardMessage', dashboardMessageSchema);
