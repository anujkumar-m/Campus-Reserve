const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a resource name'],
        trim: true,
    },
    type: {
        type: String,
        enum: ['classroom', 'lab', 'seminar_hall'],
        required: [true, 'Please specify resource type'],
    },
    capacity: {
        type: Number,
        required: [true, 'Please specify capacity'],
        min: 1,
    },
    location: {
        type: String,
        required: [true, 'Please provide location'],
        trim: true,
    },
    amenities: {
        type: [String],
        default: [],
    },
    department: {
        type: String,
        trim: true,
    },
    isAvailable: {
        type: Boolean,
        default: true,
    },
    image: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Index for efficient queries
resourceSchema.index({ type: 1, department: 1, isAvailable: 1 });

module.exports = mongoose.model('Resource', resourceSchema);
