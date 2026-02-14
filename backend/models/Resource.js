const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a resource name'],
        trim: true,
    },
    type: {
        type: String,
        enum: [
            'classroom',
            'lab',
            'department_library',
            'department_seminar_hall',
            'central_seminar_hall',
            'auditorium',
            'conference_room',
            'bus',
            'projector',
            'camera',
            'sound_system',
            'other_equipment',
            'others'
        ],
        required: [true, 'Please specify resource type'],
    },
    customType: {
        type: String,
        trim: true,
        required: function () {
            return this.type === 'others';
        }
    },
    category: {
        type: String,
        enum: ['department', 'central', 'movable_asset'],
        required: [true, 'Please specify resource category'],
        default: function () {
            // Auto-categorize based on type
            if (['classroom', 'lab', 'department_library', 'department_seminar_hall'].includes(this.type)) {
                return 'department';
            } else if (['central_seminar_hall', 'auditorium', 'conference_room', 'bus'].includes(this.type)) {
                return 'central';
            } else {
                return 'movable_asset';
            }
        }
    },
    isMovable: {
        type: Boolean,
        default: function () {
            // Auto-set based on category
            return this.category === 'movable_asset';
        }
    },
    managedBy: {
        type: String,
        enum: ['infrastructure', 'it_services'],
        required: [true, 'Please specify managing department'],
        default: function () {
            // Auto-assign based on resource type
            // Fixed resources (buildings/rooms) -> Infrastructure
            if (['classroom', 'lab', 'department_library', 'department_seminar_hall',
                'central_seminar_hall', 'auditorium', 'conference_room', 'bus'].includes(this.type)) {
                return 'infrastructure';
            }
            // Movable resources (equipment) -> IT Services
            else if (['projector', 'camera', 'sound_system', 'other_equipment'].includes(this.type)) {
                return 'it_services';
            }
            // Default to infrastructure for 'others'
            return 'infrastructure';
        }
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
        required: function () {
            return this.category === 'department';
        }
    },
    isAvailable: {
        type: Boolean,
        default: true,
    },
    requiresApproval: {
        type: Boolean,
        default: function () {
            // Central and movable assets always require approval
            return this.category !== 'department';
        }
    },
    maxBookingDuration: {
        type: Number, // in hours
        default: function () {
            // Default max duration based on resource type
            if (this.type === 'classroom' || this.type === 'lab') {
                return 8; // 8 hours max
            } else if (this.type === 'bus') {
                return 24; // Full day
            } else {
                return 4; // 4 hours for most resources
            }
        }
    },
    availableTimeSlots: [{
        label: {
            type: String,
            required: true
        },
        duration: {
            type: Number, // in hours
            required: true,
            min: 0.5
        },
        isDefault: {
            type: Boolean,
            default: false
        }
    }],
    // Default time slots if none specified
    defaultTimeSlots: {
        type: Boolean,
        default: true
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
resourceSchema.index({ type: 1, category: 1, department: 1, isAvailable: 1 });

module.exports = mongoose.model('Resource', resourceSchema);
