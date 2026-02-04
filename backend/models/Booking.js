const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    resourceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resource',
        required: [true, 'Please specify a resource'],
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please specify a user'],
    },
    date: {
        type: String, // Format: YYYY-MM-DD
        required: [true, 'Please provide a date'],
    },
    timeSlot: {
        start: {
            type: String, // Format: HH:MM
            required: [true, 'Please provide start time'],
        },
        end: {
            type: String, // Format: HH:MM
            required: [true, 'Please provide end time'],
        },
    },
    purpose: {
        type: String,
        required: [true, 'Please provide booking purpose'],
        trim: true,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
    department: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Index for efficient queries
bookingSchema.index({ resourceId: 1, date: 1, status: 1 });
bookingSchema.index({ userId: 1, status: 1 });

// Virtual fields for populated data
bookingSchema.virtual('resourceName');
bookingSchema.virtual('userName');
bookingSchema.virtual('userRole');

// Ensure virtuals are included in JSON
bookingSchema.set('toJSON', { virtuals: true });
bookingSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Booking', bookingSchema);
