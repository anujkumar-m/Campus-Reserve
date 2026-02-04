const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
        type: String,
        required: function () {
            return this.authProvider === 'local';
        },
        minlength: 6,
        select: false, // Don't return password by default
    },
    googleId: {
        type: String,
        sparse: true,
        unique: true,
    },
    authProvider: {
        type: String,
        enum: ['local', 'google'],
        default: 'local',
        required: true,
    },
    role: {
        type: String,
        enum: ['admin', 'faculty', 'student', 'department', 'club'],
        required: [true, 'Please specify a role'],
    },
    department: {
        type: String,
        required: function () {
            return ['faculty', 'student', 'department'].includes(this.role);
        },
    },
    clubName: {
        type: String,
        required: function () {
            return this.role === 'club';
        },
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    // Skip hashing if password is not modified or user is using Google auth
    if (!this.isModified('password') || this.authProvider === 'google') {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
